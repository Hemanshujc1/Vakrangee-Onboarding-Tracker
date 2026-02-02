import React from 'react';
import { InstructionBlock, SignatureUpload, FormActions } from "./Shared";

const  FormLayout = ({ 
    title, 
    children, 
    employeeData, 
    showPhoto = false, 
    showSignature = true, 
    signaturePreview,
    isLocked = false,
    onSubmit,
    actions,
    signature
}) => {
  const { profilePhoto, signature: dataSignature } = employeeData || {};
  
  const photoUrl = profilePhoto 
    ? `http://localhost:3001/uploads/profilepic/${profilePhoto}`
    : null;

  // Use preview if available, otherwise fallback to server url
  const signatureUrl = signaturePreview 
    ? signaturePreview
    : dataSignature
      ? `http://localhost:3001/uploads/signatures/${dataSignature}`
      : null;

  return (
    <div className="max-w-4xl mx-auto bg-white p-10 shadow-lg my-8 print:shadow-none print:my-0 print:w-full print:max-w-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">{title}</h1>
                <p className="text-gray-500 text-sm mt-1">Vakrangee Limited - Employee Onboarding</p>
            </div>
            {showPhoto && photoUrl ? (
                <div className="w-24 h-32 bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                    <img src={photoUrl} alt="Employee" className="w-full h-full object-cover" />
                </div>
            ) : showPhoto ? (
                <div className="w-24 h-32 bg-gray-50 border border-gray-200 flex items-center justify-center text-xs text-center text-gray-400 p-2">
                    Photo Not Available
                </div>
            ) : null}
        </div>

        {/* Locked Message */}
        {isLocked && <InstructionBlock>Form Locked.</InstructionBlock>}

        {/* Form Content */}
        {onSubmit ? (
            <form onSubmit={onSubmit} className="space-y-8 font-serif text-sm">
                <fieldset disabled={isLocked} className="space-y-8 disabled:opacity-75">
                    <div className="min-h-125">
                        {children}
                    </div>

                    {/* Footer Signature Display in Edit Mode */}
                    {showSignature && signatureUrl && (
                        <div className="mt-8 flex justify-end">
                            <div className="text-center">
                                <img src={signatureUrl} alt="Signature" className="h-10 w-auto object-contain mb-2 mx-auto" />
                                <p className="border-t border-gray-400 w-48 pt-2 font-semibold text-gray-700">Employee Signature</p>
                            </div>
                        </div>
                    )}

                    {/* Footer Signature Upload */}
                    {showSignature && signature && (
                       <SignatureUpload {...signature} />
                    )}
                    
                    {/* Read-only Signature view  */}
                    {showSignature && !signature && (
                        <div className="mt-12 pt-8 border-t flex justify-end">
                            <div className="text-center">
                                {signatureUrl ? (
                                    <div className="mb-2 flex items-center justify-center">
                                        <img src={signatureUrl} alt="Signature" className="h-10 w-auto object-contain" />
                                    </div>
                                ) : (
                                    <div className="w-48 h-16 mb-2 bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                                        Signature Pending
                                    </div>
                                )}
                                <p className="border-t border-gray-400 w-48 pt-2 font-semibold text-gray-700">Employee Signature</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {actions && <FormActions {...actions} />}
                </fieldset>
            </form>
        ) : (
            <div className="min-h-125">
                {children}
                {/* Footer Signature  */}
                {showSignature && (
                    <div className="mt-12 pt-8 border-t flex justify-end">
                        <div className="text-center">
                            {signatureUrl ? (
                                <div className="mb-2 flex items-center justify-center">
                                    <img src={signatureUrl} alt="Signature" className="h-10 w-auto object-contain" />
                                </div>
                            ) : (
                                <div className="w-48 h-16 mb-2 bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                                    Signature Pending
                                </div>
                            )}
                            <p className="border-t border-gray-400 w-48 pt-2 font-semibold text-gray-700">Employee Signature</p>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default FormLayout;
