import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function PUT(request) {
    const mongoClient = new MongoClient(uri);

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await request.json();
        await mongoClient.connect();
        const db = mongoClient.db("BollywoodSystem");

        const updateDoc = {
            email: session.user.email,
            displayName: data.displayName || '',
            dateOfBirth: data.dateOfBirth || '',
            photoUrl: data.photoUrl || '',
            updatedAt: new Date()
        };

        const result = await db.collection('users').findOneAndUpdate(
            { email: session.user.email },
            {
                $set: updateDoc,
                $setOnInsert: { createdAt: new Date() }
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );


        return new Response(JSON.stringify({
            success: true,
            data: result.value || updateDoc
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Server error updating profile:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Internal server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } finally {
        await mongoClient.close();
    }
}

export async function GET() {
    const mongoClient = new MongoClient(uri);

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await mongoClient.connect();
        const db = mongoClient.db("BollywoodSystem");

        const userProfile = await db.collection('users').findOne(
            { email: session.user.email }
        );

        return Response.json(userProfile || {
            email: session.user.email,
            displayName: '',
            dateOfBirth: '',
            photoUrl: '',
            createdAt: new Date()
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return Response.json({ error: 'Failed to fetch profile' }, { status: 500 });
    } finally {
        await mongoClient.close();
    }
} 