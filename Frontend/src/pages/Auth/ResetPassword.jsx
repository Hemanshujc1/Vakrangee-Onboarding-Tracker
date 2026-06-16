import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Check, Eye, EyeOff } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import { commonSchemas } from '../../utils/validations';
import * as Yup from 'yup';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();

  // Two modes: firstLogin (authenticated) vs forgot-password (OTP-based)
  const firstLogin = location.state?.firstLogin === true;
  const { email, otp } = location.state || {};

  // Guard: if not first-login mode and missing email/otp, block access
  if (!firstLogin && (!email || !otp)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        Invalid access. Please restart the process.
      </div>
    );
  }

  const validatePassword = async (value) => {
    try {
      await commonSchemas.password.validate(value);
      setPasswordError('');
      return true;
    } catch (err) {
      setPasswordError(err.message);
      return false;
    }
  };

  const validateConfirm = async (value, pw = newPassword) => {
    try {
      await Yup.string()
        .oneOf([pw], 'Passwords do not match')
        .required('Required')
        .validate(value);
      setConfirmError('');
      return true;
    } catch (err) {
      setConfirmError(err.message);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const [pwOk, confirmOk] = await Promise.all([
      validatePassword(newPassword),
      validateConfirm(confirmPassword),
    ]);
    if (!pwOk || !confirmOk) return;

    setLoading(true);
    setError('');

    try {
      if (firstLogin) {
        // Authenticated endpoint — token already in localStorage
        const token = localStorage.getItem('token');
        await axios.post(
          '/api/auth/change-password',
          { newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await showAlert('Password set successfully! Please log in with your new password.', { type: 'success' });

        // Clear session and force re-login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        await axios.post('/api/auth/reset-password', { email, otp, newPassword });
        await showAlert('Password reset successfully! Please login with your new password.', { type: 'success' });
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {firstLogin ? 'Set Your Password' : 'Reset Password'}
          </h1>
          <p className="text-gray-500 text-sm">
            {firstLogin
              ? 'This is your first login. Please set a new password to continue.'
              : 'Set a new password for your account.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showNew ? 'text' : 'password'}
                required
                className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-xl focus:ring-2 transition-all outline-none ${
                  passwordError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordError) validatePassword(e.target.value);
                  if (confirmPassword) validateConfirm(confirmPassword, e.target.value);
                }}
                onBlur={(e) => validatePassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
                <span>⚠</span> {passwordError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-xl focus:ring-2 transition-all outline-none ${
                  confirmError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmError) validateConfirm(e.target.value);
                }}
                onBlur={(e) => validateConfirm(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {confirmError && (
              <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
                <span>⚠</span> {confirmError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : (
              <>
                {firstLogin ? 'Set Password' : 'Reset Password'} <Check size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
