"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { MONTHS, MONTHS_SHORT, VEHICLE_CLASSES, getDashboardData, type PeriodId, type RegionId } from "@/lib/dashboard/data";
import { fmt, fmtCount, loadStatus, splitCount } from "@/lib/dashboard/format";
import CongestionHeatmap from "@/components/dashboard/CongestionHeatmap";
import NotificationPanel from "@/components/dashboard/NotificationPanel";
import SpeedByArea from "@/components/dashboard/SpeedByArea";
import { ChartSkeleton, FilterBar, KpiCard, LegendRow, Panel, RankList, Row, type Tone } from "@/components/dashboard/ui";

// Recharts hanya dirender di browser agar ukuran kontainer terbaca dengan benar.
const Donut = dynamic(() => import("@/components/dashboard/charts").then((m) => m.Donut), {
  ssr: false,
  loading: () => <div className="h-[150px] w-[150px] shrink-0 animate-pulse rounded-full bg-raised" />,
});
const VolumeByClassChart = dynamic(() => import("@/components/dashboard/charts").then((m) => m.VolumeByClassChart), {
  ssr: false,
  loading: () => <ChartSkeleton height={260} />,
});
const SpeedChart = dynamic(() => import("@/components/dashboard/charts").then((m) => m.SpeedChart), {
  ssr: false,
  loading: () => <ChartSkeleton height={240} />,
});
const VolumeSpeedScatter = dynamic(() => import("@/components/dashboard/charts").then((m) => m.VolumeSpeedScatter), {
  ssr: false,
  loading: () => <ChartSkeleton height={240} />,
});

const STATUS_COLOR = { lancar: "#2e9d6c", padat: "#e8a03a", macet: "#dc4848", mati: "#b3b9c6" };
const CAMERA_COLOR = { sehat: "#2e9d6c", menurun: "#e3b534", mati: "#dc4848" };

const arrow = (n: number) => (n > 0 ? "▲" : n < 0 ? "▼" : "■");
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function labelFormatter(period: PeriodId) {
  return (label: string) => {
    if (period === "harian") return `Pukul ${label}.00`;
    if (period === "mingguan") return `${label}.00`;
    if (period === "bulanan") return `${label} September 2026`;
    const idx = MONTHS_SHORT.indexOf(label);
    return `${MONTHS[idx]} ${idx >= 9 ? 2025 : 2026} · rata-rata per hari`;
  };
}

