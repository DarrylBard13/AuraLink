
import React from "react";
import { DollarSign, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import StatsCard from "../dashboard/StatsCard";
import { motion } from "framer-motion";
import { isAfter, addDays, isWithinInterval } from 'date-fns';
import { safeDueDate } from './dateUtils';

export default function BillStatsSafe({ bills, loading, selectedCycle }) {
  const stats = React.useMemo(() => {
    if (!Array.isArray(bills)) {
      return { totalDue: 0, totalPastDue: 0, paidCount: 0, dueSoonCount: 0 };
    }

    const now = new Date();
    const sevenDaysFromNow = addDays(now, 7);
    
    let totalDue = 0;
    let totalPastDue = 0;
    let dueSoonCount = 0;
    let paidCount = 0; // Initialize paidCount here

    // These are the active (unpaid/partially paid) bills
    // It's assumed 'bills' passed here are already filtered for the 'selectedCycle' if that's the intention for these stats.
    bills.forEach(bill => {
        if (!bill || typeof bill !== 'object') return;
        
        if (bill.status === 'paid') { // Check for paid status
            paidCount++; // Increment paidCount if bill is paid
            return; // Don't include paid bills in due amounts, move to next bill
        }

        totalDue += bill.balance || 0;
        
        if (bill.status === 'overdue') {
            totalPastDue += bill.balance || 0;
        }
        
        if (bill.status === 'pending') {
            const dueDate = safeDueDate(bill.dueDate);
            if (dueDate && isWithinInterval(dueDate, {start: now, end: sevenDaysFromNow})) {
                dueSoonCount++;
            }
        }
    });

    return { totalDue, totalPastDue, paidCount, dueSoonCount };
  }, [bills]); // Removed paidBills from dependency array

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-panel rounded-xl p-4 animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-3"></div>
            <div className="h-3 bg-white/20 rounded mb-2 w-2/3"></div>
            <div className="h-6 bg-white/20 rounded mb-1 w-1/2"></div>
            <div className="h-3 bg-white/20 rounded w-1/3"></div>
          </div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
    >
      <StatsCard
        title="Total Balance Due"
        value={`$${stats.totalDue.toFixed(2)}`}
        icon={DollarSign}
        gradient="from-blue-400 to-cyan-400"
        subtitle="Current cycle"
      />
      <StatsCard
        title="Total Past Due"
        value={`$${stats.totalPastDue.toFixed(2)}`}
        icon={AlertTriangle}
        gradient="from-orange-400 to-red-400"
        subtitle="Overdue amounts"
      />
      <StatsCard
        title="Paid Bills"
        value={stats.paidCount}
        icon={CheckCircle}
        gradient="from-emerald-400 to-teal-400"
        subtitle="This cycle"
      />
      <StatsCard
        title="Due Soon"
        value={stats.dueSoonCount}
        icon={Calendar}
        gradient="from-purple-400 to-pink-400"
        subtitle="Next 7 days"
      />
    </motion.div>
  );
}
