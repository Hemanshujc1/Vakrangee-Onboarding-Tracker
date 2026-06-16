import React from 'react';

const InfoField = ({ icon: Icon, label, value, isEditing, editInput, className = "wrap-break-word" }) => {
  return (
    <div className="flex items-start gap-3 text-gray-600 min-w-0">
      <div className="p-2 bg-(--color-primary)/10 rounded-lg text-(--color-primary) shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0 w-full">
        <p className="text-xs text-gray-400">{label}</p>
        {isEditing && editInput ? (
          editInput
        ) : (
          <p className={`font-medium text-sm ${className}`}>
            {value || "N/A"}
          </p>
        )}
      </div>
    </div>
  );
};

export default InfoField;