export default function Home() {
  const [region, setRegion] = useState<RegionId>("bodebek");
  const [period, setPeriod] = useState<PeriodId>("harian");
  const data = useMemo(() => getDashboardData(region, period), [region, period]);
  const { kpi } = data;

  const volume = splitCount(kpi.volume);
  const speedTone: Tone = kpi.speedDelta < 0 ? "bad" : kpi.speedDelta > 0 ? "ok" : "neutral";
  const macetTone: Tone = kpi.macetDelta > 0 ? "bad" : kpi.macetDelta < 0 ? "ok" : "neutral";
  const formatLabel = labelFormatter(period);
  const areaLabel = region === "bodebek" ? "wilayah Bodebek" : `wilayah ${data.regionLabel}`;

  return (
    <div className="-m-6 min-h-[calc(100%+3rem)] bg-canvas p-4 text-ink sm:p-6 lg:p-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-ink sm:text-3xl">
            Dashboard Pimpinan Direktorat
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Lalu lintas darat perkotaan · {areaLabel} · {data.periodLabel} · diperbarui 5 menit lalu
          </p>
        </div>
        <FilterBar region={region} period={period} onRegion={setRegion} onPeriod={setPeriod} />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Indikator utama */}
        <Row className="@lg:grid-cols-2 @4xl:grid-cols-4">
          <KpiCard
            label="Kecepatan rata-rata"
            value={fmt(kpi.speed, 1)}
            unit="km/jam"
            note={`${arrow(kpi.speedDelta)} ${fmt(Math.abs(kpi.speedDelta), 1)} km/j vs ${data.compareLabel}`}
            noteTone={speedTone}
          />
          <KpiCard
            label="Status kamera"
            value={String(kpi.camerasActive)}
            unit={`dari ${kpi.camerasTotal} aktif`}
            note={`ketersediaan ${fmt(kpi.availability, 1)}% selama periode`}
            noteTone="ok"
          />
          <KpiCard
            label="Volume kendaraan"
            value={volume.value}
            unit={`${volume.unit} ${kpi.volumeCaption}`}
            note={`${arrow(kpi.volumeDeltaPct)} ${fmt(Math.abs(kpi.volumeDeltaPct), 1)}% vs ${data.compareLabel}`}
            noteTone={kpi.volumeDeltaPct > 0 ? "warn" : "neutral"}
          />
          <KpiCard
            label="Titik macet"
            value={String(kpi.macet)}
            valueTone="bad"
            unit={`dari ${kpi.titikTotal} titik`}
            note={`${arrow(kpi.macetDelta)} ${Math.abs(kpi.macetDelta)} titik vs ${data.compareLabel}`}
            noteTone={macetTone}
          />
        </Row>

        <NotificationPanel
          key={region}
          items={data.notifications}
          className="2xl:sticky 2xl:top-0 2xl:col-start-2 2xl:row-span-6 2xl:row-start-1 2xl:max-h-[calc(100vh-7rem)] 2xl:self-start"
        />

        {/* Komposisi & kondisi */}
        <Row className="@3xl:grid-cols-2 @6xl:grid-cols-[1.15fr_1fr_1fr]">
          <Panel title="Klasifikasi kendaraan">
            <div className="flex flex-col items-center gap-5 @[22rem]:flex-row @[22rem]:items-start">
              <Donut
                data={data.composition.map((c) => ({ name: c.label, value: c.volume, color: c.color }))}
                center={
                  <>
                    <span className="font-display text-2xl font-bold">{volume.value}</span>
                    <span className="text-[11px] text-subtle">{volume.unit} kend</span>
                  </>
                }
              />
              <ul className="w-full min-w-0 flex-1 @[22rem]:max-w-sm">
                {data.composition.map((c) => (
                  <LegendRow key={c.key} color={c.color} label={c.label} value={`${fmt(c.share, 1)}%`} />
                ))}
              </ul>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-faint">
              Persentase dari seluruh kendaraan yang terhitung kamera pada periode ini.
            </p>
          </Panel>

          <Panel title="Kondisi lalu lintas">
            <div className="flex flex-col items-center gap-5 @[22rem]:flex-row @[22rem]:items-start">
              <Donut
                data={[
                  { name: "Lancar", value: data.status.lancar, color: STATUS_COLOR.lancar },
                  { name: "Padat", value: data.status.padat, color: STATUS_COLOR.padat },
                  { name: "Macet", value: data.status.macet, color: STATUS_COLOR.macet },
                  { name: "CCTV mati", value: data.status.mati, color: STATUS_COLOR.mati },
                ]}
                center={
                  <>
                    <span className="font-display text-2xl font-bold">{kpi.titikTotal}</span>
                    <span className="text-[11px] text-subtle">titik pantau</span>
                  </>
                }
              />
              <ul className="w-full min-w-0 flex-1 @[22rem]:max-w-sm">
                <LegendRow color={STATUS_COLOR.lancar} label="Lancar" value={String(data.status.lancar)} sub="di bawah 70% kapasitas" />
                <LegendRow color={STATUS_COLOR.padat} label="Padat" value={String(data.status.padat)} sub="70–100% kapasitas" />
                <LegendRow color={STATUS_COLOR.macet} label="Macet" value={String(data.status.macet)} sub="melebihi kapasitas" />
                <LegendRow color={STATUS_COLOR.mati} label="CCTV mati" value={String(data.status.mati)} />
              </ul>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-faint">{data.status.caption}</p>
          </Panel>

          <Panel title="Kesehatan kamera" className="@3xl:col-span-2 @6xl:col-span-1">
            <div className="flex flex-col items-center gap-5 @[22rem]:flex-row @[22rem]:items-start">
              <Donut
                data={[
                  { name: "Sehat", value: data.cameraHealth.sehat, color: CAMERA_COLOR.sehat },
                  { name: "Kualitas menurun", value: data.cameraHealth.menurun, color: CAMERA_COLOR.menurun },
                  { name: "Mati", value: data.cameraHealth.mati, color: CAMERA_COLOR.mati },
                ]}
                center={
                  <>
                    <span className="font-display text-2xl font-bold">{fmt(kpi.availability, 1)}</span>
                    <span className="text-[11px] text-subtle">persen</span>
                  </>
                }
              />
              <ul className="w-full min-w-0 flex-1 @[22rem]:max-w-sm">
                <LegendRow color={CAMERA_COLOR.sehat} label="Sehat" value={String(data.cameraHealth.sehat)} />
                <LegendRow color={CAMERA_COLOR.menurun} label="Kualitas menurun" value={String(data.cameraHealth.menurun)} />
                <LegendRow color={CAMERA_COLOR.mati} label="Mati" value={String(data.cameraHealth.mati)} />
              </ul>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-faint">
              Angka tengah adalah ketersediaan: persentase waktu kamera mengirim data. Kamera dengan kualitas menurun
              tetap mengirim gambar, datanya diberi tanda, bukan dibuang.
            </p>
          </Panel>
        </Row>

        {/* Volume per kelas */}
        <Panel title={data.seriesMeta.volumeTitle} subtitle="ditumpuk menurut 7 kelas kendaraan">
          <ul className="-mt-1 mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {VEHICLE_CLASSES.map((c) => (
              <li key={c.key} className="flex items-center gap-1.5 text-xs text-muted">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c.color }} />
                {c.label}
              </li>
            ))}
          </ul>
          <VolumeByClassChart
            series={data.series}
            ticks={data.seriesMeta.ticks}
            unit={data.seriesMeta.volumeUnit}
            formatLabel={formatLabel}
          />
        </Panel>

        {/* Kecepatan & hubungan volume–kecepatan */}
        <Row className="@3xl:grid-cols-2">
          <Panel title={data.seriesMeta.speedTitle} subtitle="titik merah = kecepatan terendah">
            <SpeedChart
              series={data.series}
              ticks={data.seriesMeta.ticks}
              marks={data.seriesMeta.speedMarks}
              formatLabel={formatLabel}
            />
          </Panel>
          <Panel title="Volume terhadap kecepatan" subtitle={data.scatter.caption}>
            <VolumeSpeedScatter points={data.scatter.points} xUnit={data.scatter.xUnit} />
          </Panel>
        </Row>

        {/* Peringkat */}
        <Row className="@xl:grid-cols-2 @5xl:grid-cols-4">
          <RankList
            title="Ruas paling padat"
            items={data.topCongested.map((r) => ({
              key: r.name,
              primary: r.name,
              secondary: r.area,
              value: `${r.load}%`,
              valueTone: loadStatus(r.load).tone,
            }))}
            footnote={`Beban jalan ${period === "harian" ? "pada jam tersibuk hari ini" : "rata-rata pada jam tersibuk"}: jumlah kendaraan dibanding daya tampung jalan. Di atas 100% berarti macet.`}
          />
          <RankList
            title="Ruas volume tertinggi"
            items={data.topVolume.map((r) => ({
              key: r.name,
              primary: r.name,
              secondary: r.area,
              value: fmtCount(r.volume),
            }))}
            footnote="Jumlah kendaraan yang melintas di titik pantau utama ruas, dua arah."
          />
          <RankList
            title="Lokasi pelanggaran terbanyak"
            items={data.topViolations.map((v) => ({
              key: v.name,
              primary: v.name,
              secondary: v.type,
              value: fmt(v.count),
            }))}
            footnote={`${capitalize(data.violationCaption)}, semua jenis pelanggaran.`}
          />
          <RankList
            title="Kamera paling sering bermasalah"
            numbered={false}
            items={data.topCameras.map((c, i) => ({
              key: c.id,
              primary: `${c.id} · ${c.location}`,
              secondary: c.issue,
              value: `${fmt(c.count)}×`,
              valueTone: i < 2 ? "bad" : "warn",
            }))}
            footnote={`${capitalize(data.cameraCaption)}.`}
          />
        </Row>

        {/* Pola kepadatan & kecepatan per wilayah */}
        <Row className="@5xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <CongestionHeatmap data={data.heatmap} />
          <SpeedByArea {...data.speedByArea} />
        </Row>
      </div>
    </div>
  );
}
