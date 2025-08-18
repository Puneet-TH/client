import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import VideoGrid from '../components/video/VideoGrid';
import Tweets from '../components/common/Tweets';
import api from '../services/api';
import { formatError, formatDate } from '../utils/helpers';

const UserProfile = () => {
  const { username } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, videosRes] = await Promise.all([
        api.get(`/users/c/${username}`),
        api.get(`/videos/user/${username}`)
      ]);

      setProfile(profileRes.data.data);
      setVideos(videosRes.data.data || []);
      setSubscribersCount(profileRes.data.data.subscribersCount || 0);

      // Check if current user is subscribed to this profile
      if (currentUser && profileRes.data.data._id !== currentUser._id) {
        checkSubscriptionStatus(profileRes.data.data._id);
      }
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async (userId) => {
    try {
      const response = await api.get(`/subscriptions/c/${userId}`);
      setIsSubscribed(response.data.data);
    } catch (error) {
      // Ignore errors for checking subscription status
    }
  };

  const toggleSubscription = async () => {
    if (!currentUser) {
      toast.error('Please login to subscribe');
      return;
    }

    try {
      await api.post(`/subscriptions/c/${profile._id}`);
      setIsSubscribed(!isSubscribed);
      setSubscribersCount(prev => prev + (isSubscribed ? -1 : 1));
      toast.success(isSubscribed ? 'Unsubscribed successfully' : 'Subscribed successfully');
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h1 className="text-2xl font-bold text-white mb-2">User Not Found</h1>
        <p className="text-zinc-400 mb-6">The user profile you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser._id === profile._id;

  return (
    <div className="min-h-screen bg-zinc-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="relative">
            {/* Cover Image */}
            {profile.coverImage && (
              <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-zinc-800">
                <img
                  src={profile.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Profile Info */}
            <div className={`${profile.coverImage ? 'relative -mt-20' : ''} flex flex-col md:flex-row items-start md:items-end gap-6`}>
              <div className="flex-shrink-0">
                <img
                  src={profile.avatar || '/default-avatar.png'}
                  alt={profile.fullname}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-zinc-900 bg-zinc-800"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {profile.fullname}
                </h1>
                <p className="text-zinc-400 mb-2">@{profile.username}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-4">
                  <span>{subscribersCount} subscriber{subscribersCount !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{videos.length} video{videos.length !== 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {isOwnProfile ? (
                    <Link
                      to="/settings"
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </Link>
                  ) : (
                    <button
                      onClick={toggleSubscription}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isSubscribed
                          ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  )}
                  
                  <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-zinc-800 mb-8">
          <nav className="flex space-x-8">
            {['videos', 'playlists', 'tweets'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'videos' && (
            <div>
              {videos.length > 0 ? (
                <VideoGrid videos={videos} />
              ) : (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-zinc-600 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-zinc-400 mb-2">
                    No videos uploaded yet
                  </h3>
                  <p className="text-zinc-500">
                    {isOwnProfile ? 'Upload your first video!' : `${profile.fullname} hasn't uploaded any videos yet.`}
                  </p>
                  {isOwnProfile && (
                    <Link
                      to="/upload"
                      className="inline-block mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Upload Video
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-zinc-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-lg font-medium text-zinc-400 mb-2">
                No playlists created yet
              </h3>
              <p className="text-zinc-500">
                Playlists feature is coming soon!
              </p>
            </div>
          )}

          {activeTab === 'tweets' && (
            <Tweets 
              username={profile?.username} 
              profileUser={profile} 
              isOwnProfile={currentUser?.username === profile?.username} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
