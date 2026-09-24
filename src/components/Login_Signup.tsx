import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { type RootState } from '../utils/store'; 
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const Login: React.FC = () => {
    const navigate = useNavigate();
    
    const user = useSelector((store: RootState) => store.user);
    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user]);

    const [isLogin, setIsLogin] = useState<boolean>(true);

    return (
        <div className="w-full min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
            <div className={`w-full space-y-8 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden transition-all duration-300 ${isLogin ? 'max-w-md' : 'max-w-2xl'}`}>

                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header Section */}
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

                <div className="relative z-10">
                    {isLogin ? <LoginForm /> : <SignupForm />}
                </div>

                {/* Footer Toggle Button */}
                <div className="mt-6 text-center relative z-10">
                    <p className="text-sm text-slate-400">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
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