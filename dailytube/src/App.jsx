import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VideoWatch from './pages/VideoWatch';
import VideoUpload from './pages/VideoUpload';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Channel from './pages/Channel';
import History from './pages/History';
import LikedVideos from './pages/LikedVideos';
import Playlists from './pages/Playlists';
import PlaylistDetails from './pages/PlaylistDetails';
import Subscriptions from './pages/Subscriptions';
import TweetsPage from './pages/TweetsPage';

// 404 Page Component
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-center">
    <div className="text-8xl mb-4">404</div>
    <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
    <p className="text-zinc-400 mb-8">The page you're looking for doesn't exist.</p>
    <a
      href="/"
      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
    >
      Go Back Home
    </a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="min-h-screen bg-zinc-900">
          <Routes>
            {/* Auth Routes (no header) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Main Routes (with header) */}
            <Route path="*" element={
              <>
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/watch/:videoId" element={<VideoWatch />} />
                    <Route path="/upload" element={<VideoUpload />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/user/:username" element={<UserProfile />} />
                    <Route path="/c/:username" element={<Channel />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/liked" element={<LikedVideos />} />
                    <Route path="/playlists" element={<Playlists />} />
                    <Route path="/playlist/:playlistId" element={<PlaylistDetails />} />
                    <Route path="/tweets" element={<TweetsPage />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </>
            } />
          </Routes>

          {/* Global Toast Notifications */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#27272a',
                color: '#fff',
                border: '1px solid #3f3f46',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
