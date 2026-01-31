import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  className = "" 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalItems === 0) {
      return (
        <div className={`bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between ${className}`}>
           <span className="text-sm text-gray-500">
            Showing <span className="font-medium">0</span> results
           </span>
           <div className="flex gap-2">
            <button disabled className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white opacity-50 cursor-not-allowed">Previous</button>
            <button disabled className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white opacity-50 cursor-not-allowed">Next</button>
           </div>
        </div>
      )
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between ${className}`}>
      <span className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-medium">{startItem}</span>
        {" - "}
        <span className="font-medium">{endItem}</span>
        {" of "}
        <span className="font-medium">{totalItems}</span>{" "}
        results
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
           <ChevronLeft/>
          
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
         <ChevronRight/>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
