import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import { formatError } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';

const Playlists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchUserPlaylists();
    }
  }, [user]);

  const fetchUserPlaylists = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/playlist/user/${user._id}`);
      setPlaylists(response.data.data || []);
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylist.name.trim() || !newPlaylist.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setCreating(true);
      const response = await api.post('/playlist', {
        name: newPlaylist.name.trim(),
        description: newPlaylist.description.trim()
      });
      
      setPlaylists(prev => [response.data.data, ...prev]);
      setNewPlaylist({ name: '', description: '' });
      setShowCreateModal(false);
      toast.success('Playlist created successfully');
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setCreating(false);
    }
  };

  const deletePlaylist = async (playlistId, playlistName) => {
    setPlaylistToDelete({ id: playlistId, name: playlistName });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!playlistToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/playlist/${playlistToDelete.id}`);
      setPlaylists(prev => prev.filter(playlist => playlist._id !== playlistToDelete.id));
      toast.success('Playlist deleted successfully');
      setShowDeleteModal(false);
      setPlaylistToDelete(null);
    } catch (error) {
      toast.error(formatError(error));
    } finally {
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

  return (
    <div className="min-h-screen bg-zinc-900 pt-16 lg:ml-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Playlists</h1>
            <p className="text-zinc-400 mt-1">Organize your favorite videos</p>
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Create Playlist
          </button>
        </div>

        {/* Content */}
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist) => (
              <div key={playlist._id} className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors group relative">
                <Link
                  to={`/playlist/${playlist._id}`}
                  className="block"
                >
                  <div className="aspect-video bg-zinc-700 rounded-lg mb-3 flex items-center justify-center">
                    <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-1">{playlist.name}</h3>
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-1">
                    {playlist.description}
                  </p>
                  <p className="text-zinc-500 text-xs">
                    {playlist.video?.length || 0} videos
                  </p>
                </Link>
                
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deletePlaylist(playlist._id, playlist.name);
                  }}
                  className="absolute top-2 right-2 p-2 text-zinc-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 bg-zinc-900 rounded-full"
                  title="Delete playlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No playlists yet</h2>
            <p className="text-zinc-400 mb-6">Create your first playlist to organize your favorite videos</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Create Your First Playlist
            </button>
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Create New Playlist</h2>
            
            <form onSubmit={handleCreatePlaylist}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                  placeholder="Enter playlist name"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white resize-none"
                  placeholder="Enter playlist description"
                  rows="3"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPlaylist({ name: '', description: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {creating && <LoadingSpinner size="sm" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && playlistToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Delete Playlist</h2>
            
            <p className="text-zinc-300 mb-6">
              Are you sure you want to delete <strong>"{playlistToDelete.name}"</strong>? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPlaylistToDelete(null);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-zinc-600 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {deleting && <LoadingSpinner size="sm" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlists;
