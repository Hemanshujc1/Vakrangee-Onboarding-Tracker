import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center my-2 px-6 py-12 lg:px-8">
        <div className="flex justify-center mb-6">
          <div className="p-4">
            <img
              src={`${import.meta.env.BASE_URL}vakrangee-logo.svg`}
              alt="Vakrangee Logo"
              className="h-24 w-auto mb-1"
            />
          </div>
        </div>
      <div className="text-center">
        <div className="flex justify-center mb-6 animate-spin">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertTriangle className="h-12 w-16 text-red-600" />
          </div>
        </div>

        <p className="text-base font-semibold text-red-600 animate-ping">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl animate-pulse">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-gray-600 max-w-md mx-auto animate-bounce">
          Sorry, we couldn't find the page you're looking for. It might have
          been moved, or deleted.
        </p>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/login"
            className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black flex items-center gap-2 transition-all animate-bounce"
          >
            <ArrowLeft size={16} />
            Go back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
