import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Video, Image as ImageIcon } from 'lucide-react';
import { videoService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatFileSize } from '../utils/helpers';
import toast from 'react-hot-toast';
import './VideoUpload.css';

const VideoUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [files, setFiles] = useState({
    videoFile: null,
    thumbnail: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (fileType === 'videoFile') {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      // Max 100MB for video files
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video file size should be less than 100MB');
        return;
      }
    } else if (fileType === 'thumbnail') {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file for thumbnail');
        return;
      }
      // Max 5MB for thumbnails
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Thumbnail file size should be less than 5MB');
        return;
      }
    }

    setFiles({
      ...files,
      [fileType]: file
    });
  };

  const removeFile = (fileType) => {
    setFiles({
      ...files,
      [fileType]: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!files.videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!files.thumbnail) {
      toast.error('Please select a thumbnail image');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('videoFile', files.videoFile);
      uploadData.append('thumbnail', files.thumbnail);

      // Create a custom axios config with progress tracking
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      };

      const response = await videoService.uploadVideo(uploadData);
      
      toast.success('Video uploaded successfully!');
      navigate(`/video/${response.data.data._id}`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Upload Video</h1>
        <p>Share your video with the DailyTube community</p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-section">
          <h3>Video Details</h3>
          
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter video title"
              required
              maxLength={100}
            />
            <span className="char-count">{formData.title.length}/100</span>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Describe your video"
              required
              maxLength={5000}
              rows={6}
            />
            <span className="char-count">{formData.description.length}/5000</span>
          </div>
        </div>

        <div className="form-section">
          <h3>Video File *</h3>
          <div className="file-upload-section">
            {!files.videoFile ? (
              <div className="file-drop-zone">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'videoFile')}
                  className="file-input"
                  id="videoFile"
                />
                <label htmlFor="videoFile" className="file-drop-label">
                  <Video size={48} />
                  <h4>Select video file</h4>
                  <p>MP4, WebM, AVI and other video formats</p>
                  <p className="file-size-limit">Maximum file size: 100MB</p>
                </label>
              </div>
            ) : (
              <div className="file-preview">
                <div className="file-info">
                  <Video size={24} />
                  <div className="file-details">
                    <span className="file-name">{files.videoFile.name}</span>
                    <span className="file-size">{formatFileSize(files.videoFile.size)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="file-remove-btn"
                  onClick={() => removeFile('videoFile')}
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>Thumbnail *</h3>
          <div className="file-upload-section">
            {!files.thumbnail ? (
              <div className="file-drop-zone thumbnail-drop">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                  className="file-input"
                  id="thumbnail"
                />
                <label htmlFor="thumbnail" className="file-drop-label">
                  <ImageIcon size={48} />
                  <h4>Select thumbnail image</h4>
                  <p>JPG, PNG, GIF formats</p>
                  <p className="file-size-limit">Maximum file size: 5MB</p>
                </label>
              </div>
            ) : (
              <div className="file-preview thumbnail-preview">
                <img
                  src={URL.createObjectURL(files.thumbnail)}
                  alt="Thumbnail preview"
                  className="thumbnail-image"
                />
                <button
                  type="button"
                  className="file-remove-btn"
                  onClick={() => removeFile('thumbnail')}
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="progress-text">{uploadProgress}% uploaded</span>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/')}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoUpload;
