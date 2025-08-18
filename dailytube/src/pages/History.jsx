import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import VideoGrid from '../components/video/VideoGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import { formatError } from '../utils/helpers';

const History = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchHistory();
  }, []);

  const fetchWatchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/history');
      setVideos(response.data.data || []);
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      // TODO: Add clear history API endpoint in backend
      toast.success('History cleared');
      setVideos([]);
    } catch (error) {
      toast.error('Failed to clear history');
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
    <div className="min-h-screen bg-zinc-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Watch History</h1>
            <p className="text-zinc-400 mt-1">Videos you've watched recently</p>
          </div>
          
          {videos.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Clear History
            </button>
          )}
        </div>

        {/* Content */}
        {videos.length > 0 ? (
          <VideoGrid 
            videos={videos} 
            loading={false}
            emptyMessage="No videos in your watch history"
          />
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No watch history</h2>
            <p className="text-zinc-400 mb-6">Videos you watch will appear here</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Start Watching
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
