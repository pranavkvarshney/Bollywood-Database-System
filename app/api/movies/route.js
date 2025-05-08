import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function GET(request) {
    const client = new MongoClient(uri);

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const year = searchParams.get('year');
        const genre = searchParams.get('genre');
        const actor = searchParams.get('actor');
        const limit = 30;
        const skip = (page - 1) * limit;

        await client.connect();
        const db = client.db("BollywoodSystem");


        const query = {};
        if (year) query.year = parseInt(year);
        if (genre) query.genres = genre;
        if (actor) query.actors = new RegExp(actor, 'i');

        const movies = await db.collection('movies')
            .find(query)
            .sort({ releaseDate: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();


        return Response.json(movies || []);

    } catch (error) {
        console.error('Error fetching movies:', error);

        return Response.json([]);
    } finally {
        await client.close();
    }
}
