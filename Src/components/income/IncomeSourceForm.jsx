
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const incomeTypes = ["Salary", "Freelance", "Benefits", "Investment", "Other"];
const frequencies = ["weekly", "bi-weekly", "monthly", "one-time"];
const statuses = ["active", "inactive"];

const defaultState = {
  name: "",
  type: "Salary",
  expectedAmount: "",
  payFrequency: "monthly",
  nextPayday: "",
  status: "active"
};

export default function IncomeSourceForm({ source, onSubmit, onCancel, isOpen }) {
  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (isOpen) {
      if (source) {
        // When editing, pre-fill the form with the existing source data
        setFormData({
            name: source.name || "",
            type: source.type || "Salary",
            expectedAmount: source.expectedAmount || "",
            payFrequency: source.payFrequency || "monthly",
            // Ensure date is in yyyy-MM-dd format for the input
            nextPayday: source.nextPayday ? source.nextPayday.split('T')[0] : "",
            status: source.status || "active"
        });
      } else {
        // When adding, reset the form to its default empty state
        setFormData(defaultState);
      }
    }
  }, [source, isOpen, defaultState]); // Added defaultState to dependencies for stricter linting,
                                    // though its constant nature means it won't cause re-renders.

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, expectedAmount: parseFloat(formData.expectedAmount) });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="glass-panel text-white border-white/20">
        <DialogHeader>
          <DialogTitle>{source ? "Edit" : "Add"} Income Source</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="name">Source Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required className="bg-white/10 border-white/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                <SelectTrigger className="bg-white/10 border-white/20"><SelectValue /></SelectTrigger>
                <SelectContent>{incomeTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expectedAmount">Expected Amount</Label>
              <Input id="expectedAmount" type="number" value={formData.expectedAmount} onChange={(e) => handleChange('expectedAmount', e.target.value)} required className="bg-white/10 border-white/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payFrequency">Pay Frequency</Label>
              <Select value={formData.payFrequency} onValueChange={(value) => handleChange('payFrequency', value)}>
                <SelectTrigger className="bg-white/10 border-white/20"><SelectValue /></SelectTrigger>
                <SelectContent>{frequencies.map((f) => <SelectItem key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="nextPayday">Next Payday</Label>
              <Input id="nextPayday" type="date" value={formData.nextPayday} onChange={(e) => handleChange('nextPayday', e.target.value)} required className="flex h-10 w-56 rounded-md border px-0 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white/10 border-white/20" />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger className="bg-white/10 border-white/20"><SelectValue /></SelectTrigger>
              <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600">Save Source</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
