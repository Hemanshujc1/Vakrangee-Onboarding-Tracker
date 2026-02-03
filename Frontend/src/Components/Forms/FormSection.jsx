import React from 'react';

const FormSection = ({ title, isRequired, children, className = "" }) => (
  <div className={`p-5 border rounded-lg shadow-sm mb-6 bg-white ${className}`}>
    <h3 className="font-semibold uppercase text-sm mb-4 border-b border-gray-200 pb-2 bg-gray-50 -mx-5 -mt-5 p-3 rounded-t-lg">
      {title} 
      {isRequired && <span className="text-red-500"> *</span>}
    </h3>
    {children}
  </div>
);

export default FormSection;
