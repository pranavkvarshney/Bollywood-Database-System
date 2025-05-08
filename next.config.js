/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'm.media-amazon.com',
            'image.tmdb.org',
            // Add any other domains you're loading images from
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
}

module.exports = nextConfig 