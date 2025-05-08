import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Rating from '@/lib/models/Rating';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MongoClient } from 'mongodb';


const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);


export async function GET(request) {
    let mongoClient;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return Response.json(null);
        }

        const { searchParams } = new URL(request.url);
        const movieId = searchParams.get('movieId');

        if (!movieId) {
            return Response.json({ error: 'Movie ID is required' }, { status: 400 });
        }

        mongoClient = await client.connect();
        const db = mongoClient.db("BollywoodSystem");

        const userRating = await db.collection('ratings').findOne({
            user: session.user.email,
            movie_id: movieId
        });

        return Response.json(userRating || null);

    } catch (error) {
        console.error('Error fetching user rating:', error);
        return Response.json({ error: 'Failed to fetch rating' }, { status: 500 });
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
    }
}


export async function POST(request) {
    let mongoClient;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return Response.json({ error: 'Please sign in to rate movies' }, { status: 401 });
        }

        const { movieId, rating, review } = await request.json();

        if (!movieId || !rating) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        mongoClient = await client.connect();
        const db = mongoClient.db("BollywoodSystem");

        const newRating = {
            user: session.user.email,
            movie_id: movieId,
            rating: Number(rating),
            review: review || '',
            updatedAt: new Date()
        };

        const result = await db.collection('ratings').findOneAndUpdate(
            {
                user: session.user.email,
                movie_id: movieId
            },
            {
                $set: newRating
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        return Response.json(result.value || result);

    } catch (error) {
        console.error('Rating submission error:', error);
        return Response.json({ error: 'Failed to submit rating' }, { status: 500 });
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { movieId, rating, review } = await request.json();

        if (!movieId || !rating) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }


        await client.connect();
        const db = client.db("BollywoodSystem");

        const updatedRating = await db.collection('ratings').findOneAndUpdate(
            {
                userId: session.user.email,
                movieId: movieId
            },
            {
                $set: {
                    rating: rating,
                    review: review || '',
                    updatedAt: new Date()
                }
            },
            {
                returnDocument: 'after',
                upsert: true
            }
        );

        return new Response(JSON.stringify(updatedRating.value || updatedRating), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Rating update error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to update rating'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {

        await client.close();
    }
}

export async function DELETE(request) {
    let mongoClient;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const movieId = searchParams.get('movieId');

        if (!movieId) {
            return Response.json({ error: 'Movie ID is required' }, { status: 400 });
        }

        mongoClient = await client.connect();
        const db = mongoClient.db("BollywoodSystem");

        await db.collection('ratings').deleteOne({
            user: session.user.email,
            movie_id: movieId
        });

        return Response.json({ success: true });

    } catch (error) {
        console.error('Error deleting rating:', error);
        return Response.json({ error: 'Failed to delete rating' }, { status: 500 });
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
    }
}
