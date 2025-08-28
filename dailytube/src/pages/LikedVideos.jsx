import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import VideoGrid from '../components/video/VideoGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import { formatError } from '../utils/helpers';

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/likes/videos');
      setVideos(response.data.data || []);
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const clearAllLikes = async () => {
    if (!confirm('Are you sure you want to unlike all videos? This action cannot be undone.')) {
      return;
    }

    try {
      setClearingAll(true);
      // Unlike all videos by calling toggle on each
      await Promise.all(
        videos.map(video => api.post(`/likes/toggle/v/${video._id}`))
      );
      setVideos([]);
      toast.success('All videos unliked successfully');
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setClearingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 pt-16 lg:ml-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Liked Videos</h1>
            <p className="text-zinc-400 mt-1">Videos you've liked ({videos.length})</p>
          </div>
          {videos.length > 0 && (
            <button
              onClick={clearAllLikes}
              disabled={clearingAll}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {clearingAll && <LoadingSpinner size="sm" />}
              Unlike All
            </button>
          )}
        </div>

        {/* Content */}
        {videos.length > 0 ? (
          <VideoGrid 
            videos={videos} 
            loading={false}
            emptyMessage="No liked videos"
          />
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No liked videos</h2>
            <p className="text-zinc-400 mb-6">Videos you like will appear here</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Discover Videos
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedVideos;
