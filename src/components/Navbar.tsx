import React, { useState } from 'react';
import { Link } from 'react-router';
import { Bell, User, LogOut, Menu, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../utils/store';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { removeUser } from '../utils/userslice';


export const Navbar: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState<Boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<Boolean>(false);

    const navbardata = useSelector((store: RootState) => store.user);

    const dispatch = useDispatch()
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Left: Brand Logo */}
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                            {/* Your Custom Logo Image */}
                            <img
                                src="/Tab_Logo.svg"
                                alt="DevTinder Logo"
                                className="w-9 h-9 object-contain"
                            />

                            {/* Brand Text */}
                            <span className="text-xl font-bold tracking-tight text-white">
                                dev<span className="text-indigo-400">conect</span>
                            </span>
                        </Link>
                    </div>

                    {/* Right: Navigation Links & User Actions Grouped Together */}
                    <div className="hidden md:flex items-center gap-6">

                        {/* Nav Links */}
                        <Link to="/requests" className="text-slate-300 hover:text-white transition-colors font-medium flex items-center gap-1.5">
                            Requests
                            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                2
                            </span>
                        </Link>
                        <Link to="/connections" className="text-slate-300 hover:text-white transition-colors font-medium">
                            Connections
                        </Link>

                        {/* Vertical Divider */}
                        <div className="h-6 w-px bg-slate-800"></div>

                        {/* Notifications */}
                        <button className="text-slate-400 hover:text-white transition-colors focus:outline-none">
                            <Bell size={20} />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 focus:outline-none"
                            >
                                Hello<div>{navbardata ? navbardata.firstName : <div>User</div>}</div>
                                <img
                                    src={navbardata?.photoUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                                    alt="Profile"
                                    className="cursor-pointer w-10 h-10 rounded-full border border-slate-700 object-cover hover:border-indigo-500 transition-colors"
                                />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 overflow-hidden">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <User size={16} />
                                        My Profile
                                    </Link>
                                    <button
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-slate-800 transition-colors"
                                        onClick={async () => {
                                            setIsDropdownOpen(false);

                                            try {
                                                // 1. Call the backend to destroy the JWT cookie
                                                await axios.post(
                                                    "http://localhost:3000/logout",
                                                    {}, // The body is empty
                                                    { withCredentials: true } // The config is the 3rd argument
                                                );

                                                // 2. Wipe the user from React's memory
                                                dispatch(removeUser()); // Assumes you imported removeUser from your userslice

                                                // 3. Send them to the login page
                                                navigate("/login");

                                            } catch (error) {
                                                console.error("Logout failed:", error);
                                            }
                                        }}
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button (Hamburger) */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-slate-400 hover:text-white focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-900 border-b border-slate-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link
                            to="/requests"
                            className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <span>Requests</span>
                            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span>
                        </Link>
                        <Link
                            to="/connections"
                            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Connections
                        </Link>
                        <Link
                            to="/profile"
                            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Profile
                        </Link>
                        <button
                            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:bg-slate-800"
                            onClick={async () => {
                                            setIsDropdownOpen(false);

                                            try {
                                                // 1. Call the backend to destroy the JWT cookie
                                                await axios.post(
                                                    "http://localhost:3000/logout",
                                                    {}, // The body is empty
                                                    { withCredentials: true } // The config is the 3rd argument
                                                );

                                                // 2. Wipe the user from React's memory
                                                dispatch(removeUser()); // Assumes you imported removeUser from your userslice

                                                // 3. Send them to the login page
                                                navigate("/login");

                                            } catch (error) {
                                                console.error("Logout failed:", error);
                                            }
                                        }}
                                   
                        >
                        Logout
                    </button>
                </div>
                </div>
    )
}
        </nav >
    );
};