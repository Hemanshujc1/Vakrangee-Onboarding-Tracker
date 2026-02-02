import React from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { getEmployeeStatus } from '../../utils/employeeUtils';

const EmployeeTable = ({ employees, onRowClick, onDelete, onActivate, showAssignedDate = false, emptyMessage = "No employees found." }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-center">
          <thead className="bg-gray-50 border-b border-gray-100 text-center">
            <tr>
              <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joining Date</th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {showAssignedDate ? "Assigned Date" : "HR Assigned"}
              </th>
              {(onDelete || onActivate) && <th className="px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {employees.length > 0 ? (
              employees.map((emp) => {
                const statusText = getEmployeeStatus(emp);
                const isInactive = emp.accountStatus === 'Inactive' || statusText === 'Not Joined';
                
                return (
                  <tr
                    key={emp.id}
                    onClick={() => onRowClick(emp)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-4 flex flex-col justify-center items-center gap-1">
                      {emp.profilePhoto ? (
                        <img
                          src={emp.profilePhoto}
                          alt={emp.firstName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm uppercase">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                      )} 
                      <span>  {emp.firstName} {emp.lastName}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {emp.jobTitle || "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {emp.department || "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {emp.location || "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString('en-GB') : "-"}
                    </td>
                    <td className="px-0 py-4">
                      <StatusBadge status={statusText} />
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {showAssignedDate 
                        ? (emp.assignedDate ? new Date(emp.assignedDate).toLocaleDateString('en-GB') : "-")
                        : (emp.assignedHRName || "-")}
                    </td>
                    {(onDelete || onActivate) && (
                    <td className="px-3 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                {(isInactive && onActivate) ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onActivate(emp);
                                        }}
                                        className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Activate"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                ) : (
                                    onDelete && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(emp);
                                            }}
                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )
                                )}
                            </div>
                    </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={(onDelete || onActivate) ? "8" : "7"}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;
