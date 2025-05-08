'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import NavHeader from "./NavHeader";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function AnimatedHero() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchTimeoutRef = useRef(null);

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
            setSearchQuery('');
            setSuggestions([]);
        }
    };

    return (
        <>
            <NavHeader />
            <div className="relative h-screen flex items-center justify-center overflow-hidden">

                <div className="absolute inset-0 bg-white">

                    <div className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.3' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '20px 20px'
                        }}
                    ></div>


                    <svg className="absolute bottom-0 left-0 right-0 opacity-25" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path fill="#fefdee" fillOpacity="0.6" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                    <svg className="absolute bottom-0 left-0 right-0 opacity-30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path fill="#fefdee" fillOpacity="0.6" d="M0,96L48,128C96,160,192,224,288,213.3C384,203,480,117,576,96C672,75,768,117,864,144C960,171,1056,181,1152,186.7C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>

                    <svg className="absolute bottom-0 left-0 right-0 opacity-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path fill="#F59E0B" fillOpacity="0.2" d="M0,160L48,170.7C96,181,192,203,288,213.3C384,224,480,224,576,213.3C672,203,768,181,864,186.7C960,192,1056,224,1152,224C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>




                <motion.div
                    className="absolute bottom-20 -left-10 w-48 h-48 opacity-15"
                    animate={{
                        rotate: [0, -360],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 50,
                        ease: "linear"
                    }}
                >

                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="30" width="80" height="40" rx="5" fill="#F59E0B" fillOpacity="0.4" />
                        <path d="M10 45 L90 45" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />
                        <circle cx="20" cy="40" r="3" fill="#F59E0B" />
                        <circle cx="20" cy="60" r="3" fill="#F59E0B" />
                        <circle cx="80" cy="40" r="3" fill="#F59E0B" />
                        <circle cx="80" cy="60" r="3" fill="#F59E0B" />
                        <rect x="60" y="50" width="20" height="12" rx="2" fill="#F59E0B" fillOpacity="0.7" />
                    </svg>
                </motion.div>


                <motion.div
                    className="absolute top-36 left-16 opacity-20 w-20 h-20"
                    animate={{
                        y: [0, -5, 0],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 4,
                        ease: "easeInOut"
                    }}
                >
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M30 30 L20 70 L80 70 L70 30 Z" fill="#F59E0B" fillOpacity="0.4" />
                        <path d="M30 30 L70 30" stroke="#F59E0B" strokeWidth="2" />
                        <circle cx="35" cy="22" r="8" fill="#F59E0B" fillOpacity="0.7" />
                        <circle cx="45" cy="15" r="8" fill="#F59E0B" fillOpacity="0.7" />
                        <circle cx="55" cy="15" r="8" fill="#F59E0B" fillOpacity="0.7" />
                        <circle cx="65" cy="22" r="8" fill="#F59E0B" fillOpacity="0.7" />
                        <circle cx="40" cy="25" r="8" fill="#F59E0B" fillOpacity="0.7" />
                        <circle cx="50" cy="25" r="8" fill="#F59E0B" fillOpacity="0.7" />
                        <circle cx="60" cy="25" r="8" fill="#F59E0B" fillOpacity="0.7" />
                    </svg>
                </motion.div>


                <div className="absolute inset-0 overflow-hidden pointer-events-none">

                    <motion.div
                        className="absolute top-0 left-8 h-full w-10 opacity-10"
                        animate={{
                            y: [-100, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 15,
                            ease: "linear"
                        }}
                    >
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="h-10 w-10 border border-yellow-600 my-1 rounded-sm flex items-center justify-center">
                                <div className="h-6 w-6 border border-yellow-600 rounded-sm"></div>
                            </div>
                        ))}
                    </motion.div>


                    <motion.div
                        className="absolute top-0 right-8 h-full w-10 opacity-10"
                        animate={{
                            y: [0, -100],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 17,
                            ease: "linear"
                        }}
                    >
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="h-10 w-10 border border-yellow-600 my-1 rounded-sm flex items-center justify-center">
                                <div className="h-6 w-6 border border-yellow-600 rounded-sm"></div>
                            </div>
                        ))}
                    </motion.div>
                </div>


                <motion.div
                    className="absolute top-16 right-16 opacity-20"
                    animate={{
                        rotate: [-5, 5, -5],
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 8,
                        ease: "easeInOut"
                    }}
                >
                    <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="5" y="20" width="90" height="55" fill="#F59E0B" />
                        <rect x="5" y="5" width="90" height="15" fill="#F59E0B" />
                        <rect x="5" y="20" width="90" height="5" fill="#000000" />
                        <line x1="20" y1="5" x2="20" y2="20" stroke="#000000" strokeWidth="2" />
                        <line x1="40" y1="5" x2="40" y2="20" stroke="#000000" strokeWidth="2" />
                        <line x1="60" y1="5" x2="60" y2="20" stroke="#000000" strokeWidth="2" />
                        <line x1="80" y1="5" x2="80" y2="20" stroke="#000000" strokeWidth="2" />
                    </svg>
                </motion.div>


                <motion.div
                    className="absolute bottom-6 left-0 right-0 h-8 flex"
                    animate={{ x: [-1000, 0] }}
                    transition={{
                        repeat: Infinity,
                        duration: 20,
                        ease: "linear"
                    }}
                >
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="h-8 w-8 border-2 border-yellow-500 opacity-25 mx-2"></div>
                    ))}
                </motion.div>

                <div className="relative z-10 text-center px-6">

                    <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-yellow-400 opacity-15 rounded-full blur-3xl"></div>


                    <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-32 bg-yellow-300 rounded-full opacity-15 blur-xl"
                        animate={{
                            rotate: [0, 360],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 8,
                            ease: "linear"
                        }}
                    />

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-7xl md:text-9xl font-bold text-yellow-500 drop-shadow-xl"
                    >
                        BollY BuzZ
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-3xl text-black font-medium mt-10"
                    >
                        Your Ultimate Bollywood Entertainment Guide
                    </motion.p>
                    <motion.form
                        onSubmit={handleSearch}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col md:flex-row justify-center gap-4 max-w-lg mx-auto mt-8 relative"
                    >
                        <div className="relative w-full">
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={handleSearchInput}
                                placeholder="Search for movies, actors..."
                                className="px-6 py-3 w-full rounded-full bg-gray-100 text-black border border-gray-300 focus:outline-none focus:border-yellow-500 text-lg placeholder-gray-600 shadow-md"
                            />


                            {isLoading && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="animate-spin h-5 w-5 border-2 border-yellow-500 rounded-full border-t-transparent"></div>
                                </div>
                            )}


                            {suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                router.push(`/movie/search?q=${encodeURIComponent(suggestion)}`);
                                                setSearchQuery('');
                                                setSuggestions([]);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-yellow-50 transition-colors text-gray-700 flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-full bg-yellow-500 text-white font-semibold shadow-lg hover:bg-yellow-600 transition"
                            disabled={isLoading}
                        >
                            Search
                        </button>
                    </motion.form>
                </div>
            </div>
        </>
    );
}