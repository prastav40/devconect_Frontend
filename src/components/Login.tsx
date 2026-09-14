import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Calendar, Users, Code, ChevronDown, AlertCircle, UploadCloud, X } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { addUser } from '../utils/userslice';

const Login: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // State to catch and display backend errors (e.g., Wrong password)
    const [apiError, setApiError] = useState<string>('');

    // Core Form states
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    // Signup specific states matching the Mongoose Schema
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [skillsString, setSkillsString] = useState<string>('');
    const [isGenderOpen, setIsGenderOpen] = useState<boolean>(false);

    const [passwordError, setPasswordError] = useState<string>('');

    // Real-time password validation checks
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+]/.test(password);
    const isPasswordValid = hasLength && hasUpper && hasNumber && hasSpecial;

    // Real-time validation checks
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError(''); // Clear any previous errors on new submission

        if (!isEmailValid) {
            alert("Please enter a valid email address.");
            return;
        }

        try {
            if (!isLogin) {
                if (!isPasswordValid) {
                    alert("Please complete all password requirements.");
                    return;
                }

                const parsedAge = parseInt(age);
                if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 65) {
                    alert("Age must be between 18 and 65.");
                    return;
                }

                // Process skills into unique array with max 10 limit
                const skillsArray = skillsString
                    .split(',')
                    .map(skill => skill.trim())
                    .filter(skill => skill.length > 0);
                const uniqueSkills = [...new Set(skillsArray)];
                if (uniqueSkills.length > 10) {
                    alert("You can only add up to 10 skills.");
                    return;
                }

                // Build FormData for file upload
                const formData = new FormData();
                formData.append("email", email);
                formData.append("password", password);
                formData.append("firstName", firstName);
                formData.append("lastName", lastName);
                formData.append("age", parsedAge.toString());
                formData.append("gender", gender);
                formData.append("skills", JSON.stringify(uniqueSkills));

                if (photo) {
                    formData.append("photo", photo);
                }

                // 1. Make the Signup API Call with FormData headers
                const response = await axios.post(
                    "http://localhost:3000/signup",
                    formData,
                    {
                        withCredentials: true,
                        headers: { "Content-Type": "multipart/form-data" }
                    }
                );

                // 2. Dispatch user data to Redux
                dispatch(addUser(response.data));

                // 3. Redirect to main app
                navigate("/");

            } else {
                // 1. Make the Login API Call
                const response = await axios.post(
                    "http://localhost:3000/login",
                    { email, password },
                    { withCredentials: true }
                );
                // 2. Dispatch user data to Redux
                dispatch(addUser(response?.data));

                // 3. Redirect to main app
                navigate("/");
            }
        } catch (error: any) {
            // Safely catch backend error messages (e.g., 401 Unauthorized, 400 Bad Request)
            const errorMessage = error.response?.data?.message || "An unexpected error occurred. Please try again.";
            setApiError(errorMessage);
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
            <div className={`w-full space-y-8 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden transition-all duration-300 ${isLogin ? 'max-w-md' : 'max-w-2xl'}`}>

                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header */}
                <div className="text-center relative z-10">
                    <div className="mx-auto w-fit mb-6">
                        <img
                            src="/Tab_Logo.svg"
                            alt="DevTinder Logo"
                            className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                        />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        {isLogin ? 'Enter your details to access your account.' : 'Join the premier developer matchmaking platform.'}
                    </p>
                </div>

                {/* API Error Banner */}
                {apiError && (
                    <div className="relative z-10 bg-rose-500/10 border border-rose-500/50 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-rose-200">{apiError}</p>
                    </div>
                )}

                {/* Form */}
                <form className="mt-4 space-y-5 relative z-10" onSubmit={handleSubmit}>

                    {/* Sign Up Specific Fields */}
                    {!isLogin && (
                        <div className="space-y-5">
                            {/* Name Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                                            placeholder="Pratik"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                                            placeholder="Parker"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Age & Gender Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Age *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min="18"
                                            max="65"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                                            placeholder="22"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Gender *</label>
                                    <div className="relative group">
                                        {/* Invisible backdrop to close dropdown when clicking outside */}
                                        {isGenderOpen && (
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setIsGenderOpen(false)}
                                            ></div>
                                        )}

                                        {/* Custom Select Trigger Button */}
                                        <button
                                            type="button"
                                            onClick={() => setIsGenderOpen(!isGenderOpen)}
                                            className={`relative flex items-center w-full pl-10 pr-10 py-2.5 border rounded-xl bg-slate-950/50 text-left focus:outline-none transition-all sm:text-sm cursor-pointer z-50 ${isGenderOpen
                                                ? "border-indigo-500 ring-2 ring-indigo-500/50"
                                                : "border-slate-700 hover:border-slate-600"
                                                }`}
                                        >
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Users className={`h-5 w-5 transition-colors ${isGenderOpen ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                                            </div>

                                            <span className={`block truncate capitalize ${gender ? "text-white" : "text-slate-500"}`}>
                                                {gender ? gender : "Select gender"}
                                            </span>

                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isGenderOpen ? 'text-indigo-400 rotate-180' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                                            </div>
                                        </button>

                                        {/* Custom Dropdown Menu */}
                                        {isGenderOpen && (
                                            <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2">
                                                {['male', 'female', 'other'].map((option) => (
                                                    <div
                                                        key={option}
                                                        onClick={() => {
                                                            setGender(option);
                                                            setIsGenderOpen(false);
                                                        }}
                                                        className={`px-10 py-2.5 cursor-pointer transition-colors text-sm capitalize ${gender === option
                                                            ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                            }`}
                                                    >
                                                        {option}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Optional Fields Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Profile Photo</label>

                                    {!photo ? (
                                        /* Empty State: Custom Upload Zone */
                                        <label className="flex flex-col items-center justify-center w-full h-[122px] border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-950/50 hover:bg-slate-900 hover:border-indigo-500 transition-all group overflow-hidden">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <UploadCloud className="w-7 h-7 mb-2 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                                <p className="text-xs text-slate-400 group-hover:text-slate-300">
                                                    <span className="font-semibold text-indigo-400">Click to upload</span>
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-1">JPG, PNG, WEBP</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden" // Completely hides the ugly default HTML input
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setPhoto(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        </label>
                                    ) : (
                                        /* Filled State: Image Preview & File Info */
                                        <div className="relative flex items-center gap-3 p-3 h-[122px] border border-slate-700 rounded-xl bg-slate-950/50">
                                            <img
                                                src={URL.createObjectURL(photo)}
                                                alt="Profile Preview"
                                                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-lg shadow-indigo-500/20"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{photo.name}</p>
                                                <p className="text-xs text-slate-400">{(photo.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPhoto(null)}
                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-900 rounded-lg transition-colors focus:outline-none"
                                                title="Remove photo"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Skills (comma separated)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Code className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <input
                                            type="text"
                                            value={skillsString}
                                            onChange={(e) => setSkillsString(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                                            placeholder="React, Node.js, TypeScript"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email (Always visible) */}
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
                                className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all sm:text-sm ${email.length > 0 && !isEmailValid
                                    ? "border-rose-500 focus:ring-rose-500"
                                    : "border-slate-700 focus:ring-indigo-500"
                                    }`}
                                placeholder="you@example.com"
                            />
                        </div>
                        {email.length > 0 && !isEmailValid && (
                            <p className="mt-1.5 text-xs text-rose-500">Please enter a valid email address.</p>
                        )}
                    </div>

                    {/* Password (Always visible) */}
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
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPassword(val);
                                    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
                                    if (val.length > 0 && !passwordRegex.test(val)) {
                                        setPasswordError("Must be 8+ characters with at least 1 uppercase, 1 number, and 1 special character.");
                                    } else {
                                        setPasswordError('');
                                    }
                                }}
                                className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all sm:text-sm ${passwordError
                                    ? "border-rose-500 focus:ring-rose-500"
                                    : "border-slate-700 focus:ring-indigo-500"
                                    }`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {passwordError && (
                            <p className="mt-1.5 text-xs text-rose-500">{passwordError}</p>
                        )}

                        {!isLogin && (
                            <div className="mt-3 space-y-1.5 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                <p className="text-xs text-slate-400 mb-2 font-medium">Password must contain:</p>
                                <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${hasLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    <span className="text-[10px]">{hasLength ? '✓' : '○'}</span><span>At least 8 characters</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    <span className="text-[10px]">{hasUpper ? '✓' : '○'}</span><span>1 uppercase letter</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    <span className="text-[10px]">{hasNumber ? '✓' : '○'}</span><span>1 number</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    <span className="text-[10px]">{hasSpecial ? '✓' : '○'}</span><span>1 special character (!@#$%^&*)</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {isLogin && (
                        <div className="flex items-center justify-end">
                            <button type="button" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Forgot your password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all active:scale-[0.98]"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </form>

                <div className="mt-6 text-center relative z-10">
                    <p className="text-sm text-slate-400">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setPasswordError('');
                                setApiError('');
                            }}
                            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none underline-offset-4 hover:underline"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;