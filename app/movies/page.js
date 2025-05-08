'use client';
import { useState, useEffect } from 'react';
import NavHeader from '../components/NavHeader';
import MovieCard from '../components/MovieCard';
import Image from 'next/image';

export default function MoviesPage() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        year: '',
        genre: '',
        actor: ''
    });
    const [page, setPage] = useState(1);
    const moviesPerPage = 30;


    const years = Array.from({ length: 55 }, (_, i) => (2024 - i).toString());
    const genres = ['Action', 'Thriller', 'Drama', 'Comedy', 'Romance', 'Family', 'Horror', 'Adventure', 'Fantasy', 'Animation', 'Biography', 'History', 'Crime', 'Mystery', 'Musical', 'Sport'];


    const createUniqueId = (movie, pageNum, index, timestamp) => {
        return `${movie._id}-${pageNum}-${index}-${timestamp}`;
    };

    const fetchMovies = async (isLoadMore = false) => {
        try {
            setLoading(true);
            setError(null);

            const currentPage = isLoadMore ? page : 1;
            const timestamp = Date.now();

            let endpoint = '/api/movies/random';

            if (filters.year || filters.genre || filters.actor) {
                const queryParams = new URLSearchParams({
                    page: currentPage.toString(),
                    limit: moviesPerPage.toString(),
                    ...(filters.year && { year: filters.year }),
                    ...(filters.genre && { genre: filters.genre }),
                    ...(filters.actor && { actor: filters.actor })
                });
                endpoint = `/api/movies/filter?${queryParams}`;
            }

            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();


            const moviesWithUniqueIds = data.map((movie, index) => ({
                ...movie,
                uniqueId: createUniqueId(movie, currentPage, index, timestamp)
            }));

            setHasMore(data.length === moviesPerPage);


            setMovies(prev => {
                if (isLoadMore) {

                    const existingIds = new Set(prev.map(m => m.movie_id));
                    const newMovies = moviesWithUniqueIds.filter(m => !existingIds.has(m.movie_id));
                    return [...prev, ...newMovies];
                }
                return moviesWithUniqueIds;
            });

            if (!isLoadMore) {
                setPage(1);
            }

        } catch (error) {
            console.error('Error fetching movies:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchMovies();
    }, []);


    const handleApplyFilters = () => {
        fetchMovies();
    };


    const handleResetFilters = () => {
        setFilters({
            year: '',
            genre: '',
            actor: ''
        });
        fetchMovies();
    };


    const handleLoadMore = () => {
        setPage(prev => prev + 1);
        fetchMovies(true);
    };

    return (
        <>
            <NavHeader />
            <div className="container mx-auto px-4 py-8 mt-16">

                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                                className="w-full rounded-md border border-gray-300 p-2"
                            >
                                <option value="">All Years</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                            <select
                                value={filters.genre}
                                onChange={(e) => setFilters(prev => ({ ...prev, genre: e.target.value }))}
                                className="w-full rounded-md border border-gray-300 p-2"
                            >
                                <option value="">All Genres</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Actor</label>
                            <input
                                type="text"
                                value={filters.actor}
                                onChange={(e) => setFilters(prev => ({ ...prev, actor: e.target.value }))}
                                placeholder="Search by actor name"
                                className="w-full rounded-md border border-gray-300 p-2"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-4">
                        <button
                            onClick={handleResetFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Reset Filters
                        </button>
                        <button
                            onClick={handleApplyFilters}
                            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>


                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                    </div>
                )}


                {error && (
                    <div className="text-center py-8 text-red-500">
                        {error}
                    </div>
                )}


                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {movies.map((movie, index) => (
                        <MovieCard
                            key={movie.uniqueId || `${movie._id}-${index}`}
                            movie={movie}
                        />
                    ))}
                </div>


                {!loading && !error && movies.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No movies found matching your criteria.
                    </div>
                )}


                {!loading && !error && hasMore && movies.length > 0 && (
                    <div className="text-center mt-8">
                        <button
                            onClick={handleLoadMore}
                            className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </>
    );
} 