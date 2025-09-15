
import React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  Pause,
  Eye,
  Check,
  X,
  Calendar,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

const statusConfig = {
  active: { color: "bg-green-100/20 text-green-200", icon: Play },
  paused: { color: "bg-yellow-100/20 text-yellow-200", icon: Pause },
  cancelled: { color: "bg-red-100/20 text-red-200", icon: X }
};

export default function SubscriptionCard({ subscription, onEdit, onMarkPaid, onViewDetails, onStatusChange }) {
  const { name, cost, billing_cycle, renewal_date, category, status, paidThisCycle } = subscription;

  const formatBillingCycle = (cycle) => {
    return cycle.charAt(0).toUpperCase() + cycle.slice(1);
  };

  const getMonthlyEquivalent = (cost, cycle) => {
    if (cycle === 'yearly') return cost / 12;
    if (cycle === 'quarterly') return cost / 3;
    return cost;
  };

  const cardClasses = `glass-panel rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 ${
    paidThisCycle ? 'opacity-75' : ''
  }`;

  const handleDropdownSelect = (e) => {
    e.stopPropagation(); // Prevent card click when interacting with dropdown
  };

  const StatusIcon = statusConfig[status]?.icon;

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold text-white/90 truncate pr-2">{name}</CardTitle>
          {onEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mt-1 -mr-2 text-white/70 hover:bg-white/20 hover:text-white" onClick={handleDropdownSelect}>
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800/80 backdrop-blur-md border-slate-700 text-white" onClick={handleDropdownSelect}>
                <DropdownMenuItem onClick={() => onViewDetails(subscription)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(subscription)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                {status === 'active' &&
                  <DropdownMenuItem onClick={() => onStatusChange(subscription, 'paused')}>
                    <Pause className="mr-2 h-4 w-4" />
                    <span>Pause</span>
                  </DropdownMenuItem>
                }
                {status === 'paused' &&
                  <DropdownMenuItem onClick={() => onStatusChange(subscription, 'active')}>
                    <Play className="mr-2 h-4 w-4" />
                    <span>Activate</span>
                  </DropdownMenuItem>
                }
                {status !== 'cancelled' &&
                  <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/20" onClick={() => onStatusChange(subscription, 'cancelled')}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Cancel</span>
                  </DropdownMenuItem>
                }
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="text-white/60 text-sm capitalize">{category.replace('_', ' ')}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Cost</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-white">
                ${cost.toFixed(2)}
              </p>
              <p className="text-white/60 text-xs">
                {formatBillingCycle(billing_cycle)}
              </p>
            </div>
          </div>

          {billing_cycle !== 'monthly' && (
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Monthly equivalent</span>
              <span className="text-white/80 text-sm font-medium">
                ${getMonthlyEquivalent(cost, billing_cycle).toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/80">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Next renewal</span>
            </div>
            <span className="text-white text-sm font-medium">
              {format(parseISO(renewal_date), 'MMM d, yyyy')}
            </span>
          </div>

          {subscription.description && (
            <div className="pt-2">
              <p className="text-white/70 text-sm">{subscription.description}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {onMarkPaid && status === 'active' ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onMarkPaid(subscription, !paidThisCycle);
              }}
              variant="outline"
              size="sm"
              className={`w-full transition-all duration-300 ${
                paidThisCycle
                  ? "bg-green-500/20 border-green-500/40 text-green-300 hover:bg-green-500/30"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
            >
              {paidThisCycle ? <Check className="w-4 h-4 mr-2" /> : <X className="w-4 h-4 mr-2" />}
              {paidThisCycle ? "Paid" : "Mark as Paid"}
            </Button>
        ) : (
          <Badge className={`${statusConfig[status]?.color} w-full justify-center`}>
            {StatusIcon && <StatusIcon className="w-4 h-4 mr-2" />} {status}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
