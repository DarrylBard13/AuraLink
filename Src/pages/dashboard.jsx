import React, { useState, useEffect, useMemo } from "react";
import {
  Subscription,
  Bill,
  User,
  BillTransaction,
  IncomeSource,
} from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  format,
  isSameMonth,
  parseISO,
  isBefore,
  startOfToday,
  add,
  startOfMonth,
  endOfMonth,
  subDays,
  addDays,
  isWithinInterval,
  isAfter,
} from "date-fns";
import { toast } from "sonner";

import StatsCard from "../components/dashboard/StatsCard";
import StatsCardGrid from "../components/common/StatsCardGrid";
import { calculateBillMetrics } from "../components/bills/billCalculationUtils";
import BillDetailsDrawer from "../components/bills/BillDetailsDrawer";
import PageErrorBoundary from "../components/common/PageErrorBoundary";

import OverdueAlert from "../components/dashboard/OverdueAlert";
import MonthlyCalendarStrip from "../components/dashboard/MonthlyCalendarStrip";
import UpcomingDashboardItems from "../components/dashboard/UpcomingDashboardItems";

import {
  getBillsDonutChartData, // still used to derive categories; safe to keep or remove if you prefer
  getUpcomingItems,
} from "../components/dashboard/dashboardUtils";

import {
  AlertTriangle,
  DollarSign,
  CreditCard,
  Calculator,
} from "lucide-react";

