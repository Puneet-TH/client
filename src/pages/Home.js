import React, { useState, useEffect } from 'react';
import { videoService } from '../services/api';
import VideoGrid from '../components/video/VideoGrid';
import './Home.css';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async (pageNum = 1, append = false) => {
    try {
      setLoading(!append);
      const response = await videoService.getAllVideos(pageNum, 12);
      const newVideos = response.data.data.docs || [];
      
      if (append) {
        setVideos(prev => [...prev, ...newVideos]);
      } else {
        setVideos(newVideos);
      }
      
      setHasMore(newVideos.length === 12);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching videos:', error);
      // Don't show error toast for unauthenticated requests on home page
      if (error.response?.status !== 401) {
        // Handle other errors if needed
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchVideos(page + 1, true);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Trending Videos</h1>
      </div>
      
      <VideoGrid videos={videos} loading={loading && page === 1} />
      
      {hasMore && videos.length > 0 && (
        <div className="load-more-container">
          <button 
            className="load-more-btn"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
