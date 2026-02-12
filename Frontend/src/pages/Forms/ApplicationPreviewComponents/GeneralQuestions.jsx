import React from "react";
import { LinedTextArea } from "../../../Components/Forms/Shared/PrintComponents";

const GeneralQuestions = ({ formData }) => {
  return (
    <>
      <div className="mb-6">
        <div className="font-bold mb-2">
          a) What are your career objectives & personal goals? Ideally, how
          would you like to see them develop over the next 5 Years.
        </div>
        <LinedTextArea value={formData.careerObjectives} minLines={4} />
      </div>

      <div className="mb-6">
        <div className="font-bold mb-2">b) Major achievements...</div>
        <LinedTextArea value={formData.majorAchievements} minLines={3} />
      </div>

      <div className="mb-6">
        <div className="font-bold mb-2">
          c) Physical or mental disability, if any...
        </div>
        <LinedTextArea value={formData.disability} minLines={2} />
      </div>

      <div className="mb-6">
        <div className="font-bold mb-2">
          d) Have you been interviewed in this organization before? If yes,
          Please give details.
        </div>
        <LinedTextArea value={formData.interviewedBefore} minLines={2} />
      </div>

      <div className="mb-6">
        <div className="font-bold mb-2">e) List your hobbies?</div>
        <LinedTextArea value={formData.hobbies} minLines={2} />
      </div>

      <div className="mb-6">
        <div className="font-bold mb-2">
          f) Have you been convicted for any offence? If yes, please give
          details.
        </div>
        <LinedTextArea value={formData.conviction} minLines={2} />
      </div>
    </>
  );
};

export default GeneralQuestions;
