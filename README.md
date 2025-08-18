# DailyTube Frontend

A modern React-based frontend application for the DailyTube video platform, similar to YouTube.

## Features

- 🔐 User authentication (login/register)
- 📹 Video upload and streaming
- 👍 Like/dislike videos
- 💬 Comments system
- 📺 Subscriptions
- 📱 Responsive design
- 🌙 Dark theme
- 🔍 Video search
- 📊 User dashboard
- 🎭 User profiles

## Tech Stack

- **React** - Frontend framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **CSS3** - Styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 8000

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── common/         # Common components (Header, Footer, etc.)
│   └── video/          # Video-related components
├── contexts/           # React contexts (Auth, etc.)
├── pages/              # Page components
├── services/           # API services
├── utils/              # Utility functions
├── App.js              # Main app component
├── App.css             # Global styles
└── index.js            # Entry point
```

## API Integration

The frontend communicates with the backend API running on `http://localhost:8000/api/v1`. Key endpoints include:

- `/users` - User authentication and management
- `/videos` - Video operations
- `/comments` - Comment system
- `/likes` - Like/dislike functionality
- `/subscriptions` - User subscriptions
- `/playlists` - Playlist management

## Environment Variables

Create a `.env` file in the client directory:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## Features Implementation

### Authentication
- JWT-based authentication
- Automatic token refresh
- Protected routes
- User session management

### Video Management
- Video upload with progress tracking
- Video streaming
- Thumbnail generation
- Video metadata management

### Social Features
- Like/dislike system
- Comment system
- Subscription management
- User profiles

### UI/UX
- Dark theme
- Responsive design
- Loading states
- Error handling
- Toast notifications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
