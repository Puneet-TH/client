import React from 'react';
import { Link } from 'react-router-dom';
import { formatDuration, formatViewCount, timeAgo } from '../../utils/helpers';
import './VideoCard.css';

const VideoCard = ({ video }) => {
  const {
    _id,
    title,
    description,
    thumbnail,
    duration,
    views,
    createdAt,
    owner
  } = video;

  return (
    <div className="video-card">
      <Link to={`/video/${_id}`} className="video-thumbnail">
        <img src={thumbnail} alt={title} />
        <span className="video-duration">{formatDuration(duration)}</span>
      </Link>
      
      <div className="video-info">
        <Link to={`/channel/${owner?.username}`} className="channel-avatar">
          <img src={owner?.avatar} alt={owner?.fullName} />
        </Link>
        
        <div className="video-details">
          <Link to={`/video/${_id}`} className="video-title">
            {title}
          </Link>
          
          <Link to={`/channel/${owner?.username}`} className="channel-name">
            {owner?.fullName}
          </Link>
          
          <div className="video-meta">
            <span>{formatViewCount(views)} views</span>
            <span>•</span>
            <span>{timeAgo(createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
