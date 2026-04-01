import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle, Circle } from "lucide-react";


const AccordionSection = ({
  id,
  title,
  isOpen,
  onToggle,
  isCompleted,
  children,
}) => {
  return (
    <div id={id} className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white shadow-sm transition-all duration-300">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className={`w-full flex items-center justify-between p-5 text-left transition-colors ${
          isOpen ? "bg-blue-50/50" : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-green-500 fill-green-50" />
            ) : (
              <Circle className="w-6 h-6 text-gray-300" />
            )}
          </div>
          <h3
            className={`font-semibold text-lg ${
              isOpen ? "text-blue-700" : "text-gray-800"
            }`}
          >
            {title}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown
            className={`w-5 h-5 ${isOpen ? "text-blue-600" : "text-gray-400"}`}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="p-6 border-t border-gray-100 bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccordionSection;
