import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-sm bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700 text-white">
        <p className="label">{`${payload[0].name} : $${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

export default function BillsDonutChart({ data }) {
  const hasData = data && data.length > 0;

 /* return (
    <Card className="glass-panel h-full">
      <CardHeader>
        <CardTitle className="text-white text-lg">Bills by Category (This Month)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 250 }}>
          {hasData ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={5}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{fontSize: '12px', color: '#a0aec0'}}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-slate-400">
                No bill data for this month.
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  ); */
}