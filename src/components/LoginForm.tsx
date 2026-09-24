// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LoginForm: React.FC = () => {
    const { authenticate, isLoading, apiError } = useAuth();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        await authenticate(true, { email, password });
    };

    return (
        <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
            
            {/* API Error Message  */}
            {apiError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 animate-fadeIn">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{apiError}</span>
                </div>
            )}

            {/* Email Field */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address *</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500" />
                    </div>
                    <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                        placeholder="you@example.com"
                    />
                </div>
            </div>

            {/* Password Field */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password *</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500" />
                    </div>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2.5 border border-slate-700 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                        placeholder="••••••••"
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
                <button type="button" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none">
                    Forgot your password?
                </button>
            </div>

            {/* Submit Button */}
            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Signing In...
                    </>
                ) : (
                    <>
                        Sign In
                        <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </button>
        </form>
    );
};

export default LoginForm;