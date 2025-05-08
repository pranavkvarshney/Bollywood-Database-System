import { MongoClient } from 'mongodb';

function generateFuzzyRegex(query) {

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const chars = escapedQuery.split('');
    const fuzzyPattern = chars.map(char => `${char}.*`).join('');
    return new RegExp(fuzzyPattern, 'i');
}

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'BollywoodSystem';

export async function GET(request) {
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get('q');
    let client;

    console.log('Suggestion API called with query:', query);

    if (!query) {
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {

        client = await MongoClient.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });

        const db = client.db(DB_NAME);
        const fuzzyRegex = generateFuzzyRegex(query);
        console.log('Generated regex:', fuzzyRegex);


        const suggestions = await db.collection('Database')
            .find(
                { movie_name: { $regex: fuzzyRegex } },
                { projection: { movie_name: 1, _id: 0 } }
            )
            .limit(5)
            .toArray();

        const suggestionList = suggestions.map(item => item.movie_name);

        console.log('Found suggestions:', suggestionList);

        return new Response(JSON.stringify(suggestionList), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            }
        });

    } catch (error) {
        console.error('MongoDB Error:', error);
        return new Response(
            JSON.stringify({
                error: 'Database connection failed',
                details: error.message
            }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
} 
