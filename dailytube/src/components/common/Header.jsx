import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Upload, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  Film,
  Home,
  PlaySquare,
  Heart,
  Clock,
  List,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOnClickOutside } from '../../hooks/useCommon';
import { getInitials, getRandomColor } from '../../utils/helpers';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef();
  const mobileMenuRef = useRef();

  // Memoize user avatar data
  const userInitials = useMemo(() => user?.username ? getInitials(user.username) : '', [user?.username]);
  const randomColor = useMemo(() => getRandomColor(), []);

  const closeUserMenu = useCallback(() => setUserMenuOpen(false), []);
  useOnClickOutside(userMenuRef, closeUserMenu);
  // Note: Mobile menu uses overlay click instead of useOnClickOutside to avoid conflicts

  // Close mobile menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  const handleMenuToggle = useCallback((e) => {
    e.stopPropagation();
    // Desktop: toggle sidebar, Mobile: toggle dropdown
    if (window.innerWidth >= 1024) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setMobileMenuOpen(!mobileMenuOpen);
    }
  }, [sidebarOpen, setSidebarOpen, mobileMenuOpen]);

  const handleMobileSearchToggle = useCallback((e) => {
    e.stopPropagation();
    setMobileSearchOpen(!mobileSearchOpen);
  }, [mobileSearchOpen]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  }, [logout, navigate]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side */}
          <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
            <button
              onClick={handleMenuToggle}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-red-600 p-2 rounded-lg">
                <Film className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                DailyTube
              </span>
            </Link>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-2xl mx-6 hidden md:block">
            <form onSubmit={handleSearch} className="flex justify-center">
              <div className="flex w-full max-w-lg">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-5 py-2.5 bg-zinc-800/50 border border-zinc-600 rounded-l-full text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:bg-zinc-800 transition-all duration-200"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-zinc-700/50 border border-zinc-600 border-l-0 rounded-r-full hover:bg-zinc-600 transition-colors duration-200 cursor-pointer"
                >
                  <Search className="w-5 h-5 text-zinc-300" />
                </button>
              </div>
            </form>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3 min-w-0 flex-shrink-0">
            {/* Mobile search button */}
            <button 
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors md:hidden cursor-pointer"
              onClick={handleMobileSearchToggle}
            >
              <Search className="w-6 h-6 text-white" />
            </button>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/upload"
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:block">Upload</span>
                </Link>
                
                <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors relative cursor-pointer">
                  <Bell className="w-6 h-6 text-white" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full"></span>
                </button>

                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full ${getRandomColor()} flex items-center justify-center text-white text-sm font-medium`}>
                        {getInitials(user?.fullName)}
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-2">
                      <div className="px-4 py-3 border-b border-zinc-700">
                        <div className="flex items-center space-x-3">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full ${getRandomColor()} flex items-center justify-center text-white font-medium`}>
                              {getInitials(user?.fullName)}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{user?.fullName}</p>
                            <p className="text-zinc-400 text-sm">@{user?.username}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        to={`/c/${user?.username}`}
                        className="flex items-center space-x-3 px-4 py-2 hover:bg-zinc-700 text-white"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>Your Channel</span>
                      </Link>
                      
                      <Link
                        to="/dashboard"
                        className="flex items-center space-x-3 px-4 py-2 hover:bg-zinc-700 text-white"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <PlaySquare className="w-5 h-5" />
                        <span>Dashboard</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-2 hover:bg-zinc-700 text-white"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                      </Link>
                      
                      <div className="border-t border-zinc-700 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-zinc-700 text-white w-full text-left cursor-pointer"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 border border-zinc-600 text-zinc-300 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 border-t border-zinc-800">
            <form onSubmit={handleSearch} className="flex mt-3">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-600 rounded-l-full text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-all"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-zinc-700 border border-zinc-600 border-l-0 rounded-r-full hover:bg-zinc-600 transition-colors cursor-pointer"
              >
                <Search className="w-5 h-5 text-zinc-300" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden absolute top-full left-0 right-0 bg-zinc-900 border-b border-zinc-800 shadow-lg z-50">
            <nav className="px-4 py-4 space-y-2 max-h-96 overflow-y-auto">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              
              {isAuthenticated && (
                <>
                  <div className="pt-4 pb-2">
                    <h3 className="text-zinc-400 text-sm font-medium px-3">Library</h3>
                  </div>
                  
                  <Link
                    to="/history"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
                  >
                    <Clock className="w-5 h-5" />
                    <span>History</span>
                  </Link>
                  
                  <Link
                    to="/liked"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Liked videos</span>
                  </Link>
                  
                  <Link
                    to="/playlists"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
                  >
                    <List className="w-5 h-5" />
                    <span>Playlists</span>
                  </Link>
                  
                  <Link
                    to="/tweets"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Tweets</span>
                  </Link>
                  
                  <Link
                    to="/subscriptions"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    <span>Subscriptions</span>
                  </Link>

                  <div className="pt-4 pb-2">
                    <h3 className="text-zinc-400 text-sm font-medium px-3">Account</h3>
                  </div>

                  <Link
                    to={`/c/${user?.username}`}
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>Your Channel</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
                  >
                    <PlaySquare className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/upload"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload Video</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className={`hidden lg:block fixed top-16 left-0 h-full w-64 bg-zinc-900 transform transition-transform duration-300 z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <nav className="p-4 space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          
          {isAuthenticated && (
            <>
              <div className="pt-4 pb-2">
                <h3 className="text-zinc-400 text-sm font-medium px-3">Library</h3>
              </div>
              
              <Link
                to="/history"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              >
                <Clock className="w-5 h-5" />
                <span>History</span>
              </Link>
              
              <Link
                to="/liked"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span>Liked videos</span>
              </Link>
              
              <Link
                to="/playlists"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              >
                <List className="w-5 h-5" />
                <span>Playlists</span>
              </Link>
              
              <Link
                to="/tweets"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Tweets</span>
              </Link>
              
              <Link
                to="/subscriptions"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>Subscriptions</span>
              </Link>

              <div className="pt-4 pb-2">
                <h3 className="text-zinc-400 text-sm font-medium px-3">Account</h3>
              </div>

              <Link
                to={`/c/${user?.username}`}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Your Channel</span>
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              >
                <PlaySquare className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/upload"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Video</span>
              </Link>

              <Link
                to="/settings"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800 text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Desktop Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
