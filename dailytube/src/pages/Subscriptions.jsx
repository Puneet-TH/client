import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';
import { formatError } from '../utils/helpers';
import { useAuth } from '../contexts/AuthContext';

const Subscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/subscriptions/u/${user._id}`);
      setSubscriptions(response.data.data || []);
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (channelId, channelName) => {
    try {
      const response = await api.post(`/subscriptions/c/${channelId}`);
      
      // Check if the response indicates unsubscribed (the toggle worked)
      if (response.data.message.includes('unsubscribed')) {
        setSubscriptions(prev => prev.filter(sub => sub._id !== channelId));
        toast.success(`Unsubscribed from ${channelName}`);
      } else {
        // This shouldn't happen, but just in case
        toast.error('Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to unsubscribe');
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
          <p className="text-zinc-400 mt-1">Channels you're subscribed to</p>
        </div>

        {/* Content */}
        {subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subscriptions.map((channel) => (
              <div key={channel._id} className="bg-zinc-800 rounded-lg p-6 text-center">
                <Link to={`/c/${channel.username}`} className="block">
                  <img
                    src={channel.avatar || '/default-avatar.png'}
                    alt={channel.fullName}
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-white font-semibold mb-1">{channel.fullName}</h3>
                  <p className="text-zinc-400 text-sm mb-2">@{channel.username}</p>
                  <p className="text-zinc-500 text-xs">
                    {channel.subscribersCount || 0} subscribers
                  </p>
                </Link>
                
                <button
                  onClick={() => handleUnsubscribe(channel._id, channel.fullName)}
                  className="mt-4 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors"
                >
                  Unsubscribe
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No subscriptions yet</h2>
            <p className="text-zinc-400 mb-6">Subscribe to channels to see them here</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Discover Channels
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
