import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { videoService } from '../../services/api';

const EditVideoModal = ({ video, isOpen, onClose, onVideoUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: null
  });
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        thumbnail: null
      });
      setPreviewUrl(null);
    }
  }, [video]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        thumbnail: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);
    
    try {
      const updateData = new FormData();
      updateData.append('title', formData.title.trim());
      updateData.append('description', formData.description.trim());
      
      if (formData.thumbnail) {
        updateData.append('thumbnail', formData.thumbnail);
      }

      const response = await videoService.updateVideo(video._id, updateData);
      
      if (response.data.success) {
        toast.success('Video updated successfully!');
        onVideoUpdate(response.data.data);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        thumbnail: null
      });
    }
    setPreviewUrl(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Edit Video Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter video title..."
                maxLength={100}
                required
              />
              <p className="text-xs text-zinc-500 mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical"
                placeholder="Enter video description..."
                rows={5}
                maxLength={1000}
              />
              <p className="text-xs text-zinc-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Thumbnail (Optional)
              </label>
              
              {/* Current Thumbnail Preview */}
              <div className="mb-4">
                <p className="text-xs text-zinc-500 mb-2">Current thumbnail:</p>
                <img
                  src={video?.thumbnail || '/placeholder-thumbnail.jpg'}
                  alt="Current thumbnail"
                  className="w-32 h-20 object-cover rounded border border-zinc-700"
                />
              </div>

              {/* New Thumbnail Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent file:bg-zinc-700 file:border-0 file:text-white file:px-3 file:py-1 file:rounded file:mr-3 file:cursor-pointer hover:file:bg-zinc-600"
              />
              
              {/* New Thumbnail Preview */}
              {previewUrl && (
                <div className="mt-3">
                  <p className="text-xs text-zinc-500 mb-2">New thumbnail preview:</p>
                  <img
                    src={previewUrl}
                    alt="New thumbnail preview"
                    className="w-32 h-20 object-cover rounded border border-zinc-700"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update Video'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditVideoModal;
