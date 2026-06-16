import React from 'react';
import { ChevronDown } from 'lucide-react';

const CollapsibleSection = ({ title, icon: Icon, isOpen, onToggle, children, gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" }) => {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between pb-2 border-b border-gray-100 hover:text-(--color-primary) transition-colors text-left focus:outline-none group"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-(--color-primary)/10 text-(--color-primary) rounded-lg group-hover:bg-(--color-primary)/20 transition-colors">
            <Icon size={18} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-(--color-text-dark) group-hover:text-(--color-primary) transition-colors">
            {title}
          </h3>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-200 group-hover:text-(--color-primary) ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className={`grid ${gridCols} gap-y-6 gap-x-6 mt-6`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
