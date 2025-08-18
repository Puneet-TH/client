import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import VideoGrid from '../components/video/VideoGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import { formatError } from '../utils/helpers';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');
  
  const [videos, setVideos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [page, setPage] = useState(1);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [channelSearchInput, setChannelSearchInput] = useState('');

  const navigateToChannel = useCallback(() => {
    if (channelSearchInput.trim()) {
      navigate(`/c/${channelSearchInput.trim()}`);
    }
  }, [channelSearchInput, navigate]);

  const searchContent = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(!append);
      
      // Search videos
      const videoParams = {
        query: query,
        page: pageNum,
        limit: 12
      };

      const [videosRes] = await Promise.all([
        api.get('/videos', { params: videoParams }),
        // We'll add user search later
      ]);

      const newVideos = videosRes.data.data.docs;
      
      if (append) {
        setVideos(prev => [...prev, ...newVideos]);
      } else {
        setVideos(newVideos);
      }
      
      setHasMoreVideos(videosRes.data.data.hasNextPage);
      setPage(pageNum);
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (query) {
      searchContent();
    }
  }, [query, searchContent]);

  const loadMoreVideos = useCallback(() => {
    if (hasMoreVideos && !loading) {
      searchContent(page + 1, true);
    }
  }, [hasMoreVideos, loading, page, searchContent]);

  if (loading && videos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Search results for "{query}"
          </h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-6 border-b border-zinc-700">
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'videos'
                  ? 'text-white border-red-600'
                  : 'text-zinc-400 border-transparent hover:text-white'
              }`}
            >
              Videos ({videos.length})
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'channels'
                  ? 'text-white border-red-600'
                  : 'text-zinc-400 border-transparent hover:text-white'
              }`}
            >
              Channels ({users.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'videos' && (
          <div>
            {videos.length > 0 ? (
              <>
                <VideoGrid 
                  videos={videos} 
                  loading={loading}
                  emptyMessage={`No videos found for "${query}"`}
                />
                
                {hasMoreVideos && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMoreVideos}
                      disabled={loading}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-zinc-400 mb-4">
                  <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No videos found</h3>
                  <p className="text-zinc-400">Try searching with different keywords</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'channels' && (
          <div>
            {/* Channel search hint */}
            <div className="bg-zinc-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-white mb-2">Search for Channels</h3>
              <p className="text-zinc-400 mb-4">
                To view a specific channel, search for their username. For example, try searching for a username like "john" or "creator123".
              </p>
              
              {/* Quick channel navigation */}
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Enter username to visit channel..."
                  value={channelSearchInput}
                  onChange={(e) => setChannelSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && navigateToChannel()}
                  className="flex-1 px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-red-600"
                />
                <button
                  onClick={navigateToChannel}
                  disabled={!channelSearchInput.trim()}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Visit Channel
                </button>
              </div>
            </div>

            {/* Search suggestion */}
            <div className="text-center py-8">
              <div className="text-zinc-400">
                <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-zinc-400">
                  Type "{query}" in the channel search above if you think it's a username, or search for videos in the Videos tab.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
