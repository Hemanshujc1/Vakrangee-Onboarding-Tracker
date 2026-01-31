import React, { useState } from "react";
import DashboardLayout from "../../Components/Layout/DashboardLayout";
import {
  CheckCircle,
  Circle,
  CalendarDays,
  AlertTriangle,
  User,
  Mail,
  MessageSquare,
} from "lucide-react";

const checklistItems = [
  {
    id: 1,
    label: "Collect ID Card",
    dueDate: "2026-01-15",
    incharge: "Priya Sharma",
    email: "priya.sharma@company.com",
    teamsLink:
      "/",
  },
  {
    id: 2,
    label: "Collect Laptop",
    dueDate: "2026-01-16",
    incharge: "Rahul Mehta",
    email: "rahul.mehta@company.com",
    teamsLink:
      "/",
  },
  {
    id: 3,
    label: "Register Biometric",
    dueDate: "2026-01-18",
    incharge: "Neha Verma",
    email: "neha.verma@company.com",
    teamsLink: "/",
  },
  {
    id: 4,
    label: "Receive Company Email ID",
    dueDate: "2026-01-20",
    incharge: "Amit Singh",
    email: "amit.singh@company.com",
    teamsLink:
      "/",
  },
];

const CheckList = () => {
  const [checkedItems, setCheckedItems] = useState([]);

  const toggleCheck = (id) => {
    setCheckedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const progress = Math.round(
    (checkedItems.length / checklistItems.length) * 100
  );

  const today = new Date();

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 m-0 ">
        <h1 className="text-5xl underline underline-offset-auto text-center font-bold mb-6">
          Onboarding Checklist
        </h1>

        <div className="bg-white shadow-lg rounded-xl p-6 max-w-2xl flex flex-col align-middle justify-center m-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <ul className="space-y-4">
            {checklistItems.map((item) => {
              const isChecked = checkedItems.includes(item.id);
              const due = new Date(item.dueDate);
              const isOverdue = !isChecked && due < today;

              return (
                <li
                  key={item.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition
                    ${
                      isOverdue
                        ? "border-red-300 bg-red-50"
                        : "hover:bg-gray-50"
                    }
                  `}
                >
                  {/* Tick */}
                  <button onClick={() => toggleCheck(item.id)}>
                    {isChecked ? (
                      <CheckCircle className="text-green-600 w-6 h-6" />
                    ) : (
                      <Circle className="text-gray-400 w-6 h-6" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isChecked
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {item.label}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                      {/* Due */}
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        Due: {item.dueDate}
                      </span>

                      {/* In-charge */}
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {item.incharge}
                      </span>

                      {/* Email */}
                      <a
                        href={`mailto:${item.email}`}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </a>

                      {/* Teams */}
                      {item.teamsLink && (
                        <a
                          href={item.teamsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-purple-600 hover:underline"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Teams
                        </a>
                      )}

                      {/* Overdue */}
                      {isOverdue && (
                        <span className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-4 h-4" />
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {progress === 100 && (
            <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-lg text-center font-semibold">
              🎉 All onboarding tasks completed!
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CheckList;
