import { useState } from "react";
import axios from "axios";
import { Mail, Lock, Key, ArrowLeft, GraduationCap, Send, ShieldCheck } from 'lucide-react';

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: request, 2: verify
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sendOtp = async () => {
    if (!email) return alert("Enter email");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
      alert("OTP sent to email");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const verifyAndReset = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
        email, otp, password, confirmPassword
      });
      alert(res.data.message);
      setStep(1);
      setEmail(""); setOtp(""); setPassword(""); setConfirmPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* High-Quality Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=2400&q=95&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.7) contrast(1.1) saturate(1.1)'
        }}
      />
      
      {/* Gradient Overlay with Warm Amber/Orange Tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/60 via-orange-800/50 to-rose-900/60 z-10" />
      
      {/* Animated Orbs */}
      <div className="absolute top-20 left-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse z-10" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse z-10" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-orange-400/15 rounded-full blur-3xl animate-pulse z-10" style={{ animationDelay: '3s' }} />

      {/* Main Container */}
      <div className="relative z-20 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
            {step === 1 ? "Reset Password" : "Verify & Update"}
          </h1>
          <p className="text-orange-100 text-sm drop-shadow-md">
            {step === 1 ? "Enter your email to receive a secure OTP code" : "Verify your OTP and create a new password"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 transform transition-all duration-500 hover:shadow-orange-500/20">
          <div className="space-y-6">
            {/* Email Input (Always visible) */}
            <div className="relative group">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-600 group-focus-within:text-orange-600 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={step === 2}
                  className="block w-full pl-12 pr-4 py-3.5 bg-amber-50/70 border-2 border-amber-200 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-300 placeholder-gray-400 text-gray-800 font-medium"
                />
              </div>
            </div>

            {step === 1 ? (
              // Step 1: Send OTP Button
              <button
                onClick={sendOtp}
                className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold hover:from-amber-600 hover:via-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Send OTP Code</span>
              </button>
            ) : (
              // Step 2: OTP Verification and Password Reset
              <>
                {/* OTP Input */}
                <div className="relative group">
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                    OTP Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-600 group-focus-within:text-orange-600 transition-colors">
                      <Key className="h-5 w-5" />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      className="block w-full pl-12 pr-4 py-3.5 bg-amber-50/70 border-2 border-amber-200 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 outline-none placeholder-gray-400 text-gray-800 font-mono text-lg tracking-widest"
                    />
                  </div>
                </div>

                {/* New Password Input */}
                <div className="relative group">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-600 group-focus-within:text-orange-600 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Create new password"
                      className="block w-full pl-12 pr-4 py-3.5 bg-amber-50/70 border-2 border-amber-200 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 outline-none placeholder-gray-400 text-gray-800"
                    />
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="relative group">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-600 group-focus-within:text-orange-600 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="block w-full pl-12 pr-4 py-3.5 bg-amber-50/70 border-2 border-amber-200 rounded-xl focus:ring-4 focus:ring-orange-500/30 focus:border-orange-500 transition-all duration-300 outline-none placeholder-gray-400 text-gray-800"
                    />
                  </div>
                </div>

                {/* Reset Password Button */}
                <button
                  onClick={verifyAndReset}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold hover:from-amber-600 hover:via-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Reset Password
                </button>

                {/* Back Button */}
                <button
                  onClick={() => setStep(1)}
                  className="w-full flex items-center justify-center text-orange-600 hover:text-orange-700 transition-colors font-semibold py-2 rounded-lg hover:bg-amber-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Send OTP
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-orange-100 drop-shadow-md">
            Remember your password?{' '}
            <a href="/" className="text-white font-bold hover:text-amber-200 transition-colors hover:underline">
              Sign In Here
            </a>
          </p>
        </div>

        {/* Branding */}
        <div className="text-center mt-6">
          <p className="text-white text-sm font-medium drop-shadow-lg flex items-center justify-center space-x-2">
            <GraduationCap className="w-4 h-4" />
            <span>Secured by EduFlow</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;