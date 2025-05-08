import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectToDatabase();
        const db = mongoose.connection.useDb('BollywoodSystem');

        const trendingMovies = await db.collection('Database')
            .find({})
            .sort({ votes: -1 })
            .limit(5)
            .project({
                movie_id: 1,
                movie_name: 1,
                year: 1,
                genre: 1,
                overview: 1,
                poster_url: 1,
                rating: 1,
                votes: 1
            })
            .toArray();


        const transformedMovies = trendingMovies.map(movie => ({
            _id: movie._id,
            movieId: movie.movie_id,
            title: movie.movie_name,
            year: movie.year.replace(/[^0-9]/g, ''),
            genres: movie.genre.split(', '),
            overview: movie.overview,
            poster: movie.poster_url,
            rating: movie.rating,
            votes: movie.votes
        }));

        return new Response(JSON.stringify(transformedMovies), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Trending API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch trending movies' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 