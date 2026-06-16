import React from "react";
import { Trash2, RotateCcw } from "lucide-react";

const AdminTable = ({
  currentAdmins,
  handleActivateAdmin,
  handleDeleteAdmin,
  navigate,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-center text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Admins
              </th>
              <th className="hidden md:table-cell px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="hidden lg:table-cell px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="hidden md:table-cell px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="hidden sm:table-cell px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                Assigned
              </th>
              <th className="hidden xl:table-cell px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                Onboarded
              </th>
              <th className="hidden xl:table-cell px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                Not Joined
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentAdmins.length > 0 ? (
              currentAdmins.map((admin) => (
                <tr
                  key={admin.id}
                  onClick={() => navigate(`/hr-super-admin/admins/${admin.id}`)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-2 flex flex-col items-center gap-1">
                    {admin.profilePhoto ? (
                      <img
                        src={admin.profilePhoto}
                        alt={admin.firstName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-(--color-secondary) text-white flex items-center justify-center font-bold text-sm uppercase">
                        {admin.firstName?.[0]}
                        {admin.lastName?.[0]}
                      </div>
                    )}{" "}
                    <div className="font-normal text-gray-900">
                      {admin.firstName} {admin.lastName}
                      <div className="text-xs text-gray-400 font-normal">
                        {admin.email}
                      </div>
                    </div>
                  </td>

                  <td className="hidden md:table-cell px-6 py-4 text-gray-600">
                    {admin.jobTitle || admin.role}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 text-gray-600">
                    {admin.location || "-"}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.accountStatus === "Inactive"
                          ? "bg-red-100 text-red-800"
                          : admin.accountStatus === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {admin.accountStatus || "ACTIVE"}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-s font-medium bg-blue-100 text-blue-800">
                      {admin.assignedCount || 0}
                    </span>
                  </td>
                  <td className="hidden xl:table-cell px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-s font-medium bg-green-100 text-green-800">
                      {admin.onboardedCount || 0}
                    </span>
                  </td>

                  <td className="hidden xl:table-cell px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-s font-medium bg-gray-600 text-gray-100">
                      {admin.notJoinedCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {admin.accountStatus === "Inactive" ||
                      admin.accountStatus === "Not Joined" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivateAdmin(admin.id);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Activate Admin"
                        >
                          <RotateCcw size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAdmin(admin.id);
                          }}
                          disabled={admin.role === "HR_SUPER_ADMIN"}
                          className={`p-2 rounded-lg transition-colors text-black ${
                            admin.role === "HR_SUPER_ADMIN"
                              ? "cursor-not-allowed"
                              : "hover:text-red-600 hover:bg-red-50"
                          }`}
                          title={
                            admin.role === "HR_SUPER_ADMIN"
                              ? "Cannot delete Super Admin"
                              : "Deactivate Admin"
                          }
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
