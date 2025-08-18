import { Link } from 'react-router-dom';
import { memo, useMemo } from 'react';
import { formatDuration, formatViewCount, timeAgo, getInitials, getRandomColor, getSecureUrl } from '../../utils/helpers';
import { MoreVertical } from 'lucide-react';

const VideoCard = memo(({ video, layout = 'grid' }) => {
  const {
    _id,
    title,
    description,
    thumbnail,
    duration,
    views,
    createdAt,
    owner,
  } = video;

  // Memoize expensive computations
  const formattedViews = useMemo(() => formatViewCount(views), [views]);
  const timeAgoText = useMemo(() => timeAgo(createdAt), [createdAt]);
  const durationText = useMemo(() => duration ? formatDuration(duration) : null, [duration]);
  const secureAvatar = useMemo(() => owner?.avatar ? getSecureUrl(owner.avatar) : null, [owner?.avatar]);
  const secureThumbnail = useMemo(() => thumbnail ? getSecureUrl(thumbnail) : null, [thumbnail]);
  const ownerInitials = useMemo(() => getInitials(owner?.username), [owner?.username]);
  const randomColor = useMemo(() => getRandomColor(), []);

  // Common avatar component
  const AvatarComponent = ({ size = 'w-9 h-9', textSize = 'text-sm' }) => (
    secureAvatar ? (
      <img
        src={secureAvatar}
        alt={owner?.username || 'User'}
        className={`${size} rounded-full object-cover`}
        loading="lazy"
      />
    ) : (
      <div className={`${size} rounded-full ${randomColor} flex items-center justify-center text-white ${textSize} font-medium`}>
        {ownerInitials}
      </div>
    )
  );

  // Common thumbnail component
  const ThumbnailComponent = ({ className, containerClass }) => (
    <div className={`relative ${containerClass}`}>
      {secureThumbnail ? (
        <img
          src={secureThumbnail}
          alt={title}
          className={className}
          loading="lazy"
        />
      ) : (
        <div className={`${className} bg-zinc-800 flex items-center justify-center`}>
          <span className="text-zinc-500 text-sm">No Thumbnail</span>
        </div>
      )}
      {durationText && (
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {durationText}
        </span>
      )}
    </div>
  );

  if (layout === 'list') {
    return (
      <div className="flex gap-4 p-4 hover:bg-zinc-800/50 rounded-lg transition-colors">
        <Link to={`/watch/${_id}`} className="relative flex-shrink-0">
          <ThumbnailComponent 
            className="w-48 h-28 object-cover rounded-lg"
            containerClass="mb-0"
          />
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${_id}`}>
            <h3 className="text-white font-medium line-clamp-2 hover:text-blue-400 transition-colors mb-1">
              {title}
            </h3>
          </Link>
          
          <div className="flex items-center text-zinc-400 text-sm mb-2">
            <span>{formattedViews} views</span>
            <span className="mx-1">•</span>
            <span>{timeAgoText}</span>
          </div>
          
          <Link
            to={`/c/${owner?.username}`}
            className="flex items-center gap-2 mb-2 hover:text-white transition-colors"
          >
            <AvatarComponent size="w-6 h-6" textSize="text-xs" />
            <span className="text-zinc-400 text-sm hover:text-white transition-colors">
              {owner?.username}
            </span>
          </Link>
          
          {description && (
            <p className="text-zinc-400 text-sm line-clamp-2">
              {description}
            </p>
          )}
        </div>
        
        <button 
          className="p-1 hover:bg-zinc-700 rounded-full h-fit cursor-pointer"
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer">
      <Link to={`/watch/${_id}`} className="block">
        <ThumbnailComponent 
          className="w-full aspect-video object-cover rounded-xl group-hover:scale-105 transition-transform duration-200"
          containerClass="mb-3"
        />
      </Link>
      
      <div className="flex gap-3">
        <Link to={`/c/${owner?.username}`} className="flex-shrink-0">
          <AvatarComponent />
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${_id}`}>
            <h3 className="text-white font-medium line-clamp-2 group-hover:text-blue-400 transition-colors mb-1 leading-tight">
              {title}
            </h3>
          </Link>
          
          <Link
            to={`/c/${owner?.username}`}
            className="text-zinc-400 text-sm hover:text-white transition-colors block mb-1"
          >
            {owner?.username}
          </Link>
          
          <div className="flex items-center text-zinc-400 text-sm">
            <span>{formattedViews} views</span>
            <span className="mx-1">•</span>
            <span>{timeAgoText}</span>
          </div>
        </div>
        
        <button 
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded-full h-fit transition-opacity cursor-pointer"
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
    </div>
  );
});

VideoCard.displayName = 'VideoCard';

export default VideoCard;
