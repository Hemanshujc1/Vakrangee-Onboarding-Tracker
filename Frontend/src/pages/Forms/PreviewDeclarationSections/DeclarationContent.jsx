import React from "react";

const DeclarationContent = ({ formData }) => {
  return (
    <div className="font-serif text-gray-900 space-y-10 leading-loose text-base text-justify mt-8">
      <p>
        I, the undersigned{" "}
        <span className="font-semibold border-b border-gray-800 px-2 uppercase">
          {formData.title} {formData.employee_full_name}
        </span>{" "}
        hereby declare that I have resigned from my previous employment i.e.
        Company Name:{" "}
        {formData.previous_company_name ? (
          <span className="font-semibold border-b border-gray-800 px-2 uppercase">
            {formData.previous_company_name}
          </span>
        ) : (
          <span>________</span>
        )}
        Designation:{" "}
        {formData.previous_job_title ? (
          <span className="font-semibold border-b border-gray-800 px-2 uppercase">
            {formData.previous_job_title}
          </span>
        ) : (
          <span>________</span>
        )}{" "}
        and completed all full and final processes before joining Vakrangee
        Limited.
      </p>

      <p>
        I say that I do not have any outstanding dues or pending assignments of
        whatsoever nature in my previous employment.
      </p>

      <p>
        I say that I take complete responsibility for any issue / liability
        arising out of my previous employment and Vakrangee Limited, shall not
        have any responsibility whatsoever in such matters.
      </p>
    </div>
  );
};

export default DeclarationContent;
