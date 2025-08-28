import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Tweets from '../components/common/Tweets';

const TweetsPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-900 pt-16 lg:ml-64">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tweets</h1>
          <p className="text-zinc-400">Share your thoughts with the community</p>
        </div>
        
        <Tweets username={user?.username} profileUser={user} isOwnProfile={true} />
      </div>
    </div>
  );
};

export default TweetsPage;
