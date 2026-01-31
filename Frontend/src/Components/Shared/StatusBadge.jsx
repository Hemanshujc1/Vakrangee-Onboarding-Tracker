import React from 'react';
import { getStatusColor } from '../../utils/employeeUtils';

const StatusBadge = ({ status }) => {
    const colorClass = getStatusColor(status);
    return (
        <span className={`px-1 py-2 rounded-full text-xs font-normal ${colorClass}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
