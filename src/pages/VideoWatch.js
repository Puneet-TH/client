import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { videoService, likeService, subscriptionService, commentService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatViewCount, timeAgo } from '../utils/helpers';
import { ThumbsUp, ThumbsDown, Share, Download, MessageCircle, Send } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './VideoWatch.css';

const VideoWatch = () => {
  const { videoId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (videoId) {
      fetchVideo();
      fetchComments();
    }
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await videoService.getVideoById(videoId);
      setVideo(response.data.data);
      // You would need to implement these in the backend
      // setIsLiked(response.data.data.isLiked);
      // setIsSubscribed(response.data.data.isSubscribed);
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await commentService.getVideoComments(videoId);
      setComments(response.data.data.docs || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like videos');
      return;
    }

    try {
      await likeService.toggleVideoLike(videoId);
      setIsLiked(!isLiked);
      toast.success(isLiked ? 'Removed from liked videos' : 'Added to liked videos');
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      return;
    }

    try {
      await subscriptionService.toggleSubscription(video.owner._id);
      setIsSubscribed(!isSubscribed);
      toast.success(isSubscribed ? 'Unsubscribed successfully' : 'Subscribed successfully');
    } catch (error) {
      console.error('Error toggling subscription:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await commentService.addComment(videoId, newComment);
      setNewComment('');
      fetchComments();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  if (!video) {
    return (
      <div className="error-container">
        <h2>Video not found</h2>
        <p>The video you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="video-watch-container">
      <div className="video-player-section">
        <div className="video-player">
          <video
            controls
            width="100%"
            height="100%"
            src={video.videoFile}
            poster={video.thumbnail}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="video-info">
          <h1 className="video-title">{video.title}</h1>
          
          <div className="video-stats">
            <div className="video-meta">
              <span>{formatViewCount(video.views)} views</span>
              <span>•</span>
              <span>{timeAgo(video.createdAt)}</span>
            </div>

            <div className="video-actions">
              <button
                className={`action-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <ThumbsUp size={20} />
                <span>Like</span>
              </button>
              
              <button className="action-btn">
                <ThumbsDown size={20} />
                <span>Dislike</span>
              </button>
              
              <button className="action-btn">
                <Share size={20} />
                <span>Share</span>
              </button>
              
              <button className="action-btn">
                <Download size={20} />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="channel-info">
            <div className="channel-details">
              <img
                src={video.owner.avatar}
                alt={video.owner.fullName}
                className="channel-avatar"
              />
              <div className="channel-text">
                <h3 className="channel-name">{video.owner.fullName}</h3>
                <p className="channel-subscribers">
                  {video.owner.subscribersCount} subscribers
                </p>
              </div>
            </div>
            
            {user?._id !== video.owner._id && (
              <button
                className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
                onClick={handleSubscribe}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>

          <div className="video-description">
            <p>{video.description}</p>
          </div>
        </div>
      </div>

      <div className="comments-section">
        <h3 className="comments-title">
          <MessageCircle size={20} />
          Comments ({comments.length})
        </h3>

        {isAuthenticated && (
          <form className="comment-form" onSubmit={handleAddComment}>
            <img
              src={user.avatar}
              alt={user.fullName}
              className="comment-avatar"
            />
            <div className="comment-input-container">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
                rows={2}
              />
              <div className="comment-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setNewComment('')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Send size={16} />
                  Comment
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="comments-list">
          {commentsLoading ? (
            <LoadingSpinner size="medium" />
          ) : comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="comment-item">
                <img
                  src={comment.owner.avatar}
                  alt={comment.owner.fullName}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{comment.owner.fullName}</span>
                    <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoWatch;
