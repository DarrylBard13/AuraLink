// Components/MonthlyCalendarStrip.jsx

import React, { useState, useEffect, useRef } from 'react';
import { eachDayOfInterval, startOfMonth, endOfMonth, format, isSameDay, parseISO, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter, Plus, X, Edit2, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';

/* ------------------------------ Helpers ------------------------------ */

// Remove trailing "(pay)" or "(payday)" from income names
function cleanIncomeName(name) {
  try { return String(name).replace(/\s*\((pay|payday)\)\s*$/i, ''); } catch { return name || ''; }
}

// Carryover bill that’s still overdue = Past Due
function isPastDueBill(e) {
  return e?.type === 'bill' && e?.isCarryover && e?.originalDueDate && e?.status === 'overdue';
}

// Inline row class (return null to hide the row inline)
function rowClass(e) {
  if (e.type === 'income') return null;                     // hide income inline (tooltip will show it)
  if (e.type === 'bill' && e.status === 'paid') return 'text-green-500 pl-2.5';
  if (isPastDueBill(e)) return 'text-red-500 pl-2';
  if (e.type === 'bill' && e.status === 'overdue') return 'text-red-500 pl-2.5';
  if (e.type === 'bill' && e.status === 'pending') return 'text-yellow-500 pl-2.5';
  if (e.type === 'bill' && e.status === 'upcoming') return 'text-yellow-500 pl-2.5';
  if (e.type === 'subscription') return 'text-cyan-500 pl-2.5';
  return 'text-white pl-2.5';
}

// Pill styles for bills (inline + tooltip)
function billStatusPill(e) {
  if (isPastDueBill(e)) return { label: 'Past Due', className: 'bg-red-600/20 text-red-300 border border-red-600/30' };
  if (e.status === 'paid') return { label: 'Paid', className: 'bg-green-600/20 text-green-300 border border-green-600/30' };
  if (e.status === 'pending' || e.status === 'upcoming' || e.status === 'overdue') {
    return { label: 'Pending', className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' };
  }
  return { label: (e.status || '').replace('_', ' ') || '—', className: 'bg-slate-500/20 text-slate-300 border border-slate-500/30' };
}

// Day button background
function dayButtonClass(day, isTooltipActive) {
  if (isToday(day)) return 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold shadow-lg rounded-xl';
  if (isTooltipActive) return 'bg-white/20 text-white';
  return 'text-white bg-black/20';
}

/* --- NEW: Mobile-only dot color (bills only) --- */
function mobileDotClassForDay(dayEvents) {
  const bills = dayEvents.filter((e) => e.type === 'bill');
  if (bills.length === 0) return ''; // no dot if no bills

  // Priority: past due/overdue/unpaid (red) > pending/upcoming (yellow) > paid (green)
  if (bills.some((e) => isPastDueBill(e) || e.status === 'overdue')) return 'bg-red-500';
  if (bills.some((e) => e.status === 'pending' || e.status === 'upcoming')) return 'bg-yellow-500';
  if (bills.some((e) => e.status === 'paid')) return 'bg-green-500';
  return '';
}

/* ------------------------------ Defaults ------------------------------ */

const DEFAULT_FILTERS = [
  { id: 'default-filter', name: 'Default', types: ['bill', 'income'] },
  { id: 'bills-only', name: 'Bills', types: ['bill'] },
  { id: 'income-only', name: 'Income', types: ['income'] },
  { id: 'subscriptions-only', name: 'Subscriptions', types: ['subscription'] },
  { id: 'all-sources', name: 'All', types: ['bill', 'income', 'subscription'] }
];

function resetCalendarFiltersLocal() {
  try {
    localStorage.removeItem('calendar-filters');
    localStorage.removeItem('calendar-default-filter-id');
    localStorage.setItem('calendar-filters', JSON.stringify(DEFAULT_FILTERS));
    localStorage.setItem('calendar-default-filter-id', 'default-filter');
  } catch { }
}

/* ------------------------------ Component ------------------------------ */

export default function MonthlyCalendarStrip({ events, onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [savedFilters, setSavedFilters] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['bill', 'income']);
  const [defaultFilterId, setDefaultFilterId] = useState('default-filter');
  const calendarRef = useRef(null);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const saveFiltersToStorage = (filters) => {
    localStorage.setItem('calendar-filters', JSON.stringify(filters));
  };

  // Load saved filters/default on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('calendar-filters');
      const allFilters = saved ? JSON.parse(saved) : DEFAULT_FILTERS;
      if (!saved) saveFiltersToStorage(DEFAULT_FILTERS);
      setSavedFilters(allFilters);

      const savedDefaultId = localStorage.getItem('calendar-default-filter-id') || 'default-filter';
      setDefaultFilterId(savedDefaultId);

      let def = allFilters.find((f) => f.id === savedDefaultId);
      if (!def) {
        def = allFilters.find((f) => f.id === 'default-filter') || allFilters[0];
        if (def) {
          localStorage.setItem('calendar-default-filter-id', def.id);
          setDefaultFilterId(def.id);
        }
      }
      setActiveFilter(def || null);
    } catch {
      setSavedFilters(DEFAULT_FILTERS);
      setActiveFilter(DEFAULT_FILTERS[0]);
    }
  }, []);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setActiveTooltip(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  const changeMonth = (amount) => {
    setCurrentDate((prev) => new Date(prev.setMonth(prev.getMonth() + amount)));
    setActiveTooltip(null);
  };

  const handleDateClick = (day, dayEvents) => {
    const dayKey = day.toISOString().split('T')[0];
    setActiveTooltip(dayEvents.length > 0 ? (activeTooltip === dayKey ? null : dayKey) : null);
    onDateSelect(day);
  };

  const handleTypeToggle = (type, checked) => {
    setSelectedTypes((prev) => checked ? [...prev, type] : prev.filter((t) => t !== type));
  };

  const handleSaveFilter = () => {
    if (!newFilterName.trim()) return;
    const newFilter = { id: `custom-${Date.now()}`, name: newFilterName.trim(), types: [...selectedTypes] };
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    saveFiltersToStorage(updated);
    setActiveFilter(newFilter);
    setNewFilterName('');
    setShowSaveDialog(false);
  };

  const handleDeleteFilter = (filterId) => {
    if (filterId === 'default-filter') return toast.error("The 'All Events' filter cannot be deleted.");
    const updated = savedFilters.filter((f) => f.id !== filterId);
    setSavedFilters(updated);
    saveFiltersToStorage(updated);

    if (activeFilter?.id === filterId) {
      const fallback = updated.find((f) => f.id === 'default-filter') || updated[0] || null;
      setActiveFilter(fallback);
    }
    if (defaultFilterId === filterId) handleSetDefaultFilter('default-filter');
    toast.success('Filter deleted successfully!');
  };

  const handleSetDefaultFilter = (filterId) => {
    setDefaultFilterId(filterId);
    localStorage.setItem('calendar-default-filter-id', filterId);
    toast.success('Default filter has been updated!');
  };

  const openCustomFilter = () => {
    setSelectedTypes(['bill', 'income']);
    setNewFilterName('');
    setShowSaveDialog(true);
  };

  const handleResetFilters = () => {
    resetCalendarFiltersLocal();
    setSavedFilters(DEFAULT_FILTERS);
    setDefaultFilterId('default-filter');
    setActiveFilter(DEFAULT_FILTERS.find((f) => f.id === 'default-filter') || DEFAULT_FILTERS[0]);
    toast.success('Calendar filters reset to defaults.');
  };

  const getFilteredEvents = (dayEvents) => {
    if (!activeFilter) return [];
    return dayEvents.filter((e) => activeFilter.types.includes(e.type));
  };

  return (
    <div ref={calendarRef}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-y-2">
        <h3 className="text-lg font-bold text-white">{format(currentDate, 'MMMM yyyy')}</h3>
        <div className="flex items-center gap-2 sm:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 gap-2">
                <Filter className="w-4 h-4" />
                {activeFilter ? activeFilter.name : 'Select Filter'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 text-white border-slate-700">
              {savedFilters.map((filter) => (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => setActiveFilter(filter)}
                  className="hover:bg-slate-700 flex justify-between"
                >
                  <span>{filter.name}</span>
                  {activeFilter && activeFilter.id === filter.id && <span className="text-cyan-400">✓</span>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={openCustomFilter} className="hover:bg-slate-700">
                <Plus className="w-4 h-4 mr-2" /> Create Custom Filter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowManageDialog(true)} className="hover:bg-slate-700">
                <Edit2 className="w-4 h-4 mr-2" /> Manage Filters
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleResetFilters} className="hover:bg-slate-700 text-red-300">
                <X className="w-4 h-4 mr-2" /> Reset to Defaults
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white" onClick={() => changeMonth(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Week headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-white/60 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 relative">
        {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => <div key={`empty-${i}`} />)}

        {daysInMonth.map((day) => {
          const allDayEvents = events.filter((e) => {
            if (!e?.date || typeof e.date !== 'string') return false;
            try { return isSameDay(parseISO(e.date), day); } catch { return false; }
          });

          const filteredDayEvents = getFilteredEvents(allDayEvents);
          const hasEvent = filteredDayEvents.length > 0;
          const hasIncome = filteredDayEvents.some((e) => e.type === 'income');  // <-- paydate?
          const dayKey = day.toISOString().split('T')[0];
          const isTooltipActive = activeTooltip === dayKey;
          const btnClasses = dayButtonClass(day, isTooltipActive);
          const dotClassMobile = mobileDotClassForDay(filteredDayEvents); // <-- NEW

          return (
            <div key={day.toString()} className="relative">
              <button
                onClick={() => handleDateClick(day, filteredDayEvents)}
                className={`h-12 sm:h-28 w-full relative text-m transition-colors hover:bg-white/10 ${btnClasses}`}
              >
                {/* Day number (green if any income that day) */}
                <span className={`absolute top-1 left-1 text-sm font-medium ${hasIncome ? 'text-emerald-300' : ''}`}>
                  {format(day, 'd')}
                </span>

                {/* MOBILE: show a single status dot for bills */}
                {dotClassMobile && (
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full sm:hidden ${dotClassMobile}`} />
                )}

                {/* DESKTOP: inline rows (income hidden here) */}
                <div className="absolute left-1 right-1 top-6 bottom-1 overflow-hidden hidden sm:block">
                  <div className="flex flex-col gap-1">
                    {[...filteredDayEvents]
                      .sort((a, b) => (a.type === 'income') === (b.type === 'income') ? 0 : (a.type === 'income' ? -1 : 1))
                      .slice(0, 3)
                      .map((e) => {
                        const cls = rowClass(e);
                        if (!cls) return null; // hide income inline
                        const isBill = e.type === 'bill';
                        const name = e.type === 'income' ? cleanIncomeName(e.name) : e.name;

                        return (
                          <div key={e.id} className={`text-[11px] leading-tight text-left truncate ${cls}`}>
                            <span className="truncate inline-block max-w-[90%] align-middle">{name}</span>
                            {isBill && (() => {
                              const { label, className } = billStatusPill(e);
                              return (
                                <span className={`ml-1 align-middle inline-block px-1.5 py-[1px] rounded-full text-[10px] ${className}`}>
                                  {label}
                                </span>
                              );
                            })()}
                          </div>
                        );
                      })}
                    {filteredDayEvents.length > 3 && (
                      <div className="text-[11px] text-white/70 pl-2">
                        +{filteredDayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Tooltip — income first; bills show pill on same line */}
              {isTooltipActive && hasEvent && (
                <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-slate-800/90 backdrop-blur-sm rounded-lg border border-slate-700 shadow-xl min-w-48">
                  <div className="space-y-2">
                    {[...filteredDayEvents]
                      .sort((a, b) => (a.type === 'income') === (b.type === 'income') ? 0 : (a.type === 'income' ? -1 : 1))
                      .map((e) => {
                        const isBill = e.type === 'bill';
                        const name = e.type === 'income' ? cleanIncomeName(e.name) : e.name;
                        const amount = (Number(e.amount) || 0).toFixed(2);

                        return (
                          <div key={e.id} className="flex items-start gap-2 text-xs">
                            <div className="flex-1 flex items-center gap-2">
                              <p className="font-medium text-white truncate">{name} - ${amount}</p>
                              {isBill && (() => {
                                const { label, className } = billStatusPill(e);
                                return <span className={`inline-block px-1.5 py-[1px] rounded-full text-[10px] ${className}`}>{label}</span>;
                              })()}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-700"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Custom Filter Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="glass-panel text-white border-white/20">
          <DialogHeader><DialogTitle>Create Custom Filter</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2 block">Filter Name</Label>
              <Input value={newFilterName} onChange={(e) => setNewFilterName(e.target.value)} placeholder="Enter filter name..." className="bg-white/10 border-white/20 text-white" />
            </div>
            <div>
              <Label className="text-white mb-3 block">Include Events</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="bills" checked={selectedTypes.includes('bill')} onCheckedChange={(c) => handleTypeToggle('bill', c)} className="border-white/30" />
                  <Label htmlFor="bills" className="text-white">Bills</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="subscriptions" checked={selectedTypes.includes('subscription')} onCheckedChange={(c) => handleTypeToggle('subscription', c)} className="border-white/30" />
                  <Label htmlFor="subscriptions" className="text-white">Subscriptions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="income" checked={selectedTypes.includes('income')} onCheckedChange={(c) => handleTypeToggle('income', c)} className="border-white/30" />
                  <Label htmlFor="income" className="text-white">Income</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveFilter} disabled={!newFilterName.trim() || selectedTypes.length === 0} className="bg-gradient-to-r from-cyan-500 to-blue-500">Save Filter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Filters Dialog */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="glass-panel text-white border-white/20">
          <DialogHeader><DialogTitle>Manage Filters</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {savedFilters.map((filter) => (
              <div key={filter.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                <div>
                  <span className="text-white font-medium">{filter.name}</span>
                  <p className="text-white/60 text-xs">{filter.types.join(', ')}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => handleSetDefaultFilter(filter.id)}
                    disabled={defaultFilterId === filter.id}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-amber-400 hover:text-amber-300 disabled:text-amber-400 disabled:opacity-100 hover:bg-white/10"
                    title="Set as default"
                  >
                    {defaultFilterId === filter.id ? <Star className="w-4 h-4" fill="currentColor" /> : <Star className="w-4 h-4" />}
                  </Button>
                  {filter.id !== 'default-filter' && (
                    <Button
                      onClick={() => handleDeleteFilter(filter.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      title="Delete filter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setShowManageDialog(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}