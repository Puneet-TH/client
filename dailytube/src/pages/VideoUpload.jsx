import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProtectedRoute from '../components/common/ProtectedRoute';
import api from '../services/api';
import { formatError } from '../utils/helpers';

const VideoUpload = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublished: true
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState({ video: false, thumbnail: false });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVideoFileChange = (file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file');
        return;
      }

      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Video file size should be less than 100MB');
        return;
      }

      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);

      // Auto-generate title from filename if empty
      if (!formData.title && file.name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const handleThumbnailChange = (file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file for thumbnail');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Thumbnail file size should be less than 5MB');
        return;
      }

      setThumbnail(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      if (type === 'video') {
        handleVideoFileChange(files[0]);
      } else if (type === 'thumbnail') {
        handleThumbnailChange(files[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formDataToSend = new FormData();
      formDataToSend.append('videoFile', videoFile);
      if (thumbnail) {
        formDataToSend.append('thumbnail', thumbnail);
      }
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('isPublished', formData.isPublished);

      const response = await api.post('/videos', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      toast.success('Video uploaded successfully!');
      navigate(`/watch/${response.data.data._id}`);
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      isPublished: true
    });
    setVideoFile(null);
    setThumbnail(null);
    setVideoPreview('');
    setThumbnailPreview('');
    setUploadProgress(0);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-900 pt-16 lg:ml-64">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
            <p className="text-zinc-400">Share your content with the world</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Video Upload Section */}
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Video File *
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive.video
                    ? 'border-red-500 bg-red-500 bg-opacity-10'
                    : videoFile
                    ? 'border-green-500 bg-green-500 bg-opacity-10'
                    : 'border-zinc-600 hover:border-zinc-500'
                }`}
                onDragEnter={(e) => handleDrag(e, 'video')}
                onDragLeave={(e) => handleDrag(e, 'video')}
                onDragOver={(e) => handleDrag(e, 'video')}
                onDrop={(e) => handleDrop(e, 'video')}
              >
                {videoPreview ? (
                  <div className="space-y-4">
                    <video
                      src={videoPreview}
                      className="max-w-full max-h-64 mx-auto rounded-lg"
                      controls
                    />
                    <div className="flex items-center justify-center gap-4">
                      <p className="text-green-400">{videoFile.name}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreview('');
                          URL.revokeObjectURL(videoPreview);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <svg className="mx-auto h-12 w-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="mb-4">
                      <p className="text-lg text-white mb-2">Drop your video here</p>
                      <p className="text-zinc-400 text-sm">or click to browse files</p>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoFileChange(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                      Supported formats: MP4, MOV, AVI, WMV. Max size: 100MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Upload Section */}
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Custom Thumbnail (Optional)
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive.thumbnail
                    ? 'border-red-500 bg-red-500 bg-opacity-10'
                    : thumbnail
                    ? 'border-green-500 bg-green-500 bg-opacity-10'
                    : 'border-zinc-600 hover:border-zinc-500'
                }`}
                onDragEnter={(e) => handleDrag(e, 'thumbnail')}
                onDragLeave={(e) => handleDrag(e, 'thumbnail')}
                onDragOver={(e) => handleDrag(e, 'thumbnail')}
                onDrop={(e) => handleDrop(e, 'thumbnail')}
              >
                {thumbnailPreview ? (
                  <div className="space-y-4">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
                    />
                    <div className="flex items-center justify-center gap-4">
                      <p className="text-green-400">{thumbnail.name}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnail(null);
                          setThumbnailPreview('');
                          URL.revokeObjectURL(thumbnailPreview);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <svg className="mx-auto h-8 w-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="mb-2">
                      <p className="text-white mb-1">Upload custom thumbnail</p>
                      <p className="text-zinc-400 text-sm">or drag and drop an image</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleThumbnailChange(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Video Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter video title"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-zinc-400"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-zinc-500 mt-1">
                  {formData.title.length}/100 characters
                </p>
              </div>

              <div>
                <label className="flex items-center gap-3 text-white">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-red-600 bg-zinc-800 border-zinc-700 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium">Publish immediately</span>
                </label>
                <p className="text-xs text-zinc-500 mt-1 ml-8">
                  Uncheck to save as draft
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell viewers about your video"
                rows="4"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-zinc-400 resize-vertical"
                maxLength={500}
              />
              <p className="text-xs text-zinc-500 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-zinc-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-medium">Uploading...</span>
                  <span className="text-zinc-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-zinc-400 mt-2">
                  Please don't close this page while uploading
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
              <button
                type="button"
                onClick={resetForm}
                disabled={uploading}
                className="px-6 py-3 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear Form
              </button>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={uploading}
                  className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={uploading || !videoFile || !formData.title.trim()}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {uploading && <LoadingSpinner size="sm" />}
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default VideoUpload;
