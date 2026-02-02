import React from 'react';

const SignatureUpload = ({ 
  setValue, 
  error, 
  preview, 
  setPreview, 
  isSaved,
  fieldName = "signature"
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded border border-gray-200 print:hidden">
      <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">
        Signature
      </h3>
      <div className="flex flex-col gap-4">

        
        <div className="flex items-center gap-4">
          <input
            id="signature-upload"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files[0];
              setValue(fieldName, file, { shouldValidate: true });
              if (file && setPreview) {
                const objectUrl = URL.createObjectURL(file);
                setPreview(objectUrl);
              }
            }}
            className="text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
          />
          <div className="text-xs text-gray-500">Max size: 200KB.</div>
        </div>
      </div>

      {isSaved && (
        <div className="text-green-600 text-xs mt-2 font-medium flex items-center gap-1">
          <span className="text-base">✓</span> Signature already uploaded
        </div>
      )}
      

      
      {error && (
        <div className="text-red-500 text-xs mt-2">
          {error.message}
        </div>
      )}

    </div>
  );
};

export default SignatureUpload;
