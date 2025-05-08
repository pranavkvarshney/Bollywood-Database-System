'use client';

import Image from 'next/image';
import Link from 'next/link';


function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}


const PLACEHOLDER_IMAGE = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy0vLi44QjhAOEA4Qi4tMkYwRjlDSEhIWUNQTUhNSElISkj/2wBDAR...'; // Add the full base64 string here

const MovieCard = ({ movie }) => {

    const isValidUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };


    const imageUrl = isValidUrl(movie.poster_url)
        ? movie.poster_url
        : PLACEHOLDER_IMAGE;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <Link href={`/movie/${movie.movie_id}`}>
                <div className="relative h-72 w-full">
                    <Image
                        src={imageUrl}
                        alt={movie.movie_name || 'Movie Poster'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                            e.currentTarget.src = '/placeholder.png';
                        }}
                    />
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-semibold truncate">
                        {movie.movie_name || 'Untitled'}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {movie.year || 'Year not available'}
                    </p>
                    <div className="flex items-center mt-2">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{movie.rating || 'N/A'}</span>
                        <span className="text-sm text-gray-500 ml-2">
                            ({movie.votes || 0} votes)
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {movie.genre || 'Genre not available'}
                    </p>
                </div>
            </Link>
        </div>
    );
};

export default MovieCard; 