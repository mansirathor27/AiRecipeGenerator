import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ChefHat,
    Home,
    UtensilsCrossed,
    Calendar,
    ShoppingCart,
    Settings,
    LogOut,
    ChevronDown,
    Sparkles,
    BookOpen,
    Menu,
    X
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const NAV_LINKS = [
    { to: '/dashboard',     icon: Home,            label: 'Dashboard' },
    { to: '/generate',      icon: Sparkles,        label: 'Generate' },
    { to: '/recipes',       icon: BookOpen,        label: 'Recipes' },
    { to: '/pantry',        icon: UtensilsCrossed, label: 'Pantry' },
    { to: '/meal-plan',     icon: Calendar,        label: 'Meal Plan' },
    { to: '/shopping-list', icon: ShoppingCart,    label: 'Shopping' },
];

const Navbar = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsDropdownOpen(false);
        setIsMobileOpen(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll shadow effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    if (loading) return null;

    const isActive = (path) => location.pathname === path ||
        (path !== '/dashboard' && location.pathname.startsWith(path));

    return (
        <>
            <nav className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
                scrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-gray-100'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-emerald-200 transition-shadow">
                                <ChefHat className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900 hidden sm:block">
                                AI Recipe
                                <span className="text-emerald-500">.</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 relative group ${
                                        isActive(to)
                                            ? 'text-emerald-600 bg-emerald-50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{label}</span>
                                    {isActive(to) && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-500 rounded-full" />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Right: Settings + User */}
                        <div className="flex items-center gap-2">
                            <Link
                                to="/settings"
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                    isActive('/settings')
                                        ? 'text-emerald-600 bg-emerald-50'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                                title="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </Link>

                            {/* User Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
                                >
                                    <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                                        {user?.name?.split(' ')[0] || 'User'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-slide-down">
                                        {/* User Info */}
                                        <div className="px-4 py-4 bg-linear-to-br from-emerald-50 to-teal-50 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Logout */}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setIsMobileOpen(!isMobileOpen)}
                                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer */}
            {isMobileOpen && (
                <div className="md:hidden fixed inset-0 z-40 animate-fade-in" onClick={() => setIsMobileOpen(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                    <div
                        className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-xl animate-slide-down"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 py-3 space-y-1">
                            {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                        isActive(to)
                                            ? 'text-emerald-600 bg-emerald-50'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {label}
                                </Link>
                            ))}
                            <Link
                                to="/settings"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                    isActive('/settings')
                                        ? 'text-emerald-600 bg-emerald-50'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Settings className="w-5 h-5" />
                                Settings
                            </Link>
                            <div className="border-t border-gray-100 pt-2 mt-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;