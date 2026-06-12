import { Award } from "lucide-react";

const EducationIdentityCard = ({ employee }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#4E4E4E]">
          Academic Information
        </h3>
        <div className="p-2 bg-gray-50 text-gray-600 rounded-lg">
          <Award size={20} />
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">10th Percentage</p>
            <p className="text-sm text-gray-800 font-medium">
              {employee.tenth_percentage
                ? `${employee.tenth_percentage}%`
                : "N/A"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">12th Percentage</p>
            <p className="text-sm text-gray-800 font-medium">
              {employee.twelfth_percentage
                ? `${employee.twelfth_percentage}%`
                : "N/A"}
            </p>
          </div>
          {employee.degree_name && (
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Degree</p>
              <p className="text-sm text-gray-800 font-medium">
                {employee.degree_name}
              </p>
            </div>
          )}
          {employee.degree_percentage !== undefined && employee.degree_percentage !== null && (
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Degree Percentage</p>
              <p className="text-sm text-gray-800 font-medium">
                {employee.degree_percentage}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EducationIdentityCard;
