import React from "react";
import { ChevronDown } from "lucide-react";

const AccordionSection = ({
  id,
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  contentPadding = "p-6",
}) => {
  return (
    <div id={id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-all font-semibold text-gray-700 focus:outline-none group"
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="p-1.5 bg-(--color-primary)/10 text-(--color-primary) rounded-lg group-hover:bg-(--color-primary)/20 transition-all">
              <Icon size={18} />
            </span>
          )}
          <span className="text-base font-bold text-(--color-text-dark) group-hover:text-(--color-primary) transition-colors">
            {title}
          </span>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-all duration-200 group-hover:text-(--color-primary) ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className={`border-t border-gray-100 ${contentPadding}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionSection;
