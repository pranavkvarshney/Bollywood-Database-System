import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

export async function GET(request) {
    const client = new MongoClient(uri);

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 30;

        await client.connect();
        const db = client.db("BollywoodSystem");

        const movies = await db.collection('Database')
            .aggregate([
                { $sample: { size: limit * 2 } },
                {
                    $group: {
                        _id: "$_id",
                        doc: { $first: "$$ROOT" }
                    }
                },
                { $replaceRoot: { newRoot: "$doc" } },
                { $limit: limit }
            ])
            .toArray();

        return Response.json(movies);

    } catch (error) {
        console.error('Error fetching random movies:', error);
        return Response.json([]);
    } finally {
        await client.close();
    }
} 