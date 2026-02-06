import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorVar }) => (
  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-(--color-text-dark)">{value}</h3>
      </div>
      <div 
        className="p-3 rounded-full shrink-0 flex items-center justify-center"
        style={{ 
            backgroundColor: `color-mix(in srgb, var(${colorVar}), transparent 85%)`,
            color: `var(${colorVar})`
        }}
      >
        <Icon size={20} style={{ opacity: 1, color: `var(${colorVar})` }} />
      </div>
    </div>
  </div>
);

export default StatCard;
