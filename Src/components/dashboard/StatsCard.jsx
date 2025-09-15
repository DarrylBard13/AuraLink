import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Receipt } from "lucide-react";

export default function StatsCard({
  title,
  value,
  icon: Icon,
  gradient,
  subtitle,
  linkTo,
  variant
}) {
  const isDanger = variant === "danger";

  const cardClasses = isDanger
    ? "rounded-xl p-2 sm:p-4 transition-all duration-300 min-w-0 flex-shrink-0 shadow-lg h-full bg-red-800/50 backdrop-blur-md border-2 border-red-500 hover:bg-red-900/90"
    : "glass-panel rounded-xl p-2 sm:p-4 transition-all duration-300 min-w-0 flex-shrink-0 shadow-lg h-full hover:glass-hover";

  const iconContainerClasses = isDanger
    ? "p-1.5 sm:p-2 rounded-lg bg-red-500/50 shadow-lg"
    : `p-1.5 sm:p-2 rounded-lg bg-gradient-to-r ${gradient} shadow-lg`;

  const FallbackIcon = Icon || Receipt;

  const CardContent = (
    <motion.div
      whileHover={{ y: -1, scale: 1.02 }}
      className={cardClasses}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className={iconContainerClasses}>
          <FallbackIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${isDanger ? "text-red-100" : "text-white"}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 truncate ${isDanger ? "text-red-200/90" : "text-blue-200/90"}`}>
            {title}
          </p>
          <p className={`text-sm sm:text-xl font-bold mb-0.5 sm:mb-1 truncate ${isDanger ? "text-red-100" : "text-white"}`}>
            {value}
          </p>
          {subtitle && (
            <p className={`text-xs truncate ${isDanger ? "text-red-200/70" : "text-blue-200/70"}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block h-full">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}