import React from 'react';
import { getStatusColor } from '../../utils/employeeUtils';

const StatusBadge = ({ status }) => {
    const colorClass = getStatusColor(status);
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorClass}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
