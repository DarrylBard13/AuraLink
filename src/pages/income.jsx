import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Landmark } from 'lucide-react';
import { IncomeSource, LoggedIncome } from '@/api/entities';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO, add, addDays, subDays, startOfToday } from 'date-fns';
import { toast } from 'sonner';

import PageErrorBoundary from '@/components/common/PageErrorBoundary';
import IncomeStats from '@/components/income/IncomeStats';
import IncomeTable from '@/components/income/IncomeTable';
import WeeklyIncome from '@/components/income/WeeklyIncome';
import IncomeSourceForm from '@/components/income/IncomeSourceForm';
import LogIncomeForm from '@/components/income/LogIncomeForm';

function IncomePageContent() {
  const [sources, setSources] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSourceForm, setShowSourceForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingSource, setEditingSource] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sourcesData, logsData] = await Promise.all([
        IncomeSource.list('-created_date'),
        LoggedIncome.list('-created_date')
      ]);
      setSources(sourcesData);
      setLogs(logsData);
    } catch (error) {
      console.error("Error fetching income data:", error);
      toast.error("Failed to load income data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditSource = (sourceToEdit) => {
    setEditingSource(sourceToEdit);
    setShowSourceForm(true);
  };

  const handleSourceSubmit = async (data) => {
    try {
      if (editingSource) {
        await IncomeSource.update(editingSource.id, data);
        toast.success("Income source updated!");
      } else {
        await IncomeSource.create(data);
        toast.success("Income source added!");
      }
      setShowSourceForm(false);
      setEditingSource(null);
      fetchData();
    } catch (error) {
      console.error("Error saving income source:", error);
      toast.error("Failed to save income source.");
    }
  };

  const handleLogSubmit = async (data) => {
    try {
        const existing = await LoggedIncome.filter({ entryHash: data.entryHash });
        if (existing.length > 0) {
            toast.error("Duplicate Entry", { description: "This income entry appears to have already been logged." });
            return;
        }
      await LoggedIncome.create(data);
      
      // Advance payday for recurring sources
      const source = sources.find(s => s.id === data.incomeSourceId);
      if (source && (source.payFrequency === 'weekly' || source.payFrequency === 'bi-weekly')) {
        try {
          const currentPayday = parseISO(source.nextPayday);
          const daysToAdd = source.payFrequency === 'weekly' ? 7 : 14;
          const nextPayday = add(currentPayday, { days: daysToAdd });
          
          await IncomeSource.update(source.id, { nextPayday: format(nextPayday, 'yyyy-MM-dd') });
          toast.info(`'${source.name}' next payday advanced to ${format(nextPayday, 'MMM d')}.`);
          
        } catch (updateError) {
          console.error("Failed to advance income source payday:", updateError);
          toast.error("Logged income, but failed to update next payday for the source.");
        }
      }
      
      toast.success("Income logged successfully!");
      setShowLogForm(false);
      fetchData();
    } catch (error)      {
      console.error("Error logging income:", error);
      toast.error("Failed to log income.");
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const today = startOfToday();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);

    const thisMonthLogs = logs.filter(log => {
      try {
        return log.dateReceived && isWithinInterval(parseISO(log.dateReceived), { start: monthStart, end: monthEnd });
      } catch { return false; }
    });

    const thisYearLogs = logs.filter(log => {
      try {
        return log.dateReceived && isWithinInterval(parseISO(log.dateReceived), { start: yearStart, end: yearEnd });
      } catch { return false; }
    });
    
    const activeSources = sources.filter(s => s.status === 'active');
    
    const thisMonthNet = thisMonthLogs.reduce((acc, log) => acc + (log.amountReceived || 0), 0);
    const ytdNet = thisYearLogs.reduce((acc, log) => acc + (log.amountReceived || 0), 0);
    
    const expectedEventsThisMonth = [];
    activeSources.forEach(source => {
        if (!source.nextPayday) return;

        try {
            if (source.payFrequency === 'weekly' || source.payFrequency === 'bi-weekly') {
                const intervalDays = source.payFrequency === 'weekly' ? 7 : 14;
                let currentPayday = parseISO(source.nextPayday);

                // Rewind to the last payday before the current month started to establish a baseline
                // This handles cases where nextPayday is in the future, but we need to count
                // multiple paydays within the current month for recurring sources.
                // We go back one interval to ensure we catch any paydays at the very start of the month.
                while (currentPayday.getTime() >= monthStart.getTime()) {
                    currentPayday = subDays(currentPayday, intervalDays);
                }
                
                // Step forward through the month, adding each payday that falls within it
                // We add a few extra iterations beyond monthEnd to ensure we catch all potential
                // paydays that might just fall within the month due to `addDays` calculation.
                for (let i = 0; i < 5; i++) { // Max 4-5 paydays in a month for weekly/bi-weekly
                    currentPayday = addDays(currentPayday, intervalDays);
                    if (isWithinInterval(currentPayday, { start: monthStart, end: monthEnd })) {
                        expectedEventsThisMonth.push({ amount: source.expectedAmount || 0 });
                    }
                    if (currentPayday.getTime() > monthEnd.getTime()) {
                        break; // Stop if we've gone past the end of the month
                    }
                }
            } else { // For monthly or one-time
                const payday = parseISO(source.nextPayday);
                if (isWithinInterval(payday, { start: monthStart, end: monthEnd })) {
                    expectedEventsThisMonth.push({ amount: source.expectedAmount || 0 });
                }
            }
        } catch (e) {
            console.error(`Could not process source for stats: ${source.name}`, e);
        }
    });

    const thisMonthExpected = expectedEventsThisMonth.reduce((acc, event) => acc + event.amount, 0);

    const upcomingPaydays = activeSources
        .filter(s => {
            try {
                // Ensure nextPayday is defined and not in the past relative to today
                return s.nextPayday && parseISO(s.nextPayday).getTime() >= today.getTime();
            } catch {
                return false;
            }
        })
        .sort((a, b) => parseISO(a.nextPayday) - parseISO(b.nextPayday));

    const nextPaydaySource = upcomingPaydays[0];

    return {
      thisMonthNet,
      ytdNet,
      thisMonthReceived: thisMonthNet,
      thisMonthExpected,
      nextPayday: nextPaydaySource ? format(parseISO(nextPaydaySource.nextPayday), 'MMM d') : 'N/A',
      nextPaydaySource: nextPaydaySource ? nextPaydaySource.name : 'No upcoming paydays'
    };
  }, [logs, sources]);

  const thisMonthLogs = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    return logs
        .filter(log => isWithinInterval(parseISO(log.dateReceived), { start: monthStart, end: monthEnd }))
        .sort((a, b) => parseISO(b.dateReceived) - parseISO(a.dateReceived));
  }, [logs]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Income</h1>
            <p className="text-white/80 text-sm md:text-base">Track your earnings and manage income sources.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => { setEditingSource(null); setShowSourceForm(true); }}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/15 w-full sm:w-auto"
            >
              <Landmark className="w-4 h-4 mr-2" />
              Add Income Source
            </Button>
            <Button
              onClick={() => setShowLogForm(true)}
              className="bg-gradient-to-r from-green-500 to-lime-500 text-white shadow-lg w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Received Income
            </Button>
          </div>
        </div>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {loading ? <p className="text-white">Loading stats...</p> : <IncomeStats stats={stats} />}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {loading ? <p className="text-white">Loading table...</p> : <IncomeTable loggedIncome={thisMonthLogs} incomeSources={sources} />}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        {loading ? <p className="text-white">Loading weekly breakdown...</p> : <WeeklyIncome sources={sources} loggedIncome={logs} onEditSource={handleEditSource} />}
      </motion.div>

      <IncomeSourceForm 
        isOpen={showSourceForm}
        source={editingSource}
        onSubmit={handleSourceSubmit}
        onCancel={() => { setShowSourceForm(false); setEditingSource(null); }}
      />
      
      <LogIncomeForm
        isOpen={showLogForm}
        sources={sources}
        onSubmit={handleLogSubmit}
        onCancel={() => setShowLogForm(false)}
      />

      <style>{`
        .glass-panel[role="dialog"] {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          max-height: 85vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

export default function IncomePage() {
    return (
        <PageErrorBoundary pageName="Income">
            <IncomePageContent />
        </PageErrorBoundary>
    );
}