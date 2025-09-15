import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700 text-white">
        {payload.map(p => (
            <p key={p.dataKey} className="label" style={{color: p.color}}>{`${p.name} : $${p.value.toFixed(2)}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function IncomeOutcomeRatioChart({ data }) {
/*  return (
    <Card className="glass-panel h-full">
      <CardHeader>
        <CardTitle className="text-white text-lg">This Month: Income vs. Outcome</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#a0aec0', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a0aec0', fontSize: 12 }} unit="$" axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}/>
              <Legend wrapperStyle={{fontSize: '12px', color: '#a0aec0'}}/>
              <Bar dataKey="income" name="Expected Income" fill="#4ade80" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outcome" name="Expected Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  ); */
}