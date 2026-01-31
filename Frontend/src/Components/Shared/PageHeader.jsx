import React from 'react';

const PageHeader = ({ title, subtitle, actionLabel, onAction, ActionIcon, children }) => {
  return (
    <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-(--color-text-dark)">{title}</h1>
        <p className="text-gray-500 mt-2">{subtitle}</p>
      </div>
      <div className="flex gap-3">
        {children}
        {actionLabel && onAction && (
            <button 
                onClick={onAction}
                className="flex items-center gap-2 bg-(--color-secondary) text-white px-5 py-2.5 rounded-lg hover:brightness-110 transition-all font-medium cursor-pointer shadow-sm"
            >
            {ActionIcon && <ActionIcon size={20} />}
            <span>{actionLabel}</span>
            </button>
        )}
      </div>
    </header>
  );
};

export default PageHeader;
