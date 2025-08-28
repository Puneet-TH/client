import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import VideoGrid from '../components/video/VideoGrid';
import api from '../services/api';
import { formatError, formatDate } from '../utils/helpers';

const PlaylistDetails = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [videoToRemove, setVideoToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistDetails();
    }
  }, [playlistId]);

  const fetchPlaylistDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/playlist/${playlistId}`);
      const playlistData = response.data.data;
      setPlaylist(playlistData);
      
      // Fetch full video details for each video ID in the playlist
      if (playlistData.video && playlistData.video.length > 0) {
        
        const videoPromises = playlistData.video.map(videoId => 
          api.get(`/videos/${videoId}`).catch(err => {
            return null;
          })
        );
        
        const videoResponses = await Promise.all(videoPromises);
        const validVideos = videoResponses
          .filter(res => res && res.data?.data)
          .map(res => res.data.data);
        
        setVideos(validVideos);
        
        // If some videos failed to load, show a warning
        if (validVideos.length < playlistData.video.length) {
          const missingCount = playlistData.video.length - validVideos.length;
          toast.error(`${missingCount} videos could not be loaded (they may have been deleted or are private)`);
        }
      } else {
        setVideos([]);
      }
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const removeVideoFromPlaylist = async (videoId) => {
    setVideoToRemove(videoId);
    setShowRemoveModal(true);
  };

  const confirmRemoveVideo = async () => {
    if (!videoToRemove) return;

    try {
      setRemoving(true);
      await api.patch(`/playlist/remove/${videoToRemove}/${playlistId}`);
      setVideos(prev => prev.filter(video => video._id !== videoToRemove));
      toast.success('Video removed from playlist');
      setShowRemoveModal(false);
      setVideoToRemove(null);
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setRemoving(false);
    }
  };

  const deletePlaylist = async () => {
    setShowDeleteModal(true);
  };

  const confirmDeletePlaylist = async () => {
    try {
      setDeleting(true);
      await api.delete(`/playlist/${playlistId}`);
      toast.success('Playlist deleted successfully');
      navigate('/playlists');
    } catch (error) {
      toast.error(formatError(error));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Playlist Not Found</h1>
        <p className="text-zinc-400 mb-6">The playlist you're looking for doesn't exist.</p>
        <Link to="/playlists" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
          Back to Playlists
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 pt-16 lg:ml-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Link to="/playlists" className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <span className="text-zinc-400">Playlists</span>
            <span className="text-zinc-400">/</span>
            <span className="text-white">{playlist.name}</span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
            <button
              onClick={deletePlaylist}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Playlist
            </button>
          </div>
          <p className="text-zinc-400 mb-2">{playlist.description}</p>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>{videos.length} videos</span>
            <span>•</span>
            <span>Created {formatDate(playlist.createdAt)}</span>
          </div>
        </div>

        {/* Videos */}
        {videos.length > 0 ? (
          <div className="space-y-4">
            {videos.map((video, index) => (
              <div key={video._id} className="flex gap-4 bg-zinc-800 rounded-lg p-4 hover:bg-zinc-750 transition-colors group">
                <div className="flex items-center justify-center w-8 text-zinc-400 text-sm">
                  {index + 1}
                </div>
                
                <Link
                  to={`/watch/${video._id}`}
                  className="flex gap-4 flex-1 min-w-0"
                >
                  <div className="relative flex-shrink-0 w-40 aspect-video bg-zinc-700 rounded overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-600 flex items-center justify-center">
                        <span className="text-zinc-400 text-xs">No Thumbnail</span>
                      </div>
                    )}
                    {video.duration && (
                      <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white group-hover:text-red-400 transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                      {video.owner?.username || 'Unknown User'}
                    </p>
                    <p className="text-sm text-zinc-500 mt-1">
                      {video.views || 0} views • {formatDate(video.createdAt)}
                    </p>
                    {video.description && (
                      <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                </Link>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeVideoFromPlaylist(video._id);
                  }}
                  className="flex-shrink-0 p-2 text-zinc-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove from playlist"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No videos in this playlist</h2>
            <p className="text-zinc-400 mb-6">Start adding videos to build your collection</p>
            <Link 
              to="/" 
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors inline-block"
            >
              Browse Videos
            </Link>
          </div>
        )}
      </div>

      {/* Remove Video Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Remove Video</h3>
            <p className="text-zinc-300 mb-6">
              Are you sure you want to remove this video from the playlist?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRemoveModal(false);
                  setVideoToRemove(null);
                }}
                disabled={removing}
                className="px-4 py-2 text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveVideo}
                disabled={removing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {removing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Playlist Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Playlist</h3>
            <p className="text-zinc-300 mb-6">
              Are you sure you want to delete this playlist? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePlaylist}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetails;
