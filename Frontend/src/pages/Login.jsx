import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import axios from "axios";

import { useAlert } from "../context/AlertContext";

const Login = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup specific states
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (activeTab === "signup") {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        await axios.post("/api/auth/register", {
          username: email,
          password: password,
          fullName: fullName,
          role: "EMPLOYEE",
        });

        await showAlert("Account created successfully! Please log in.", { type: 'success' });
        setActiveTab("login");
      } else {
        const response = await axios.post("/api/auth/login", {
          username: email,
          password: password,
        });

        const { token, user } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        if (user.role === "HR_SUPER_ADMIN") {
          navigate("/hr-super-admin");
        } else if (user.role === "HR_ADMIN") {
          navigate("/hr-admin");
        } else {
          navigate("/employee");
        }
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full bg-white font-sans min-h-screen lg:h-screen lg:overflow-hidden">
      {/* Left Side - Image (Desktop Only) */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-950 text-white flex-col justify-between p-16 h-full isolate">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Office Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/90"></div>
        </div>
        
        <div className="flex flex-col justify-center items-center align-middle text-center gap-15 relative z-10 h-full">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <img
                src={`${import.meta.env.BASE_URL}vakrangee Logo.svg`}
                alt="Vakrangee Logo"
                className="h-30 w-100 object-contain brightness"
              />
            </div>
          </div>

          <div>
            <h1 className="text-5xl font-bold mb-4 leading-tight tracking-tight">
              Onboarding Simplified.
            </h1>
            <p className="text-lg max-w-md leading-relaxed font-bold opacity-90">
              Experience a seamless welcome journey with Vakrangee. From
              documentation to team integration, we've got you covered.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 py-12 lg:p-16 bg-white relative lg:overflow-y-auto lg:h-full">
        <div className="w-full max-w-md lg:max-w-105 space-y-8">
          
          {/* Mobile Logo */}
          <div className="flex justify-center mb-6 lg:hidden">
             <img
               src={`${import.meta.env.BASE_URL}vakrangee Logo.svg`}
                alt="Vakrangee Logo"
                className="h-16 w-auto object-contain"
              />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold text-(--color-text-dark) mb-3 tracking-tight">
              {activeTab === "login" ? "Welcome Back" : "Get Started"}
            </h2>
            <p className="text-gray-500 text-base lg:text-lg">
              {activeTab === "login"
                ? "Please enter your details to sign in."
                : "Create your account to continue."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium text-center border border-red-100 mb-4">
              {error}
            </div>
          )}

          <div className="flex bg-gray-50 p-1.5 rounded-lg mb-8">
            <button
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "login"
                  ? "bg-white text-(--color-secondary) shadow-sm ring-1 ring-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("login");
                setError("");
              }}
            >
              Log In
            </button>
            <button
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "signup"
                  ? "bg-white text-(--color-secondary) shadow-sm ring-1 ring-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => {
                setActiveTab("signup");
                setError("");
              }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {activeTab === "signup" && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-blue-50 focus:ring-1 focus:ring-blue-200 transition-all font-medium text-gray-800 placeholder:text-gray-400"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-blue-50 focus:ring-1 focus:ring-blue-200 transition-all font-medium text-gray-800 placeholder:text-gray-400"
                placeholder="emp@vakrangee.in"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-blue-50 focus:ring-1 focus:ring-blue-200 transition-all font-medium text-gray-800 placeholder:text-gray-400 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              {activeTab === "login" && (
                <div className="flex justify-end mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}
            </div>

            {activeTab === "signup" && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-blue-50 focus:ring-1 focus:ring-blue-200 transition-all font-medium text-gray-800 placeholder:text-gray-400"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 bg-white border border-gray-200 text-gray-800 rounded-xl font-bold text-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading
                ? "Processing..."
                : activeTab === "login"
                ? "Sign In"
                : "Sign Up"}{" "}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
