import React from "react";
import { motion } from "framer-motion";
import { DollarSign, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import StatsCard from "../dashboard/StatsCard";
import { isWithinInterval, addDays, parseISO, isThisMonth } from "date-fns";

export default function BillStats({ bills, loading }) {
  const calculateStats = () => {
    const now = new Date();
    const sevenDaysFromNow = addDays(now, 7);
    
    const totalDueThisMonth = bills
      .filter(bill => bill.amountRemainingThisCycle > 0)
      .reduce((sum, bill) => sum + bill.amountRemainingThisCycle, 0);
    
    const totalPastDue = bills
      .reduce((sum, bill) => sum + bill.pastDueBalance, 0);
    
    const paidThisMonth = bills
      .filter(bill => isThisMonth(parseISO(bill.dueDate)) && bill.status === 'paid')
      .reduce((sum, bill) => sum + bill.amountPaidThisCycle, 0);
    
    const dueSoon = bills.filter(bill => {
      if (bill.status === 'paid' || bill.status === 'overdue') return false;
      const dueDate = parseISO(bill.dueDate);
      return isWithinInterval(dueDate, { start: now, end: sevenDaysFromNow });
    }).length;

    return {
      totalDueThisMonth,
      totalPastDue,
      paidThisMonth,
      dueSoon
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="flex gap-3 min-w-max md:min-w-0 md:grid md:grid-cols-4 md:gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-64 md:w-auto glass-panel rounded-xl p-4 animate-pulse">
              <div className="h-8 bg-white/20 rounded mb-3"></div>
              <div className="h-3 bg-white/20 rounded mb-2 w-2/3"></div>
              <div className="h-6 bg-white/20 rounded mb-1 w-1/2"></div>
              <div className="h-3 bg-white/20 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full overflow-x-auto"
    >
      <div className="flex gap-3 min-w-max md:min-w-0 md:grid md:grid-cols-4 md:gap-3">
        <div className="w-64 md:w-auto">
          <StatsCard
            title="Total Due This Month"
            value={`$${stats.totalDueThisMonth.toFixed(2)}`}
            icon={DollarSign}
            gradient="from-blue-400 to-cyan-400"
            subtitle="Remaining balance"
          />
        </div>
        <div className="w-64 md:w-auto">
          <StatsCard
            title="Total Past Due"
            value={`$${stats.totalPastDue.toFixed(2)}`}
            icon={AlertTriangle}
            gradient="from-orange-400 to-red-400"
            subtitle="Overdue amounts"
          />
        </div>
        <div className="w-64 md:w-auto">
          <StatsCard
            title="Paid This Month"
            value={`$${stats.paidThisMonth.toFixed(2)}`}
            icon={CheckCircle}
            gradient="from-emerald-400 to-teal-400"
            subtitle="Completed payments"
          />
        </div>
        <div className="w-64 md:w-auto">
          <StatsCard
            title="Next 7 Days"
            value={stats.dueSoon}
            icon={Calendar}
            gradient="from-purple-400 to-pink-400"
            subtitle="Bills due soon"
          />
        </div>
      </div>
    </motion.div>
  );
}