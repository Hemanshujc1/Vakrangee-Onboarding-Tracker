import React from "react";
import { LinedTextArea } from "../../../Components/Forms/Shared/PrintComponents";

const SignificantAchievements = ({ data }) => {
  return (
    <div className="mb-8 relative break-inside-avoid">
      <h4 className="font-bold mb-4 uppercase text-sm">
        SIGNIFICANT ACHIEVEMENTS / OTHER COURSES / DIPLOMA COMPLETED: (Please
        mention Institute name / Year of completion / Duration)
      </h4>

      <LinedTextArea
        value={(data.educational_details || [])
          .filter((edu) => edu.achievements)
          .map((edu) => `${edu.degree}: ${edu.achievements}`)
          .join("\n")}
        minLines={8}
      />
    </div>
  );
};

export default SignificantAchievements;
