import {
  format,
  parseISO,
  isSameMonth,
  isBefore,
  startOfToday,
  isToday,
  isTomorrow,
  add,
  subMonths,
  subWeeks,
  isSameDay, // Import isSameDay
} from 'date-fns';
import { calculateBillMetrics } from '@/components/bills/billCalculationUtils';

/**
 * Prepares data for the Bills Breakdown Donut Chart for the current month.
 * @param {Array} bills - The array of bill objects.
 * @returns {Array} - Data formatted for Recharts PieChart.
 */
export function getBillsDonutChartData(bills) {
  const currentMonthBills = bills.filter(bill => isSameMonth(parseISO(bill.dueDate), new Date()));
  
  const categoryTotals = currentMonthBills.reduce((acc, bill) => {
    const category = bill.category || 'Other';
    acc[category] = (acc[category] || 0) + (bill.amountOriginal || 0);
    return acc;
  }, {});

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];
  
  return Object.entries(categoryTotals).map(([name, value], index) => ({
    name,
    value,
    fill: colors[index % colors.length],
  }));
}

/**
 * Prepares data for the 6-Month Income vs. Outcome Line Chart.
 * @param {Array} transactions - The array of financial transaction objects (deposits, general payments).
 * @param {Array} bills - The array of bill objects (used for paid bill amounts).
 * @returns {Array} - Data formatted for Recharts LineChart.
 */
export function getIncomeOutcomeChartData(transactions, bills) {
  const today = new Date();
  const sixMonthsAgo = subMonths(today, 5); // Start of the month 5 months ago
  sixMonthsAgo.setDate(1); // Ensure it's the first day of that month
  sixMonthsAgo.setHours(0, 0, 0, 0); // Normalize to start of day for accurate comparison

  const monthlyData = {};

  // Initialize monthly data for the last 6 months
  for (let i = 0; i < 6; i++) {
    const monthStart = add(sixMonthsAgo, { months: i });
    const monthKey = format(monthStart, 'yyyy-MM');
    monthlyData[monthKey] = { income: 0, outcome: 0 };
  }

  // Process transactions
  transactions.forEach(tx => {
    try {
      const txDate = parseISO(tx.created_date);
      const monthKey = format(txDate, 'yyyy-MM');

      // Only consider transactions within our 6-month window and ensure monthKey exists
      if (monthlyData[monthKey] && txDate >= sixMonthsAgo) {
        if (tx.type === 'deposit') {
          monthlyData[monthKey].income += tx.amount || 0;
        } else if (tx.type === 'payment') {
          monthlyData[monthKey].outcome += tx.amount || 0;
        }
      }
    } catch (e) {
      console.warn("Could not parse created_date for income/outcome chart transaction:", tx.created_date, e);
    }
  });

  // Process paid bills
  // NOTE: This assumes that bill payments (totalPaid) recorded in 'bills' are distinct from 'payment' type transactions.
  // If a bill payment also generates a 'payment' transaction, this approach could double-count.
  // A robust solution would require a way to link transactions to bills or a clearer data model definition.
  bills.forEach(bill => {
    if (bill.status === 'paid' && bill.paid_date) {
      try {
        const paidDate = parseISO(bill.paid_date);
        const monthKey = format(paidDate, 'yyyy-MM');

        // Only consider paid bills within our 6-month window and ensure monthKey exists
        if (monthlyData[monthKey] && paidDate >= sixMonthsAgo) {
          monthlyData[monthKey].outcome += bill.totalPaid || 0;
        }
      } catch (e) {
        console.warn("Could not parse paid_date for income/outcome chart bill:", bill.paid_date, e);
      }
    }
  });

  // Format for Recharts LineChart
  return Object.entries(monthlyData)
    .sort(([monthA], [monthB]) => new Date(monthA) - new Date(monthB)) // Ensure chronological order
    .map(([monthKey, totals]) => ({
      name: format(parseISO(`${monthKey}-01`), 'MMM'), // Display as 'Jan', 'Feb', etc.
      income: parseFloat(totals.income.toFixed(2)),
      outcome: parseFloat(totals.outcome.toFixed(2)),
    }));
}

/**
 * Gets all unpaid bills and active subscriptions to be used for upcoming items display.
 * The filtering by date range is now handled in the component.
 * @param {Array} bills - The array of bill objects.
 * @param {Array} subscriptions - The array of subscription objects.
 * @returns {Array} - An unsliced, sorted list of all potential upcoming items.
 */
export function getUpcomingItems(bills, subscriptions) {
  const upcomingBills = bills
    .filter(bill => {
      // Only include bills that aren't paid (pending or overdue)
      return bill.status !== 'paid';
    })
    .map(bill => ({
        id: bill.id,
        name: bill.name,
        amount: bill.balance || 0,
        date: bill.dueDate,
        type: 'bill',
        isUrgent: isToday(parseISO(bill.dueDate)) || isTomorrow(parseISO(bill.dueDate)),
        rawDate: parseISO(bill.dueDate)
    }));
  
  const upcomingSubscriptions = subscriptions
    .filter(sub => {
        if (sub.status !== 'active') return false;
        // Include all active subscriptions that haven't been marked as paid for the cycle
        return !sub.paidThisCycle;
    })
    .map(sub => ({
      id: sub.id,
      name: sub.name,
      amount: sub.cost || 0,
      date: sub.renewal_date,
      type: 'subscription',
      isUrgent: isToday(parseISO(sub.renewal_date)) || isTomorrow(parseISO(sub.renewal_date)),
      rawDate: parseISO(sub.renewal_date)
    }));
  
  return [...upcomingBills, ...upcomingSubscriptions]
    .sort((a, b) => a.rawDate - b.rawDate);
}

/**
 * Gets transaction history.
 * @param {Array} bills - All bill objects which contain transactions.
 * @returns {Array} - A sorted list of transactions from the past 2 weeks.
 */
export function getTransactionHistory(bills = []) {
  // TODO: TransactionHistory functionality pending rebuild
  // For now, return empty array to prevent dashboard errors
  return [];
}