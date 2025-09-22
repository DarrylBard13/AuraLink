// Pages/bills.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Bill, User, BillTransaction } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Search, Calendar, ChevronLeft, ChevronRight, Receipt, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { format, addMonths, subMonths, parse, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import BillForm from "../components/bills/BillForm";
import BillCard from "../components/bills/BillCard";
import BillStatsSafe from "../components/bills/BillStatsSafe";
import BillTransactionModal from "../components/bills/BillTransactionModal";
import BillDetailsDrawer from "../components/bills/BillDetailsDrawer";
import EmptyBillsState from "../components/bills/EmptyBillsState";
import PageErrorBoundary from "../components/common/PageErrorBoundary";
import { safeDueDate } from "../components/bills/dateUtils";
import { calculateBillMetrics } from "../components/bills/billCalculationUtils";
import { toast } from "sonner";

// Main Component
function BillsPageContent() {
  // State Management
  const [bills, setBills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionBill, setTransactionBill] = useState(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [detailsBill, setDetailsBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState(format(new Date(), 'yyyy-MM'));

  // User and URL Parameter Setup
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    };
    fetchUser();

  }, []);

  // Data Loading
  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentCycleDate = parse(selectedCycle, 'yyyy-MM', new Date());
      const nextCycle = format(addMonths(currentCycleDate, 1), 'yyyy-MM');

      const [billsData, nextCycleBillsData, transactionsData] = await Promise.all([
        Bill.filter({ cycle: selectedCycle }),
        Bill.filter({ cycle: nextCycle }),
        BillTransaction.list(),
      ]);

      const transactionsByBillId = transactionsData.reduce((acc, tx) => {
        if (!acc[tx.bill_id]) acc[tx.bill_id] = [];
        acc[tx.bill_id].push(tx);
        return acc;
      }, {});

      const nextCycleBillsMap = new Map((Array.isArray(nextCycleBillsData) ? nextCycleBillsData : []).map(b => [b.name, b]));

      const processedBills = (Array.isArray(billsData) ? billsData : [])
        .map((bill) => {
          if (!bill || typeof bill !== 'object') return null;

          const nextCycleBill = nextCycleBillsMap.get(bill.name);
          if (nextCycleBill && nextCycleBill.previous_balance > 0) {
            const nextCycleTransactions = transactionsByBillId[nextCycleBill.id] || [];
            const nextCycleMetrics = calculateBillMetrics(nextCycleBill, nextCycleTransactions);

            if (nextCycleMetrics.carryoverStatus === 'paid') {
              return {
                ...bill,
                status: 'paid_carryover',
                balance: 0,
                totalPaid: bill.amountOriginal,
                transactions: transactionsByBillId[bill.id] || [],
                archived: bill.archived,
                system_notes: (bill.system_notes || '') + '\nMarked paid via carryover to next cycle.'
              };
            }
          }

          const billTransactions = transactionsByBillId[bill.id] || [];
          const metrics = calculateBillMetrics(bill, billTransactions);

          return {
            ...bill,
            ...metrics,
            transactions: billTransactions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
            archived: Boolean(bill.archived)
          };
        })
        .filter((bill) => bill !== null && bill.archived !== true);

      setBills(processedBills);
    } catch (error) {
      console.error("[BillsPage] Error loading bills:", error);
      setError(error);
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCycle]);


  // Form Handlers
  const handleSubmit = async (billData) => {
    try {
      const { totalDue, totalPaid, totalFees, balance, status, transactions, ...savableBillData } = billData;

      if (savableBillData.dueDate) {
        savableBillData.cycle = format(parseISO(savableBillData.dueDate), 'yyyy-MM');
      }

      if (editingBill) {
        await Bill.update(editingBill.id, savableBillData);
      } else {
        await Bill.create(savableBillData);
      }
      setShowForm(false);
      setEditingBill(null);
      loadBills();
    } catch (error) {
      console.error("[BillsPage] Error saving bill:", error);
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBill(null);
  };

  const handleAddTransaction = (bill) => {
    setTransactionBill(bill);
    setShowTransactionModal(true);
  };

  // Bill Management
  const handleTransactionSubmit = async (transactionData) => {
    try {
      // Create the new transaction on the current bill
      await BillTransaction.create({ ...transactionData, bill_id: transactionBill.id });

      // Reload current bill and metrics
      const updatedBill = await Bill.get(transactionBill.id);
      const updatedTransactions = await BillTransaction.filter({ bill_id: transactionBill.id });
      const updatedMetrics = calculateBillMetrics(updatedBill, updatedTransactions);

      // Settlement: if this next cycle bill had carryover and is now fully paid, zero the previous cycle bill via credit
      if ((updatedBill.previous_balance || 0) > 0 && updatedMetrics?.carryoverStatus === "paid") {
        try {
          let prevBill = null;

          // Prefer linking via previous_bill_id set by rollover_manager
          if (updatedBill.previous_bill_id) {
            try { prevBill = await Bill.get(updatedBill.previous_bill_id); } catch {}
          }

          // Fallback: name + prior cycle
          if (!prevBill) {
            const currentDue = parseISO(updatedBill.dueDate);
            const prevCycle = format(subMonths(currentDue, 1), "yyyy-MM");
            const prevBills = await Bill.filter({ name: updatedBill.name, cycle: prevCycle });
            prevBill = Array.isArray(prevBills) ? prevBills[0] : null;
          }

          if (prevBill) {
            const prevTxs = await BillTransaction.filter({ bill_id: prevBill.id });
            const prevMetrics = calculateBillMetrics(prevBill, prevTxs);
            const remaining = Number(prevMetrics?.balance || 0);

            if (remaining > 0.01) {
              const alreadySettled = (prevTxs || []).some(
                tx =>
                  tx.type === "credit" &&
                  (tx.note || "").includes(`Carryover settlement via next cycle bill ${updatedBill.id}`)
              );

              if (!alreadySettled) {
                await BillTransaction.create({
                  bill_id: prevBill.id,
                  type: "credit",
                  amount: remaining,
                  note: `Carryover settlement via next cycle bill ${updatedBill.id} (${format(parseISO(updatedBill.dueDate), "MMMM yyyy")})`,
                  transaction_date: format(new Date(), "yyyy-MM-dd")
                });
              }
            }

            // Annotate only. Do not archive.
            const newNotes =
              (prevBill.system_notes || "") +
              `\nCarryover settled via next-cycle payment on ${new Date().toISOString()}.`;
            await Bill.update(prevBill.id, { system_notes: newNotes });
          }
        } catch (e) {
          console.error("[BillsPage] Carryover settlement failed:", e);
          // Non fatal
        }
      }

      // Existing note on the current bill
      if (
        updatedBill.previous_balance > 0 &&
        updatedMetrics.carryoverStatus === "paid" &&
        !(updatedBill.system_notes || "").includes("Carryover balance paid")
      ) {
        const systemNotesUpdate =
          (updatedBill.system_notes || "") + `\nCarryover balance paid on ${new Date().toISOString()}.`;
        await Bill.update(updatedBill.id, { system_notes: systemNotesUpdate });
      }

      toast.success("Transaction recorded successfully!");
      setShowTransactionModal(false);
      setTransactionBill(null);
      loadBills();
    } catch (error) {
      console.error("[Bills] Error recording transaction:", error);
      toast.error("Failed to record payment.");
    }
  };

  const handleShowDetails = (bill) => {
    setDetailsBill(bill);
    setShowDetailsDrawer(true);
  };

  const handleDelete = async (bill) => {
    if (!window.confirm(
      `Are you sure you want to permanently delete "${bill.name}"? This action cannot be undone.`
    )) {
      return;
    }

    try {
      const billTransactions = bill.transactions || [];
      if (billTransactions.length > 0) {
        await Promise.all(
          billTransactions.map((transaction) =>
            BillTransaction.delete(transaction.id)
          )
        );
      }

      await Bill.delete(bill.id);
      toast.success(`Bill "${bill.name}" was deleted successfully.`);

      setShowDetailsDrawer(false);
      setDetailsBill(null);
      loadBills();

    } catch (error) {
      console.error("[BillsPage] Error deleting bill:", error);
      toast.error("Failed to delete the bill. Please try again.");
    }
  };

  const handlePayAndAdvance = async (bill) => {
    try {
      const paymentDate = new Date();

      if (bill.balance > 0.01) {
        await BillTransaction.create({
          bill_id: bill.id,
          type: 'payment',
          amount: bill.balance,
          note: `Full payment for ${format(parseISO(bill.dueDate), 'MMMM yyyy')} cycle.`,
          transaction_date: format(paymentDate, 'yyyy-MM-dd')
        });
        console.log(`[BillsPage] Recorded payment of ${bill.balance.toFixed(2)} for bill '${bill.name}'.`);

        toast.success(`Payment of $${bill.balance.toFixed(2)} recorded for "${bill.name}".`);
      } else {
        console.log(`[BillsPage] Bill '${bill.name}' already fully paid (balance: ${bill.balance.toFixed(2)}).`);
        toast.info(`Bill "${bill.name}" is already paid.`);
      }

      loadBills();
    } catch (error) {
      console.error("[BillsPage] Error paying bill:", error);
      toast.error("Failed to record payment.");
    }
  };

  // Admin Actions
  const handleMoveToNextCycle = async (bill) => {
    toast.info("This feature has been decommissioned.", {
      description: "Bill cycle management is now handled by the AI Assistant.",
    });
    console.warn(`Attempted to use deprecated 'Move to Next Cycle' feature for bill: "${bill.name}".`);
  };

  // Filtering and Sorting
  const getFilteredAndSortedBills = () => {
    if (!Array.isArray(bills)) return [];

    let baseBills = [...bills];

    let filtered = baseBills.filter((bill) => {
        if (!bill || typeof bill !== 'object') return false;

        if (statusFilter === "all") {
            return true;
        } else if (statusFilter === "unpaid") {
            return (bill.status === "overdue" || bill.status === "pending");
        } else if (statusFilter === "paid") {
            return (bill.status === "paid" || bill.status === "paid_carryover");
        } else {
            return bill.status === statusFilter;
        }
    });

    filtered = filtered.filter((bill) => {
        const name = bill.name || '';
        const notes = bill.notes || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               notes.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (categoryFilter !== "all") {
        filtered = filtered.filter((bill) => (bill.category || '') === categoryFilter);
    }

    filtered.sort((a, b) => {
        try {
            switch (sortBy) {
                case "dueDate": {
                    const dueDateA = (a.status === 'paid' || a.status === 'paid_carryover') ? Infinity : (safeDueDate(a.dueDate) || 0);
                    const dueDateB = (b.status === 'paid' || b.status === 'paid_carryover') ? Infinity : (safeDueDate(b.dueDate) || 0);
                    return dueDateA - dueDateB;
                }
                case "balance": {
                    const balanceA = (a.status === 'paid' || a.status === 'paid_carryover') ? 0 : (a.balance || 0);
                    const balanceB = (b.status === 'paid' || b.status === 'paid_carryover') ? 0 : (b.balance || 0);
                    return balanceB - balanceA;
                }
                case "name":
                    return (a.name || '').localeCompare(b.name || '');
                default:
                    return 0;
            }
        } catch (error) {
            console.error("[BillsPage] Error sorting bills:", error);
            return 0;
        }
    });

    return filtered;
  };

  const filteredBills = getFilteredAndSortedBills();
  const isAdmin = true;

  const overdueBills = filteredBills.filter((bill) => bill.status === "overdue");
  const upcomingBills = filteredBills.filter((bill) => bill.status === "pending");
  const paidBillsList = filteredBills.filter((bill) => bill.status === 'paid' || bill.status === 'paid_carryover');

  const hasFilters = searchTerm || statusFilter !== "all" || categoryFilter !== "all";

  const changeCycle = (direction) => {
    const currentDate = parse(selectedCycle, 'yyyy-MM', new Date());
    const newDate = direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
    setSelectedCycle(format(newDate, 'yyyy-MM'));
  };

  // Render
  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start lg:items-center"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Bills</h1>
          <p className="text-white/80 text-sm sm:text-base">Track payments and manage due dates</p>
        </div>
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:w-auto">
          {isAdmin && (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg min-h-[44px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Bill
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 min-h-[44px]"
          >
            <Link to={createPageUrl("billtransactions")}>
              <Receipt className="w-4 h-4 mr-2" />
              Transaction History
            </Link>
          </Button>
        </div>
      </motion.div>

      <BillStatsSafe bills={bills} loading={loading} selectedCycle={selectedCycle} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-2xl p-3 sm:p-6 space-y-4"
      >
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => changeCycle('prev')} className="h-10 w-10 text-white/60 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px]">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg sm:text-xl font-bold text-white text-center w-32 sm:w-48">
              {format(parse(selectedCycle, 'yyyy-MM', new Date()), 'MMMM yyyy')}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => changeCycle('next')} className="h-10 w-10 text-white/60 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px]">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative flex-1 max-w-full md:min-w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-white/60" />
            <Input
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 min-h-[44px] text-base"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4 sm:items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32 bg-white/10 border-white/20 text-white min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Default</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-32 bg-white/10 border-white/20 text-white min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Housing">Housing</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Insurance">Insurance</SelectItem>
              <SelectItem value="Loans">Loans</SelectItem>
              <SelectItem value="Subscriptions">Subscriptions</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              <SelectItem value="all">All Categories</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40 bg-white/10 border-white/20 text-white min-h-[44px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="balance">Balance</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {isAdmin && (
        <Dialog open={showForm} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
          <DialogContent className="glass-panel text-white border-white/20 max-w-2xl w-full">
            <DialogHeader>
              <DialogTitle>{editingBill ? "Edit Bill" : "Add New Bill"}</DialogTitle>
            </DialogHeader>
            {showForm && (
              <BillForm
                bill={editingBill}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-6 sm:space-y-8"
      >
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl p-4 sm:p-6 animate-pulse">
                <div className="h-6 bg-white/20 rounded mb-3 w-3/4"></div>
                <div className="h-8 bg-white/20 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-white/20 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredBills.length === 0 ? (
          <EmptyBillsState
            onAddBill={isAdmin ? () => setShowForm(true) : null}
            searchTerm={searchTerm}
            hasFilters={hasFilters}
          />
        ) : (
          <>
            {overdueBills.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-red-300 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Overdue ({overdueBills.length})
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {overdueBills.map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      onEdit={isAdmin ? handleEdit : null}
                      onAddTransaction={isAdmin ? handleAddTransaction : null}
                      onShowDetails={handleShowDetails}
                      onPayAndAdvance={isAdmin ? handlePayAndAdvance : null}
                      onMoveToNextCycle={isAdmin ? handleMoveToNextCycle : null}
                    />
                  ))}
                </div>
              </div>
            )}

            {upcomingBills.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-white/80 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming ({upcomingBills.length})
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcomingBills.map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      onEdit={isAdmin ? handleEdit : null}
                      onAddTransaction={isAdmin ? handleAddTransaction : null}
                      onShowDetails={handleShowDetails}
                      onPayAndAdvance={isAdmin ? handlePayAndAdvance : null}
                      onMoveToNextCycle={isAdmin ? handleMoveToNextCycle : null}
                    />
                  ))}
                </div>
              </div>
            )}

            {paidBillsList.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-green-300/80 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Paid ({paidBillsList.length})
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {paidBillsList.map((bill) => (
                    <BillCard
                      key={bill.id}
                      bill={bill}
                      onEdit={isAdmin ? handleEdit : null}
                      onAddTransaction={isAdmin ? handleAddTransaction : null}
                      onShowDetails={handleShowDetails}
                      onPayAndAdvance={isAdmin ? handlePayAndAdvance : null}
                      onMoveToNextCycle={isAdmin ? handleMoveToNextCycle : null}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {isAdmin && showTransactionModal && transactionBill &&
        <BillTransactionModal
          bill={transactionBill}
          metrics={{ balance: transactionBill.balance, totalDue: transactionBill.totalDue }}
          onSubmit={handleTransactionSubmit}
          onClose={() => {
            setShowTransactionModal(false);
            setTransactionBill(null);
          }} />

      }

      {showDetailsDrawer && detailsBill &&
        <BillDetailsDrawer
          bill={detailsBill}
          onClose={() => {
            setShowDetailsDrawer(false);
            setDetailsBill(null);
          }}
          onEdit={isAdmin ? handleEdit : null}
          onAddTransaction={isAdmin ? handleAddTransaction : null}
          onPayAndAdvance={isAdmin ? handlePayAndAdvance : null}
          onDelete={isAdmin ? handleDelete : null}
        />

      }
      <style>{`
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

// Error Boundary Wrapper
export default function BillsPage() {
  return (
    <PageErrorBoundary pageName="Bills">
      <BillsPageContent />
    </PageErrorBoundary>
  );
}