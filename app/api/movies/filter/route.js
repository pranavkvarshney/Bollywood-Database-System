import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function GET(request) {
    const client = new MongoClient(uri);

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 30;
        const year = searchParams.get('year');
        const genre = searchParams.get('genre');
        const actor = searchParams.get('actor');
        const skip = (page - 1) * limit;

        await client.connect();
        const db = client.db("BollywoodSystem");


        const query = {};
        if (year) query.year = year;
        if (genre) query.genre = new RegExp(genre, 'i');
        if (actor) query.cast = new RegExp(actor, 'i');

        const movies = await db.collection('Database')
            .find(query)
            .sort({ rating: -1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        return Response.json(movies);

    } catch (error) {
        console.error('Error fetching filtered movies:', error);
        return Response.json([]);
    } finally {
        await client.close();
    }
} 