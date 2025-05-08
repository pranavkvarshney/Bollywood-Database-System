import { withAuth } from 'next-auth/middleware';

export default withAuth(
    function middleware(req) {
        return;
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
        pages: {
            signIn: '/auth/signin',
        },
    }
);

export const config = {
    matcher: [
        '/profile',
        '/api/profile/:path*',
        '/api/ratings/:path*'
    ]
}; 