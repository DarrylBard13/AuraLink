
import React, { useState, useEffect } from "react";
import { Budget } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

function BudgetCard({ budget }) {
  const netAmount = budget.net_amount || 0;
  const isSurplus = netAmount >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="glass-panel h-full flex flex-col hover:bg-white/15 transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-white text-lg font-bold">
              Budget: {format(new Date(budget.cycle + "-02"), 'MMMM yyyy')}
            </CardTitle>
            <Badge variant="secondary" className={`capitalize ${budget.status === 'draft' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
              {budget.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-white/70 text-sm">Total Income</span>
              <span className="font-semibold text-green-300 text-lg">${(budget.total_income || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-white/70 text-sm">Total Expenses</span>
              <span className="font-semibold text-red-300 text-lg">${(budget.total_expenses || 0).toFixed(2)}</span>
            </div>
             <div className="flex justify-between items-baseline pt-2 border-t border-white/20">
              <span className="text-white font-bold text-md">Net</span>
              <span className={`font-bold text-xl ${isSurplus ? 'text-green-400' : 'text-orange-400'}`}>
                {isSurplus ? '+' : '-'}${Math.abs(netAmount).toFixed(2)}
              </span>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full mt-6 bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Link to={createPageUrl(`budgetdetails?cycle=${budget.cycle}`)}>
              View Details <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const budgetRecords = await Budget.list('-cycle');
        setBudgets(budgetRecords);
      } catch (error) {
        console.error("Failed to fetch budgets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Budgets</h1>
          <p className="text-white/80">Review all budgets created by the AI Assistant.</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
          <Link to={createPageUrl("budgetbuilder")}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Budget
          </Link>
        </Button>
      </motion.div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-white/70">Loading budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="glass-panel rounded-2xl p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Budgets Found</h3>
            <p className="text-white/60 mb-6">
              Use the Budget Builder AI to create your first monthly budget.
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {budgets.map(budget => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