function DashboardContent() {
  const [allData, setAllData] = useState({
    subscriptions: [],
    bills: [],
    transactions: [],
    incomeSources: [],
  });
  const [loading, setLoading] = useState(true);

  const [showOverdueAlert, setShowOverdueAlert] = useState(true);
  const [selectedUpcoming, setSelectedUpcoming] = useState(null);
  const [upcomingFilterDate, setUpcomingFilterDate] = useState(null);

  // Pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  const fetchData = async () => {
    try {
      const [subsData, billsData, transactionsData, currentUser, incomeSourcesData] =
        await Promise.all([
          Subscription.list("-created_date"),
          Bill.list("-created_date"),
          BillTransaction.list("-created_date"),
          User.me(),
          IncomeSource.list(),
        ]);

      const billTransactions = transactionsData.reduce((acc, tx) => {
        if (!acc[tx.bill_id]) acc[tx.bill_id] = [];
        acc[tx.bill_id].push(tx);
        return acc;
      }, {});

      const processedBills = billsData.map((bill) => {
        const transactionsForBill = billTransactions[bill.id] || [];
        const metrics = calculateBillMetrics(bill, transactionsForBill);

        return {
          ...bill,
          ...metrics,
          transactions: transactionsForBill,
        };
      });

      setAllData({
        subscriptions: subsData,
        bills: processedBills,
        transactions: transactionsData,
        incomeSources: incomeSourcesData || [],
      });

      void currentUser;
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data.");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
      toast.success("Dashboard refreshed!");
    } catch {
      toast.error("Failed to refresh dashboard");
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  const handleTouchStart = (e) => {
    if (e.currentTarget.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY(0);
    }
  };
  const handleTouchMove = (e) => {
    if (startY > 0 && e.currentTarget.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, 120));
      }
    }
  };
  const handleTouchEnd = () => {
    if (pullDistance > 80 && !isRefreshing) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
    setStartY(0);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    init();

    try {
      const dismissedAt = localStorage.getItem("overdue-alert-dismissed-at");
      if (dismissedAt) {
        const dismissedTime = new Date(dismissedAt);
        const now = new Date();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (now.getTime() - dismissedTime.getTime() < twentyFourHours) {
          setShowOverdueAlert(false);
        } else {
          localStorage.removeItem("overdue-alert-dismissed-at");
          setShowOverdueAlert(true);
        }
      }
    } catch (error) {
      console.error("Error checking overdue alert dismissal:", error);
    }
  }, []);

  const handleDismissOverdueAlert = () => {
    try {
      localStorage.setItem("overdue-alert-dismissed-at", new Date().toISOString());
      setShowOverdueAlert(false);
    } catch (error) {
      console.error("Error storing overdue alert dismissal:", error);
      setShowOverdueAlert(false);
    }
  };

  const processedData = useMemo(() => {
    const { subscriptions, bills, incomeSources } = allData;

    const monthlySubCost = subscriptions
      .filter((sub) => sub.status === "active" && sub.billing_cycle === "monthly")
      .reduce((total, sub) => total + sub.cost, 0);

    const currentMonth = new Date();
    const overdueBillsCount = bills.filter(
      (bill) => bill.status === "overdue" && isSameMonth(parseISO(bill.dueDate), currentMonth)
    ).length;

    const allBillsForCharts = bills.filter((bill) =>
      isSameMonth(parseISO(bill.dueDate), currentMonth)
    );
    const donutData = getBillsDonutChartData(allBillsForCharts); // kept; remove if truly unused anywhere else

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    let totalExpectedIncome = 0;
    (incomeSources || []).forEach((source) => {
      if (source.status !== "active" || !source.nextPayday) return;
      try {
        const parsedNextPayday = parseISO(source.nextPayday);
        if (source.payFrequency === "weekly" || source.payFrequency === "bi-weekly") {
          const intervalDays = source.payFrequency === "weekly" ? 7 : 14;
          let currentPayday = parsedNextPayday;

          while (isBefore(currentPayday, monthStart)) {
            currentPayday = addDays(currentPayday, intervalDays);
          }
          while (isWithinInterval(currentPayday, { start: monthStart, end: monthEnd })) {
            totalExpectedIncome += source.expectedAmount || 0;
            currentPayday = addDays(currentPayday, intervalDays);
          }
        } else {
          if (isWithinInterval(parsedNextPayday, { start: monthStart, end: monthEnd })) {
            totalExpectedIncome += source.expectedAmount || 0;
          }
        }
      } catch (e) {
        console.error(`Could not process income source for chart: ${source.name}`, e);
      }
    });

    const currentMonthBills = bills.filter((bill) =>
      isSameMonth(parseISO(bill.dueDate), now)
    );
    const totalCurrentMonthBillsOriginal = currentMonthBills.reduce(
      (sum, bill) => sum + (bill.amountOriginal || 0),
      0
    );

    const incomeOutcomeData = [
      {
        name: format(now, "MMM"),
        income: totalExpectedIncome,
        outcome: totalCurrentMonthBillsOriginal,
      },
    ];

    const allPotentialUpcoming = getUpcomingItems(bills, subscriptions);

    let filteredUpcomingItems;
    let dateRangeTitle;

    if (upcomingFilterDate) {
      const fourteenDaysFromSelected = add(upcomingFilterDate, { days: 14 });
      filteredUpcomingItems = allPotentialUpcoming.filter((item) => {
        const itemDate = item.rawDate;
        return itemDate >= upcomingFilterDate && itemDate <= fourteenDaysFromSelected;
      });
      dateRangeTitle = `From ${format(upcomingFilterDate, "MMM d")}`;
    } else {
      const today = startOfToday();
      const fourteenDaysFromNow = add(today, { days: 14 });
      filteredUpcomingItems = allPotentialUpcoming
        .filter((item) => item.rawDate >= today && item.rawDate <= fourteenDaysFromNow)
        .slice(0, 10);
      dateRangeTitle = "Next 14 days";
    }

    const upcomingBills = filteredUpcomingItems.filter((item) => item.type === "bill").slice(0, 5);
    const upcomingSubscriptions = filteredUpcomingItems
      .filter((item) => item.type === "subscription")
      .slice(0, 5);

    const calendarEvents = [];

    bills.forEach((bill) => {
      calendarEvents.push({
        id: `bill-${bill.id}`,
        name: bill.name,
        date: bill.dueDate,
        amount: bill.amountOriginal || 0,
        type: "bill",
        status: bill.status,
        totalBalance: bill.balance || 0,
      });

      if (bill.previous_balance > 0) {
        try {
          let originalDueDateISO = null;
          const systemNotes = bill.system_notes || "";
          const originalDateMatch = systemNotes.match(/Original due date: (\d{4}-\d{2}-\d{2})/);

          if (originalDateMatch) {
            originalDueDateISO = originalDateMatch[1];
          } else {
            const currentDueDate = parseISO(bill.dueDate);
            const originalDueDate = new Date(currentDueDate);
            originalDueDate.setMonth(originalDueDate.getMonth() - 1);
            originalDueDateISO = format(originalDueDate, "yyyy-MM-dd");
          }

          calendarEvents.push({
            id: `carryover-${bill.id}`,
            name: `${bill.name} (Past Due)`,
            date: originalDueDateISO,
            amount: bill.previous_balance,
            type: "bill",
            status: bill.carryoverStatus === "paid" ? "paid" : "overdue",
            isCarryover: true,
            originalDueDate: true,
          });
        } catch (e) {
          console.error("Error processing carryover date for calendar:", e);
        }
      }
    });

    subscriptions
      .filter((s) => s.status === "active")
      .forEach((sub) => {
        calendarEvents.push({
          id: `sub-${sub.id}`,
          name: sub.name,
          date: sub.renewal_date,
          amount: sub.cost,
          type: "subscription",
          status: sub.paidThisCycle
            ? "paid"
            : isBefore(parseISO(sub.renewal_date), startOfToday())
            ? "overdue"
            : "upcoming",
        });
      });

    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());

    (incomeSources || []).forEach((source) => {
      if (source.status !== "active" || !source.nextPayday) return;
      try {
        if (source.payFrequency === "weekly" || source.payFrequency === "bi-weekly") {
          const intervalDays = source.payFrequency === "weekly" ? 7 : 14;
          let currentPayday = parseISO(source.nextPayday);

          while (isAfter(currentPayday, currentMonthStart)) {
            currentPayday = subDays(currentPayday, intervalDays);
          }

          while (currentPayday <= currentMonthEnd) {
            if (isWithinInterval(currentPayday, { start: currentMonthStart, end: currentMonthEnd })) {
              calendarEvents.push({
                id: `income-${source.id}-${format(currentPayday, "yyyy-MM-dd")}`,
                name: `${source.name} (Payday)`,
                date: format(currentPayday, "yyyy-MM-dd"),
                amount: source.expectedAmount || 0,
                type: "income",
                status: "expected_income",
              });
            }
            currentPayday = addDays(currentPayday, intervalDays);
          }
        } else {
          const payday = parseISO(source.nextPayday);
          if (isWithinInterval(payday, { start: currentMonthStart, end: currentMonthEnd })) {
            calendarEvents.push({
              id: `income-${source.id}`,
              name: `${source.name} (Payday)`,
              date: source.nextPayday,
              amount: source.expectedAmount || 0,
              type: "income",
              status: "expected_income",
            });
          }
        }
      } catch (e) {
        console.error(`Error processing income source for calendar:${source.name}`, e);
      }
    });

    return {
      stats: {
        monthlySubCost,
        overdueBillsCount,
      },
      donutData,
      incomeOutcomeData,
      upcomingBills,
      upcomingSubscriptions,
      dateRangeTitle,
      calendarEvents,
    };
  }, [allData, upcomingFilterDate]);

  const handleSelectItem = (item) => {
    if (item.type === "bill") {
      const fullBill = allData.bills.find((b) => b.id === item.id);
      if (fullBill) setSelectedUpcoming(fullBill);
    } else {
      toast.info(`Selected subscription: ${item.name}. Detail view coming soon.`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-white">Loading your dashboard...</div>;
  }

  const refreshOpacity = Math.min(pullDistance / 80, 1);
  const refreshRotation = (pullDistance / 120) * 360;

  return (
    <div
      className="p-3 sm:p-6 lg:p-6 space-y-4 sm:space-y-2 relative h-full overflow-y-auto safe-top safe-bottom"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overscrollBehavior: "contain" }}
    >
      {/* Pull-to-refresh indicator */}
      <div
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center transition-transform duration-200"
        style={{ transform: `translateY(${Math.min(pullDistance, 80) - 80}px) translateX(-50%)` }}
      >
        <div
          className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm"
          style={{ opacity: refreshOpacity }}
        >
          <div
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            style={{
              transform: `rotate(${isRefreshing ? 0 : refreshRotation}deg)`,
              animation: isRefreshing ? "spin 1s linear infinite" : "none",
            }}
          />
          {isRefreshing ? "Refreshing..." : pullDistance > 80 ? "Release to refresh" : "Pull to refresh"}
        </div>
      </div>

      {/* Stat cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <StatsCardGrid>
          <StatsCard
            dataKey="overdue"
            title="Overdue Bills"
            value={processedData.stats.overdueBillsCount}
            icon={AlertTriangle}
            gradient="from-orange-400 to-red-400"
            subtitle="Need attention"
            variant={processedData.stats.overdueBillsCount > 0 ? "danger" : undefined}
            linkTo={createPageUrl("bills")}
          />
          <StatsCard
            dataKey="income"
            title="Received Income"
            value={`$${(processedData.incomeOutcomeData[0]?.income || 0).toFixed(2)}`}
            icon={DollarSign}
            gradient="from-green-400 to-lime-400"
            subtitle="This month"
            linkTo={createPageUrl("income")}
          />
          <StatsCard
            dataKey="subs"
            title="Subscriptions"
            value={`$${processedData.stats.monthlySubCost.toFixed(2)}`}
            icon={CreditCard}
            gradient="from-purple-400 to-pink-400"
            subtitle="Active services"
            linkTo={createPageUrl("subscriptions")}
          />
          <StatsCard
            dataKey="budgets"
            title="Budgets"
            value="View All"
            icon={Calculator}
            gradient="from-emerald-500 to-green-500"
            subtitle="Review & manage"
            linkTo={createPageUrl("budgets")}
          />
        </StatsCardGrid>
      </motion.div>

      {/* Overdue alert */}
      {showOverdueAlert && processedData.stats.overdueBillsCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <OverdueAlert count={processedData.stats.overdueBillsCount} onDismiss={handleDismissOverdueAlert} />
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="border-t-2 border-white/40" />

      {/* Calendar + upcoming items (charts removed) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="space-y-4 sm:space-y-6">
        <div className="glass-panel p-3 sm:p-4 rounded-2xl col-span-1 lg:col-span-2">
          <MonthlyCalendarStrip events={processedData.calendarEvents} onDateSelect={setUpcomingFilterDate} />
          <div className="mt-4 sm:mt-6 border-t-2 border-white/10 pt-3 sm:pt-4 grid grid-cols-1 gap-y-4 sm:gap-y-4 lg:grid-cols-2 lg:gap-x-6">
            <UpcomingDashboardItems
              items={processedData.upcomingBills}
              onSelectItem={handleSelectItem}
              title="Upcoming Bills"
              dateRangeTitle={processedData.dateRangeTitle}
            />
            <UpcomingDashboardItems
              items={processedData.upcomingSubscriptions}
              onSelectItem={handleSelectItem}
              title="Upcoming Subscriptions"
              dateRangeTitle={processedData.dateRangeTitle}
            />
          </div>
        </div>

        {/* Removed charts section */}
      </motion.div>

      {selectedUpcoming && (
        <BillDetailsDrawer
          bill={selectedUpcoming}
          onClose={() => setSelectedUpcoming(null)}
          onEdit={() => toast.info("Please edit from the Bills page.")}
          onAddTransaction={() => toast.info("Please add transactions from the Bills page.")}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .glass-panel[role="dialog"] {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          max-height: 85vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return (
    <PageErrorBoundary pageName="Dashboard">
      <DashboardContent />
    </PageErrorBoundary>
  );
}