
import React, { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, startOfMonth, endOfMonth, isWithinInterval, parseISO, max, min, addDays, subDays } from 'date-fns';
import { ChevronDown, ChevronRight, Calendar, DollarSign, TrendingUp, TrendingDown, Pencil } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export default function WeeklyIncome({ sources, loggedIncome, onEditSource }) {
  const [expandedWeeks, setExpandedWeeks] = useState(new Set());
  const [viewFilter, setViewFilter] = useState('both');
  const [amountBasis, setAmountBasis] = useState('net');

  const allExpectedEventsThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const events = [];

    sources.forEach(source => {
        if (source.status !== 'active' || !source.nextPayday) return;

        try {
            if (source.payFrequency === 'weekly' || source.payFrequency === 'bi-weekly') {
                const intervalDays = source.payFrequency === 'weekly' ? 7 : 14;
                let currentPayday = parseISO(source.nextPayday);

                // Adjust currentPayday to be before or at monthStart to ensure all potential paydays within month are found
                while (currentPayday.getTime() >= monthStart.getTime()) {
                    currentPayday = subDays(currentPayday, intervalDays);
                }

                // Iterate forward to find paydays within the current month
                while (currentPayday.getTime() <= monthEnd.getTime()) {
                    currentPayday = addDays(currentPayday, intervalDays);
                    if (currentPayday.getTime() >= monthStart.getTime() && currentPayday.getTime() <= monthEnd.getTime()) {
                        events.push({
                            id: `${source.id}-${format(currentPayday, 'yyyy-MM-dd')}`,
                            name: source.name,
                            type: source.type,
                            date: format(currentPayday, 'yyyy-MM-dd'),
                            amount: source.expectedAmount,
                            status: 'expected'
                        });
                    }
                }
            } else { // For monthly or one-time
                const payday = parseISO(source.nextPayday);
                if (isWithinInterval(payday, { start: monthStart, end: monthEnd })) {
                    events.push({
                        id: source.id,
                        name: source.name,
                        type: source.type,
                        date: source.nextPayday,
                        amount: source.expectedAmount,
                        status: 'expected'
                    });
                }
            }
        } catch (e) {
            console.error(`Could not process source ${source.name} with payday ${source.nextPayday}:`, e);
        }
    });

    return events;
  }, [sources]);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const weeksInMonth = eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 0 }
    ).map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      const clippedStart = max([weekStart, monthStart]);
      const clippedEnd = min([weekEnd, monthEnd]);
      
      return {
        weekStart,
        weekEnd,
        clippedStart,
        clippedEnd,
        label: `${format(clippedStart, 'MM/dd')} – ${format(clippedEnd, 'MM/dd')}`
      };
    });

    return weeksInMonth.map(week => {
      const expectedItems = allExpectedEventsThisMonth.filter(event =>
          isWithinInterval(parseISO(event.date), { start: week.clippedStart, end: week.clippedEnd })
      );

      const receivedItems = loggedIncome
        .filter(log => 
          log.dateReceived &&
          isWithinInterval(parseISO(log.dateReceived), { start: week.clippedStart, end: week.clippedEnd })
        )
        .map(log => {
          const source = sources.find(s => s.id === log.incomeSourceId);
          return {
            id: log.id,
            name: source?.name || 'Unknown Source',
            type: source?.type || 'Other',
            date: log.dateReceived,
            amount: log.amountReceived,
            status: 'received',
            notes: log.notes
          };
        });

      const expectedTotal = expectedItems.reduce((sum, item) => sum + item.amount, 0);
      const receivedTotal = receivedItems.reduce((sum, item) => sum + item.amount, 0);
      // Fixed variance calculation: expected - received (positive when received less than expected, negative when received more than expected)
      const variance = expectedTotal - receivedTotal;

      return {
        ...week,
        expectedItems,
        receivedItems,
        expectedTotal,
        receivedTotal,
        variance,
        allItems: [...expectedItems, ...receivedItems].sort((a, b) => parseISO(a.date) - parseISO(b.date))
      };
    }).filter(week => week.expectedItems.length > 0 || week.receivedItems.length > 0);
  }, [sources, loggedIncome, allExpectedEventsThisMonth]);

  const toggleWeekExpansion = (weekIndex) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekIndex)) {
      newExpanded.delete(weekIndex);
    } else {
      newExpanded.add(weekIndex);
    }
    setExpandedWeeks(newExpanded);
  };

  const getFilteredItems = (week) => {
    let items = [];
    if (viewFilter === 'expected' || viewFilter === 'both') {
      items = items.concat(week.expectedItems);
    }
    if (viewFilter === 'received' || viewFilter === 'both') {
      items = items.concat(week.receivedItems);
    }
    return items.sort((a, b) => parseISO(a.date) - parseISO(b.date));
  };

  if (weeklyData.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-4 md:p-6">
        <h3 className="text-xl font-bold text-white mb-4">Weekly Income Breakdown</h3>
        <div className="text-center py-10">
          <p className="text-white/70">No income data for this month yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-bold text-white">Weekly Income Breakdown</h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={viewFilter} onValueChange={setViewFilter}>
              <SelectTrigger className="w-full sm:w-32 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both</SelectItem>
                <SelectItem value="expected">Expected</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
            <Select value={amountBasis} onValueChange={setAmountBasis}>
              <SelectTrigger className="w-full sm:w-24 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net">Net</SelectItem>
                <SelectItem value="gross">Gross</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {weeklyData.map((week, index) => {
          const isExpanded = expandedWeeks.has(index);
          const filteredItems = getFilteredItems(week);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
            >
              <button
                onClick={() => toggleWeekExpansion(index)}
                className="w-full p-3 md:p-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-xl"
              >
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  {isExpanded ? 
                    <ChevronDown className="w-5 h-5 text-white/70 flex-shrink-0" /> : 
                    <ChevronRight className="w-5 h-5 text-white/70 flex-shrink-0" />
                  }
                  <div className="text-left min-w-0 flex-1">
                    <h4 className="text-white font-medium text-sm md:text-base truncate">Week of {week.label}</h4>
                    <p className="text-white/60 text-xs md:text-sm">{filteredItems.length} items</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-6 text-right flex-shrink-0">
                  {(viewFilter === 'expected' || viewFilter === 'both') && (
                    <div className="min-w-0">
                      <p className="text-amber-300 font-semibold text-sm md:text-base">${week.expectedTotal.toFixed(2)}</p>
                      <p className="text-white/60 text-xs hidden md:block">Expected</p>
                    </div>
                  )}
                  {(viewFilter === 'received' || viewFilter === 'both') && (
                    <div className="min-w-0">
                      <p className="text-green-300 font-semibold text-sm md:text-base">${week.receivedTotal.toFixed(2)}</p>
                      <p className="text-white/60 text-xs hidden md:block">Received</p>
                    </div>
                  )}
                  {viewFilter === 'both' && (
                    <div className="min-w-0 hidden md:block">
                      <div className="flex items-center gap-1">
                        {/* If variance > 0 (expected more than received), it's a shortfall, show red down arrow. */}
                        {/* Else (expected less than or equal to received), it's a surplus or on target, show green up arrow. */}
                        {week.variance > 0 ? 
                          <TrendingDown className="w-4 h-4 text-red-400" /> : 
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        }
                        <p className={`font-semibold text-sm ${week.variance > 0 ? 'text-red-300' : 'text-green-300'}`}>
                          ${Math.abs(week.variance).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-white/60 text-xs">Variance</p>
                    </div>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && filteredItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                      {filteredItems.map((item, itemIndex) => (
                        <div key={`${item.status}-${item.id}-${itemIndex}`} className="flex flex-col md:flex-row md:items-center md:justify-between py-2 px-3 bg-white/5 rounded-lg gap-2">
                          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'expected' ? 'bg-amber-400' : 'bg-green-400'}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-white font-medium text-sm truncate">{item.name}</p>
                              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-white/60 text-xs">
                                <span className="capitalize">{item.type}</span>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(parseISO(item.date), 'MMM d')}
                                </div>
                              </div>
                              {item.notes && (
                                <p className="text-white/50 text-xs mt-1 truncate">{item.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-left md:text-right flex-shrink-0">
                            <div>
                                <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-white/60" />
                                    <span className={`font-semibold text-sm ${item.status === 'expected' ? 'text-amber-300' : 'text-green-300'}`}>
                                        {item.amount.toFixed(2)}
                                    </span>
                                </div>
                                <span className={`text-xs capitalize ${item.status === 'expected' ? 'text-amber-200/60' : 'text-green-200/60'}`}>
                                {item.status}
                                </span>
                            </div>
                            {item.status === 'expected' && onEditSource && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const sourceId = item.id.split('-')[0]; // Extract source ID from item.id
                                        const sourceToEdit = sources.find(s => s.id === sourceId);
                                        if (sourceToEdit) {
                                            onEditSource(sourceToEdit);
                                        }
                                    }}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
