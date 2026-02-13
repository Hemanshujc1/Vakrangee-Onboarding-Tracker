import React from "react";
import { InstructionBlock, SignatureUpload, FormActions } from "./Shared";

const FormLayout = ({
  title,
  children,
  employeeData,
  showPhoto = false,
  showSignature = true,
  signaturePreview,
  isLocked = false,
  onSubmit,
  actions,
  signature,
}) => {
  const { profilePhoto, signature: dataSignature } = employeeData || {};

  const photoUrl = profilePhoto ? `/uploads/profilepic/${profilePhoto}` : null;
  const signatureUrl = signaturePreview
    ? signaturePreview
    : dataSignature
    ? `/uploads/signatures/${dataSignature}`
    : null;

  return (
    <div className="max-w-4xl mx-auto bg-white 
                    p-4 sm:p-6 md:p-8 lg:p-10 
                    shadow-lg my-4 sm:my-6 md:my-8 
                    rounded-lg">

      {/* Header */}
      <div className="flex flex-col sm:flex-row 
                      sm:justify-between sm:items-start 
                      gap-4 mb-6 md:mb-8 border-b pb-4 md:pb-6">

        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl 
                         font-bold text-gray-800 
                         uppercase tracking-wide leading-snug">
            {title}
          </h1>
          <p className="text-gray-500 
                        text-xs sm:text-sm mt-1">
            Vakrangee Limited - Employee Onboarding
          </p>
        </div>

        {showPhoto && (
          photoUrl ? (
            <div className="w-20 sm:w-24 h-28 sm:h-32 
                            bg-gray-100 border 
                            flex items-center justify-center 
                            overflow-hidden rounded">
              <img
                src={photoUrl}
                alt="Employee"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 sm:w-24 h-28 sm:h-32 
                            bg-gray-50 border 
                            flex items-center justify-center 
                            text-[10px] sm:text-xs 
                            text-center text-gray-400 p-2 rounded">
              Photo Not Available
            </div>
          )
        )}
      </div>

      {/* Locked Message */}
      {isLocked && <InstructionBlock>Form Locked.</InstructionBlock>}

      {/* Form Content */}
      {onSubmit ? (
        <form
          onSubmit={onSubmit}
          className="space-y-6 md:space-y-8 
                     font-serif text-xs sm:text-sm md:text-base overflow-x-auto"
        >
          <fieldset
            disabled={isLocked}
            className="space-y-6 md:space-y-8 disabled:opacity-75"
          >
            <div className="min-h-75">{children}</div>

            {/* Signature Display */}
            {showSignature && signatureUrl && (
              <div className="mt-6 md:mt-8 flex justify-end">
                <div className="text-center">
                  <img
                    src={signatureUrl}
                    alt="Signature"
                    className="h-8 sm:h-10 w-auto object-contain mb-2 mx-auto"
                  />
                  <p className="border-t border-gray-400 
                                w-36 sm:w-48 pt-2 
                                font-semibold text-gray-700 
                                text-xs sm:text-sm">
                    Employee Signature
                  </p>
                </div>
              </div>
            )}

            {/* Signature Upload */}
            {showSignature && signature && <SignatureUpload {...signature} />}

            {/* Read-only Signature */}
            {showSignature && !signature && (
              <div className="mt-8 md:mt-12 pt-6 md:pt-8 
                              border-t flex justify-end">
                <div className="text-center">
                  {signatureUrl ? (
                    <div className="mb-2 flex items-center justify-center">
                      <img
                        src={signatureUrl}
                        alt="Signature"
                        className="h-8 sm:h-10 w-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-36 sm:w-48 h-14 sm:h-16 
                                    mb-2 bg-gray-50 border 
                                    border-dashed border-gray-300 
                                    flex items-center justify-center 
                                    text-gray-400 text-xs sm:text-sm rounded">
                      Signature Pending
                    </div>
                  )}
                  <p className="border-t border-gray-400 
                                w-36 sm:w-48 pt-2 
                                font-semibold text-gray-700 
                                text-xs sm:text-sm">
                    Employee Signature
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            {actions && <FormActions {...actions} />}
          </fieldset>
        </form>
      ) : (
        <div className="min-h-75 text-xs sm:text-sm md:text-base">
          {children}

          {showSignature && (
            <div className="mt-8 md:mt-12 pt-6 md:pt-8 
                            border-t flex justify-end">
              <div className="text-center">
                {signatureUrl ? (
                  <div className="mb-2 flex items-center justify-center">
                    <img
                      src={signatureUrl}
                      alt="Signature"
                      className="h-8 sm:h-10 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-36 sm:w-48 h-14 sm:h-16 
                                  mb-2 bg-gray-50 border 
                                  border-dashed border-gray-300 
                                  flex items-center justify-center 
                                  text-gray-400 text-xs sm:text-sm rounded">
                    Signature Pending
                  </div>
                )}
                <p className="border-t border-gray-400 
                              w-36 sm:w-48 pt-2 
                              font-semibold text-gray-700 
                              text-xs sm:text-sm">
                  Employee Signature
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormLayout;
