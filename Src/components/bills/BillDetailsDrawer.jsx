// Components/bills/BillDetailsDrawer.jsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Edit, 
  CreditCard, 
  Calendar, 
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  MinusCircle,
  FileWarning,
  Repeat,
  Trash2,
  BookOpen,
  Archive
} from "lucide-react";
import { format, parseISO, isValid as isValidDate } from "date-fns";
import { Bill } from "@/api/entities";
import { toast } from "sonner";

// ---- safe number + currency helpers ----
function toNumber(v) {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}
function safeCurrency(v) {
  const n = toNumber(v);
  return `$${n.toFixed(2)}`;
}
function safeDateLabel(iso) {
  if (!iso) return "N/A";
  try {
    const d = parseISO(String(iso));
    if (!isValidDate(d)) return "N/A";
    return format(d, "MMMM d, yyyy");
  } catch {
    return "N/A";
  }
}
function safeTxDate(iso) {
  if (!iso) return "—";
  try {
    const d = parseISO(String(iso));
    if (!isValidDate(d)) return "—";
    return format(d, "MMM d, yyyy");
  } catch {
    return "—";
  }
}

const statusConfig = {
  pending: { icon: Clock, color: "bg-yellow-100/20 text-yellow-200" },
  paid: { icon: CheckCircle, color: "bg-green-100/20 text-green-200" },
  overdue: { icon: AlertTriangle, color: "bg-red-100/20 text-red-200" },
  paid_carryover: { icon: CheckCircle, color: "bg-green-100/20 text-green-200" },
};

const transactionTypeConfig = {
  payment: { icon: CreditCard, color: "text-green-300", sign: "-" },
  late_fee: { icon: FileWarning, color: "text-orange-300", sign: "+" },
  credit: { icon: MinusCircle, color: "text-blue-300", sign: "-" },
  adjustment: { icon: PlusCircle, color: "text-yellow-300", sign: "+" },
};

