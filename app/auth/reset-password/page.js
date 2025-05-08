'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '../AuthLayout';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            setMessage('Password reset instructions have been sent to your email');
            setEmail('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="Reset Password">
            <div className="mt-2 text-center">
                <p className="text-gray-900 text-sm">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-50 text-green-500 p-3 rounded-lg text-sm border border-green-100">
                        {message}
                    </div>
                )}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1">
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors sm:text-sm"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            '::placeholder': { color: '#FFFFFF' },
                        }}
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Sending...' : 'Reset Password'}
                    </button>
                </div>

                <div className="text-center">
                    <Link
                        href="/auth/signin"
                        className="text-sm font-medium text-yellow-600 hover:text-yellow-500 transition-colors"
                    >
                        Back to Sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
} 