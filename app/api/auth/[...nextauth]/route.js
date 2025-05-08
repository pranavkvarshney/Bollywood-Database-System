// /app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
    // Add base URL for proper redirection in production
    baseUrl: process.env.NEXTAUTH_URL || "https://bollybuzz.vercel.app",
    url: process.env.NEXTAUTH_URL || "https://bollybuzz.vercel.app",

    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials");
                    throw new Error('Please enter your email and password');
                }

                try {
                    console.log("Connecting to database...");
                    await connectToDatabase();

                    console.log("Finding user:", credentials.email);
                    const user = await User.findOne({ email: credentials.email }).select('+password');

                    if (!user) {
                        console.log("User not found");
                        throw new Error('Invalid email or password');
                    }

                    console.log("User found, comparing password");
                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isValid) {
                        console.log("Password invalid");
                        throw new Error('Invalid email or password');
                    }

                    console.log("Authentication successful");
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        createdAt: user.createdAt
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    throw new Error(error.message || 'Authentication failed');
                }
            }
        })
    ],
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    // Add explicit cookie configuration
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production"
            }
        }
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.createdAt = user.createdAt;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.name = token.name;
                session.user.createdAt = token.createdAt;
            }
            return session;
        }
    },
    debug: process.env.NODE_ENV === 'development',
    // You can try using the direct secret value for testing
    // secret: "6bf0764e71a5f1cdb6b38900e5639b73f08589e6f10f09a1fc318abbb42897ba",
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };