import React from 'react';
import { Plus, Trash2 } from "lucide-react";

export const DynamicTable = ({ headers, fields = [], onRemove, renderRow, colWidths }) => (
    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden mb-2">
        <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
                <tr className="bg-gray-100">
                    {headers.map((h, i) => <th key={i} className="border border-gray-300 p-2 text-left" style={{ width: colWidths?.[i] }}>{h}</th>)}
                    {onRemove && <th className="border border-gray-300 p-2 w-[5%]"></th>}
                </tr>
            </thead>
            <tbody>
                {fields.map((item, index) => (
                    <tr key={item.id}>
                        {renderRow(item, index)}
                        {onRemove && (
                            <td className="border border-gray-300 p-2 text-center align-middle">
                                <button type="button" onClick={() => onRemove(index)} className="text-red-500 hover:text-red-700">
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const TableInput = ({ register, placeholder, type = "text", error }) => (
    <td className="border border-gray-300 p-1 align-top">
        <input {...register} type={type} placeholder={placeholder} className="w-full outline-none p-1 bg-transparent" />
        {error && <span className="text-red-500 text-xs block px-1">{error.message}</span>}
    </td>
);

export const AddButton = ({ onClick, label, disabled }) => (
    <button 
        type="button" 
        onClick={onClick} 
        disabled={disabled}
        className={`text-sm font-medium flex items-center gap-1 ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
    >
        <Plus size={16} /> {label}
    </button>
);
