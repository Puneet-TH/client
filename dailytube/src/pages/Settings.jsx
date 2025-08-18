import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProtectedRoute from '../components/common/ProtectedRoute';
import api from '../services/api';
import { formatError } from '../utils/helpers';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || ''
      });
      setAvatarPreview(user.avatar || '');
      setCoverPreview(user.coverImage || '');
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size should be less than 5MB');
        return;
      }

      if (type === 'avatar') {
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
      } else if (type === 'cover') {
        setCoverImage(file);
        setCoverPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Update account details (text fields only) - send as JSON
      const accountData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim()
      };

      const accountResponse = await api.patch('/users/update-account', accountData);
      let updatedUser = accountResponse.data.data;

      // Update avatar if provided - separate endpoint
      if (avatar) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', avatar);
        
        const avatarResponse = await api.patch('/users/avatar', avatarFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        updatedUser = avatarResponse.data.data;
      }

      // Update cover image if provided - separate endpoint  
      if (coverImage) {
        const coverFormData = new FormData();
        coverFormData.append('coverImage', coverImage);
        
        const coverResponse = await api.patch('/users/cover-image', coverFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        updatedUser = coverResponse.data.data;
      }

      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
      
      // Reset file selections
      setAvatar(null);
      setCoverImage(null);
      
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await api.post('/users/change-password', {
        oldPassword,
        newPassword
      });

      toast.success('Password changed successfully!');
      e.target.reset();
    } catch (error) {
      toast.error(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-900 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-zinc-400">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'profile' && (
                <div className="bg-zinc-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Profile Settings</h2>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Avatar Upload */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-4">
                        <img
                          src={avatarPreview || '/default-avatar.png'}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'avatar')}
                            className="hidden"
                            id="avatar-upload"
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="inline-block px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg cursor-pointer transition-colors"
                          >
                            Change Picture
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Cover Image
                      </label>
                      <div className="space-y-4">
                        {coverPreview && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden">
                            <img
                              src={coverPreview}
                              alt="Cover"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'cover')}
                            className="hidden"
                            id="cover-upload"
                          />
                          <label
                            htmlFor="cover-upload"
                            className="inline-block px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg cursor-pointer transition-colors"
                          >
                            {coverPreview ? 'Change Cover' : 'Upload Cover'}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="w-full">
                      <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        {loading && <LoadingSpinner size="sm" />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="bg-zinc-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label htmlFor="oldPassword" className="block text-sm font-medium text-white mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="oldPassword"
                        name="oldPassword"
                        className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                        minLength="6"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                        minLength="6"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                      >
                        {loading && <LoadingSpinner size="sm" />}
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="bg-zinc-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Preferences</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Privacy</h3>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 text-white">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-5 h-5 text-red-600 bg-zinc-700 border-zinc-600 rounded focus:ring-red-500 focus:ring-2"
                          />
                          <span>Make my channel public</span>
                        </label>
                        <label className="flex items-center gap-3 text-white">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-5 h-5 text-red-600 bg-zinc-700 border-zinc-600 rounded focus:ring-red-500 focus:ring-2"
                          />
                          <span>Allow comments on my videos</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Notifications</h3>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3 text-white">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-5 h-5 text-red-600 bg-zinc-700 border-zinc-600 rounded focus:ring-red-500 focus:ring-2"
                          />
                          <span>Email notifications for new subscribers</span>
                        </label>
                        <label className="flex items-center gap-3 text-white">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="w-5 h-5 text-red-600 bg-zinc-700 border-zinc-600 rounded focus:ring-red-500 focus:ring-2"
                          />
                          <span>Email notifications for comments</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-zinc-700">
                      <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Settings;
