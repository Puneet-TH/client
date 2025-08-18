import VideoCard from './VideoCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { Grid, List } from 'lucide-react';

const VideoGrid = ({ 
  videos, 
  loading, 
  layout = 'grid', 
  onLayoutChange,
  showLayoutToggle = false,
  title = '',
  emptyMessage = 'No videos found'
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-zinc-400 mb-4">
          <div className="w-24 h-24 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Grid className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No videos available</h3>
          <p className="text-zinc-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with layout toggle */}
      {(title || showLayoutToggle) && (
        <div className="flex items-center justify-between mb-6">
          {title && (
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          )}
          
          {showLayoutToggle && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onLayoutChange?.('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  layout === 'grid'
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => onLayoutChange?.('list')}
                className={`p-2 rounded-lg transition-colors ${
                  layout === 'list'
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Video Grid/List */}
      <div className={
        layout === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'
          : 'space-y-2'
      }>
        {videos.map((video) => (
          <VideoCard 
            key={video._id} 
            video={video} 
            layout={layout}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
