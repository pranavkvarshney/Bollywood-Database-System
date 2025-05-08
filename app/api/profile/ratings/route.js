import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Rating from '@/lib/models/Rating';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();


        const userRatings = await Rating.aggregate([
            { $match: { user: session.user.id } },
            {
                $lookup: {
                    from: 'Database',
                    localField: 'movie_id',
                    foreignField: 'movie_id',
                    as: 'movie'
                }
            },
            { $unwind: '$movie' },
            { $sort: { updatedAt: -1 } }
        ]);


        const recommendations = await Rating.aggregate([
            { $match: { user: session.user.id } },
            {
                $lookup: {
                    from: 'Database',
                    localField: 'movie_id',
                    foreignField: 'movie_id',
                    as: 'ratedMovie'
                }
            },
            { $unwind: '$ratedMovie' },
            {
                $lookup: {
                    from: 'Database',
                    let: {
                        genre: '$ratedMovie.genre',
                        year: '$ratedMovie.year',
                        movieId: '$ratedMovie.movie_id'
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$genre', '$$genre'] },
                                        { $gte: ['$year', { $subtract: ['$$year', 10] }] },
                                        { $lte: ['$year', { $add: ['$$year', 10] }] },
                                        { $ne: ['$movie_id', '$$movieId'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'recommendations'
                }
            },
            { $unwind: '$recommendations' },
            {
                $group: {
                    _id: '$recommendations.movie_id',
                    movie: { $first: '$recommendations' }
                }
            },
            { $replaceRoot: { newRoot: '$movie' } },
            { $limit: 10 }
        ]);

        return NextResponse.json({
            ratings: userRatings,
            recommendations
        });
    } catch (error) {
        console.error('Profile data fetch error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 