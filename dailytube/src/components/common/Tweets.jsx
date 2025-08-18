import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import api from '../../services/api';
import { formatError, formatDate } from '../../utils/helpers';

const Tweets = ({ username, profileUser, isOwnProfile = false }) => {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTweet, setNewTweet] = useState('');
  const [posting, setPosting] = useState(false);
  const [editingTweet, setEditingTweet] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tweetToDelete, setTweetToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTweets();
  }, [username]);

  const fetchTweets = async () => {
    try {
      setLoading(true);
      let endpoint;
      if (username && username !== user?.username) {
        // Fetch tweets for specific user by username
        endpoint = `/tweets/user/${username}`;
      } else {
        // Fetch tweets for current authenticated user
        endpoint = '/tweets/';
      }
      const response = await api.get(endpoint);
      setTweets(response.data.data || []);
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const createTweet = async (e) => {
    e.preventDefault();
    if (!newTweet.trim()) return;

    try {
      setPosting(true);
      const response = await api.post('/tweets/', { content: newTweet });
      setTweets(prev => [response.data.data, ...prev]);
      setNewTweet('');
      toast.success('Tweet posted successfully!');
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setPosting(false);
    }
  };

  const updateTweet = async (tweetId) => {
    if (!editContent.trim()) return;

    try {
      const response = await api.patch(`/tweets/${tweetId}`, { content: editContent });
      setTweets(prev => prev.map(tweet => 
        tweet._id === tweetId ? response.data.data : tweet
      ));
      setEditingTweet(null);
      setEditContent('');
      toast.success('Tweet updated successfully!');
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  const deleteTweet = async (tweetId) => {
    setTweetToDelete(tweetId);
    setShowDeleteModal(true);
  };

  const confirmDeleteTweet = async () => {
    if (!tweetToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/tweets/${tweetToDelete}`);
      setTweets(prev => prev.filter(tweet => tweet._id !== tweetToDelete));
      toast.success('Tweet deleted successfully!');
      setShowDeleteModal(false);
      setTweetToDelete(null);
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setDeleting(false);
    }
  };

  const startEditing = (tweet) => {
    setEditingTweet(tweet._id);
    setEditContent(tweet.content);
  };

  const cancelEditing = () => {
    setEditingTweet(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Create Tweet Form - Only show for own profile */}
      {isOwnProfile && (
        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <form onSubmit={createTweet}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                  placeholder="What's happening?"
                  className="w-full bg-transparent text-white text-xl placeholder-zinc-400 border-none outline-none resize-none"
                  rows={3}
                  maxLength={280}
                />
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-zinc-400">
                    {newTweet.length}/280
                  </span>
                  <button
                    type="submit"
                    disabled={!newTweet.trim() || posting}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-full font-medium transition-colors"
                  >
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tweets List */}
      <div className="space-y-4">
        {tweets.length > 0 ? (
          tweets.map((tweet) => (
            <div key={tweet._id} className="bg-zinc-800 rounded-lg p-6 hover:bg-zinc-750 transition-colors">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {(profileUser?.avatar || user?.avatar) ? (
                    <img
                      src={profileUser?.avatar || user?.avatar}
                      alt={profileUser?.username || user?.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {(profileUser?.username || user?.username)?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-white">{profileUser?.username || user?.username}</span>
                    <span className="text-zinc-400 text-sm">
                      {formatDate(tweet.createdAt)}
                    </span>
                  </div>
                  
                  {editingTweet === tweet._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-zinc-700 text-white p-3 rounded-lg border border-zinc-600 focus:border-red-500 outline-none resize-none"
                        rows={3}
                        maxLength={280}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">
                          {editContent.length}/280
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={cancelEditing}
                            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => updateTweet(tweet._id)}
                            disabled={!editContent.trim()}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-white whitespace-pre-wrap">{tweet.content}</p>
                      
                      {/* Tweet Actions - Only show for own tweets */}
                      {isOwnProfile && (
                        <div className="flex items-center gap-4 mt-3 text-zinc-400">
                          <button
                            onClick={() => startEditing(tweet)}
                            className="flex items-center gap-1 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTweet(tweet._id)}
                            className="flex items-center gap-1 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No tweets yet</h2>
            <p className="text-zinc-400">
              {isOwnProfile ? "Start sharing your thoughts with the community!" : "This user hasn't posted any tweets yet."}
            </p>
          </div>
        )}
      </div>

      {/* Delete Tweet Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Tweet</h3>
            <p className="text-zinc-300 mb-6">
              Are you sure you want to delete this tweet? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTweetToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2 text-zinc-300 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTweet}
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

export default Tweets;
