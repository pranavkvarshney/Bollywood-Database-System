import { MongoClient } from 'mongodb';
import NavHeader from '@/app/components/NavHeader';
import MovieCard from '@/app/components/MovieCard';

const uri = process.env.MONGODB_URI;

async function getSearchResults(query) {
    const client = await MongoClient.connect(uri);
    const db = client.db('BollywoodSystem');

    function generateFuzzyRegex(query) {
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const chars = escapedQuery.split('');
        const fuzzyPattern = chars.map(char => `${char}.*`).join('');
        return new RegExp(fuzzyPattern, 'i');
    }

    const fuzzyRegex = generateFuzzyRegex(query);

    const movies = await db.collection('Database')
        .aggregate([
            {
                $match: {
                    $or: [
                        { movie_name: { $regex: fuzzyRegex } },
                        { cast: { $regex: fuzzyRegex } },
                        { director: { $regex: fuzzyRegex } }
                    ]
                }
            },
            {
                $addFields: {
                    relevanceScore: {
                        $add: [

                            {
                                $cond: [
                                    { $regexMatch: { input: "$movie_name", regex: new RegExp(`^${query}$`, 'i') } },
                                    10,
                                    0
                                ]
                            },

                            {
                                $cond: [
                                    { $regexMatch: { input: "$movie_name", regex: new RegExp(`^${query}`, 'i') } },
                                    5,
                                    0
                                ]
                            },

                            { $cond: [{ $regexMatch: { input: "$movie_name", regex: fuzzyRegex } }, 3, 0] },
                            { $cond: [{ $regexMatch: { input: "$director", regex: fuzzyRegex } }, 2, 0] },
                            { $cond: [{ $regexMatch: { input: "$cast", regex: fuzzyRegex } }, 1, 0] }
                        ]
                    }
                }
            },
            { $sort: { relevanceScore: -1, rating: -1 } },
            { $limit: 10 }
        ])
        .toArray();

    client.close();


    return movies.map(movie => ({
        id: movie._id.toString(),
        movie_id: movie.movie_id,
        movie_name: movie.movie_name,
        year: movie.year,
        genre: movie.genre,
        overview: movie.overview,
        director: movie.director,
        cast: movie.cast,
        poster_url: movie.poster_url,
        rating: movie.rating,
        votes: movie.votes,
        relevanceScore: movie.relevanceScore
    }));
}

export default async function SearchResults({ searchParams }) {
    const query = searchParams.q || '';
    const movies = await getSearchResults(query);

    return (
        <>
            <NavHeader />
            <div className="min-h-screen bg-gradient-to-b from-white to-yellow-50">

                <div className="relative pt-24 pb-12 bg-white/80">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Search Results</h1>
                        <p className="text-xl text-yellow-600">
                            Found {movies.length} results for "{query}"
                        </p>
                    </div>
                </div>


                <div className="max-w-7xl mx-auto px-4 ">
                    {movies.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {movies.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="text-yellow-500 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h2>
                            <p className="text-gray-600">
                                We couldn't find any movies matching your search. Try different keywords or browse our categories.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
} 