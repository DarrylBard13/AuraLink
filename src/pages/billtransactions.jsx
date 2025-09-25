// Pages/billtransactions.jsx

import React, { useState, useEffect, useCallback } from "react";
import { BillTransaction, Bill, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Calendar as CalendarIcon,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  Filter,
  Loader2,
  Receipt
} from "lucide-react";
import { format, parseISO, subDays, isAfter, isBefore, subMonths } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PageErrorBoundary from "../components/common/PageErrorBoundary";

/** --------------------------
 *  Carryover reconciliation helpers
 *  -------------------------- */

// Calculate remaining balance for a bill given its transactions.
// Matches server-side semantics: base + prev_balance + fees - payments/credits.
function calcBalance(bill, txs) {
  if (!bill) return 0;
  const base = Number(bill.amountOriginal) || 0;
  const prev = Number(bill.previous_balance) || 0;

  let paid = 0;
  let fees = 0;
  for (const tx of txs || []) {
    const amt = Number(tx.amount) || 0;
    if (tx.type === "payment" || tx.type === "credit") paid += amt;
    if (tx.type === "late_fee" || tx.type === "adjustment") fees += amt;
  }

  const totalDue = base + prev + fees;
  const bal = totalDue - paid;
  return Math.max(0, Number(bal.toFixed(2)));
}

// Return true if next-cycle bill fully settles its carryover component
// by looking at its total balance after edit/delete.
function nextBillSettlesCarryover(nextBill, txs) {
  if (!nextBill) return false;
  if ((Number(nextBill.previous_balance) || 0) <= 0) return false;
  const bal = calcBalance(nextBill, txs);
  return bal <= 0.01;
}

// Settlement note signature to find the right mirror transaction on the previous bill
function isSettlementCreditFor(nextBillId, tx) {
  if (!tx) return false;
  if (tx.type !== "credit") return false;
  const n = String(tx.note || "");
  return n.includes(`Carryover settlement via next cycle bill ${nextBillId}`);
}

// Find previous-cycle bill using previous_bill_id, then fallback to name + prior cycle
async function findPreviousBillFor(nextBill) {
  if (!nextBill) return null;

  // Prefer strong link
  if (nextBill.previous_bill_id) {
    try {
      return await Bill.get(nextBill.previous_bill_id);
    } catch {}
  }

  // Fallback: name + prior cycle from dueDate
  try {
    const due = parseISO(nextBill.dueDate);
    const priorCycle = format(subMonths(due, 1), "yyyy-MM");
    const matches = await Bill.filter({ name: nextBill.name, cycle: priorCycle });
    return Array.isArray(matches) ? matches[0] : null;
  } catch {
    return null;
  }
}

// Reconcile the previous bill's settlement credit after a next-bill edit or delete
async function reconcileSettlementForNextBill(nextBillId) {
  try {
    // Load next bill + its txs
    const nextBill = await Bill.get(nextBillId);
    const nextTxs = await BillTransaction.filter({ bill_id: nextBillId });

    const prevBill = await findPreviousBillFor(nextBill);
    if (!prevBill) return;

    const prevTxsAll = await BillTransaction.filter({ bill_id: prevBill.id });

    // Identify existing settlement credit
    const existingSettlement = (prevTxsAll || []).find(tx => isSettlementCreditFor(nextBillId, tx));

    // Compute prev bill balance EXCLUDING the settlement credit itself
    const prevTxsNoSettlement = (prevTxsAll || []).filter(tx => !isSettlementCreditFor(nextBillId, tx));
    const prevRemainder = calcBalance(prevBill, prevTxsNoSettlement);

    const fullySettledByNext = nextBillSettlesCarryover(nextBill, nextTxs);

    if (fullySettledByNext) {
      // Should have a credit equal to remainder
      if (prevRemainder > 0.01) {
        if (existingSettlement) {
          // Update amount if it changed materially
          if (Math.abs(Number(existingSettlement.amount) - prevRemainder) > 0.01) {
            await BillTransaction.update(existingSettlement.id, {
              amount: prevRemainder,
              note: existingSettlement.note // keep same note signature
            });
          }
        } else {
          // Create the mirror credit
          await BillTransaction.create({
            bill_id: prevBill.id,
            type: "credit",
            amount: prevRemainder,
            note: `Carryover settlement via next cycle bill ${nextBill.id} (${format(parseISO(nextBill.dueDate), "MMMM yyyy")})`,
            transaction_date: format(new Date(), "yyyy-MM-dd")
          });
        }

        // Annotate previous bill system_notes (idempotent-ish)
        const mark = `Carryover settled via next-cycle reconciliation on ${new Date().toISOString()}.`;
        if (!String(prevBill.system_notes || "").includes(mark)) {
          await Bill.update(prevBill.id, { system_notes: `${prevBill.system_notes || ""}\n${mark}` });
        }
      } else {
        // Nothing to credit; remove any old settlement to keep things clean
        if (existingSettlement) {
          await BillTransaction.delete(existingSettlement.id);
        }
      }
    } else {
      // Next bill no longer pays off the carryover; remove the settlement if it exists
      if (existingSettlement) {
        await BillTransaction.delete(existingSettlement.id);
        const note = `Carryover settlement removed due to next-cycle change on ${new Date().toISOString()}.`;
        await Bill.update(prevBill.id, { system_notes: `${prevBill.system_notes || ""}\n${note}` });
      }
    }
  } catch (e) {
    console.error("[Transactions] reconcileSettlementForNextBill failed:", e);
    // Non-fatal for the user; UI will still show the edited/deleted tx result.
  }
}

