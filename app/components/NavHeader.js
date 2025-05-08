'use client';

import { motion, useScroll } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function NavHeader() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const searchModalRef = useRef(null);
    const userMenuRef = useRef(null);
    const mobileUserMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const { scrollY } = useScroll();
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const isHomePage = pathname === '/';
    const isMoviePage = pathname.startsWith('/movie/');
    const isSearchPage = pathname.startsWith('/movie/search');
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const shouldShowLogo = !isHomePage || isScrolled;


    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (mobileUserMenuRef.current && !mobileUserMenuRef.current.contains(event.target)) {
                setShowMobileUserMenu(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
                !event.target.closest('.hamburger-button')) {
                setShowMobileMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/');
        setShowUserMenu(false);
        setShowMobileUserMenu(false);
        setShowMobileMenu(false);
    };

    const fetchSuggestions = useCallback(async (value) => {
        setIsLoading(true);
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(
                `/api/suggestions?q=${encodeURIComponent(value)}&t=${timestamp}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error('API Error:', data.error, data.details);
                setSuggestions([]);
                return;
            }

            if (Array.isArray(data)) {
                setSuggestions(data);
            } else {
                console.error('Unexpected response format:', data);
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchQuery(value);


        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }


        if (value.trim().length > 0) {
            searchTimeoutRef.current = setTimeout(() => {
                fetchSuggestions(value.trim());
            }, 300);
        } else {
            setSuggestions([]);
        }
    };


    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/movie/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowSearch(false);
            setSearchQuery('');
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        router.push(`/movie/search?q=${encodeURIComponent(suggestion)}`);
        setShowSearch(false);
        setSearchQuery('');
        setSuggestions([]);
    };

    const getLogoStyle = () => {

        return "text-2xl font-bold transition-colors duration-300 text-yellow-500";
    };


    const navLinkStyle = "text-base sm:text-lg font-medium transition-colors duration-300 text-black hover:text-yellow-500";

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchModalRef.current && !searchModalRef.current.contains(event.target)) {
                setShowSearch(false);
            }
        };

        if (showSearch) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSearch]);

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    const toggleMobileUserMenu = () => {
        setShowMobileUserMenu(!showMobileUserMenu);
    };

    return (
        <>
            <motion.header
                initial={{ y: 0 }}
                animate={{
                    y: 0,
                    backgroundColor: isScrolled ? 'white' : 'transparent',
                }}
                transition={{ duration: 0.3 }}
                className={`fixed top-0 left-0 right-0 z-50 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}
                style={{ position: 'fixed' }}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-4 py-4 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: shouldShowLogo ? 1 : 0, x: shouldShowLogo ? 0 : -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-2"
                    >
                        {shouldShowLogo && (
                            <Link
                                href="/"
                                className={getLogoStyle()}
                            >
                                BollY BuzZ
                            </Link>
                        )}
                    </motion.div>


                    <nav className="hidden md:flex items-center gap-8">
                        <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center gap-8"
                        >
                            <Link
                                href="/"
                                className={navLinkStyle}
                            >
                                Home
                            </Link>
                            <Link
                                href="/movies"
                                className={navLinkStyle}
                            >
                                Movies
                            </Link>
                            <Link
                                href="/about"
                                className={navLinkStyle}
                            >
                                About
                            </Link>
                            <button
                                onClick={() => setShowSearch(true)}
                                className={navLinkStyle}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </motion.div>

                        {status === 'authenticated' ? (
                            <div className="relative" ref={userMenuRef}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-300 bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg"
                                >
                                    <span>My Account</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </motion.button>

                                {showUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                                    >
                                        <div className="py-1">
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <Link href="/auth/signin">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-2 rounded-full font-medium transition-all duration-300 bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg"
                                >
                                    Sign In
                                </motion.button>
                            </Link>
                        )}
                    </nav>


                    <div className="flex items-center gap-4 md:hidden">

                        <button
                            onClick={() => setShowSearch(true)}
                            className="text-black p-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>


                        {status === 'authenticated' ? (
                            <div className="relative" ref={mobileUserMenuRef}>
                                <button
                                    onClick={toggleMobileUserMenu}
                                    className="px-4 py-1 rounded-full font-medium bg-yellow-500 text-white text-sm flex items-center gap-1"
                                >
                                    <span>My Account</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${showMobileUserMenu ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {showMobileUserMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                                    >
                                        <div className="py-1">
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setShowMobileUserMenu(false)}
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <Link href="/auth/signin">
                                <button className="px-3 py-1 rounded-full font-medium bg-yellow-500 text-white text-sm">
                                    Sign In
                                </button>
                            </Link>
                        )}


                        <button
                            onClick={toggleMobileMenu}
                            className="hamburger-button p-2 text-black relative z-50"
                            aria-label={showMobileMenu ? "Close menu" : "Open menu"}
                        >
                            {showMobileMenu ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>


                {showMobileMenu && (
                    <div
                        ref={mobileMenuRef}
                        className="bg-white shadow-md md:hidden"
                    >
                        <div className="flex flex-col px-6 py-4 space-y-3">
                            <Link
                                href="/"
                                className="py-2 text-black font-medium"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/movies"
                                className="py-2 text-black font-medium"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Movies
                            </Link>
                            <Link
                                href="/about"
                                className="py-2 text-black font-medium"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                About
                            </Link>

                        </div>
                    </div>
                )}
            </motion.header>


            {showSearch && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
                    <motion.div
                        ref={searchModalRef}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 mx-4 w-full max-w-2xl shadow-2xl"
                    >
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchInput}
                                placeholder="Search movies..."
                                className="w-full px-6 py-4 text-lg rounded-full border border-gray-300 focus:outline-none focus:border-yellow-500"
                                autoFocus
                            />


                            {isLoading && (
                                <div className="absolute right-14 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin h-5 w-5 border-2 border-yellow-500 rounded-full border-t-transparent"></div>
                                </div>
                            )}


                            {suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                router.push(`/movie/search?q=${encodeURIComponent(suggestion)}`);
                                                setShowSearch(false);
                                                setSearchQuery('');
                                                setSuggestions([]);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-yellow-500 text-white p-3 rounded-full hover:bg-yellow-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}


            <div className=""></div>
        </>
    );
}