import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import VideoCard from '../components/video/VideoCard';
import Tweets from '../components/common/Tweets';
import { formatError } from '../utils/helpers';
import api from '../services/api';

const Channel = () => {
  const { username } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');

  // Debug: log token and currentUser
  useEffect(() => {
    console.log('TOKEN:', localStorage.getItem('token'));
    console.log('currentUser:', currentUser);
  }, [currentUser]);

  useEffect(() => {
    fetchChannelData();
  }, [username]);

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const response = await api.get(`/users/c/${username}`);
      console.log(response)
      if (response.data && response.data.data) {
        setChannelData(response.data.data);
      } else {
        throw new Error('Channel not found');
      }
    } catch (error) {
      setChannelData(null); // Ensure channelData is null on error
      if (error.response?.status === 404) {
        setError('Channel not found');
        toast.error(`Channel "${username}" does not exist`);
      } else {
        setError('Failed to load channel');
        toast.error(formatError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count?.toString() || '0';
  };

  const handleSubscribe = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to subscribe');
        return;
      }

      await api.post(`/subscriptions/c/${channelData._id}`);

      // Re-fetch channel data to get updated isSubscribed and SubscribersCount
      await fetchChannelData();

      toast.success(
        channelData && channelData.isSubscribed ? 'Unsubscribed' : 'Subscribed!'
      );
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{error}</h2>
          <p className="text-gray-400">
            {error === 'Channel not found' 
              ? `The channel "@${username}" doesn't exist.`
              : 'There was a problem loading the channel.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16 lg:ml-64">
      {/* Channel Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-red-900 to-red-700">
          {channelData.coverImage && (
            <img 
              src={channelData.coverImage} 
              alt={`${channelData.fullName} cover`}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Channel Info */}
        <div className="px-4 py-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={channelData.avatar || '/default-avatar.png'}
                alt={channelData.fullName}
                className="w-32 h-32 rounded-full border-4 border-red-600"
              />
            </div>

            {/* Channel Details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{channelData.fullName}</h1>
              <p className="text-gray-400 mb-2">@{channelData.username}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span>{formatViewCount(channelData.SubscribersCount)} subscribers</span>
              </div>

              {/* Subscribe Button */}
              <button
                onClick={handleSubscribe}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                  channelData.isSubscribed
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {channelData.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>

        {/* Channel Navigation */}
        <div className="border-b border-gray-700">
          <div className="px-4 max-w-7xl mx-auto">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('videos')}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === 'videos'
                    ? 'border-red-600 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setActiveTab('tweets')}
                className={`py-4 px-2 border-b-2 transition-colors ${
                  activeTab === 'tweets'
                    ? 'border-red-600 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                Tweets
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Channel Content */}
      <div className="px-4 py-6 max-w-7xl mx-auto">
        {activeTab === 'videos' && (
          <div>
            {channelData.videos && channelData.videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {channelData.videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">This channel has no videos yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tweets' && (
          <Tweets username={channelData.username} profileUser={channelData} isOwnProfile={false} />
        )}
      </div>
    </div>
  );
};

export default Channel;