export default function BillDetailsDrawer({ 
  bill, 
  onClose, 
  onEdit, 
  onAddTransaction,
  onPayAndAdvance,
  onDelete
}) {
  // normalize values once to avoid undefined/.toFixed crashes
  const amountOriginal = toNumber(bill?.amountOriginal);
  const previousBalance = toNumber(bill?.previous_balance);
  const totalPaid = toNumber(bill?.totalPaid);
  const totalDue = toNumber(bill?.totalDue);
  const balance = toNumber(bill?.balance);

  // fees = totalDue - base - previousBalance, clamped at 0 for display sanity
  const feesAndAdj = Math.max(0, totalDue - amountOriginal - previousBalance);

  const status = bill?.status || "pending";
  const StatusIcon = (statusConfig[status]?.icon) || Clock;
  const statusColor = (statusConfig[status]?.color) || "bg-yellow-100/20 text-yellow-200";

  const [isArchived, setIsArchived] = useState(Boolean(bill?.archived));
  const [isUpdatingArchive, setIsUpdatingArchive] = useState(false);

  const isAdmin = !!onEdit;

  const handleDelete = () => {
    onDelete?.(bill);
  };

  const handleArchiveChange = async (checked) => {
    setIsUpdatingArchive(true);
    try {
      await Bill.update(bill.id, { archived: checked });
      setIsArchived(checked);
      toast.success(checked ? "Bill archived successfully" : "Bill unarchived successfully");
      if (checked) {
        setTimeout(() => onClose?.(), 1000);
      }
    } catch (error) {
      console.error("Error updating bill archive status:", error);
      toast.error("Failed to update archive status");
    } finally {
      setIsUpdatingArchive(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-panel text-white border-white/20 max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-bold text-white">
            Bill Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {bill?.name || "Unnamed Bill"}
                {bill?.recurring === "monthly" && (
                  <Repeat className="w-4 h-4 text-cyan-300" title="Monthly Recurring" />
                )}
                {previousBalance > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="bg-orange-100/20 text-orange-200 flex items-center gap-1"
                    title="Balance Carried Over from Previous Cycle"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Carried Over
                  </Badge>
                )}
                {isArchived && (
                  <Badge 
                    variant="secondary" 
                    className="bg-gray-100/20 text-gray-200 flex items-center gap-1"
                    title="Bill is Archived"
                  >
                    <Archive className="w-3 h-3" />
                    Archived
                  </Badge>
                )}
              </h3>
              <Badge variant="secondary" className={statusColor}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {status}
              </Badge>
            </div>
            <p className="text-white/60 text-sm">{bill?.category || "Other"}</p>
          </div>

          <div className="glass-panel rounded-xl p-4 space-y-3">
            <h4 className="font-medium text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Financial Summary
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/80">Original Amount:</span>
                <span>{safeCurrency(amountOriginal)}</span>
              </div>

              {previousBalance > 0 && (
                <div className="flex justify-between text-orange-300">
                  <span className="text-orange-300/80">Carried Over:</span>
                  <span className="flex items-center gap-2">
                    {safeCurrency(previousBalance)}
                    {bill?.carryoverStatus === "paid" && (
                      <CheckCircle className="w-4 h-4 text-green-400" title="Carryover Paid" />
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-white/80">Fees/Adjustments:</span>
                <span>{safeCurrency(feesAndAdj)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-white/80">Total Due:</span>
                <span>{safeCurrency(totalDue)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-green-200">Total Paid:</span>
                <span className="text-green-200">{safeCurrency(totalPaid)}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-white/20 font-medium">
                <span className="text-white">Balance Due:</span>
                <span className="text-white">{safeCurrency(balance)}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h4 className="font-medium text-white flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4" />
              Due Date
            </h4>
            <p className="text-white text-lg">{safeDateLabel(bill?.dueDate)}</p>
          </div>
          
          {Array.isArray(bill?.transactions) && bill.transactions.length > 0 && (
            <div className="glass-panel rounded-xl p-4">
              <h4 className="font-medium text-white flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4" />
                Transaction History
              </h4>
              <div className="space-y-2">
                {bill.transactions.map((tx) => {
                  const config = transactionTypeConfig[tx.type] || { icon: CreditCard, color: "text-white/80", sign: "" };
                  const TxIcon = config.icon;
                  const amt = toNumber(tx.amount);
                  return (
                    <div key={tx.id || `${tx.type}-${tx.transaction_date}-${amt}`} className="flex justify-between items-start p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <TxIcon className={`w-4 h-4 ${config.color}`} />
                        <div>
                          <p className="text-white font-medium capitalize">{String(tx.type || "").replace("_", " ") || "transaction"}</p>
                          <p className="text-white/60 text-xs">{safeTxDate(tx.transaction_date)}</p>
                          {tx.note && <p className="text-white/60 text-xs italic mt-1">{tx.note}</p>}
                        </div>
                      </div>
                      <p className={`font-medium ${config.color}`}>{config.sign}{safeCurrency(amt)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {bill?.notes && (
            <div className="glass-panel rounded-xl p-4">
              <h4 className="font-medium text-white flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" />
                Notes
              </h4>
              <p className="text-white/80 text-sm">{bill.notes}</p>
            </div>
          )}

          {bill?.system_notes && (
            <div className="glass-panel rounded-xl p-4">
              <h4 className="font-medium text-white flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4" />
                System Notes
              </h4>
              <p className="text-white/60 text-xs whitespace-pre-wrap">{bill.system_notes}</p>
            </div>
          )}

          {isAdmin && (
            <div className="space-y-3">
              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="archive-bill"
                    checked={isArchived}
                    onCheckedChange={handleArchiveChange}
                    disabled={isUpdatingArchive}
                    className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="archive-bill" className="text-white font-medium cursor-pointer">
                      Archive this bill
                    </Label>
                    <p className="text-xs text-white/60">
                      Archived bills will not appear in the main list or be advanced to next cycle
                    </p>
                  </div>
                </div>
              </div>

              {onPayAndAdvance && balance > 0 && (
                <Button onClick={() => onPayAndAdvance(bill)} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay Full Balance
                </Button>
              )}

              <Button onClick={() => onAddTransaction?.(bill)} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>

              <Button onClick={() => onEdit?.(bill)} variant="ghost" className="w-full text-white/80 hover:text-white hover:bg-white/10">
                <Edit className="w-4 h-4 mr-2" />
                Edit Bill
              </Button>

              {onDelete && (
                <Button 
                  onClick={handleDelete} 
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Bill
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}