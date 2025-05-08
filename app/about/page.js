'use client';
import NavHeader from '../components/NavHeader';

export default function AboutPage() {
    return (
        <>
            <NavHeader />
            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-center">About BollY BuzZ</h1>

                    <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
                            <p className="text-gray-700">
                                BollY BuzZ was founded with a passion for bringing the magic of Bollywood cinema to audiences worldwide.
                                We believe in the power of Indian cinema to connect, entertain, and inspire people across cultures.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                            <p className="text-gray-700">
                                To create a comprehensive platform that celebrates Indian cinema by providing accurate information,
                                authentic reviews, and a community-driven rating system that helps users discover the best of Bollywood.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Our Goals</h2>
                            <ul className="list-disc list-inside text-gray-700 space-y-2">
                                <li>Provide accurate and up-to-date information about Bollywood movies</li>
                                <li>Create a trusted platform for genuine user reviews and ratings</li>
                                <li>Help users discover movies based on their preferences</li>
                                <li>Promote Indian cinema globally</li>
                                <li>Build a community of movie enthusiasts</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">What Sets Us Apart</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Authentic Reviews</h3>
                                    <p className="text-gray-700">Real reviews from verified users ensuring trustworthy ratings</p>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Comprehensive Database</h3>
                                    <p className="text-gray-700">Extensive collection of Bollywood movies with detailed information</p>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Smart Recommendations</h3>
                                    <p className="text-gray-700">Personalized movie suggestions based on your preferences</p>
                                </div>
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">Community Focus</h3>
                                    <p className="text-gray-700">A platform built for and by movie enthusiasts</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
} 