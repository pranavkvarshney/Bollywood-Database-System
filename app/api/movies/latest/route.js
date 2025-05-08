import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectToDatabase();
        const db = mongoose.connection.useDb('BollywoodSystem');

        const latestMovies = await db.collection('Database')
            .find({
                poster_url: { $ne: 'Not Available' }
            })
            .sort({ year: -1 })
            .limit(5)
            .project({
                movie_name: 1,
                year: 1,
                poster_url: 1,
                rating: 1,
                director: 1,
                cast: 1,
                movie_id: 1
            })
            .toArray();

        const transformedMovies = latestMovies.map(movie => ({
            _id: movie._id,
            movieId: movie.movie_id,
            title: movie.movie_name,
            year: movie.year.replace(/[^0-9]/g, ''),
            poster: movie.poster_url,
            rating: movie.rating,
            director: movie.director,
            cast: movie.cast
        }));

        return new Response(JSON.stringify(transformedMovies), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Latest API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch latest movies' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}