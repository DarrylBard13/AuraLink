import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Receipt } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const typeConfig = {
  bill: { icon: Receipt, color: "text-blue-300" },
  subscription: { icon: CreditCard, color: "text-purple-300" }
};

export default function UpcomingDashboardItems({ items, onSelectItem, title, dateRangeTitle }) {
  const itemTypeForEmptyMessage = title.toLowerCase().includes('bill') ? 'bills' : 'subscriptions';

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-bold">{title}</h3>
        <span className="text-white/70 text-sm">{dateRangeTitle}</span>
      </div>
      <ScrollArea className="h-auto lg:h-[250px] pr-3">
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map(item => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => onSelectItem(item)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={typeConfig[item.type].color}>
                      {React.createElement(typeConfig[item.type].icon, { className: "w-5 h-5" })}
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-white/70 text-sm">{format(parseISO(item.date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${(item.amount || 0).toFixed(2)}</p>
                    {item.isUrgent && (
                      <Badge variant="destructive" className="mt-1 text-xs">Urgent</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 py-8 lg:py-0">
              No upcoming {itemTypeForEmptyMessage} in this timeframe.
            </div>
          )}
        </ScrollArea>
    </div>
  );
}