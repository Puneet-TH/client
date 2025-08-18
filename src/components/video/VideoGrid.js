import React from 'react';
import VideoCard from './VideoCard';
import LoadingSpinner from '../common/LoadingSpinner';
import './VideoGrid.css';

const VideoGrid = ({ videos, loading, layout = 'grid' }) => {
  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="empty-state">
        <h3>No videos found</h3>
        <p>Try adjusting your search or check back later.</p>
      </div>
    );
  }

  return (
    <div className={`videos-container ${layout === 'list' ? 'videos-list' : 'videos-grid'}`}>
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
};

export default VideoGrid;
