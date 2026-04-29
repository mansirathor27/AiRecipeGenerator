import { useState, useEffect } from 'react';
import { User, Lock, Trash2, Save, ChefHat, Shield, Sliders, AlertTriangle, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DIETARY_OPTIONS = [
    { label: 'Vegetarian', emoji: '🥗' },
    { label: 'Vegan',      emoji: '🌱' },
    { label: 'Gluten-Free',emoji: '🌾' },
    { label: 'Dairy-Free', emoji: '🥛' },
    { label: 'Keto',       emoji: '🥑' },
    { label: 'Paleo',      emoji: '🍖' },
];
const CUISINES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];

const TABS = [
    { key: 'profile',      label: 'Profile',      icon: User },
    { key: 'security',     label: 'Security',     icon: Shield },
    { key: 'preferences',  label: 'Preferences',  icon: Sliders },
    { key: 'danger',       label: 'Danger Zone',  icon: AlertTriangle },
];

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [profile, setProfile] = useState({ name: '', email: '' });
    const [preferences, setPreferences] = useState({
        dietary_restrictions: [],
        allergies: [],
        preferred_cuisines: [],
        default_servings: 4,
        measurement_unit: 'metric'
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => { fetchUserData(); }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/users/profile');
            const { user: u, preferences: userPrefs } = response.data.data;
            setProfile({ name: u.name, email: u.email });
            if (userPrefs) {
                setPreferences({
                    dietary_restrictions: userPrefs.dietary_restrictions || [],
                    allergies:            userPrefs.allergies || [],
                    preferred_cuisines:   userPrefs.preferred_cuisines || [],
                    default_servings:     userPrefs.default_servings || 4,
                    measurement_unit:     userPrefs.measurement_unit || 'metric'
                });
            }
        } catch {
            toast.error('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/users/profile', profile);
            toast.success('Profile updated! ✅');
            localStorage.setItem('user', JSON.stringify({ ...user, ...profile }));
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePreferencesUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/users/preferences', preferences);
            toast.success('Preferences saved! ✅');
        } catch {
            toast.error('Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setSaving(true);
        try {
            await api.put('/users/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password changed! 🔐');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
        const confirmation = prompt('Type "DELETE" to confirm account deletion:');
        if (confirmation !== 'DELETE') { toast.error('Account deletion cancelled'); return; }
        try {
            await api.delete('/users/account');
            toast.success('Account deleted');
            logout();
            navigate('/login');
        } catch {
            toast.error('Failed to delete account');
        }
    };

    const toggleDietary = (option) => {
        setPreferences(prev => ({
            ...prev,
            dietary_restrictions: prev.dietary_restrictions.includes(option)
                ? prev.dietary_restrictions.filter(d => d !== option)
                : [...prev.dietary_restrictions, option]
        }));
    };

    const toggleCuisine = (cuisine) => {
        setPreferences(prev => ({
            ...prev,
            preferred_cuisines: prev.preferred_cuisines.includes(cuisine)
                ? prev.preferred_cuisines.filter(c => c !== cuisine)
                : [...prev.preferred_cuisines, cuisine]
        }));
    };

    return (
        <div className="page-container">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your account, security and preferences</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* ── Sidebar Tabs ── */}
                    <aside className="lg:w-56 shrink-0">
                        {/* User avatar card */}
                        <div className="card p-5 mb-4 text-center">
                            <div className="w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 shadow-lg shadow-emerald-200">
                                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <p className="font-bold text-gray-900 text-sm truncate">{profile.name || 'User'}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{profile.email}</p>
                        </div>

                        {/* Tab nav */}
                        <nav className="card p-2 space-y-1">
                            {TABS.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                        activeTab === key
                                            ? key === 'danger'
                                                ? 'bg-red-50 text-red-600'
                                                : 'bg-emerald-50 text-emerald-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* ── Tab Panels ── */}
                    <div className="flex-1 min-w-0">

                        {/* ── Profile ── */}
                        {activeTab === 'profile' && (
                            <div className="card p-8 animate-slide-up">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <User className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
                                        <p className="text-xs text-gray-400">Update your name and email address</p>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileUpdate} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="input-field opacity-60 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed for security reasons</p>
                                    </div>
                                    <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6">
                                        {saving ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                                        ) : (
                                            <><Save className="w-4 h-4" /> Save Profile</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* ── Security ── */}
                        {activeTab === 'security' && (
                            <div className="card p-8 animate-slide-up">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                                        <p className="text-xs text-gray-400">Keep your account secure with a strong password</p>
                                    </div>
                                </div>

                                <form onSubmit={handlePasswordChange} className="space-y-5">
                                    {[
                                        { key: 'currentPassword', label: 'Current Password',     autoComplete: 'current-password' },
                                        { key: 'newPassword',     label: 'New Password',         autoComplete: 'new-password' },
                                        { key: 'confirmPassword', label: 'Confirm New Password', autoComplete: 'new-password' },
                                    ].map(({ key, label, autoComplete }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">{label}</label>
                                            <input
                                                type="password"
                                                value={passwordData[key]}
                                                onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                                                className="input-field"
                                                required
                                                minLength={key !== 'currentPassword' ? 6 : undefined}
                                                autoComplete={autoComplete}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    ))}
                                    <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                                        {saving ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Changing…</>
                                        ) : (
                                            <><Lock className="w-4 h-4" /> Change Password</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* ── Preferences ── */}
                        {activeTab === 'preferences' && (
                            <div className="card p-8 animate-slide-up">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <Sliders className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Dietary Preferences</h2>
                                        <p className="text-xs text-gray-400">Personalize your recipe generation experience</p>
                                    </div>
                                </div>

                                <form onSubmit={handlePreferencesUpdate} className="space-y-7">
                                    {/* Dietary restrictions */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Dietary Restrictions</label>
                                        <div className="flex flex-wrap gap-2">
                                            {DIETARY_OPTIONS.map(({ label, emoji }) => (
                                                <button
                                                    key={label}
                                                    type="button"
                                                    onClick={() => toggleDietary(label)}
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                                                        preferences.dietary_restrictions.includes(label)
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <span>{emoji}</span> {label}
                                                    {preferences.dietary_restrictions.includes(label) && (
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Allergies */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                            Allergies <span className="text-gray-400 font-normal">(comma-separated)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={preferences.allergies.join(', ')}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
                                            })}
                                            placeholder="e.g. peanuts, shellfish, soy"
                                            className="input-field"
                                        />
                                    </div>

                                    {/* Preferred cuisines */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Preferred Cuisines</label>
                                        <div className="flex flex-wrap gap-2">
                                            {CUISINES.map(cuisine => (
                                                <button
                                                    key={cuisine}
                                                    type="button"
                                                    onClick={() => toggleCuisine(cuisine)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                                        preferences.preferred_cuisines.includes(cuisine)
                                                            ? 'bg-emerald-500 text-white shadow-sm'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {cuisine}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Default servings */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                                            Default Servings — <span className="text-emerald-600 text-sm font-bold">{preferences.default_servings}</span>
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400">1</span>
                                            <input
                                                type="range"
                                                min="1"
                                                max="12"
                                                value={preferences.default_servings}
                                                onChange={(e) => setPreferences({ ...preferences, default_servings: parseInt(e.target.value) })}
                                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                            />
                                            <span className="text-xs text-gray-400">12</span>
                                        </div>
                                    </div>

                                    {/* Measurement unit */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Measurement Unit</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { value: 'metric',   label: '🌍 Metric',   sub: 'kg, L, cm' },
                                                { value: 'imperial', label: '🇺🇸 Imperial', sub: 'lb, gal, in' },
                                            ].map(({ value, label, sub }) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => setPreferences({ ...preferences, measurement_unit: value })}
                                                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                                                        preferences.measurement_unit === value
                                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <span className="font-bold text-sm">{label}</span>
                                                    <span className="text-xs text-gray-400 mt-0.5">{sub}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button type="submit" disabled={saving} className="btn-primary py-2.5 px-6">
                                        {saving ? (
                                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                                        ) : (
                                            <><Save className="w-4 h-4" /> Save Preferences</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* ── Danger Zone ── */}
                        {activeTab === 'danger' && (
                            <div className="card border-2 border-red-200 p-8 animate-slide-up">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Danger Zone</h2>
                                        <p className="text-xs text-gray-400">Irreversible and destructive actions</p>
                                    </div>
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                                    <h3 className="font-bold text-red-900 mb-2 text-sm">Delete Account</h3>
                                    <p className="text-red-700 text-sm mb-5 leading-relaxed">
                                        Once you delete your account, there is no going back.
                                        All your recipes, meal plans, pantry items, and data will be permanently deleted.
                                    </p>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="btn-danger py-2.5 px-6 text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete My Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
