import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import VideoGrid from '../components/video/VideoGrid';
import EditVideoModal from '../components/video/EditVideoModal';
import api from '../services/api';
import { formatError, formatDate, formatDuration, formatViewCount, getSecureUrl } from '../utils/helpers';

const VideoWatch = () => {
  const { videoId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [viewsIncremented, setViewsIncremented] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (videoId) {
      setViewsIncremented(false); // Reset view tracking for new video
      fetchVideoData();
    }
  }, [videoId]);

  // Check like status immediately when user and videoId are available
  useEffect(() => {
    if (user && videoId) {
      checkLikeStatus();
    }
  }, [user, videoId]);

  // Increment views when video is loaded and ready to be watched
  useEffect(() => {
    if (video && !viewsIncremented) {
      // Add a small delay to ensure the video is actually being watched
      const timer = setTimeout(() => {
        incrementViews();
      }, 2000); // 2 second delay to indicate genuine viewing intent

      return () => clearTimeout(timer);
    }
  }, [video, viewsIncremented]);

  const checkLikeStatus = async () => {
    try {
      const likedVideosRes = await api.get('/likes/videos');
      const likedVideos = likedVideosRes.data.data || [];
      
      const isVideoLiked = likedVideos.some(likedVideo => 
        String(likedVideo._id) === String(videoId)
      );
      setIsLiked(isVideoLiked);
    } catch (error) {
      setIsLiked(false);
    }
  };

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      
      // Fetch video data first (most important)
      const videoRes = await api.get(`/videos/${videoId}`);
      setVideo(videoRes.data.data);
      
      // Fetch comments and related videos separately with error handling
      try {
        const commentsRes = await api.get(`/comments/${videoId}`);
        const commentsData = commentsRes.data?.data;
        // Extract comments from paginated response (comments are in 'docs' array)
        const commentsArray = commentsData?.docs || [];
        setComments(Array.isArray(commentsArray) ? commentsArray : []);
      } catch (commentsError) {
        setComments([]); // Ensure comments is always an array
      }
      
      try {
        const relatedRes = await api.get('/videos', { params: { limit: 12 } });
        const relatedData = relatedRes.data?.data?.docs;
        setRelatedVideos(Array.isArray(relatedData) ? relatedData.filter(v => v._id !== videoId) : []);
      } catch (relatedError) {
        setRelatedVideos([]);
      }

      // Check if user liked this video and subscribed to channel
      if (user) {
        checkUserInteractions();
      }
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    if (viewsIncremented || !videoId) return;

    try {
      setViewsIncremented(true);
      await api.patch(`/videos/${videoId}/views`);
      // Update local video state to reflect new view count
      setVideo(prev => prev ? { ...prev, views: prev.views + 1 } : null);
    } catch (error) {
      // Reset the flag if the request failed so it can be retried
      setViewsIncremented(false);
    }
  };

  const checkUserInteractions = async () => {
    try {
      // Only check subscription status - like status is handled separately
      if (video?.owner?._id) {
        const subRes = await api.get(`/subscriptions/c/${video.owner._id}`).catch(() => ({ data: { data: false } }));
        setIsSubscribed(subRes.data.data);
      }
    } catch (error) {
      // Ignore errors for checking interactions
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast.error('Please login to like videos');
      return;
    }

    try {
      const response = await api.post(`/likes/toggle/v/${videoId}`);
      const newLikedState = response.data.data.liked;
      
      setIsLiked(newLikedState);
      setVideo(prev => ({
        ...prev,
        likesCount: prev.likesCount + (newLikedState ? 1 : -1)
      }));
      
      toast.success(newLikedState ? 'Video liked!' : 'Video unliked');
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const toggleSubscription = async () => {
    if (!user) {
      toast.error('Please login to subscribe');
      return;
    }

    try {
      await api.post(`/subscriptions/c/${video.owner._id}`);
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const fetchUserPlaylists = async () => {
    if (!user) return;
    
    try {
      setLoadingPlaylists(true);
      const response = await api.get(`/playlist/user/${user._id}`);
      setUserPlaylists(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch playlists');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const addToPlaylist = async (playlistId) => {
    try {
      await api.patch(`/playlist/add/${videoId}/${playlistId}`);
      toast.success('Video added to playlist');
      setShowPlaylistModal(false);
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const openPlaylistModal = () => {
    if (!user) {
      toast.error('Please login to add to playlist');
      return;
    }
    setShowPlaylistModal(true);
    fetchUserPlaylists();
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await api.post(`/comments/${videoId}`, {
        content: commentText.trim()
      });
      setComments(prev => [response.data.data, ...prev]);
      setCommentText('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setSubmittingComment(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!user) {
      toast.error('Please login to delete comments');
      return;
    }

    try {
      setDeletingComment(commentId);
      await api.delete(`/comments/c/${commentId}`);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setDeletingComment(null);
    }
  };

  const handleVideoUpdate = (updatedVideo) => {
    setVideo(prev => ({
      ...prev,
      ...updatedVideo
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-center">
        <div className="text-6xl mb-4">📹</div>
        <h1 className="text-2xl font-bold text-white mb-2">Video Not Found</h1>
        <p className="text-zinc-400 mb-6">The video you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <video
                className="w-full h-full"
                controls
                poster={getSecureUrl(video.thumbnail)}
                preload="metadata"
                onError={(e) => {
                  toast.error('Error playing video. Please try again.');
                }}
                onPlay={() => {
                  // Increment views when video actually starts playing
                  if (!viewsIncremented) {
                    incrementViews();
                  }
                }}
                onLoadStart={() => {
                  // Video loading started
                }}
                onCanPlay={() => {}}
                onLoadedData={() => {}}
              >
                <source src={getSecureUrl(video.videoFile)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Info */}
            <div className="mb-6">
              <h1 className="text-xl lg:text-2xl font-bold text-white mb-2 leading-tight">
                {video.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-4">
                <span>{formatViewCount(video.views)} views</span>
                <span>•</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                      isLiked 
                        ? 'bg-red-600 text-white' 
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    <svg className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {isLiked ? 'Liked' : 'Like'}
                  </button>
                  
                  <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>

                  <button 
                    onClick={openPlaylistModal}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add to Playlist
                  </button>
                </div>
              </div>
            </div>

            {/* Channel Info */}
            <div className="border border-zinc-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link to={`/c/${video.owner.username}`}>
                    <img
                      src={video.owner.avatar || '/default-avatar.png'}
                      alt={video.owner.fullname}
                      className="h-12 w-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  </Link>
                  <div>
                    <Link to={`/c/${video.owner.username}`}>
                      <h3 className="font-semibold text-white hover:text-gray-300 transition-colors cursor-pointer">{video.owner.fullname}</h3>
                    </Link>
                    <Link to={`/c/${video.owner.username}`}>
                      <p className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer">@{video.owner.username}</p>
                    </Link>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {user?._id === video.owner._id ? (
                    // Edit button for video owner
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  ) : (
                    // Subscribe button for other users
                    <button
                      onClick={toggleSubscription}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                        isSubscribed
                          ? 'bg-zinc-700 text-white hover:bg-zinc-600'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              {video.description && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className={`text-zinc-300 whitespace-pre-wrap ${
                    showDescription ? '' : 'line-clamp-3'
                  }`}>
                    {video.description}
                  </div>
                  {video.description.length > 200 && (
                    <button
                      onClick={() => setShowDescription(!showDescription)}
                      className="text-zinc-400 hover:text-white text-sm mt-2"
                    >
                      {showDescription ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                Comments ({comments.length})
              </h2>

              {/* Comment Form */}
              {user && (
                <form onSubmit={submitComment} className="mb-6">
                  <div className="flex gap-3">
                    <img
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.fullname}
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-zinc-400 resize-none"
                        rows="3"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setCommentText('')}
                          className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!commentText.trim() || submittingComment}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          {submittingComment && <LoadingSpinner size="sm" />}
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {Array.isArray(comments) && comments.map((comment) => (
                  <div key={comment._id} className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 hover:border-zinc-600/50 transition-colors">
                    <div className="flex gap-3">
                      <Link 
                        to={`/c/${comment.owner?.username}`}
                        className="flex-shrink-0"
                      >
                        <img
                          src={comment.owner?.avatar || '/default-avatar.png'}
                          alt={comment.owner?.username || 'User'}
                          className="h-10 w-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-red-500/50 transition-all"
                        />
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/c/${comment.owner?.username}`}
                              className="font-medium text-white text-sm hover:text-red-400 cursor-pointer transition-colors"
                            >
                              {comment.owner?.username || 'Unknown User'}
                            </Link>
                            <span className="text-xs text-zinc-400">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          
                          {/* Delete button - only show for comment owner */}
                          {user && user._id === comment.owner?._id && (
                            <button
                              onClick={() => deleteComment(comment._id)}
                              disabled={deletingComment === comment._id}
                              className="text-zinc-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-zinc-700/50 disabled:opacity-50"
                              title="Delete comment"
                            >
                              {deletingComment === comment._id ? (
                                <div className="w-4 h-4 border border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                        <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <div className="text-center py-8 text-zinc-400">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-white mb-4">Up Next</h2>
            <div className="space-y-3">
              {relatedVideos.slice(0, 10).map((relatedVideo) => (
                <Link
                  key={relatedVideo._id}
                  to={`/watch/${relatedVideo._id}`}
                  className="flex gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group"
                >
                  <div className="relative flex-shrink-0 w-40 aspect-video bg-zinc-800 rounded overflow-hidden">
                    {relatedVideo.thumbnail ? (
                      <img
                        src={getSecureUrl(relatedVideo.thumbnail)}
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                        <span className="text-zinc-500 text-xs">No Thumbnail</span>
                      </div>
                    )}
                    {relatedVideo.duration && (
                      <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                        {formatDuration(relatedVideo.duration)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
                      {relatedVideo.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      {relatedVideo.owner?.username}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {formatViewCount(relatedVideo.views)} views • {formatDate(relatedVideo.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add to Playlist</h2>
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingPlaylists ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : userPlaylists.length > 0 ? (
              <div className="space-y-3">
                {userPlaylists.map((playlist) => (
                  <div
                    key={playlist._id}
                    onClick={() => addToPlaylist(playlist._id)}
                    className="flex items-center gap-3 p-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-zinc-600 rounded flex items-center justify-center">
                      <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{playlist.name}</h3>
                      <p className="text-zinc-400 text-sm">{playlist.video?.length || 0} videos</p>
                    </div>
                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-zinc-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">No Playlists</h3>
                <p className="text-zinc-400 mb-4">Create a playlist to organize your videos</p>
                <button
                  onClick={() => {
                    setShowPlaylistModal(false);
                    // You could navigate to playlists page or open create modal
                    window.location.href = '/playlists';
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Create Playlist
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      <EditVideoModal
        video={video}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onVideoUpdate={handleVideoUpdate}
      />
    </div>
  );
};

export default VideoWatch;
