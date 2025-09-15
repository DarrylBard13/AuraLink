import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns';

export default function IncomeTable({ loggedIncome, incomeSources }) {
  const sourceMap = new Map(incomeSources.map(s => [s.id, s.name]));

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-6">
      <h3 className="text-xl font-bold text-white mb-4">This Month's Logged Income</h3>
      {loggedIncome.length > 0 ? (
        <div className="space-y-3 md:space-y-0">
          {/* Mobile: Stack format */}
          <div className="block md:hidden space-y-4">
            {loggedIncome.map(log => (
              <div key={log.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-white text-sm">{sourceMap.get(log.incomeSourceId) || 'Unknown Source'}</h4>
                  <span className="text-green-300 font-bold text-lg">${log.amountReceived.toFixed(2)}</span>
                </div>
                <p className="text-white/70 text-sm">{format(parseISO(log.dateReceived), 'MMM d, yyyy')}</p>
              </div>
            ))}
          </div>

          {/* Desktop: Table format */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-white">Source</TableHead>
                  <TableHead className="text-white">Date Received</TableHead>
                  <TableHead className="text-white text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loggedIncome.map(log => (
                  <TableRow key={log.id} className="border-white/10">
                    <TableCell className="font-medium text-white/90">{sourceMap.get(log.incomeSourceId) || 'Unknown Source'}</TableCell>
                    <TableCell className="text-white/80">{format(parseISO(log.dateReceived), 'MMMM d, yyyy')}</TableCell>
                    <TableCell className="text-right font-semibold text-green-300">${log.amountReceived.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-white/70">No income has been logged for this month yet.</p>
        </div>
      )}
    </div>
  );
}