/** --------------------------
 *  Original component (with edits to Edit/Delete handlers)
 *  -------------------------- */

const TRANSACTION_TYPES = [
  { value: "payment", label: "Payment", color: "bg-green-100/20 text-green-200" },
  { value: "credit", label: "Credit", color: "bg-blue-100/20 text-blue-200" },
  { value: "late_fee", label: "Late Fee", color: "bg-red-100/20 text-red-200" },
  { value: "adjustment", label: "Adjustment", color: "bg-yellow-100/20 text-yellow-200" }
];

const DATE_PRESETS = [
  { value: "30", label: "Last 30 days", days: 30 },
  { value: "60", label: "Last 60 days", days: 60 },
  { value: "90", label: "Last 90 days", days: 90 },
  { value: "custom", label: "Custom range", days: null }
];

function BillTransactionsPageContent() {
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtering state
  const [datePreset, setDatePreset] = useState("30");
  const [dateFrom, setDateFrom] = useState(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");

  // Sorting state
  const [sortField, setSortField] = useState("transaction_date");
  const [sortDirection, setSortDirection] = useState("desc");

  // Edit dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editFormData, setEditFormData] = useState({
    bill_id: "",
    transaction_date: "",
    amount: "",
    type: "payment",
    note: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Load bills for name mapping
  const loadBills = useCallback(async () => {
    try {
      const billsData = await Bill.list();
      setBills(Array.isArray(billsData) ? billsData : []);
    } catch (error) {
      console.error("Error loading bills:", error);
      setBills([]);
    }
  }, []);

  // Load transactions based on filters
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const allTransactions = await BillTransaction.list();

      const filtered = (Array.isArray(allTransactions) ? allTransactions : []).filter((tx) => {
        if (!tx.transaction_date) return false;
        const txDate = parseISO(tx.transaction_date);
        return (isAfter(txDate, dateFrom) || txDate.getTime() === dateFrom.getTime()) &&
               (isBefore(txDate, dateTo) || txDate.getTime() === dateTo.getTime());
      });

      setTransactions(filtered);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Handle date preset changes
  const handleDatePresetChange = (value) => {
    setDatePreset(value);
    if (value !== "custom") {
      const days = DATE_PRESETS.find((p) => p.value === value)?.days || 30;
      setDateFrom(subDays(new Date(), days));
      setDateTo(new Date());
    }
  };

  // Create bill name mapping
  const billMap = React.useMemo(() => {
    const map = new Map();
    bills.forEach((bill) => {
      map.set(bill.id, bill.name);
    });
    return map;
  }, [bills]);

  // Filter and sort transactions
  const processedTransactions = React.useMemo(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((tx) => {
        const billName = billMap.get(tx.bill_id) || "";
        const note = tx.note || "";
        return billName.toLowerCase().includes(searchLower) ||
               note.toLowerCase().includes(searchLower);
      });
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === typeFilter);
    }

    if (amountMin) {
      filtered = filtered.filter((tx) => tx.amount >= parseFloat(amountMin));
    }
    if (amountMax) {
      filtered = filtered.filter((tx) => tx.amount <= parseFloat(amountMax));
    }

    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case "transaction_date":
          aVal = parseISO(a.transaction_date).getTime();
          bVal = parseISO(b.transaction_date).getTime();
          break;
        case "amount":
          aVal = a.amount;
          bVal = b.amount;
          break;
        case "bill_name":
          aVal = billMap.get(a.bill_id) || "";
          bVal = billMap.get(b.bill_id) || "";
          break;
        case "type":
          aVal = a.type;
          bVal = b.type;
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return filtered;
  }, [transactions, searchTerm, typeFilter, amountMin, amountMax, sortField, sortDirection, billMap]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      bill_id: transaction.bill_id,
      transaction_date: transaction.transaction_date,
      amount: transaction.amount.toString(),
      type: transaction.type,
      note: transaction.note || ""
    });
    setShowEditDialog(true);
  };

  // Handle save edit  — with mirror reconciliation
  const handleSaveEdit = async () => {
    if (!editingTransaction) return;

    if (!editFormData.amount || parseFloat(editFormData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!editFormData.transaction_date) {
      toast.error("Please select a transaction date");
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        transaction_date: editFormData.transaction_date,
        amount: parseFloat(editFormData.amount),
        type: editFormData.type,
        note: editFormData.note
      };

      await BillTransaction.update(editingTransaction.id, updateData);

      // Mirror: reconcile prev-bill settlement for the edited transaction's bill
      await reconcileSettlementForNextBill(editingTransaction.bill_id);

      toast.success("Transaction updated successfully");
      setShowEditDialog(false);
      setEditingTransaction(null);
      loadTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete transaction — with mirror reconciliation
  const handleDeleteTransaction = async (transaction) => {
    if (!window.confirm(`Are you sure you want to delete this ${transaction.type} transaction for $${transaction.amount.toFixed(2)}?`)) {
      return;
    }

    try {
      await BillTransaction.delete(transaction.id);

      // Mirror: reconcile prev-bill settlement after removal
      await reconcileSettlementForNextBill(transaction.bill_id);

      toast.success("Transaction deleted successfully");
      loadTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setShowEditDialog(false);
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;
  const isAdmin = true;

  const SortButton = ({ field, children }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-1 text-white/80 hover:text-white hover:bg-white/10"
    >
      {children}
      {sortField === field && (
        sortDirection === "asc" ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
      )}
    </Button>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-white/80">View and manage all bill transactions</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Filters</h2>
        </div>

        {/* First row: Date range and search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Date Range</Label>
            <Select value={datePreset} onValueChange={handleDatePresetChange}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {datePreset === "custom" && (
            <>
              <div className="space-y-2">
                <Label className="text-white">From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-white">To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="text-white">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-white/60" />
              <Input
                placeholder="Search by bill name or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
              />
            </div>
          </div>
        </div>

        {/* Second row: Type filter and amount range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Transaction Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Min Amount</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Min amount"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Max Amount</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Max amount"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
            />
          </div>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : processedTransactions.length === 0 ? (
          <div className="text-center py-12 px-6">
            <Receipt className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No transactions found</h3>
            <p className="text-white/60">
              {searchTerm || typeFilter !== "all" || amountMin || amountMax
                ? "Try adjusting your filters to see more results"
                : "No transactions found in the selected date range"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-white">
                    <SortButton field="bill_name">Bill Name</SortButton>
                  </TableHead>
                  <TableHead className="text-white">
                    <SortButton field="transaction_date">Transaction Date</SortButton>
                  </TableHead>
                  <TableHead className="text-white text-right">
                    <SortButton field="amount">Amount</SortButton>
                  </TableHead>
                  <TableHead className="text-white">
                    <SortButton field="type">Type</SortButton>
                  </TableHead>
                  <TableHead className="text-white">Notes</TableHead>
                  {isAdmin && <TableHead className="text-white">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedTransactions.map((transaction) => {
                  const typeConfig = TRANSACTION_TYPES.find((t) => t.value === transaction.type);
                  return (
                    <TableRow key={transaction.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white/90">
                        {billMap.get(transaction.bill_id) || "Unknown Bill"}
                      </TableCell>
                      <TableCell className="text-white/80">
                        {transaction.transaction_date ? format(parseISO(transaction.transaction_date), "MMM d, yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-white">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={typeConfig?.color || "bg-gray-100/20 text-gray-200"}>
                          {typeConfig?.label || transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white/80 max-w-xs truncate">
                        {transaction.note || "-"}
                      </TableCell>
                      {isAdmin &&
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditTransaction(transaction)}
                              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTransaction(transaction)}
                              className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      }
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* Edit Transaction Dialog */}
      {isAdmin &&
        <Dialog
          open={showEditDialog}
          onOpenChange={(isOpen) => {
            setShowEditDialog(isOpen);
            if (!isOpen) {
              setEditingTransaction(null);
              setEditFormData({ bill_id: "", transaction_date: "", amount: "", type: "payment", note: "" });
            }
          }}
        >
          <DialogContent className="bg-white/10 backdrop-blur-md text-white border-white/20 max-w-2xl w-full rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Transaction</DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label className="text-white">Bill</Label>
                <Input
                  value={billMap.get(editFormData.bill_id) || "Unknown Bill"}
                  disabled
                  className="bg-white/5 border-white/10 text-white/60"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Transaction Date</Label>
                <Input
                  type="date"
                  value={editFormData.transaction_date}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, transaction_date: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white focus:ring-blue-500 focus:border-blue-500 px-0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Transaction Type</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Notes</Label>
                <Textarea
                  value={editFormData.note}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Add any relevant notes..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 h-20 resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-3 pt-4">
              <Button variant="ghost" onClick={handleCancelEdit} className="text-white/80 hover:text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    </div>
  );
}

export default function BillTransactionsPage() {
  return (
    <PageErrorBoundary pageName="BillTransactions">
      <BillTransactionsPageContent />
    </PageErrorBoundary>
  );
}