import React from "react";
import FormSection from "../../../Components/Forms/FormSection";
import { TableInput, AddButton } from "../../../Components/Forms/Shared";
import { Trash2 } from "lucide-react";

const WorkExperience = ({ register, errors, historyFields, appendHistory, removeHistory }) => {
  return (
    <>
      {/* Work Experience with Custom Manual Table */}
      <FormSection title="Work Experience">
        <p className="mb-4">
          Please list your work experience beginning with your most recent job.
          If you were self-employed, give firm name. Attach additional sheets if
          necessary.
        </p>
        <div className="mb-6 relative">
          <div className="border border-black overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-black">
                  <td className=" font-semibold p-2 w-[20%] border-r border-black">
                    Current Employer
                  </td>
                  <td className="p-0 w-[30%] border-r border-black relative">
                    <input
                      {...register(`workExperience.0.employer`)}
                      className={`w-full h-full p-2 outline-none absolute inset-0 bg-transparent ${errors.workExperience?.[0]?.employer ? 'bg-red-50' : ''}`}
                    />
                    {errors.workExperience?.[0]?.employer && (
                        <span className="absolute -bottom-4 left-0 text-[10px] text-red-500 bg-white px-1 z-10">
                            {errors.workExperience?.[0]?.employer?.message}
                        </span>
                    )}
                  </td>
                  <td className=" font-semibold p-2 w-[20%] border-r border-black">
                    Turnover
                  </td>
                  <td className="p-0 w-[30%] relative">
                    <input
                      {...register(`workExperience.0.turnover`)}
                      type="number"
                      className={`w-full h-full p-2 outline-none absolute inset-0 bg-transparent ${errors.workExperience?.[0]?.turnover ? 'bg-red-50' : ''}`}
                    />
                     {errors.workExperience?.[0]?.turnover && (
                        <span className="absolute -bottom-4 left-0 text-[10px] text-red-500 bg-white px-1 z-10">
                            {errors.workExperience?.[0]?.turnover?.message}
                        </span>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className=" font-semibold p-2 border-r border-black">
                    Location
                  </td>
                  <td className="p-0 border-r border-black relative">
                    <input
                      {...register(`workExperience.0.location`)}
                      className="w-full h-full p-2 outline-none absolute inset-0 bg-transparent"
                    />
                  </td>
                  <td className=" font-semibold p-2 border-r border-black">
                    No. of Employees
                  </td>
                  <td className="p-0 relative">
                    <input
                      {...register(`workExperience.0.noOfEmployees`)}
                      type="number"
                      className={`w-full h-full p-2 outline-none absolute inset-0 bg-transparent ${errors.workExperience?.[0]?.noOfEmployees ? 'bg-red-50' : ''}`}
                    />
                     {errors.workExperience?.[0]?.noOfEmployees && (
                        <span className="absolute -bottom-4 left-0 text-[10px] text-red-500 bg-white px-1 z-10">
                            {errors.workExperience?.[0]?.noOfEmployees?.message}
                        </span>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className=" font-semibold p-2 border-r border-black">
                    Joining Designation
                  </td>
                  <td className="p-0 border-r border-black relative">
                    <input
                      {...register(`workExperience.0.designation`)}
                      className="w-full h-full p-2 outline-none absolute inset-0 bg-transparent"
                    />
                  </td>
                  <td className=" font-semibold p-2 border-r border-black">
                    Joining CTC
                  </td>
                  <td className="p-0 relative">
                    <input
                      {...register(`workExperience.0.joiningCTC`)}
                       type="number"
                      className={`w-full h-full p-2 outline-none absolute inset-0 bg-transparent ${errors.workExperience?.[0]?.joiningCTC ? 'bg-red-50' : ''}`}
                    />
                    {errors.workExperience?.[0]?.joiningCTC && (
                        <span className="absolute -bottom-4 left-0 text-[10px] text-red-500 bg-white px-1 z-10">
                            {errors.workExperience?.[0]?.joiningCTC?.message}
                        </span>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className=" font-semibold p-2 border-r border-black">
                    Reporting To
                  </td>
                  <td className="p-0 border-r border-black relative">
                    <input
                      {...register(`workExperience.0.reportingOfficer`)}
                      className="w-full h-full p-2 outline-none absolute inset-0 bg-transparent"
                    />
                  </td>
                  <td className=" font-bold p-2 border-r border-black">
                    Joining Date
                  </td>
                  <td className="p-0 relative">
                    <input
                      type="date"
                      {...register(`workExperience.0.joiningDate`)}
                      className={`w-full h-full p-2 outline-none absolute inset-0 bg-transparent ${errors.workExperience?.[0]?.joiningDate ? 'bg-red-50' : ''}`}
                    />
                     {errors.workExperience?.[0]?.joiningDate && (
                        <span className="absolute -bottom-4 left-0 text-[10px] text-red-500 bg-white px-1 z-10">
                            {errors.workExperience?.[0]?.joiningDate?.message}
                        </span>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className=" font-semibold p-2 border-r border-black">
                    Current Designation
                  </td>
                  <td className="p-0 border-r border-black relative">
                    <input
                      {...register(`workExperience.0.currentDesignation`)}
                      className="w-full h-full p-2 outline-none absolute inset-0 bg-transparent"
                    />
                  </td>
                  <td className=" font-bold p-2 border-r border-black">
                    Current CTC
                  </td>
                  <td className="p-0 relative">
                    <input
                      {...register(`workExperience.0.currentCTC`)}
                       type="number"
                      className={`w-full h-full p-2 outline-none absolute inset-0 bg-transparent ${errors.workExperience?.[0]?.currentCTC ? 'bg-red-50' : ''}`}
                    />
                     {errors.workExperience?.[0]?.currentCTC && (
                        <span className="absolute -bottom-4 left-0 text-[10px] text-red-500 bg-white px-1 z-10">
                            {errors.workExperience?.[0]?.currentCTC?.message}
                        </span>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td className=" font-semibold p-2 border-r border-black">
                    Expected Salary
                  </td>
                  <td className="p-0 border-r border-black relative">
                    <input
                      {...register(`workExperience.0.expectedSalary`)}
                       type="number"
                      className={`w-full h-full p-2 outline-none absolute inset-0 bg-transparent ${errors.workExperience?.[0]?.expectedSalary ? 'bg-red-50' : ''}`}
                    />
                     {errors.workExperience?.[0]?.expectedSalary && (
                        <span className="absolute -bottom-4 left-0 text-[10px] text-red-500 bg-white px-1 z-10">
                            {errors.workExperience?.[0]?.expectedSalary?.message}
                        </span>
                    )}
                  </td>
                  <td className=" font-semibold p-2 border-r border-black">
                    Notice Period
                  </td>
                  <td className="p-0 relative">
                    <input
                      {...register(`workExperience.0.noticePeriod`)}
                       type="number"
                      className={`w-full h-full p-2 outline-none absolute inset-0 bg-transparent ${errors.workExperience?.[0]?.noticePeriod ? 'bg-red-50' : ''}`}
                    />
                    {errors.workExperience?.[0]?.noticePeriod && (
                        <span className="absolute -bottom-4 left-0 text-[10px] text-red-500 bg-white px-1 z-10">
                            {errors.workExperience?.[0]?.noticePeriod?.message}
                        </span>
                    )}
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td
                    colSpan="4"
                    className=" font-bold p-2 border-b border-black"
                  >
                    Key Responsibilities
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td colSpan="4" className="p-0 h-24 relative">
                    <textarea
                      {...register(`workExperience.0.responsibilities`)}
                      className="w-full h-full p-2 outline-none absolute inset-0 resize-none bg-transparent"
                    />
                  </td>
                </tr>
                <tr className="border-b border-black">
                  <td
                    colSpan="4"
                    className=" font-bold p-2 border-b border-black"
                  >
                    Reason for wanting to leave
                  </td>
                </tr>
                <tr>
                  <td colSpan="4" className="p-0 h-24 relative">
                    <textarea
                      {...register(`workExperience.0.reasonLeaving`)}
                      className="w-full h-full p-2 outline-none absolute inset-0 resize-none bg-transparent"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </FormSection>

      {/* Employment History */}
      <FormSection title="Employment History">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden mb-2">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan="2" className="border border-gray-300 p-2">
                  Name of Company
                </th>
                <th colSpan="2" className="border border-gray-300 p-2">
                  Period Worked
                </th>
                <th rowSpan="2" className="border border-gray-300 p-2">
                  Designation
                </th>
                <th rowSpan="2" className="border border-gray-300 p-2">
                  CTC Details
                </th>
                <th rowSpan="2" className="border border-gray-300 p-2">
                  Reporting Officer
                </th>
                <th
                  rowSpan="2"
                  className="border border-gray-300 p-2 w-[5%]"
                ></th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">From</th>
                <th className="border border-gray-300 p-2">To</th>
              </tr>
            </thead>
            <tbody>
              {historyFields.map((item, index) => (
                <tr key={item.id}>
                  <TableInput
                    register={register(`employmentHistory.${index}.employer`)}
                    error={errors.employmentHistory?.[index]?.employer}
                    required
                  />
                  <TableInput
                    register={register(`employmentHistory.${index}.fromDate`)}
                    type="date"
                    error={errors.employmentHistory?.[index]?.fromDate}
                    required
                  />
                  <TableInput
                    register={register(`employmentHistory.${index}.toDate`)}
                    type="date"
                    error={errors.employmentHistory?.[index]?.toDate}
                    required
                  />
                  <TableInput
                    register={register(
                      `employmentHistory.${index}.designation`
                    )}
                    error={errors.employmentHistory?.[index]?.designation}
                    required
                  />
                  <TableInput
                    register={register(`employmentHistory.${index}.ctc`)}
                    type="number"
                    error={errors.employmentHistory?.[index]?.ctc}
                  />
                  <TableInput
                    register={register(
                      `employmentHistory.${index}.reportingOfficer`
                    )}
                    error={errors.employmentHistory?.[index]?.reportingOfficer}
                  />
                  <td className="border border-gray-300 p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeHistory(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddButton
          onClick={() =>
            appendHistory({
              employer: "",
              fromDate: "",
              toDate: "",
              designation: "",
              ctc: "",
              reportingOfficer: "",
            })
          }
          label="Add History"
          disabled={historyFields.length >= 5}
        />
         {historyFields.length >= 5 && <p className="text-xs text-red-500 mt-1">Maximum 5 entries allowed.</p>}
      </FormSection>
    </>
  );
};

export default WorkExperience;
