import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ChefHat, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

const FEATURES = [
    { icon: '🤖', text: 'AI-powered recipe generation' },
    { icon: '🥗', text: 'Smart pantry management' },
    { icon: '📅', text: 'Weekly meal planning' },
    { icon: '🛒', text: 'Auto shopping lists' },
];

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            toast.success('Welcome back! 👋');
            navigate('/dashboard');
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            {/* ── Left decorative panel ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 flex-col justify-between p-12">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 0),
                                          radial-gradient(circle at 75px 75px, white 2px, transparent 0)`,
                        backgroundSize: '100px 100px'
                    }}
                />

                {/* Floating food emojis */}
                <div className="absolute top-20 right-16 text-5xl animate-float opacity-40">🍳</div>
                <div className="absolute top-40 right-32 text-3xl animate-float opacity-30" style={{ animationDelay: '1s' }}>🥑</div>
                <div className="absolute bottom-40 right-20 text-4xl animate-float opacity-30" style={{ animationDelay: '0.5s' }}>🌿</div>
                <div className="absolute bottom-60 left-8 text-3xl animate-float opacity-25" style={{ animationDelay: '1.5s' }}>🍋</div>

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">AI Recipe Generator</span>
                </div>

                {/* Headline */}
                <div className="relative">
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                        <span className="text-emerald-100 text-sm font-medium">Powered by Gemini AI</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                        Cook smarter.<br />Eat better.<br />Waste less.
                    </h1>
                    <p className="text-emerald-200 text-lg mb-10">
                        Your personal AI chef that turns any ingredients into delicious meals.
                    </p>

                    {/* Feature list */}
                    <div className="space-y-3">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-xl">{f.icon}</span>
                                <span className="text-emerald-100 text-sm font-medium">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom quote */}
                <p className="relative text-emerald-300 text-sm italic">
                    "The secret ingredient is always a little bit of AI magic." ✨
                </p>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
                <div className="w-full max-w-md animate-slide-up">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-9 h-9 bg-linear-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <ChefHat className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-gray-900">AI Recipe Generator</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                        <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 w-5 h-5" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field pl-11"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                                <Link to="/reset-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-11 pr-11"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 text-base"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in…
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                            Create one free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
