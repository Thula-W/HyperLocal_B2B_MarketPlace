# HyperLocal B2B MarketPlace

A modern B2B marketplace platform built with React, TypeScript, and Firebase, featuring Cloudinary-powered image management.

## Features

- **User Authentication**: Secure sign-up/sign-in with Firebase Auth
- **Product/Service Listings**: Create and manage business listings
- **Image Management**: Cloudinary integration for optimized image storage and delivery
- **Inquiry System**: Direct communication between businesses
- **Profile Management**: Company profiles and user management
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase Firestore, Firebase Auth
- **Image Storage**: Cloudinary
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Cloudinary account

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd HyperLocal_B2B_MarketPlace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase and Cloudinary credentials in the `.env` file.

4. Configure Cloudinary:
   Follow the detailed setup guide in [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md)

5. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication and Firestore
3. Add your Firebase config to `.env`

### Cloudinary Setup
1. Create a Cloudinary account
2. Set up an unsigned upload preset
3. Add your Cloudinary credentials to `.env`

See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for detailed instructions.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── firebase/           # Firebase configuration
├── pages/             # Page components
├── services/          # API services (Firestore, Cloudinary)
└── types/             # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.