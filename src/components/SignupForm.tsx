// src/components/SignupForm.tsx
import React, { useState } from 'react';
import { User, Calendar, Users, Code, ChevronDown, UploadCloud, X, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../hooks/useAuth';

const SignupForm: React.FC = () => {
    const { authenticate, isLoading, apiError } = useAuth();

    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [skillsString, setSkillsString] = useState<string>('');
    const [isGenderOpen, setIsGenderOpen] = useState<boolean>(false);
    
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<string>('');
    const [formValidationError, setFormValidationError] = useState<string | null>(null);

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+]/.test(password);
    const isPasswordValid = hasLength && hasUpper && hasNumber && hasSpecial;

    // Use either the API error from the hook or local validation errors
    const displayError = apiError || formValidationError;

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormValidationError(null);

        if (!isEmailValid) {
            setFormValidationError("Please enter a valid email address.");
            return;
        }
        if (!isPasswordValid) {
            setFormValidationError("Please complete all password requirements.");
            return;
        }

        const parsedAge = parseInt(age);
        if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 65) {
            setFormValidationError("Age must be between 18 and 65.");
            return;
        }

        const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
        const uniqueSkills = [...new Set(skillsArray)];
        if (uniqueSkills.length > 10) {
            setFormValidationError("You can only add up to 10 skills.");
            return;
        }

        // Build the physical FormData envelope for Multer
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("age", parsedAge.toString());
        formData.append("gender", gender);
        formData.append("skills", JSON.stringify(uniqueSkills));
        if (photo) formData.append("photo", photo);

        // Pass 'false' because this is the Signup form, along with the formData box
        await authenticate(false, formData);
    };

    return (
        <form className="mt-4 space-y-5" onSubmit={handleSubmit}>

            {/* Error Message Banner */}
            {displayError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 animate-fadeIn">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{displayError}</span>
                </div>
            )}

            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name *</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-500" />
                        </div>
                        <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
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
                        <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
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
                        <input type="number" required min="18" max="65" value={age} onChange={(e) => setAge(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                            placeholder="22"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Gender *</label>
                    <div className="relative group">
                        {isGenderOpen && <div className="fixed inset-0 z-40" onClick={() => setIsGenderOpen(false)}></div>}
                        <button type="button" onClick={() => setIsGenderOpen(!isGenderOpen)}
                            className={`relative flex items-center w-full pl-10 pr-10 py-2.5 border rounded-xl bg-slate-950/50 text-left focus:outline-none transition-all sm:text-sm cursor-pointer z-50 ${isGenderOpen ? "border-indigo-500 ring-2 ring-indigo-500/50" : "border-slate-700 hover:border-slate-600"}`}
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
                        {isGenderOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2">
                                {['male', 'female', 'other'].map((option) => (
                                    <div key={option}
                                        onClick={() => { setGender(option); setIsGenderOpen(false); }}
                                        className={`px-10 py-2.5 cursor-pointer transition-colors text-sm capitalize ${gender === option ? 'bg-indigo-500/20 text-indigo-300 font-medium' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Photo & Skills Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Profile Photo</label>
                    {!photo ? (
                        <label className="flex flex-col items-center justify-center w-full h-[122px] border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-950/50 hover:bg-slate-900 hover:border-indigo-500 transition-all group overflow-hidden">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-7 h-7 mb-2 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                                <p className="text-xs text-slate-400 group-hover:text-slate-300"><span className="font-semibold text-indigo-400">Click to upload</span></p>
                                <p className="text-[10px] text-slate-500 mt-1">JPG, PNG, WEBP</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*"
                                onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        try {
                                            const compressedFile = await imageCompression(e.target.files[0], { maxSizeMB: 0.2, maxWidthOrHeight: 800, useWebWorker: true });
                                            setPhoto(compressedFile);
                                        } catch (error) {
                                            console.error("Error compressing image:", error);
                                            setFormValidationError("Could not process the image. Please try another one.");
                                        }
                                    }
                                }}
                            />
                        </label>
                    ) : (
                        <div className="relative flex items-center gap-3 p-3 h-[122px] border border-slate-700 rounded-xl bg-slate-950/50">
                            <img src={URL.createObjectURL(photo)} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-lg shadow-indigo-500/20" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{photo.name}</p>
                                <p className="text-xs text-slate-400">{(photo.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button type="button" onClick={() => setPhoto(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-900 rounded-lg transition-colors focus:outline-none">
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
                        <input type="text" value={skillsString} onChange={(e) => setSkillsString(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all sm:text-sm"
                            placeholder="React, Node.js, TypeScript"
                        />
                    </div>
                </div>
            </div>

            {/* Email Field */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address *</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-500" />
                    </div>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all sm:text-sm ${email.length > 0 && !isEmailValid ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-indigo-500"}`}
                        placeholder="you@example.com"
                    />
                </div>
                {email.length > 0 && !isEmailValid && <p className="mt-1.5 text-xs text-rose-500">Please enter a valid email address.</p>}
            </div>

            {/* Password Field */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password *</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500" />
                    </div>
                    <input type={showPassword ? "text" : "password"} required value={password}
                        onChange={(e) => {
                            const val = e.target.value;
                            setPassword(val);
                            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;
                            if (val.length > 0 && !passwordRegex.test(val)) {
                                setPasswordError("Must be 8+ characters with 1 uppercase, 1 number, and 1 special character.");
                            } else {
                                setPasswordError('');
                            }
                        }}
                        className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl bg-slate-950/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all sm:text-sm ${passwordError ? "border-rose-500 focus:ring-rose-500" : "border-slate-700 focus:ring-indigo-500"}`}
                        placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
                
                {/* Password Requirements UI */}
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
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Setting up profile...
                    </>
                ) : (
                    <>
                        Create Account
                        <ArrowRight className="h-4 w-4" />
                    </>
                )}
            </button>
        </form>
    );
};

export default SignupForm;