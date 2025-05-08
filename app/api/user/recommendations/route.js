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


        const userRatings = await db.collection('ratings')
            .find({
                user: session.user.email,
                rating: { $gte: 4 }
            })
            .toArray();


        if (userRatings.length === 0) {
            const popularMovies = await db.collection('Database')
                .find({})
                .limit(6)
                .toArray();

            return Response.json(popularMovies);
        }


        const ratedMovieIds = userRatings.map(rating => rating.movie_id);


        const recommendations = await db.collection('Database')
            .find({
                movie_id: { $nin: ratedMovieIds }
            })
            .limit(6)
            .toArray();

        return Response.json(recommendations);

    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return Response.json([], { status: 200 });
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
    }
} 