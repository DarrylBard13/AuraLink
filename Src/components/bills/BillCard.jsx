// Components/bills/BillCard.jsx

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  Info,
  Edit,
  Repeat,
  Loader2,
  RefreshCw,
  ArrowRight,
  PlusCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statusConfig = {
  pending: { icon: Clock, color: "bg-yellow-100/20 text-yellow-200" },
  paid: { icon: CheckCircle, color: "bg-green-100/20 text-green-200" },
  overdue: { icon: AlertTriangle, color: "bg-red-100/20 text-red-200" },
  paid_carryover: { icon: CheckCircle, color: "bg-green-100/20 text-green-200" }
};

// helpers
function toNumber(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number" && isFinite(v)) return v;
  const n = parseFloat(String(v));
  return isFinite(n) ? n : 0;
}
function safeCurrency(v) {
  return `$${toNumber(v).toFixed(2)}`;
}

export default function BillCard({
  bill,
  onEdit,
  onAddTransaction,
  onShowDetails,
  onPayAndAdvance,
  onMoveToNextCycle
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const status = bill?.status || "pending";
  const statusText = status === "paid_carryover" ? "Paid in Next Cycle" : status.replace("_", " ");
  const StatusIcon = statusConfig[status]?.icon || Clock;
  const category = bill?.category || "Other";
  const name = bill?.name || "Unnamed Bill";

  const balanceNum = toNumber(bill?.balance);
  const totalPaidNum = toNumber(bill?.totalPaid);
  const totalDueNum = toNumber(bill?.totalDue);
  const prevBalNum = toNumber(bill?.previous_balance);

  const isPaidish = status === "paid" || status === "paid_carryover";
  const isAdmin = !!onEdit;
  const canMoveToNextCycle = bill?.status === "overdue" && balanceNum > 0;

  const handlePayAndAdvanceClick = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try { await onPayAndAdvance?.(bill); } finally { setIsProcessing(false); }
  };

  const handleMoveToNextCycle = async () => {
    if (isMoving || !onMoveToNextCycle) return;
    setIsMoving(true);
    try { await onMoveToNextCycle(bill); } finally { setIsMoving(false); }
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      className="h-full cursor-pointer"
      onClick={() => onShowDetails?.(bill)}
    >
      <Card
        className={`bg-white/5 border-white/20 text-white transition-colors h-full flex flex-col glass-panel ${
          isPaidish ? "opacity-75" : "hover:bg-white/10"
        }`}
      >
        {/* Header: tighter spacing */}
        <CardHeader className="py-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-1 mb-1">
                <h3 className="text-base font-semibold text-white truncate leading-tight">
                  {name}
                </h3>
                <div className="flex items-center gap-0.5">
                  {bill?.recurring === "monthly" && (
                    <Repeat className="w-3 h-3 text-cyan-300" title="Monthly Recurring" />
                  )}
                  {isPaidish && <CheckCircle className="w-3 h-3 text-green-400" />}
                </div>
              </CardTitle>

              <div className="flex items-center gap-1 mb-1 flex-wrap">
                <Badge variant="secondary" className="px-1.5 py-0.5 text-[11px] leading-none">
                  {category}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`px-1.5 py-0.5 text-[11px] leading-none ${statusConfig[status]?.color || statusConfig.pending.color}`}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  <span className="capitalize">{statusText}</span>
                </Badge>
                {prevBalNum > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0.5 text-[11px] leading-none bg-amber-100/20 text-amber-200 border border-amber-300/30">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Carried Over
                  </Badge>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10 w-7 h-7">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && onAddTransaction && (
                  <DropdownMenuItem onClick={() => onAddTransaction(bill)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add Transaction
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onShowDetails?.(bill)}>
                  <Info className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {isAdmin && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(bill)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Bill
                  </DropdownMenuItem>
                )}
                {isAdmin && onPayAndAdvance && bill?.recurring === "monthly" && balanceNum > 0 && (
                  <DropdownMenuItem onClick={handlePayAndAdvanceClick} disabled={isProcessing}>
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <DollarSign className="w-4 h-4 mr-2" />
                    )}
                    Pay Full Balance
                  </DropdownMenuItem>
                )}
                {isAdmin && onMoveToNextCycle && canMoveToNextCycle && (
                  <DropdownMenuItem onClick={handleMoveToNextCycle} disabled={isMoving}>
                    {isMoving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                    Move to Next Cycle
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Content: compressed; hide Balance for paid/paid_carryover */}
        <CardContent className="flex-grow py-2">
          <div className="space-y-1">
            {!isPaidish && (
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-white/80">Balance Due</span>
                <span className="text-xl font-bold text-white leading-none">
                  {safeCurrency(balanceNum)}
                </span>
              </div>
            )}

            {totalPaidNum > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-green-300/80">Total Paid</span>
                <span className="text-sm font-semibold text-green-300 leading-none">
                  {safeCurrency(totalPaidNum)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-baseline">
              <span className="text-xs text-white/80">Due Date</span>
              <span className="text-[13px] font-medium">
                {bill?.dueDate ? format(parseISO(String(bill.dueDate)), "MMM d, yyyy") : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>

        {/* Footer: compact buttons */}
        <CardFooter className="flex gap-1 pt-2">
          {onAddTransaction && !isPaidish && (
            <Button
              size="sm"
              className="px-2 py-1 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={(e) => handleActionClick(e, () => onAddTransaction(bill))}
            >
              <PlusCircle className="w-3 h-3 mr-1" />
              Transaction
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="px-2 py-1 text-xs text-white/70 hover:text-white hover:bg-white/20"
              onClick={(e) => handleActionClick(e, () => onEdit(bill))}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}