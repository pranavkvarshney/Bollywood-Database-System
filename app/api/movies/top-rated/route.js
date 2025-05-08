import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectToDatabase();
        const db = mongoose.connection.useDb('BollywoodSystem');

        const queryOptions = [

            {
                rating: { $ne: 'Not Available' },
                votes: { $gte: 50000 }
            },

            {
                rating: { $ne: 'Not Available' },
                votes: { $gt: 'Not Available' }
            }
        ];

        let topMovies = [];

        for (const query of queryOptions) {
            console.log('Attempting query:', JSON.stringify(query));

            topMovies = await db.collection('Database')
                .find(query)
                .sort({
                    rating: -1,
                    votes: -1,
                    year: -1
                })
                .limit(20)
                .project({
                    movie_id: 1,
                    movie_name: 1,
                    year: 1,
                    poster_url: 1,
                    rating: 1,
                    votes: 1,
                    genre: 1
                })
                .toArray();

            console.log(`Movies found with this query: ${topMovies.length}`);


            if (topMovies.length >= 10) break;
        }


        const transformedMovies = topMovies.map((movie) => {
            const safeConvert = (value) => {
                if (value === null || value === undefined || value === 'Not Available') return 'N/A';
                const cleaned = String(value).replace(/,/g, '');
                const num = Number(cleaned);
                return isNaN(num) ? 'N/A' : Number(num.toFixed(1));
            };

            return {
                _id: movie._id,
                movieId: movie.movie_id || 'Unknown',
                title: movie.movie_name || 'Untitled Movie',
                year: movie.year ? String(movie.year).replace(/[^0-9]/g, '') : 'N/A',
                poster: movie.poster_url || '/placeholder.png',
                rating: safeConvert(movie.rating),
                votes: safeConvert(movie.votes),
                genre: movie.genre || 'Unspecified'
            };
        });


        const sortedMovies = transformedMovies
            .filter(movie =>
                movie.rating !== 'N/A' &&
                movie.votes !== 'N/A'
            )
            .sort((a, b) => b.rating - a.rating || b.votes - a.votes)
            .slice(0, 10);

        console.log('Final movies count:', sortedMovies.length);
        console.log('Final movies:', JSON.stringify(sortedMovies, null, 2));

        return new Response(JSON.stringify({
            movies: sortedMovies,
            message: sortedMovies.length > 0
                ? `Found ${sortedMovies.length} movies`
                : 'No movies could be retrieved'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, max-age=0'
            }
        });
    } catch (error) {
        console.error('Top Movies API Error:', error);

        return new Response(JSON.stringify({
            movies: [],
            error: 'Database query failed',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}