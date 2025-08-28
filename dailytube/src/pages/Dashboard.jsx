import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProtectedRoute from '../components/common/ProtectedRoute';
import VideoCard from '../components/video/VideoCard';
import api from '../services/api';
import { formatError, formatDate, formatViewCount } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalSubscribers: 0,
    totalLikes: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [videosRes, statsRes] = await Promise.all([
        api.get('/videos/user/me'),
        api.get('/dashboard/stats').catch(() => ({ data: { data: stats } })) // Fallback if stats API doesn't exist
      ]);

      // Handle paginated response
      const videosData = videosRes.data.data.docs || videosRes.data.data || [];
      setVideos(videosData);
      
      // Map API response fields to frontend state fields
      const apiStats = statsRes.data.data;
      if (apiStats) {
        setStats({
          totalVideos: apiStats.totalvideos || 0,
          totalViews: apiStats.viewsCount || 0,
          totalSubscribers: apiStats.subscribersCount || 0,
          totalLikes: apiStats.likesCount || 0
        });
      } else {
        setStats(stats);
      }
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/videos/${videoId}`);
      setVideos(prev => prev.filter(video => video._id !== videoId));
      setStats(prev => ({
        ...prev,
        totalVideos: prev.totalVideos - 1
      }));
      toast.success('Video deleted successfully');
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const togglePublishStatus = async (videoId, currentStatus) => {
    try {
      await api.patch(`/videos/toggle/publish/${videoId}`);
      setVideos(prev => prev.map(video => 
        video._id === videoId 
          ? { ...video, isPublished: !currentStatus }
          : video
      ));
      toast.success(`Video ${currentStatus ? 'unpublished' : 'published'} successfully`);
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-screen bg-zinc-900">
          <LoadingSpinner size="lg" />
        </div>
      </ProtectedRoute>
    );
  }

  const tabs = [
    { id: 'videos', name: 'Content', count: stats.totalVideos },
    { id: 'analytics', name: 'Analytics', count: null },
    { id: 'comments', name: 'Comments', count: null },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-900 pt-16 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Creator Dashboard</h1>
                <p className="text-zinc-400">Manage your content and view analytics</p>
              </div>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Video
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Total Videos</p>
                  <p className="text-2xl font-bold text-white">{stats.totalVideos}</p>
                </div>
                <div className="w-12 h-12 bg-red-600 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Total Views</p>
                  <p className="text-2xl font-bold text-white">{formatViewCount(stats.totalViews)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Subscribers</p>
                  <p className="text-2xl font-bold text-white">{formatViewCount(stats.totalSubscribers)}</p>
                </div>
                <div className="w-12 h-12 bg-green-600 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Total Likes</p>
                  <p className="text-2xl font-bold text-white">{formatViewCount(stats.totalLikes)}</p>
                </div>
                <div className="w-12 h-12 bg-pink-600 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-zinc-800 mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-500'
                      : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-300'
                  }`}
                >
                  {tab.name}
                  {tab.count !== null && (
                    <span className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'videos' && (
              <div>
                {videos.length > 0 ? (
                  <div className="space-y-4">
                    {videos.map((video) => (
                      <div key={video._id} className="bg-zinc-800 rounded-lg p-4 flex gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-40 h-24 object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white truncate">{video.title}</h3>
                              <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
                                {video.description || 'No description'}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                                <span>{formatViewCount(video.views)} views</span>
                                <span>•</span>
                                <span>{formatDate(video.createdAt)}</span>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded-full ${
                                  video.isPublished 
                                    ? 'bg-green-900 text-green-300' 
                                    : 'bg-yellow-900 text-yellow-300'
                                }`}>
                                  {video.isPublished ? 'Published' : 'Draft'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/watch/${video._id}`}
                                className="p-2 text-zinc-400 hover:text-white transition-colors"
                                title="Watch"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Link>
                              <button
                                onClick={() => togglePublishStatus(video._id, video.isPublished)}
                                className="p-2 text-zinc-400 hover:text-white transition-colors"
                                title={video.isPublished ? 'Unpublish' : 'Publish'}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={video.isPublished ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteVideo(video._id)}
                                className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    <h3 className="text-lg font-medium text-zinc-400 mb-2">No videos uploaded</h3>
                    <p className="text-zinc-500 mb-6">Upload your first video to get started!</p>
                    <Link
                      to="/upload"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Upload Video
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-zinc-400 mb-2">Analytics Coming Soon</h3>
                <p className="text-zinc-500">Detailed analytics and insights will be available soon!</p>
              </div>
            )}

            {activeTab === 'comments' && (
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-zinc-400 mb-2">Comment Management Coming Soon</h3>
                <p className="text-zinc-500">Manage all your video comments in one place!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
