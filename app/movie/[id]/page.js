import { MongoClient } from 'mongodb';
import Image from 'next/image';
import NavHeader from '@/app/components/NavHeader';
import RatingSystem from '../../components/RatingSystem';
import Link from 'next/link';
const uri = process.env.MONGODB_URI;


function getValidImageUrl(url) {

    if (!url || url === 'Not Available' || url === 'N/A' || url.includes('N/A')) {
        return '/placeholder.png';
    }


    try {

        if (url.startsWith('/')) {
            return url;
        }


        new URL(url);
        return url;
    } catch (error) {
        console.warn(`Invalid image URL: ${url}. Using fallback.`);
        return '/placeholder.png';
    }
}

async function getMovieDetails(movieId) {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db('BollywoodSystem');
        const movie = await db.collection('Database').findOne({ movie_id: movieId });
        await client.close();
        return movie;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

async function getSimilarMovies(currentMovie) {
    if (!currentMovie || !currentMovie.genre) {
        return [];
    }

    try {
        const client = await MongoClient.connect(uri);
        const db = client.db('BollywoodSystem');


        const genres = currentMovie.genre.split(',').map(g => g.trim());


        const similarMovies = await db.collection('Database')
            .find({
                movie_id: { $ne: currentMovie.movie_id },
                genre: {
                    $regex: new RegExp(genres.join('|'), 'i')
                }
            })
            .limit(3)
            .toArray();

        await client.close();
        return similarMovies;
    } catch (error) {
        console.error('Error fetching similar movies:', error);
        return [];
    }
}

export default async function MovieDetails({ params }) {
    const movie = await getMovieDetails(params.id);

    if (!movie) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 pt-20">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Movie Not Found</h1>
                    <p className="text-gray-600">The movie you're looking for doesn't exist.</p>
                    <Link href="/" className="text-yellow-500 hover:text-yellow-600 mt-4 inline-block">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    const similarMovies = await getSimilarMovies(movie);

    return (
        <>
            <NavHeader />

            <div className="h-16"></div>

            <div className="min-h-screen">

                <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] w-full bg-gradient-to-b from-gray-900 to-black">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900">
                        <Image
                            src={getValidImageUrl(movie.poster_url)}
                            alt={movie.movie_name}
                            fill
                            className="object-cover opacity-30"
                            priority
                        />
                    </div>


                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-6 md:p-8 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8">

                            <div className="relative w-32 h-48 sm:w-48 sm:h-72 md:w-64 md:h-96 mx-auto md:mx-0 shrink-0 rounded-lg overflow-hidden shadow-2xl">
                                <Image
                                    src={getValidImageUrl(movie.poster_url)}
                                    alt={movie.movie_name}
                                    fill
                                    className="object-cover"
                                />
                            </div>


                            <div className="flex-1 mt-4 md:mt-0 text-center md:text-left">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-2 md:mb-4">
                                    {movie.movie_name}
                                </h1>
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-4 text-yellow-400 mb-3 md:mb-6">
                                    <span className="text-base md:text-lg">{movie.year}</span>
                                    <span>•</span>
                                    <span className="text-base md:text-lg">{movie.genre}</span>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-3 mb-4 md:mb-8">
                                    <div className="bg-yellow-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-full inline-flex items-center gap-1 md:gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="font-bold text-sm md:text-base">{movie.rating}/10</span>
                                    </div>
                                    <span className="text-gray-300 text-sm md:text-base">
                                        {movie.votes.toLocaleString()} votes
                                    </span>
                                </div>
                                <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-4 md:mb-8 line-clamp-3 sm:line-clamp-4 md:line-clamp-none">
                                    {movie.overview}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-16">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                            <div className="lg:col-span-2 space-y-8 md:space-y-12">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
                                        <span className="w-1 h-6 md:h-8 bg-yellow-500 mr-3 md:mr-4"></span>
                                        Cast & Crew
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                                        <div>
                                            <h3 className="text-yellow-600 font-semibold mb-2 md:mb-4">Director</h3>
                                            <p className="text-gray-700 text-base md:text-lg">{movie.director}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-yellow-600 font-semibold mb-2 md:mb-4">Stars</h3>
                                            <div className="space-y-1 md:space-y-2">
                                                {movie.cast.split(',').map((actor, index) => (
                                                    <p key={index} className="text-gray-700 text-base md:text-lg">
                                                        {actor.trim()}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
                                        <span className="w-1 h-6 md:h-8 bg-yellow-500 mr-3 md:mr-4"></span>
                                        Details
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                                        <div>
                                            <h3 className="text-yellow-600 font-semibold mb-2 md:mb-4">Release Date</h3>
                                            <p className="text-gray-700 text-base md:text-lg">{movie.year}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-yellow-600 font-semibold mb-2 md:mb-4">Genres</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {movie.genre.split(',').map((genre, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs sm:text-sm"
                                                    >
                                                        {genre.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
                                    <span className="w-1 h-6 md:h-8 bg-yellow-500 mr-3 md:mr-4"></span>
                                    More Like This
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                    {similarMovies.map((similar) => (
                                        <Link
                                            key={similar.movie_id}
                                            href={`/movie/${similar.movie_id}`}
                                            className="block group"
                                        >
                                            <div className="flex items-center gap-3 md:gap-4 bg-yellow-50 rounded-lg p-3 md:p-4 hover:bg-yellow-100 transition-colors border border-yellow-200">
                                                <div className="relative w-12 h-18 sm:w-16 sm:h-24 shrink-0 rounded overflow-hidden">
                                                    <Image
                                                        src={getValidImageUrl(similar.poster_url)}
                                                        alt={similar.movie_name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-sm sm:text-base text-gray-900 group-hover:text-yellow-600 transition-colors">
                                                        {similar.movie_name}
                                                    </h3>
                                                    <p className="text-xs sm:text-sm text-gray-600">{similar.year}</p>
                                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                                        Rating: {similar.rating}/10
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 md:mt-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto pb-8">
                    <RatingSystem movieId={params.id} />
                </div>
            </div>
        </>
    );
}