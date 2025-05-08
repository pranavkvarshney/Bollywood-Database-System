import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
    let mongoClient;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        mongoClient = await client.connect();
        const db = mongoClient.db("BollywoodSystem");


        const ratings = await db.collection('ratings')
            .aggregate([
                {
                    $match: {
                        user: session.user.email
                    }
                },
                {
                    $lookup: {
                        from: 'Database',
                        localField: 'movie_id',
                        foreignField: 'movie_id',
                        as: 'movieDetails'
                    }
                },
                {
                    $unwind: '$movieDetails'
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $project: {
                        _id: 1,
                        rating: 1,
                        review: 1,
                        createdAt: 1,
                        movie_id: 1,
                        'movie': {
                            movie_id: '$movieDetails.movie_id',
                            movie_name: '$movieDetails.movie_name',
                            poster_url: '$movieDetails.poster_url',
                            year: '$movieDetails.year'
                        }
                    }
                }
            ]).toArray();

        return Response.json(ratings);

    } catch (error) {
        console.error('Error fetching user ratings:', error);
        return Response.json({ error: 'Failed to fetch ratings' }, { status: 500 });
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
    }
} 