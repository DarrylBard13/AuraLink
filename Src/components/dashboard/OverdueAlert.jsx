import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OverdueAlert({ count, onDismiss }) {
  if (count === 0) {
    return null;
  }

  return (
    <div className="flex justify-center px-4 lg:block lg:px-0">
      <Alert variant="destructive" className="glass-panel border-red-500/50 bg-red-900/40 text-red-200 w-full max-w-2xl lg:max-w-none">
        <AlertTriangle className="h-4 w-4 !text-red-300" />
        <AlertTitle className="mb-1 leading-none tracking-tight font-bold text-red-300">Overdue Bills</AlertTitle>
        <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm">You have {count} bill{count > 1 ? 's' : ''} past the due date.</p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button asChild size="sm" className="bg-red-500 hover:bg-red-600 text-white h-8 flex-1 sm:flex-initial min-h-[44px] sm:min-h-[32px]">
              <Link to={createPageUrl("bills?status=overdue")}>Review</Link>
            </Button>
            <Button onClick={onDismiss} variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}