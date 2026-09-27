import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bell, User, LogOut, Menu, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '../utils/store';
import axios from 'axios';
import { removeUser } from '../utils/userslice';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [hoveredNav, setHoveredNav] = useState<string | null>(null);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navbardata = useSelector((store: RootState) => store.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Navigation items array for the sliding hover effect
    const navItems = [
        { name: 'Requests', path: '/requests', badge: 2 },
        { name: 'Connections', path: '/connections' }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="z-999 bg-slate-950 fixed top-0 w-full backdrop-blur-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Left: Brand Logo */}
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                            <img
                                src="/Tab_Logo.svg"
                                alt="DevTinder Logo"
                                className="w-9 h-9 object-contain"
                            />
                            <span className="text-xl font-bold tracking-tight text-white">
                                dev<span className="text-indigo-400">conect</span>
                            </span>
                        </Link>
                    </div>

                    {/* Right: Navigation Links & User Actions */}
                    <div className="hidden md:flex items-center gap-6">

                        {/* Animated Sliding Nav Links */}
                        <div 
                            className="flex items-center gap-2 relative"
                            onMouseLeave={() => setHoveredNav(null)}
                        >
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onMouseEnter={() => setHoveredNav(item.name)}
                                    className={`relative px-4 py-2 rounded-full font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                                        hoveredNav === item.name ? 'text-black' : 'text-slate-300'
                                    }`}
                                >
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        {item.name}
                                        {item.badge && (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors duration-300 ${
                                                hoveredNav === item.name ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white'
                                            }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </span>
                                    
                                    {/* The sliding white background pill */}
                                    {hoveredNav === item.name && (
                                        <motion.div
                                            layoutId="nav-hover-pill"
                                            className="absolute inset-0 bg-white rounded-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Vertical Divider */}
                        <div className="h-6 w-px bg-slate-800"></div>

                        {/* Animated Notification Bell */}
                        <motion.button 
                            whileHover={{ scale: 1.1, rotate: 10 }} 
                            whileTap={{ scale: 0.9 }}
                            className="text-slate-400 hover:text-white transition-colors focus:outline-none"
                        >
                            <Bell size={20} />
                        </motion.button>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
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
                                        to="/profileedit"
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
                                                await axios.post(
                                                    "http://localhost:3000/logout",
                                                    {}, 
                                                    { withCredentials: true } 
                                                );
                                                dispatch(removeUser()); 
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
                            to="/profileedit"
                            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Profile
                        </Link>
                        <button
                            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:bg-slate-800"
                            onClick={async () => {
                                setIsMobileMenuOpen(false);
                                try {
                                    await axios.post(
                                        "http://localhost:3000/logout",
                                        {},
                                        { withCredentials: true } 
                                    );
                                    dispatch(removeUser()); 
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
            )}
        </nav>
    );
};