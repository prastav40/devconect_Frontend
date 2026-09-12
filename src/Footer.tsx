import React from 'react';
import { Link } from 'react-router';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-12 pb-8 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Brand & Social Links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
          
          {/* Brand Section - Left Side */}
          <div className="max-w-md">
            <Link to="/" className="flex items-center gap-2.5 mb-3 hover:opacity-90 transition-opacity w-fit group">
              <img 
                src="/Tab_Logo.svg" 
                alt="DevTinder Logo" 
                className="w-8 h-8 object-contain transition-transform group-hover:scale-105" 
              />
              <span className="text-xl font-bold tracking-tight text-white">
                dev<span className="text-indigo-400">conect</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              The premier matchmaking platform for developers. Find your perfect hackathon teammate, collaborate on projects, and build something amazing.
            </p>
          </div>

          {/* Socials / Connect - Right Side */}
          <div className="flex flex-col md:items-end w-full md:w-auto">
            <h3 className="text-white font-semibold mb-3 text-sm tracking-wider uppercase">Connect</h3>
            <div className="flex items-center gap-3">
              {/* GitHub Link */}
              <a 
                href="https://github.com/prastav40" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="GitHub Profile"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0 .1-3.8s-1.2-.4-3.9 1.4a12.8 12.8 0 0 0-7 0C6.2 1.5 5 1.5 5 1.5a5.5 5.5 0 0 0 .1 3.8A5.5 5.5 0 0 0 3 9.1c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"/><path d="M9 18c-4.5 1.6-5.5-2.4-5.5-2.4"/></svg>
              </a>
              
              {/* LinkedIn Link */}
              <a 
                href="https://www.linkedin.com/in/prastav-deokar-43a938325/" 
                target="_blank" 
                rel="noreferrer" 
                aria-label="LinkedIn Profile"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-[#0A66C2] hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a22 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs text-center sm:text-left">
            © {currentYear} devconect. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800/60">
            <span>Built with</span>
            <Heart size={12} className="text-rose-500 fill-rose-500 animate-pulse" />
            <span>for developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};