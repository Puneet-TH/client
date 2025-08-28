import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import VideoGrid from '../components/video/VideoGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import { formatError } from '../utils/helpers';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVideos = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(!append);
      const params = {
        page: pageNum,
        limit: 12
      };
      
      if (searchQuery) {
        params.query = searchQuery;
      }

      const response = await api.get('/videos', { params });
      const newVideos = response.data.data.docs;
      
      if (append) {
        setVideos(prev => [...prev, ...newVideos]);
      } else {
        setVideos(newVideos);
      }
      
      setHasMore(response.data.data.hasNextPage);
      setPage(pageNum);
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const loadMoreVideos = useCallback(() => {
    if (hasMore && !loading) {
      fetchVideos(page + 1, true);
    }
  }, [hasMore, loading, page, fetchVideos]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setPage(1);
    setHasMore(true);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
    setHasMore(true);
  };

  return (
    <div className="min-h-screen bg-zinc-900 pt-16 lg:ml-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Trending Videos'}
          </h1>
          {searchQuery && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-zinc-400">
                {videos.length} video{videos.length !== 1 ? 's' : ''} found
              </p>
              <button
                onClick={clearSearch}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && page === 1 && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* No videos found */}
        {!loading && videos.length === 0 && (
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
              {searchQuery ? 'No videos found' : 'No videos available'}
            </h3>
            <p className="text-zinc-500">
              {searchQuery 
                ? 'Try searching with different keywords' 
                : 'Be the first to upload a video!'
              }
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Videos Grid */}
        {videos.length > 0 && (
          <>
            <VideoGrid videos={videos} />
            
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMoreVideos}
                  disabled={loading}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading && <LoadingSpinner size="sm" />}
                  {loading ? 'Loading...' : 'Load More Videos'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
