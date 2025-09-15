
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";

const categories = [
  "Housing",
  "Utilities", 
  "Insurance",
  "Loans",
  "Subscriptions",
  "Other"
];

const recurringOptions = [
  { value: "none", label: "One-time" },
  { value: "monthly", label: "Monthly" }
];

export default function BillForm({ bill, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(bill || {
    name: "",
    amountOriginal: "",
    dueDate: "",
    recurring: "none",
    category: "Other",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      amountOriginal: parseFloat(formData.amountOriginal)
    };
    onSubmit(processedData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">
        {bill ? "Edit Bill" : "Add New Bill"}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Bill Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Electric Bill, Rent"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amountOriginal" className="text-white">Amount</Label>
          <Input
            id="amountOriginal"
            type="number"
            step="0.01"
            min="0"
            value={formData.amountOriginal}
            onChange={(e) => handleChange('amountOriginal', e.target.value)}
            placeholder="100.00"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate" className="text-white">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            className="bg-white/10 border-white/20 text-white focus:ring-blue-500 focus:border-blue-500 px-0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recurring" className="text-white">Frequency</Label>
          <Select
            value={formData.recurring}
            onValueChange={(value) => handleChange('recurring', value)}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-blue-500 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              {recurringOptions.map(option => (
                <SelectItem key={option.value} value={option.value} className="hover:bg-gray-600 focus:bg-gray-600">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="category" className="text-white">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange('category', value)}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-blue-500 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              {categories.map(category => (
                <SelectItem key={category} value={category} className="hover:bg-gray-600 focus:bg-gray-600">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-white">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes about this bill..."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[80px] focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-white/80 hover:text-white hover:bg-white/10 order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white order-1 sm:order-2"
        >
          <Save className="w-4 h-4 mr-2" />
          {bill ? "Update Bill" : "Add Bill"}
        </Button>
      </div>
    </form>
  );
}
