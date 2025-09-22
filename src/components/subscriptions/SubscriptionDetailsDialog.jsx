import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, CircleDollarSign, Tag, FileText, Repeat, CheckCircle, XCircle, PauseCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const statusConfig = {
    active: { icon: CheckCircle, color: "bg-green-500/20 text-green-300" },
    paused: { icon: PauseCircle, color: "bg-yellow-500/20 text-yellow-300" },
    cancelled: { icon: XCircle, color: "bg-red-500/20 text-red-300" },
};

const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        <Icon className="w-5 h-5 text-white/70 mt-1" />
        <div className="flex-1">
            <p className="text-sm text-white/70">{label}</p>
            <p className="text-white font-medium">{value}</p>
        </div>
    </div>
);

export default function SubscriptionDetailsDialog({ subscription, onClose }) {
  if (!subscription) return null;

  const StatusIcon = statusConfig[subscription.status]?.icon || CheckCircle;

  return (
    <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="glass-panel text-white border-white/20 max-w-md w-[90vw] rounded-2xl">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                    <span>{subscription.name}</span>
                    <Badge className={statusConfig[subscription.status]?.color}>
                        <StatusIcon className="w-3 h-3 mr-1.5" />
                        {subscription.status}
                    </Badge>
                </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-6">
                <DetailRow 
                    icon={CircleDollarSign} 
                    label="Cost" 
                    value={`$${subscription.cost.toFixed(2)}`} 
                />
                <DetailRow 
                    icon={Repeat} 
                    label="Billing Cycle" 
                    value={subscription.billing_cycle.charAt(0).toUpperCase() + subscription.billing_cycle.slice(1)} 
                />
                <DetailRow 
                    icon={Calendar} 
                    label="Next Renewal" 
                    value={format(parseISO(subscription.renewal_date), 'MMMM d, yyyy')} 
                />
                <DetailRow 
                    icon={Tag} 
                    label="Category" 
                    value={subscription.category} 
                />
                {subscription.paidThisCycle && subscription.paidAt && (
                    <DetailRow 
                        icon={CheckCircle} 
                        label="Paid This Cycle On" 
                        value={format(parseISO(subscription.paidAt), 'MMMM d, yyyy')} 
                    />
                )}
                {subscription.description && (
                    <DetailRow 
                        icon={FileText} 
                        label="Description" 
                        value={subscription.description} 
                    />
                )}
            </div>
        </DialogContent>
    </Dialog>
  );
}