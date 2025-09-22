import React from 'react';
import StatsCard from '../dashboard/StatsCard'; // Reusing the existing StatsCard component
import { DollarSign, Scale, Calendar, Landmark } from 'lucide-react';

export default function IncomeStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatsCard
        title="This Month's Net"
        value={`$${stats.thisMonthNet.toFixed(2)}`}
        icon={DollarSign}
        gradient="from-green-400 to-lime-400"
        subtitle="Received this month"
      />
      <StatsCard
        title="Received vs. Expected"
        value={`$${stats.thisMonthReceived.toFixed(2)} / $${stats.thisMonthExpected.toFixed(2)}`}
        icon={Scale}
        gradient="from-cyan-400 to-sky-400"
        subtitle="This month's progress"
      />
      <StatsCard
        title="YTD Net Income"
        value={`$${stats.ytdNet.toFixed(2)}`}
        icon={Landmark}
        gradient="from-amber-400 to-yellow-400"
        subtitle={`As of ${new Date().getFullYear()}`}
      />
      <StatsCard
        title="Next Payday"
        value={stats.nextPayday}
        icon={Calendar}
        gradient="from-rose-400 to-red-400"
        subtitle={stats.nextPaydaySource}
      />
    </div>
  );
}