
import React from "react";
import { DollarSign, CreditCard, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import StatsCard from "../dashboard/StatsCard";
import { motion } from "framer-motion";

export default function SubscriptionStats({ subscriptions, loading }) {
  const calculateStats = () => {
    const activeSubscriptions = subscriptions.filter((sub) => sub.status === 'active');
    const paidSubscriptions = activeSubscriptions.filter((sub) => sub.paidThisCycle);
    const unpaidSubscriptions = activeSubscriptions.filter((sub) => !sub.paidThisCycle);

    const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
      if (sub.billing_cycle === 'yearly') return total + sub.cost / 12;
      if (sub.billing_cycle === 'quarterly') return total + sub.cost / 3;
      return total + sub.cost;
    }, 0);

    const monthlyPaid = paidSubscriptions.reduce((total, sub) => {
      if (sub.billing_cycle === 'yearly') return total + sub.cost / 12;
      if (sub.billing_cycle === 'quarterly') return total + sub.cost / 3;
      return total + sub.cost;
    }, 0);

    const monthlyUnpaid = unpaidSubscriptions.reduce((total, sub) => {
      if (sub.billing_cycle === 'yearly') return total + sub.cost / 12;
      if (sub.billing_cycle === 'quarterly') return total + sub.cost / 3;
      return total + sub.cost;
    }, 0);

    const yearlyTotal = monthlyTotal * 12;

    return {
      monthlyTotal,
      yearlyTotal,
      activeCount: activeSubscriptions.length,
      paidCount: paidSubscriptions.length,
      monthlyPaid,
      monthlyUnpaid
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
      >
        {[1, 2, 3, 4, 5].map((i) => (
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
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
    >
      <StatsCard
        title="Monthly Total"
        value={`$${stats.monthlyTotal.toFixed(2)}`}
        icon={DollarSign}
        gradient="from-purple-400 to-pink-400"
        subtitle="Active subscriptions"
      />
      <StatsCard
        title="Paid This Cycle"
        value={`$${stats.monthlyPaid.toFixed(2)}`}
        icon={CheckCircle}
        gradient="from-emerald-400 to-teal-400"
        subtitle={`${stats.paidCount} paid`}
      />
      <StatsCard
        title="Unpaid This Cycle"
        value={`$${stats.monthlyUnpaid.toFixed(2)}`}
        icon={Calendar}
        gradient="from-orange-400 to-red-400"
        subtitle={`${stats.activeCount - stats.paidCount} pending`}
      />
      <StatsCard
        title="Yearly Projection"
        value={`$${stats.yearlyTotal.toFixed(2)}`}
        icon={TrendingUp}
        gradient="from-blue-400 to-cyan-400"
        subtitle="Based on current"
      />
      {/* Fifth card will auto-wrap on mobile, stay in single row on desktop */}
      <StatsCard
        title="Active Services"
        value={stats.activeCount}
        icon={CreditCard}
        gradient="from-indigo-400 to-purple-400"
        subtitle="Currently subscribed"
      />
    </motion.div>
  );
}
