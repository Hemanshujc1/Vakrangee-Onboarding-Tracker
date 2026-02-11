import { React } from "../../../utils/formDependencies";

const GratuityEmployerCertificate = () => (
  <div className="mt-10 pt-6 border-t-2 border-dashed border-gray-400 page-break-inside-avoid">
    <h4 className="font-bold uppercase text-center mb-6">
      Certificate by the Employer
    </h4>
    <p>
      Certified that the particulars of the above nomination have been verified
      and recorded in this establishment.
    </p>
    <div className="flex text-sm gap-10 justify-around mt-10">
      <div className="flex flex-col items-start gap-8 w-[45%]">
        <div>
          <p>Employer's Reference No., if any ______________</p>
        </div>
        <div>
          <p>Date: _____________</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-8 w-[35%]">
        <div className="text-left">
          <p className="border-t border-gray-900">
            Signature of the employer/Officer authorised
          </p>
          <p>Designation</p>
        </div>
        <div className="text-left">
          <p className="border-t pt-1 border-gray-900">
            Name and address of the establishment or rubber stamp thereof.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default GratuityEmployerCertificate;
