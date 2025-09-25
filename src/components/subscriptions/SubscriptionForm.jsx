
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";

const categories = [
  "streaming",
  "software",
  "gaming",
  "fitness",
  "productivity",
  "music",
  "news",
  "other"
];

const billingCycles = [
  "monthly",
  "quarterly",
  "yearly"
];

const statuses = [
  "active",
  "paused",
  "cancelled"
];

export default function SubscriptionForm({ subscription, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(subscription || {
    name: "",
    cost: "",
    billing_cycle: "monthly",
    renewal_date: "",
    category: "other",
    status: "active",
    description: "",
    paidThisCycle: false,
    paidAt: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      cost: parseFloat(formData.cost),
      paidAt: formData.paidThisCycle && !subscription?.paidThisCycle ? new Date().toISOString() : formData.paidAt
    };
    onSubmit(processedData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaidToggle = (checked) => {
    setFormData(prev => ({
      ...prev,
      paidThisCycle: checked,
      paidAt: checked ? new Date().toISOString() : null
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 md:p-6 bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold text-white mb-6 text-center">
        {subscription ? "Edit Subscription" : "Add New Subscription"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Service Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Netflix, Spotify"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost" className="text-white">Cost</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            value={formData.cost}
            onChange={(e) => handleChange('cost', e.target.value)}
            placeholder="9.99"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="billing_cycle" className="text-white">Billing Cycle</Label>
          <Select
            value={formData.billing_cycle}
            onValueChange={(value) => handleChange('billing_cycle', value)}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-purple-500 focus:border-purple-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              {billingCycles.map(cycle => (
                <SelectItem key={cycle} value={cycle} className="hover:bg-gray-600 focus:bg-gray-600">
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="renewal_date" className="text-white">Next Renewal Date</Label>
          <Input
            id="renewal_date"
            type="date"
            value={formData.renewal_date}
            onChange={(e) => handleChange('renewal_date', e.target.value)}
            className="bg-white/10 border-white/20 text-white focus:ring-purple-500 focus:border-purple-500 px-0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-white">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange('category', value)}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-purple-500 focus:border-purple-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              {categories.map(category => (
                <SelectItem key={category} value={category} className="hover:bg-gray-600 focus:bg-gray-600">
                  {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-white">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-purple-500 focus:border-purple-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              {statuses.map(status => (
                <SelectItem key={status} value={status} className="hover:bg-gray-600 focus:bg-gray-600">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Additional notes about this subscription..."
          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[80px] focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Payment Status */}
      <div className="flex items-center space-x-3 p-4 rounded-lg bg-white/5 border border-white/10">
        <Checkbox
          id="paidThisCycle"
          checked={formData.paidThisCycle || false}
          onCheckedChange={handlePaidToggle}
          className="border-white/30 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 focus:ring-offset-gray-800 focus:ring-purple-500"
        />
        <div>
          <Label htmlFor="paidThisCycle" className="text-white font-medium cursor-pointer">
            Paid this cycle
          </Label>
          {formData.paidThisCycle && (
            <p className="text-white/60 text-sm mt-1">
              This subscription has been paid for the current billing period
            </p>
          )}
        </div>
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
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white order-1 sm:order-2"
        >
          <Save className="w-4 h-4 mr-2" />
          {subscription ? "Update Subscription" : "Add Subscription"}
        </Button>
      </div>
    </form>
  );
}
