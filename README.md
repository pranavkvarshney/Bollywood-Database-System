# BollY BuzZ

## Project Overview

BollY BuzZ is a comprehensive web application designed to provide users with a seamless and engaging experience. The application is built using Next.js and integrates with NextAuth for authentication. It offers a range of features including user authentication, profile management, image upload and capture, and user ratings and recommendations. The application is designed with a modern and responsive UI using Tailwind CSS and Framer Motion for animations.

## Features

- **User Authentication**:
  - Sign In: Secure login with email and password.
  - Sign Up: User registration with email verification.
  - Password Reset: Secure password reset functionality.

- **Profile Management**:
  - Update Profile: Users can update their display name, date of birth, and profile picture.
  - Profile Picture: Upload images from the device or capture using the camera.

- **Image Upload and Capture**:
  - Image Upload: Users can upload images from their device.
  - Camera Capture: Users can capture images using their device camera.
  - Image Conversion: Images are converted to base64 strings for storage.

- **User Ratings and Recommendations**:
  - View Ratings: Users can view their ratings.
  - Manage Recommendations: Users can view and manage their recommendations.

- **Responsive Design**:
  - Mobile Friendly: The application is fully responsive and works seamlessly on mobile devices.
  - Modern UI: Designed with Tailwind CSS for a clean and modern look.
  - Animations: Smooth animations using Framer Motion.

## Technologies Used

- **Next.js**: A React framework for server-side rendering and static site generation.
- **NextAuth.js**: Authentication for Next.js applications.
- **React**: A JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Framer Motion**: A library for animations in React.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/bollybuzz.git
    cd bollybuzz
    ```

2. Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

3. Set up environment variables:

    Create a `.env.local` file in the root directory and add the following variables:

    ```env
    NEXTAUTH_URL=http://localhost:3000
    DATABASE_URL=mongodb://localhost:27017/yourdatabase
    ```

4. Run the development server:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `pages/` - Contains the Next.js pages
- `components/` - Contains the React components
- `styles/` - Contains the global styles
- [public](http://_vscodecontentref_/1) - Contains public assets

## Usage

### Authentication

The authentication flow is handled by NextAuth.js. Users can sign in, sign up, and reset their passwords. The authentication state is managed using React hooks and context.

### Profile Management

Users can update their profile information, including their display name, date of birth, and profile picture. The profile picture can be uploaded from the device or captured using the camera.

### Image Upload and Capture

The application supports image upload and capture using the device camera. The images are converted to base64 strings and stored in the user's profile.

### User Ratings and Recommendations

Users can view and manage their ratings and recommendations. The data is fetched from the server and displayed in the user's profile.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License.