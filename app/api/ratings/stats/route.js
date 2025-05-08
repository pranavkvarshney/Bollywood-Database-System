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


        const stats = await db.collection('ratings').aggregate([
            {
                $match: {
                    movie_id: movieId
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 }
                }
            }
        ]).toArray();

        const result = stats[0] || { averageRating: 0, totalRatings: 0 };

        return Response.json({
            averageRating: result.averageRating || 0,
            totalRatings: result.totalRatings || 0
        });

    } catch (error) {
        console.error('Error fetching rating stats:', error);
        return Response.json({ error: 'Failed to fetch rating stats' }, { status: 500 });
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
    }
} 