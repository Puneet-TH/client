import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Upload, User, LogOut, Menu, Home, Video, Users, Heart, List, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button 
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="logo">
            <span className="logo-text">DailyTube</span>
          </Link>
        </div>

        <div className="header-center">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              name="search"
              placeholder="Search videos..."
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <Search size={20} />
            </button>
          </form>
        </div>

        <div className="header-right">
          {isAuthenticated ? (
            <>
              <Link to="/upload" className="upload-btn">
                <Upload size={20} />
                <span>Upload</span>
              </Link>
              <div className="user-menu">
                <Link to={`/channel/${user?.username}`} className="user-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.fullName} />
                  ) : (
                    <User size={24} />
                  )}
                </Link>
                <div className="user-dropdown">
                  <Link to={`/channel/${user?.username}`}>My Channel</Link>
                  <Link to="/profile">Profile Settings</Link>
                  <button onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            <Home size={20} />
            <span>Home</span>
          </Link>
          
          {isAuthenticated && (
            <>
              <Link to="/subscriptions" className="nav-item">
                <Users size={20} />
                <span>Subscriptions</span>
              </Link>
              <Link to="/liked-videos" className="nav-item">
                <Heart size={20} />
                <span>Liked Videos</span>
              </Link>
              <Link to="/playlists" className="nav-item">
                <List size={20} />
                <span>Playlists</span>
              </Link>
              <Link to="/history" className="nav-item">
                <Video size={20} />
                <span>History</span>
              </Link>
              <Link to="/tweets" className="nav-item">
                <MessageSquare size={20} />
                <span>Tweets</span>
              </Link>
              <Link to="/dashboard" className="nav-item">
                <User size={20} />
                <span>Dashboard</span>
              </Link>
            </>
          )}
        </nav>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </>
  );
};

export default Header;
