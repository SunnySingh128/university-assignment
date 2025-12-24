import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, GraduationCap, Loader2 } from 'lucide-react';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all the fields");
      return;
    }

    setLoading(true);

    try {
      // Your actual API call - uncomment and use this:
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });
      
      localStorage.setItem("token", res.data.token);
      const userRole = res.data.role;
      
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "student") {
        navigate("/student", {
          state: { email, password }
        });
      } else if (userRole === "professor") {
        navigate("/professor", { state: { email } });
      } else if (userRole === "hod") {
        navigate("/hod", { state: { email } });
      } else {
        alert("Unknown role. Please contact support.");
      }

      // Demo only:
      setTimeout(() => {
        alert("Connect to your backend - all role navigation is preserved");
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
      setLoading(false);
    }
  };

  const forgotpassword = () => {
    setIsAnimating(true);
    setTimeout(() => {
      // navigate('/forgotpassword');
      alert("Navigate to forgot password");
    }, 500);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Crystal Clear Background Image - University Library */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2400&auto=format&fit=crop"
          alt="University library background"
          className="w-full h-full object-cover brightness-[0.85]"
        />
        {/* Minimal overlay - let the image shine through */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-slate-900/50 to-blue-900/40" />
      </div>

      {/* Very subtle decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-5 opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/20 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Login Card - Warm, Library-inspired Design */}
      <div className={`relative w-full max-w-md transition-all duration-500 ease-out ${isAnimating ? 'scale-95 opacity-0 translate-y-10' : 'scale-100 opacity-100 translate-y-0'}`}>
        <div className="bg-gradient-to-br from-amber-50/98 via-white/98 to-orange-50/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200/60 p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 rounded-3xl shadow-xl mb-6">
              <GraduationCap className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-900 via-orange-900 to-amber-800 bg-clip-text text-transparent mb-3">Welcome Back</h1>
            <p className="text-gray-700 text-lg font-medium">Sign in to your EduFlow account</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-700" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/90 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-400/40 focus:border-amber-500 transition-all duration-300 placeholder-gray-500 text-gray-900"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-700" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 bg-white/90 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-400/40 focus:border-amber-500 transition-all duration-300 placeholder-gray-500 text-gray-900"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-700 hover:text-amber-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-amber-700 rounded focus:ring-amber-600 border-amber-300" />
                <span className="ml-2 text-sm text-gray-800 font-medium">Remember me</span>
              </label>
              <button
                type="button"
                onClick={forgotpassword}
                className="text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button - Warm library colors */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-2xl hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-700 font-medium">
              By signing in, you agree to our{' '}
              <button className="font-bold text-amber-700 hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button className="font-bold text-amber-700 hover:underline">Privacy Policy</button>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-white text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-bold tracking-wide">
          Powered by <span className="text-amber-300">EduFlow</span>
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 20s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

export default Login;