
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function LogIncomeForm({ sources, onSubmit, onCancel, isOpen }) {
  const [formData, setFormData] = useState({
    incomeSourceId: "",
    dateReceived: new Date().toISOString().split('T')[0],
    amountReceived: "",
    notes: ""
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.incomeSourceId) {
      alert("Please select an income source.");
      return;
    }
    const entryHash = `${formData.incomeSourceId}-${formData.dateReceived}-${formData.amountReceived}`;
    onSubmit({ ...formData, amountReceived: parseFloat(formData.amountReceived), entryHash });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="glass-panel text-white border-white/20">
        <DialogHeader>
          <DialogTitle>Log Received Income</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="incomeSourceId">Income Source</Label>
            <Select value={formData.incomeSourceId} onValueChange={(value) => handleChange('incomeSourceId', value)}>
              <SelectTrigger className="bg-white/10 border-white/20"><SelectValue placeholder="Select a source..." /></SelectTrigger>
              <SelectContent>
                {sources.filter((s) => s.status === 'active').map((s) =>
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateReceived">Date Received</Label>
              <Input id="dateReceived" type="date" value={formData.dateReceived} onChange={(e) => handleChange('dateReceived', e.target.value)} required className="flex h-10 w-56 rounded-md border px-0 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white/10 border-white/20" />
            </div>
            <div>
              <Label htmlFor="amountReceived">Amount Received</Label>
              <Input id="amountReceived" type="number" step="0.01" value={formData.amountReceived} onChange={(e) => handleChange('amountReceived', e.target.value)} required className="bg-white/10 border-white/20" />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} className="bg-white/10 border-white/20" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600">Log Income</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);

}
