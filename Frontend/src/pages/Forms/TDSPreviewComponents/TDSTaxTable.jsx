import React from "react";

const TDSTaxTable = ({ formData }) => {
  return (
    <div className="mt-0 overflow-x-auto [&::-webkit-scrollbar]:hidden print:overflow-visible w-full">
      <table className="w-full min-w-150 mt-6 border border-black table-fixed text-center text-sm border-collapse print:w-full print:min-w-0">
        <thead>
          <tr className="bg-gray-100">
            <th className="w-[10%] border border-black p-2">SR NO</th>
            <th className="w-[70%] border border-black p-2 text-left pl-4">
              PARTICULARS
            </th>
            <th className="w-[20%] border border-black p-2">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-1">1</td>
            <td className="border border-black p-1 text-left pl-4">
              Education Loan (Year in which loan taken -{" "}
              {formData.education_loan_start_year})
            </td>
            <td className="border border-black p-1">
              {formData.education_loan_amt}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">a)</td>
            <td className="border border-black p-1 text-left pl-4">
              Interest Payable on Educational Loan (From April to March{" "}
              {formData.financial_year})
            </td>
            <td className="border border-black p-1">
              {formData.education_interest}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">2</td>
            <td className="border border-black p-1 text-left pl-4 font-bold">
              Housing Loan Details
            </td>
            <td className="border border-black p-1"></td>
          </tr>
          <tr>
            <td className="border border-black p-1">a)</td>
            <td className="border border-black p-1 text-left pl-4">
              Principal Amount payable (April to March {formData.financial_year}
              )
            </td>
            <td className="border border-black p-1">
              {formData.housing_loan_principal}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">b)</td>
            <td className="border border-black p-1 text-left pl-4">
              Interest Amount payable (April to March {formData.financial_year})
            </td>
            <td className="border border-black p-1">
              {formData.housing_loan_interest}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">3</td>
            <td className="border border-black p-1 text-left pl-4">
              Contribution to National Pension Scheme
            </td>
            <td className="border border-black p-1">
              {formData.nps_contribution}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">4</td>
            <td className="border border-black p-1 text-left pl-4">
              HRA (Rent Per Month Rs.{formData.hra_rent_per_month} X No. of
              Months {formData.hra_months})
            </td>
            <td className="border border-black p-1">
              {formData.hra_rent_per_month && formData.hra_months
                ? Number(formData.hra_rent_per_month) *
                  Number(formData.hra_months)
                : ""}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1"></td>
            <td className="border border-black p-1 text-left pl-4">
              Related:
              <span className="font-bold ml-2">
                YES {formData.hra_is_related_landlord === "yes" ? "✓" : ""}
              </span>{" "}
              /
              <span className="font-bold ml-1">
                NO {formData.hra_is_related_landlord === "no" ? "✓" : ""}
              </span>
            </td>
            <td className="border border-black p-1"></td>
          </tr>
          <tr>
            <td className="border-r border-black p-1"></td>
            <td className="p-1 text-left pl-4">
              Relationship with the landlord (If YES):{" "}
              <span className="font-bold uppercase">
                {formData.hra_landlord_relationship}
              </span>
              <br />
              <span className="text-xs italic text-gray-600">
                In case of Parents, Registered Agreement with parent is
                compulsory, as per recent ITAT Judgement
              </span>
            </td>
            <td className="border border-black p-1"></td>
          </tr>
          <tr>
            <td className="border border-black p-1">5</td>
            <td className="border border-black p-1 text-left pl-4">
              Contribution to Medical Insurance Premium
            </td>
            <td className="border border-black p-1">
              {formData.medical_total_contribution}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">a)</td>
            <td className="border border-black p-1 text-left pl-4">
              For Self &amp; Family (Eq. Self, Wife &amp; Kids)
            </td>
            <td className="border border-black p-1">
              {formData.medical_self_family}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">b)</td>
            <td className="border border-black p-1 text-left pl-4">
              For Parents
            </td>
            <td className="border border-black p-1">
              {formData.medical_parents}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">c)</td>
            <td className="border border-black p-1 text-left pl-4">
              For Senior Citizen Parents
            </td>
            <td className="border border-black p-1">
              {formData.medical_senior_parents}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">6</td>
            <td className="border border-black p-1 text-left pl-4">
              Life Insurance Premium
            </td>
            <td className="border border-black p-1">
              {formData.life_insurance_premium}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">7</td>
            <td className="border border-black p-1 text-left pl-4">
              Contribution to Sukanya Samridhi Yojana (Post Office)
            </td>
            <td className="border border-black p-1">
              {formData.ssy_contribution}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">8</td>
            <td className="border border-black p-1 text-left pl-4">
              Contribution to Public Provident Fund
            </td>
            <td className="border border-black p-1">
              {formData.ppf_contribution}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">9</td>
            <td className="border border-black p-1 text-left pl-4">
              Subscription to N.S.C.
            </td>
            <td className="border border-black p-1">
              {formData.nsc_subscription}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">10</td>
            <td className="border border-black p-1 text-left pl-4">
              Subscription to United Link Insurance Plan
            </td>
            <td className="border border-black p-1">
              {formData.united_link_subsciption}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">11</td>
            <td className="border border-black p-1 text-left pl-4">
              Subscription to IDBI / ICICI Bonds
            </td>
            <td className="border border-black p-1">{formData.banks_bonds}</td>
          </tr>
          <tr>
            <td className="border border-black p-1">12</td>
            <td className="border border-black p-1 text-left pl-4">
              Fixed Deposit in the scheduled bank (More than 5 years)
            </td>
            <td className="border border-black p-1">{formData.fd_bank}</td>
          </tr>
          <tr>
            <td className="border border-black p-1">13</td>
            <td className="border border-black p-1 text-left pl-4">
              Tuition Fees paid for children’s Education
            </td>
            <td className="border border-black p-1">
              {formData.children_tuition_fees}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">14</td>
            <td className="border border-black p-1 text-left pl-4">
              Investments in the Mutual Fund ELSS
            </td>
            <td className="border border-black p-1">
              {formData.mf_investment}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">15</td>
            <td className="border border-black p-1 text-left pl-4">
              Any other allowable investment (Mention Details)
              <br />
              {formData.other_investment_details && (
                <span className="font-semibold">
                  {formData.other_investment_details}
                </span>
              )}
            </td>
            <td className="border border-black p-1">
              {formData.other_investment_amt}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TDSTaxTable;
