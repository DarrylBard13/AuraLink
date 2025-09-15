import React, { useState, useEffect } from "react";
import { Budget } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, BookOpen, DollarSign, BarChart3, TrendingUp, TrendingDown, Receipt, CreditCard, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import PageErrorBoundary from "../components/common/PageErrorBoundary";
import { Button } from "@/components/ui/button";

function DetailCard({ icon: Icon, title, value, valueClass }) {
  return (
    <div className="glass-panel p-4 rounded-lg flex items-start gap-4">
      <div className="p-2 bg-white/10 rounded-lg">
        <Icon className="w-5 h-5 text-white/80" />
      </div>
      <div>
        <p className="text-sm text-white/70">{title}</p>
        <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

/** Normalize markdown so headers, *** and line breaks render correctly */
function normalizeMarkdown(input) {
  if (!input) return "";
  let md = input;

  // If content looks JSON-encoded, try to parse once
  try {
    if ((md.startsWith("{") || md.startsWith("[") || md.startsWith('"')) && md.includes("\\n")) {
      const parsed = JSON.parse(md);
      if (typeof parsed === "string") md = parsed;
    }
  } catch {
    // ignore
  }

  md = md.replace(/\r\n?/g, "\n");                 // normalize newlines
  md = md.replace(/(\s)\*{3}(\s)/g, "\n\n***\n\n"); // ensure *** is on its own line
  md = md.replace(/([^\n])\s+(#{1,6}\s+)/g, "$1\n\n$2"); // headings start a line
  md = md.replace(/(#{1,6}\s[^\n]+)(?!\n)/g, "$1\n");    // newline after heading
  md = md.replace(/ {2}/g, "  \n");                      // double-space → soft break

  return md.trim();
}

// Minimal components so headers and hr are clearly styled
const mdComponents = {
  h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-semibold mb-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold mb-1">{children}</h3>,
  hr: () => <hr className="my-3 border-white/20" />,
  br: () => <br />,
};

// Safe currency formatter for numbers or strings
const formatCurrency = (v) => `$${(Number(v) || 0).toFixed(2)}`;

function BudgetDetailsPageContent() {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const budgetCycle = params.get("cycle");
        if (!budgetCycle) {
          setError("No budget cycle provided.");
          setLoading(false);
          return;
        }
        const budgetRecords = await Budget.filter({ cycle: budgetCycle });
        if (budgetRecords && budgetRecords.length > 0) {
          setBudget(budgetRecords[0]);
        } else {
          setError(`No budget found for cycle ${budgetCycle}.`);
        }
      } catch (err) {
        setError("Failed to fetch budget details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBudget();
  }, []);

  if (loading) return <div className="text-center p-10 text-white/70">Loading budget details...</div>;
  if (error) return <div className="text-center p-10 text-red-400">{error}</div>;
  if (!budget) return <div className="text-center p-10 text-white/70">No budget data found.</div>;

  const netAmount = budget.net_amount || 0;
  const isSurplus = netAmount >= 0;

  const editUrlParams = new URLSearchParams();
  const prompt = `I would like to edit the budget for the cycle ${budget.cycle}. Please load its details, show me the current budget and confirm when you are ready for my instructions.`;
  editUrlParams.set("prefill_prompt", prompt);

  // ---------- Normalize markdown inputs for Notes and Recommendations ----------
  const rawNotes = budget?.budget_notes;
  const notesRawStr =
    typeof rawNotes === "string"
      ? rawNotes
      : rawNotes?.content_markdown ??
        rawNotes?.markdown ??
        rawNotes?.content ??
        rawNotes?.text ??
        "";

  const notesMd = normalizeMarkdown(notesRawStr);

  const recsArr = budget?.variance_analysis?.recommendations;
  const recsJoined =
    Array.isArray(recsArr) && recsArr.length > 0
      ? recsArr
          .map((rec) => {
            if (typeof rec === "string") return `- ${rec}`;
            if (rec?.markdown) return rec.markdown;
            if (rec?.text) return `- ${rec.text}`;
            return `- ${String(rec)}`;
          })
          .join("\n")
      : "";

  const recsMd = normalizeMarkdown(recsJoined);

  // Scrub hidden characters that can trigger weird breaks
  const scrub = (s) => (s || "").replace(/[\u200B\u200C\u200D\u00AD\u2028\u2060]/g, "");
  const cleanNotesMd = scrub(notesMd);
  const cleanRecsMd = scrub(recsMd);

  // Styles: prevent breaking inside words
  const mdStyle = { wordBreak: "normal", overflowWrap: "normal", whiteSpace: "normal", hyphens: "manual" };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 safe-top safe-bottom">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to={createPageUrl("budgets")} className="flex items-center gap-2 text-white/80 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to all budgets
        </Link>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Budget for {format(new Date(budget.cycle + "-02"), "MMMM yyyy")}
            </h1>
            <Badge
              variant="secondary"
              className={`capitalize ${budget.status === "draft" ? "bg-yellow-500/20 text-yellow-300" : "bg-green-500/20 text-green-300"}`}
            >
              {budget.status}
            </Badge>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
            <Link to={createPageUrl(`budgetbuilder?${editUrlParams.toString()}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit with AI
            </Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <DetailCard title="Total Income" value={`$${(budget.total_income || 0).toFixed(2)}`} icon={TrendingUp} valueClass="text-green-300" />
        <DetailCard title="Total Expenses" value={`$${(budget.total_expenses || 0).toFixed(2)}`} icon={TrendingDown} valueClass="text-red-300" />
        <DetailCard
          title="Net Amount"
          value={`${isSurplus ? "+" : "-"}$${Math.abs(netAmount).toFixed(2)}`}
          icon={DollarSign}
          valueClass={isSurplus ? "text-green-400" : "text-orange-400"}
        />
        <DetailCard title="Expense Categories" value={Object.keys(budget.expense_categories || {}).length} icon={BarChart3} valueClass="text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Bills Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {budget.bills_breakdown?.map((item, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white">{item.bill_name}</p>
                    <p className="text-sm text-white/70">{item.category}</p>
                  </div>
                  <p className="font-bold text-white/90 text-lg">${(item.amount || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-white/20">
                    <TableHead className="text-white/80">Bill</TableHead>
                    <TableHead className="text-white/80">Category</TableHead>
                    <TableHead className="text-white/80 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budget.bills_breakdown?.map((item, i) => (
                    <TableRow key={i} className="border-b-white/10">
                      <TableCell className="font-medium text-white">{item.bill_name}</TableCell>
                      <TableCell className="text-white/80">{item.category}</TableCell>
                      <TableCell className="text-right text-white/90">${(item.amount || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscriptions Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {budget.subscriptions_breakdown?.map((item, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white">{item.subscription_name}</p>
                    <p className="text-sm text-white/70 capitalize">{item.billing_cycle}</p>
                  </div>
                  <p className="font-bold text-white/90 text-lg">${(item.cost || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-white/20">
                    <TableHead className="text-white/80">Subscription</TableHead>
                    <TableHead className="text-white/80">Cycle</TableHead>
                    <TableHead className="text-white/80 text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budget.subscriptions_breakdown?.map((item, i) => (
                    <TableRow key={i} className="border-b-white/10">
                      <TableCell className="font-medium text-white">{item.subscription_name}</TableCell>
                      <TableCell className="text-white/80 capitalize">{item.billing_cycle}</TableCell>
                      <TableCell className="text-right text-white/90">${(item.cost || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {Object.entries(budget.expense_categories || {}).map(([category, amount]) => (
                <div key={category} className="bg-white/5 rounded-lg p-3 border border-white/10 flex justify-between items-center">
                  <p className="font-medium text-white">{category}</p>
                  <p className="font-bold text-white/90 text-lg">{formatCurrency(amount)}</p>
                </div>
              ))}
            </div>
            {/* Desktop View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-white/20">
                    <TableHead className="text-white/80">Category</TableHead>
                    <TableHead className="text-white/80 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(budget.expense_categories || {}).map(([category, amount]) => (
                    <TableRow key={category} className="border-b-white/10">
                      <TableCell className="font-medium text-white">{category}</TableCell>
                      <TableCell className="text-right text-white/90">{formatCurrency(amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {(cleanNotesMd || cleanRecsMd) && (
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                AI Notes & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cleanNotesMd && (
                <div>
                  <ReactMarkdown
                    className="prose prose-sm prose-invert max-w-none text-white/90"
                    style={{ wordBreak: "normal", overflowWrap: "normal", whiteSpace: "normal", hyphens: "manual" }}
                    components={mdComponents}
                  >
                    {cleanNotesMd}
                  </ReactMarkdown>
                </div>
              )}

              {cleanRecsMd && (
                <div>
                  <h3 className="text-white font-semibold">Recommendations</h3>
                  <ReactMarkdown
                    className="prose prose-sm prose-invert max-w-none text-white/90"
                    style={{ wordBreak: "normal", overflowWrap: "normal", whiteSpace: "normal", hyphens: "manual" }}
                    components={mdComponents}
                  >
                    {cleanRecsMd}
                  </ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

export default function BudgetDetails() {
  return (
    <PageErrorBoundary pageName="Budget Details">
      <BudgetDetailsPageContent />
    </PageErrorBoundary>
  );
}