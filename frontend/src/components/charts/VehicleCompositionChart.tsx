"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const dataAll = [
  { name: 'Sepeda Motor (MC)', value: 55 },
  { name: 'Mobil Penumpang (LV)', value: 20 },
  { name: 'Mikrolet/Angkot', value: 8 },
  { name: 'Bus Kecil', value: 5 },
  { name: 'Bus Besar', value: 4 },
  { name: 'Truk Ringan', value: 5 },
  { name: 'Truk Berat (HV)', value: 3 },
];

const dataSpecific = [
  { name: 'Sepeda Motor (MC)', value: 45 },
  { name: 'Mobil Penumpang (LV)', value: 30 },
  { name: 'Mikrolet/Angkot', value: 5 },
  { name: 'Bus Kecil', value: 2 },
  { name: 'Bus Besar', value: 3 },
  { name: 'Truk Ringan', value: 10 },
  { name: 'Truk Berat (HV)', value: 5 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316', '#64748b'];

export default function VehicleCompositionChart({ location = "Semua Lokasi" }) {
  const data = location === "Semua Lokasi" ? dataAll : dataSpecific;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Proporsi']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={70} 
            iconType="circle"
            wrapperStyle={{ fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
