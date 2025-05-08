'use client';

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AnimatedSections() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [latestReleases, setLatestReleases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isManualNavigation, setIsManualNavigation] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const [trendingRes, topRatedRes, latestRes] = await Promise.all([
                    fetch('/api/movies/trending'),
                    fetch('/api/movies/top-rated'),
                    fetch('/api/movies/latest')
                ]);

                if (!trendingRes.ok || !topRatedRes.ok || !latestRes.ok) {
                    throw new Error('Failed to fetch data from one or more endpoints');
                }

                const [trending, topRated, latest] = await Promise.all([
                    trendingRes.json(),
                    topRatedRes.json(),
                    latestRes.json()
                ]);


                setTrendingMovies(trending || []);
                setTopRatedMovies(topRated.movies || []);
                setLatestReleases(latest || []);


                if (!trending?.length && !topRated.movies?.length && !latest?.length) {
                    setError('No movies available at the moment');
                }

            } catch (err) {
                console.error('Error fetching movies:', err);
                setError(err.message || 'Failed to fetch movies data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    useEffect(() => {
        let timer;
        if (trendingMovies.length > 0 && !isManualNavigation) {
            timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % trendingMovies.length);
            }, 6500);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [trendingMovies, isManualNavigation]);

    const handleNext = (e) => {
        e.stopPropagation();
        setIsManualNavigation(true);
        setCurrentIndex((prev) => (prev + 1) % trendingMovies.length);


        setTimeout(() => {
            setIsManualNavigation(false);
        }, 10000);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setIsManualNavigation(true);
        setCurrentIndex((prev) => (prev - 1 + trendingMovies.length) % trendingMovies.length);


        setTimeout(() => {
            setIsManualNavigation(false);
        }, 10000);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[600px]">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                    {error}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="px-6 py-12 max-w-[1400px] mx-auto">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="mb-12"
            >
                <h2 className="text-4xl font-bold mb-8">Trending Now</h2>
                {trendingMovies.length > 0 && (
                    <div className="relative h-[500px] rounded-2xl overflow-hidden bg-gray-900">
                        <AnimatePresence mode="sync">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5 }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src={
                                        trendingMovies[currentIndex].poster &&
                                            trendingMovies[currentIndex].poster !== "Not Available" &&
                                            !trendingMovies[currentIndex].poster.includes("N/A")
                                            ? trendingMovies[currentIndex].poster
                                            : '/placeholder.png'
                                    }
                                    alt={trendingMovies[currentIndex].title}
                                    fill
                                    className="object-cover opacity-60"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent">
                                    <div className="absolute bottom-0 left-0 p-12 w-full max-w-3xl">
                                        <Link href={`/movie/${trendingMovies[currentIndex].movieId}`} className="block">
                                            <motion.h3
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="text-6xl font-bold mb-6 text-white"
                                            >
                                                {trendingMovies[currentIndex].title}
                                            </motion.h3>
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="flex items-center gap-6 mb-6"
                                            >
                                                <span className="text-yellow-400 text-xl">★ {trendingMovies[currentIndex].rating}</span>
                                                <span className="text-white/90 text-xl">{trendingMovies[currentIndex].year}</span>
                                                <span className="text-white/80 text-xl">{trendingMovies[currentIndex].genres?.join(" • ")}</span>
                                            </motion.div>
                                            <motion.p
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                                className="text-white/70 text-lg leading-relaxed max-w-2xl mb-6"
                                            >
                                                {trendingMovies[currentIndex].overview}
                                            </motion.p>
                                            <motion.button
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-all duration-300"
                                            >
                                                View Details
                                            </motion.button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>


                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-yellow-500 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-yellow-500 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 z-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>


                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-40">
                            {trendingMovies.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(idx);
                                        setIsManualNavigation(true);
                                        setTimeout(() => setIsManualNavigation(false), 10000);
                                    }}
                                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8 bg-yellow-500" : "w-2 bg-white/50"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>


            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-2xl font-bold mb-6 flex items-center">
                        <span className="w-1 h-8 bg-yellow-500 mr-4 rounded-full"></span>
                        Top 10 IMDB Rated
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {topRatedMovies.length > 0 ? (
                            topRatedMovies.map((movie, index) => (
                                <Link href={`/movie/${movie.movieId}`} key={movie._id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex bg-gray-50 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="relative w-1/3 aspect-[2/3]">
                                            <Image
                                                src={
                                                    movie.poster &&
                                                        movie.poster !== "Not Available" &&
                                                        !movie.poster.includes("N/A") &&
                                                        movie.poster.startsWith('http')
                                                        ? movie.poster
                                                        : '/placeholder.png'
                                                }
                                                alt={movie.title}
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute top-2 left-2 bg-yellow-500 text-white text-sm px-2 py-1 rounded-full">
                                                #{index + 1}
                                            </div>
                                        </div>
                                        <div className="p-4 flex-1">
                                            <h4 className="font-bold text-lg mb-2 line-clamp-2">{movie.title}</h4>
                                            <div className="text-sm text-gray-600">
                                                <p className="text-yellow-500 text-lg mb-1">★ {movie.rating}</p>
                                                <p>{movie.year}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500 py-8">
                                No top-rated movies available
                            </div>
                        )}
                    </div>
                </div>


                <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-2xl font-bold mb-6 flex items-center">
                        <span className="w-1 h-8 bg-yellow-500 mr-4 rounded-full"></span>
                        Latest Releases
                    </h3>
                    <div className="space-y-6">
                        {latestReleases.slice(0, 5).map((movie, index) => (
                            <Link href={`/movie/${movie.movieId}`} key={movie._id}>
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-gray-50 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="relative w-full aspect-[16/9]">
                                        <Image
                                            src={
                                                movie.poster &&
                                                    movie.poster !== "Not Available" &&
                                                    !movie.poster.includes("N/A") &&
                                                    movie.poster.startsWith('http')
                                                    ? movie.poster
                                                    : '/placeholder.png'
                                            }
                                            alt={movie.title || 'Movie poster'}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-lg mb-2">{movie.title}</h4>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-yellow-500 flex items-center">
                                                ★ {movie.rating}
                                            </span>
                                            <span className="text-gray-600">{movie.year}</span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            <p className="line-clamp-1">Director: {movie.director}</p>
                                            <p className="line-clamp-1">Cast: {movie.cast?.split(',')[0]}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}