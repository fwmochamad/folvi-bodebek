"use client";

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const dataAll = [
  { time: '06:00', speed: 45, volume: 1200 },
  { time: '07:00', speed: 30, volume: 2100 },
  { time: '08:00', speed: 25, volume: 2400 },
  { time: '09:00', speed: 35, volume: 1800 },
  { time: '10:00', speed: 42, volume: 1400 },
  { time: '11:00', speed: 40, volume: 1500 },
  { time: '12:00', speed: 38, volume: 1600 },
  { time: '13:00', speed: 35, volume: 1700 },
  { time: '14:00', speed: 40, volume: 1500 },
  { time: '15:00', speed: 45, volume: 1300 },
  { time: '16:00', speed: 30, volume: 1900 },
  { time: '17:00', speed: 20, volume: 2500 },
];

const dataSpecific = [
  { time: '06:00', speed: 50, volume: 800 },
  { time: '07:00', speed: 25, volume: 1500 },
  { time: '08:00', speed: 20, volume: 1800 },
  { time: '09:00', speed: 30, volume: 1200 },
  { time: '10:00', speed: 45, volume: 900 },
  { time: '11:00', speed: 42, volume: 1000 },
  { time: '12:00', speed: 40, volume: 1100 },
  { time: '13:00', speed: 38, volume: 1200 },
  { time: '14:00', speed: 42, volume: 1000 },
  { time: '15:00', speed: 48, volume: 800 },
  { time: '16:00', speed: 35, volume: 1300 },
  { time: '17:00', speed: 15, volume: 1900 },
];

export default function TrafficTrendChart({ location = "Semua Lokasi" }) {
  const data = location === "Semua Lokasi" ? dataAll : dataSpecific;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dx={-10}
            domain={[0, 'auto']}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dx={10}
            domain={[0, 3000]}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar 
            yAxisId="right"
            dataKey="volume" 
            name="Volume (smp/jam)" 
            fill="#94a3b8" 
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="speed" 
            name="Kecepatan (km/j)"
            stroke="#2563EB" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#2563EB' }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
