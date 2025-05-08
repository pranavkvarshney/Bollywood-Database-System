'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import NavHeader from '../components/NavHeader';
import CameraCapture from '../components/CameraCapture';

const ProfilePage = () => {
    const { data: session, status } = useSession();
    const [userRatings, setUserRatings] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [userProfile, setUserProfile] = useState({
        displayName: '',
        dateOfBirth: '',
        photoUrl: '',
        email: ''
    });
    const [showCamera, setShowCamera] = useState(false);

    const fileInputRef = useRef(null);


    const isValidImageUrl = (url) => {
        if (!url) return false;
        if (url === 'Not Available') return false;

        try {

            if (url.startsWith('data:image/')) return true;


            if (url.startsWith('/')) return true;


            new URL(url);
            return true;
        } catch {
            return false;
        }
    };


    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const base64String = await fileToBase64(file);
                setUserProfile(prev => ({
                    ...prev,
                    photoUrl: base64String
                }));
            } catch (error) {
                console.error('Error converting image:', error);
            }
        }
    };

    const handleCameraCapture = (photoUrl) => {
        setUserProfile(prev => ({
            ...prev,
            photoUrl: photoUrl
        }));
        setShowCamera(false);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const formData = {
                displayName: userProfile.displayName || '',
                dateOfBirth: userProfile.dateOfBirth || '',
                photoUrl: userProfile.photoUrl || '',
                email: session?.user?.email
            };

            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {

                setUserProfile(prev => ({
                    ...prev,
                    ...data.data
                }));
                setIsEditing(false);

                alert('Profile updated successfully!');
            } else {
                throw new Error(data.error || 'Failed to update profile');
            }

        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message || 'Failed to update profile. Please try again.');
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError('');


                const profileResponse = await fetch('/api/user/profile');
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    setUserProfile({
                        displayName: profileData.displayName || '',
                        dateOfBirth: profileData.dateOfBirth || '',
                        photoUrl: profileData.photoUrl || '',
                        email: profileData.email || session?.user?.email || ''
                    });
                }


                const [ratingsResponse, recommendationsResponse] = await Promise.all([
                    fetch('/api/user/ratings'),
                    fetch('/api/user/recommendations')
                ]);

                if (ratingsResponse.ok) {
                    const ratingsData = await ratingsResponse.json();

                    const cleanedRatings = ratingsData.filter(rating => rating && rating._id).map(rating => ({
                        ...rating,
                        movie: {
                            ...rating.movie,
                            poster_url: isValidImageUrl(rating.movie?.poster_url) ? rating.movie.poster_url : null
                        }
                    }));
                    setUserRatings(cleanedRatings);
                }

                if (recommendationsResponse.ok) {
                    const recommendationsData = await recommendationsResponse.json();

                    const cleanedRecommendations = recommendationsData.filter(movie => movie && movie.movie_id).map(movie => ({
                        ...movie,
                        poster_url: isValidImageUrl(movie.poster_url) ? movie.poster_url : null,

                        unique_id: `rec_${movie.movie_id}_${Math.random().toString(36).substring(2, 9)}`
                    }));
                    setRecommendations(cleanedRecommendations);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load some data');
            } finally {
                setLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchUserData();
        }
    }, [status, session]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center min-h-[600px]">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Please sign in to view your profile</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-red-500 text-center">{error}</div>
            </div>
        );
    }

    return (
        <>
            <NavHeader />
            <div className="container mx-auto px-4 py-8 mt-16">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
                        <span className="block sm:inline">{error}</span>
                        <span
                            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
                            onClick={() => setError('')}
                        >
                            <svg className="h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <title>Close</title>
                                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                            </svg>
                        </span>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                                {isValidImageUrl(userProfile.photoUrl) ? (
                                    <Image
                                        src={userProfile.photoUrl}
                                        alt="Profile"
                                        width={128}
                                        height={128}
                                        className="w-full h-full object-cover rounded-full"
                                        priority
                                    />
                                ) : (
                                    <Image
                                        src="/placeholder.png"
                                        alt="Profile"
                                        width={128}
                                        height={128}
                                        className="w-full h-full object-cover rounded-full"
                                        priority
                                    />
                                )}
                            </div>
                            {isEditing && (
                                <div className="absolute bottom-0 right-0 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-yellow-500 p-2 rounded-full text-white hover:bg-yellow-600 transition-colors"
                                        title="Upload Photo"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCamera(true)}
                                        className="bg-yellow-500 p-2 rounded-full text-white hover:bg-yellow-600 transition-colors"
                                        title="Take Photo"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                            />
                        </div>

                        <div className="flex-1">
                            {isEditing ? (
                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            value={userProfile.displayName}
                                            onChange={(e) => setUserProfile(prev => ({
                                                ...prev,
                                                displayName: e.target.value
                                            }))}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:ring-yellow-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={userProfile.dateOfBirth}
                                            onChange={(e) => setUserProfile(prev => ({
                                                ...prev,
                                                dateOfBirth: e.target.value
                                            }))}
                                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:ring-yellow-500"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            type="submit"
                                            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setError('');
                                            }}
                                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <h1 className="text-2xl font-bold">
                                        {userProfile.displayName || 'Set your display name'}
                                    </h1>
                                    <p className="text-gray-600">
                                        {userProfile.email}
                                    </p>
                                    {userProfile.dateOfBirth && (
                                        <p className="text-gray-600">
                                            Born on {new Date(userProfile.dateOfBirth).toLocaleDateString()}
                                        </p>
                                    )}
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="mt-4 text-yellow-500 hover:text-yellow-600 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Your Ratings & Reviews</h2>
                    {userRatings.length === 0 ? (
                        <div className="text-center text-gray-500">
                            You haven't rated any movies yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userRatings.map((rating, index) => (
                                <div key={`rating-${index}-${rating._id || 'unknown'}`} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <Link href={`/movie/${rating.movie_id || 'unknown'}`}>
                                        <div className="flex">
                                            <div className="w-1/3">
                                                <Image
                                                    src={isValidImageUrl(rating.movie?.poster_url) ? rating.movie.poster_url : "/placeholder.png"}
                                                    alt={rating.movie?.movie_name || 'Movie poster'}
                                                    width={150}
                                                    height={225}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <div className="w-2/3 p-4">
                                                <h3 className="font-semibold text-lg mb-1">
                                                    {rating.movie?.movie_name || 'Unknown Movie'}
                                                </h3>
                                                <p className="text-gray-500 text-sm mb-2">
                                                    {rating.movie?.year || ''}
                                                </p>
                                                <div className="text-yellow-500 mb-2">
                                                    {'★'.repeat(Math.min(5, Math.max(0, rating.rating || 0)))}
                                                    {'☆'.repeat(Math.max(0, 5 - (rating.rating || 0)))}
                                                </div>
                                                {rating.review && (
                                                    <p className="text-gray-700 text-sm line-clamp-3">
                                                        {rating.review}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>


                {recommendations.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {recommendations.map((movie, index) => (
                                <Link
                                    key={`recommendation-${index}-${movie.unique_id || movie.movie_id || index}`}
                                    href={`/movie/${movie.movie_id || 'unknown'}`}
                                    className="transform hover:scale-105 transition-transform duration-200"
                                >
                                    <div className="relative aspect-[2/3]">
                                        <Image
                                            src={isValidImageUrl(movie.poster_url) ? movie.poster_url : "/placeholder.png"}
                                            alt={movie.movie_name || 'Movie poster'}
                                            fill
                                            className="rounded-lg object-cover"
                                        />
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium truncate">
                                        {movie.movie_name || 'Unknown Movie'}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>


            {showCamera && (
                <CameraCapture
                    onCapture={handleCameraCapture}
                    onClose={() => setShowCamera(false)}
                />
            )}
        </>
    );
};

export default ProfilePage;