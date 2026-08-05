import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center gap-1.5 text-xs font-semibold ${
                theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 hover:text-amber-300'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-indigo-600 shadow-sm'
            } ${className}`}
        >
            {theme === 'dark' ? (
                <>
                    <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="hidden sm:inline font-bold">Mode Terang</span>
                </>
            ) : (
                <>
                    <Moon className="w-4 h-4 text-indigo-600" />
                    <span className="hidden sm:inline font-bold">Mode Gelap</span>
                </>
            )}
        </button>
    );
}
