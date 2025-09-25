import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Receipt } from "lucide-react";
import { motion } from "framer-motion";

export default function EmptyBillsState({ onAddBill, searchTerm, hasFilters }) {
  if (searchTerm || hasFilters) {
    return (
      <div className="text-center py-12">
        <div className="glass-panel rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No bills found
          </h3>
          <p className="text-white/60 mb-6">
            Try adjusting your search or filters to find bills.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="glass-panel rounded-2xl p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No bills yet
        </h3>
        <p className="text-white/60 mb-6">
          Add your first bill to start tracking payments and due dates.
        </p>
        {onAddBill && (
          <Button
            onClick={onAddBill}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Bill
          </Button>
        )}
      </div>
    </motion.div>
  );
}