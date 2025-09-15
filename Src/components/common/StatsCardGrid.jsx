import React from "react";
import { motion } from "framer-motion";

export default function StatsCardGrid({ children, delay = 0.1 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}>
      {/* Outer div with gradient border effect */}
      <div className="p-1 rounded-3xl">
        {/* Inner div with mobile-optimized grid */}
        <div className="px-2 sm:px-4 py-3 sm:py-4 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 glass-panel rounded-3xl">
          {children}
        </div>
      </div>
    </motion.div>
  );
}