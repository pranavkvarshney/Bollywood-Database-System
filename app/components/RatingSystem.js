'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const RatingSystem = ({ movieId }) => {
    const { data: session } = useSession();
    const [userRating, setUserRating] = useState(null);
    const [tempRating, setTempRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [review, setReview] = useState('');
    const [tempReview, setTempReview] = useState('');
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showReviewInput, setShowReviewInput] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allReviews, setAllReviews] = useState([]);


    useEffect(() => {
        if (!session) {
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {

                const statsResponse = await fetch(`/api/ratings/stats?movieId=${movieId}`);
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setAverageRating(statsData.averageRating || 0);
                    setTotalRatings(statsData.totalRatings || 0);
                }


                const userRatingResponse = await fetch(`/api/ratings?movieId=${movieId}`);
                if (userRatingResponse.ok) {
                    const userData = await userRatingResponse.json();
                    if (userData && userData.rating) {
                        setUserRating(userData);
                        setTempRating(userData.rating);
                        setReview(userData.review || '');
                    }
                }

                const reviewsResponse = await fetch(`/api/ratings/reviews?movieId=${movieId}`);
                if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    setAllReviews(reviewsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load ratings and reviews');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [movieId, session]);


    if (!session) {
        return (
            <div className="max-w-7xl mx-auto px-8 py-12 bg-white rounded-xl shadow-sm">
                <div className="text-center p-8">
                    <p className="text-gray-600 mb-4">Please sign in to view and submit ratings</p>
                    <Link
                        href="/auth/signin"
                        className="inline-block px-6 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }


    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-8 py-12 bg-white rounded-xl shadow-sm">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                </div>
            </div>
        );
    }

    const handleStarClick = (rating) => {
        if (userRating && !isEditing) return;
        setTempRating(rating);
        if (!userRating) setShowReviewInput(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/ratings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movieId,
                    rating: tempRating,
                    review: review.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to submit rating');
            }

            const data = await response.json();
            setUserRating(data);
            setIsEditing(false);
            setShowReviewInput(false);


            await fetchRatingStats();
            await fetchAllReviews();

        } catch (error) {
            setError(error.message || 'Failed to submit rating');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setTempRating(userRating.rating);
        setReview(userRating.review || '');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setTempRating(userRating.rating);
        setReview(userRating.review || '');
    };

    const fetchRatingStats = async () => {
        try {
            const statsResponse = await fetch(`/api/ratings/stats?movieId=${movieId}`);
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setAverageRating(statsData.averageRating || 0);
                setTotalRatings(statsData.totalRatings || 0);
            }
        } catch (error) {
            console.error('Error fetching rating stats:', error);
        }
    };

    const fetchAllReviews = async () => {
        try {
            const reviewsResponse = await fetch(`/api/ratings/reviews?movieId=${movieId}`);
            if (reviewsResponse.ok) {
                const reviewsData = await reviewsResponse.json();
                setAllReviews(reviewsData);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete your review?')) return;

        try {
            const response = await fetch(`/api/ratings?movieId=${movieId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setUserRating(null);
                setTempRating(0);
                setReview('');
                setShowReviewInput(false);


                await fetchRatingStats();
                await fetchAllReviews();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-8 py-12 bg-white rounded-xl shadow-sm">

            <div className="flex items-center gap-8 p-6 bg-gradient-to-r from-yellow-50 to-white rounded-xl border border-yellow-100">
                <div className="flex items-center gap-3">
                    <span className="text-5xl font-bold text-yellow-500">
                        {Number(averageRating).toFixed(1)}
                    </span>
                    <div className="text-yellow-500 text-3xl">★</div>
                </div>
                <div className="flex flex-col">
                    <div className="text-gray-900 font-medium">Average Rating</div>
                    <div className="text-gray-500">
                        Based on {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>


            <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleStarClick(star)}
                                    className={`text-4xl transition-colors duration-200 ${star <= (isEditing ? tempRating : (userRating?.rating || tempRating))
                                        ? 'text-yellow-500'
                                        : 'text-gray-200'
                                        } ${(!isEditing && userRating)
                                            ? 'cursor-default'
                                            : 'cursor-pointer hover:text-yellow-500'
                                        }`}
                                    disabled={!isEditing && userRating}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        {userRating && (
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={isEditing ? handleCancelEdit : handleEditClick}
                                    className="text-sm px-4 py-2 rounded-full border border-yellow-500 text-yellow-500 hover:bg-yellow-50 transition-colors"
                                >
                                    {isEditing ? 'Cancel Edit' : 'Edit Review'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="text-sm px-4 py-2 rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    Delete Review
                                </button>
                            </div>
                        )}
                    </div>
                </div>


                {(showReviewInput || (userRating && isEditing)) && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your thoughts about this movie..."
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                            rows="4"
                            disabled={isSubmitting}
                        />
                        <div className="flex flex-col space-y-2">
                            {error && (
                                <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
                            )}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !tempRating}
                                    className={`px-6 py-3 text-sm font-medium bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors
                                        ${(isSubmitting || !tempRating) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isSubmitting
                                        ? 'Submitting...'
                                        : (userRating ? 'Update Review' : 'Submit Review')
                                    }
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>


            <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-1 h-8 bg-yellow-500 mr-4"></span>
                    All Reviews ({allReviews.length})
                </h3>
                <div className="space-y-6">
                    {allReviews.map((review) => (
                        <div key={review._id} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-medium">
                                        {review.user.split('@')[0].charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{review.user.split('@')[0]}</div>
                                        <div className="text-yellow-500">{'★'.repeat(review.rating)}</div>
                                    </div>
                                </div>
                                {review.createdAt && (
                                    <p className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                )}
                            </div>
                            {review.review && (
                                <p className="text-gray-700 leading-relaxed">{review.review}</p>
                            )}
                        </div>
                    ))}
                    {allReviews.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <p className="text-gray-500">No reviews yet. Be the first to share your thoughts!</p>
                        </div>
                    )}
                </div>
            </div>


            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                        <h4 className="text-lg font-semibold mb-4">Delete Rating</h4>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete your rating and review? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RatingSystem;