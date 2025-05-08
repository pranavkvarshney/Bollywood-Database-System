import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET(request) {
    let mongoClient;
    try {
        const { searchParams } = new URL(request.url);
        const movieId = searchParams.get('movieId');

        if (!movieId) {
            return Response.json({ error: 'Movie ID is required' }, { status: 400 });
        }

        mongoClient = await client.connect();
        const db = mongoClient.db("BollywoodSystem");


        const reviews = await db.collection('ratings')
            .find({ movie_id: movieId })
            .sort({ createdAt: -1 })
            .toArray();

        return Response.json(reviews);

    } catch (error) {
        console.error('Error fetching reviews:', error);
        return Response.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
    }
} 