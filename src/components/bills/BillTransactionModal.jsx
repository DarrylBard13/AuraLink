// Components/bills/BillTransactionModal.jsx

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

function toNumber(v) {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}
function money(v) {
  return `$${toNumber(v).toFixed(2)}`;
}

export default function BillTransactionModal({ bill, metrics = {}, onSubmit, onClose }) {
  const [type, setType] = useState("payment");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionDate, setTransactionDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalize incoming numbers
  const balance = toNumber(metrics.balance ?? bill?.balance);
  const isPayment = type === "payment" || type === "credit";
  const maxPayment = isPayment ? balance : Infinity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericAmount = toNumber(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    await onSubmit({
      type,
      amount: numericAmount,
      note,
      transaction_date: transactionDate
    });
    setIsSubmitting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-panel text-white border-white/20">
        <DialogHeader>
          <DialogTitle>Add Transaction for {bill?.name || "Bill"}</DialogTitle>
          {/* Use balance, not metrics.amount */}
          <DialogDescription>Balance Due: {money(balance)}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <Select id="transaction-type" value={type} onValueChange={setType}>
                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="late_fee">Late Fee</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-date" className="text-white">Transaction Date</Label>
              <Input
                id="transaction-date"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white focus:ring-blue-500 focus:border-blue-500 px-0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                const val = e.target.value;
                setAmount(val);
                const n = toNumber(val);
                if (isPayment && Number.isFinite(maxPayment) && n > maxPayment) {
                  setError(`Amount cannot exceed the balance of ${money(maxPayment)}`);
                } else {
                  setError("");
                }
              }}
              step="0.01"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Input
              id="note"
              type="text"
              placeholder="e.g., Early payment discount"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40"
            />
          </div>

          {error && <p className="text-red-400 text-sm -mt-2">{error}</p>}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !!error}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}