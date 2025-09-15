export function calculateBillMetrics(bill, transactions = []) {
  if (!bill) {
    return {
      totalDue: 0,
      totalPaid: 0,
      balance: 0,
      status: 'pending',
    };
  }

  const baseAmount = Number(bill.amountOriginal) || 0;
  const carryoverAmount = Number(bill.previous_balance) || 0;
  
  let totalPaid = 0;
  let totalFeesAndAdjustments = 0;

  (transactions || []).forEach(tx => {
    const amount = Number(tx.amount) || 0;
    switch (tx.type) {
      case 'payment':
      case 'credit':
        totalPaid += amount;
        break;
      case 'late_fee':
      case 'adjustment':
        totalFeesAndAdjustments += amount;
        break;
    }
  });

  const totalDue = baseAmount + carryoverAmount + totalFeesAndAdjustments;
  const balance = totalDue - totalPaid;

  // Calculate carryover status first
  const carryoverBalance = Math.max(0, carryoverAmount - totalPaid);
  const carryoverStatus = carryoverAmount > 0 && carryoverBalance <= 0.01 ? 'paid' : 'unpaid';

  // Determine overall status
  let status = 'pending';
  
  if (balance <= 0.01) {
    // Bill is fully paid
    status = 'paid';
  } else {
    // Check if this is a non-recurring bill from a previous cycle FIRST
    if (bill.dueDate && bill.recurring === 'none') {
      try {
        const dueDate = new Date(bill.dueDate);
        const now = new Date();
        now.setHours(0,0,0,0);
        
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const billMonth = dueDate.getMonth();
        const billYear = dueDate.getFullYear();
        
        const isFromPreviousCycle = (billYear < currentYear) || 
          (billYear === currentYear && billMonth < currentMonth);
        
        // If it's a non-recurring bill from a previous cycle, never mark as overdue
        if (isFromPreviousCycle) {
          status = 'pending';
        } else {
          // It's a non-recurring bill from current cycle, check if overdue normally
          status = now > dueDate ? 'overdue' : 'pending';
        }
      } catch(e) {
        status = 'pending';
      }
    } else {
      // Recurring bill or no due date - use original logic
      if (carryoverAmount > 0 && carryoverStatus === 'unpaid') {
        // Has unpaid carryover - mark as overdue
        status = 'overdue';
      } else {
        // Check current due date
        if (bill.dueDate) {
          try {
            const dueDate = new Date(bill.dueDate);
            const now = new Date();
            now.setHours(0,0,0,0);
            
            status = now > dueDate ? 'overdue' : 'pending';
          } catch(e) {
            status = 'pending';
          }
        }
      }
    }
  }

  return {
    totalDue,
    totalPaid,
    totalFees: transactions.filter(t => t.type === 'late_fee').reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    balance: Math.max(0, balance),
    remainingBalance: balance, // Add this for negative balances (overpayments)
    status,
    // New fields for carryover tracking
    carryoverStatus,
    carryoverBalance,
  };
}

export function shouldAutoAdvance(bill, metrics) {
  // Only advance monthly recurring bills that are fully paid
  return bill.recurring === 'monthly' && metrics.remainingBalance <= 0.01;
}

export function calculateNextCycleBill(bill, metrics, nextDueDateISO) {
  const overpayment = metrics.remainingBalance < 0 ? Math.abs(metrics.remainingBalance) : 0;
  const nextCycle = nextDueDateISO.substring(0, 7); // Extract YYYY-MM
  
  // Calculate next cycle amount with overpayment credit applied
  const baseAmount = bill.amountOriginal || 0;
  const nextAmountDue = Math.max(baseAmount - overpayment, 0);
  
  let systemNotes = `Auto-advanced from ${bill.cycle || 'previous'} cycle on ${new Date().toISOString()}.`;
  if (overpayment > 0.01) {
    systemNotes += `\nApplied $${overpayment.toFixed(2)} overpayment credit from previous cycle.`;
  }

  return {
    name: bill.name,
    amountOriginal: baseAmount,
    dueDate: nextDueDateISO,
    cycle: nextCycle,
    recurring: bill.recurring,
    category: bill.category || 'Other',
    notes: bill.notes || '',
    previous_balance: 0, // Fresh start for new cycle
    system_notes: systemNotes
  };
}