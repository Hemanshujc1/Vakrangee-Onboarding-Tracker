import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Check, X } from "lucide-react";

/**
 * A reusable searchable dropdown component with autocomplete functionality.
 *
 * @param {Object} props
 * @param {string} props.label - Label for the dropdown
 * @param {Array} props.options - Array of objects with id and name
 * @param {string} props.value - Current selected value (name)
 * @param {Function} props.onChange - Callback when value changes
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether the field is required
 * @param {boolean} props.disabled - Whether the dropdown is disabled
 * @param {string} props.name - Name of the field for identification
 */
const SearchableSelect = ({
  label,
  options = [],
  value = "",
  onChange,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    (option.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Find the label to display based on the current value (could be name or id)
  const displayLabel =
    options.find(
      (opt) => String(opt.id) === String(value) || opt.name === value,
    )?.name || value;

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
      // Focus input when opening
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSelect = (option) => {
    // Pass the ID as the value, but also include the full option for flexibility
    onChange({
      target: {
        name,
        value: option.id,
        option: option,
      },
    });
    setIsOpen(false);
    setSearchTerm("");
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: "" } });
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={handleToggle}
        className={`w-full px-4 py-2 rounded-xl border border-gray-200 bg-white flex items-center justify-between cursor-pointer transition-all ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-100"
            : "hover:border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
      >
        <span
          className={`truncate ${!displayLabel ? "text-gray-400" : "text-gray-900"}`}
        >
          {displayLabel || placeholder}
        </span>
        <div className="flex items-center gap-2">
          {value && !disabled && (
            <X
              className="w-4 h-4 text-gray-400 hover:text-gray-600"
              onClick={clearSelection}
            />
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 4 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-60 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="p-2 border-b border-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border-none rounded-lg focus:ring-0 outline-none"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className="px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">{option.name}</span>
                    {value === option.name && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No matches found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableSelect;
