import React from 'react';

const StatCard = ({ title, value, icon: Icon, colorVar }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-(--color-text-dark)">{value}</h3>
      </div>
      <div 
        className="p-3 rounded-full opacity-20" 
        style={{ backgroundColor: `var(${colorVar})`, color: `var(${colorVar})` }}
      >
        <Icon size={24} style={{ opacity: 1, color: `var(${colorVar})` }} />
      </div>
    </div>
    <div className="absolute top-6 right-6 p-3 rounded-full text-transparent">
        <Icon size={24} style={{ fill: `var(${colorVar})`, stroke: `var(${colorVar})` }} /> 
    </div>
  </div>
);

export default StatCard;
