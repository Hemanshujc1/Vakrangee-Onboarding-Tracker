import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
        setError("Session expired or invalid access. Please go back.");
        return;
    }
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:3001/api/auth/verify-otp', { email, otp });
      // Navigate to Reset Password page, passing email and otp
      navigate('/reset-password', { state: { email, otp } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
              Invalid access. Please restart the process.
          </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify OTP</h1>
            <p className="text-gray-500">
                Enter the code sent to your terminal (Dev Mode).<br/>
                <span className="text-xs font-semibold text-blue-500 block mt-1">Check Backend Console</span>
            </p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">One-Time Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ShieldCheck size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                required
                maxLength={6}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none font-mono tracking-widest text-lg"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying...' : (
                <>
                    Verify OTP <ArrowRight size={18} />
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
