'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// This component uses the search params
function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorMessage = (error) => {
        switch (error) {
            case 'Configuration':
                return 'There is a problem with the server configuration.';
            case 'AccessDenied':
                return 'Access denied. You do not have permission to access this resource.';
            case 'Verification':
                return 'The verification token has expired or has already been used.';
            default:
                return 'An error occurred during authentication.';
        }
    };

    return (
        <div>
            <h1 className="text-center text-3xl font-bold text-yellow-500 mb-2">
                Authentication Error
            </h1>
            <p className="text-center text-gray-600 mb-6">
                {getErrorMessage(error)}
            </p>
            <div className="flex justify-center space-x-4">
                <Link
                    href="/auth/signin"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                    Back to Sign In
                </Link>
                <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                    Go to Homepage
                </Link>
            </div>
        </div>
    );
}

export default function AuthError() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <Suspense fallback={
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-yellow-500 mb-2">Loading...</h1>
                    </div>
                }>
                    <ErrorContent />
                </Suspense>
            </div>
        </div>
    );
}