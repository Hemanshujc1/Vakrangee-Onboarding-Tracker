import React from "react";

const Declaration = ({ data, record }) => {
  return (
    <div className="mt-8 border-t-2 border-gray-800 pt-4 break-inside-avoid">
      <p className="font-bold mb-4 text-justify">
        I have no objection, the Management of Vakrangee Ltd. to verify the
        information such as personal details, contact details, education
        details, criminal verification and previous employment details wherever
        applicable prior to my appointment. If the information given to you is
        not found correct as per my declaration, then the company can take
        disciplinary action against me.
      </p>

      <div className="flex justify-end mt-16">
        <div className="text-center">
          {(data.signature_path ||
            record.signature_path ||
            record.signature) && (
            <img
              src={`/uploads/signatures/${
                data.signature_path || record.signature_path || record.signature
              }`}
              alt="Signature"
              className="h-12 mx-auto mb-2"
            />
          )}
          <span className="border-t border-black px-8 pt-1 font-bold">
            Signature of the candidate
          </span>
        </div>
      </div>
    </div>
  );
};

export default Declaration;
