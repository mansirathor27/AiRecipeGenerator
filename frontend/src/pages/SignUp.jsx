import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ChefHat, Mail, Lock, User, Eye, EyeOff, Sparkles, Check } from 'lucide-react';

const PERKS = [
    'Generate unlimited AI recipes',
    'Smart pantry tracking & expiry alerts',
    'Automated shopping lists',
    'Weekly meal planning calendar',
    'Nutrition & cost tracking',
];

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await register(name, email, password);
        if (result.success) {
            toast.success('Account created! Welcome aboard 🎉');
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
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 0),
                                          radial-gradient(circle at 75px 75px, white 2px, transparent 0)`,
                        backgroundSize: '100px 100px'
                    }}
                />

                {/* Floating food emojis */}
                <div className="absolute top-24 right-12 text-5xl animate-float opacity-40">🍜</div>
                <div className="absolute top-48 right-36 text-3xl animate-float opacity-30" style={{ animationDelay: '0.8s' }}>🫐</div>
                <div className="absolute bottom-44 right-16 text-4xl animate-float opacity-30" style={{ animationDelay: '1.2s' }}>🥕</div>
                <div className="absolute bottom-64 left-10 text-3xl animate-float opacity-25" style={{ animationDelay: '0.4s' }}>🍄</div>

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <ChefHat className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">AI Recipe Generator</span>
                </div>

                {/* Content */}
                <div className="relative">
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                        <span className="text-emerald-100 text-sm font-medium">Free forever, no credit card</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                        Start your<br />culinary journey<br />today.
                    </h1>
                    <p className="text-emerald-200 text-lg mb-10">
                        Join thousands of home cooks using AI to cook better every day.
                    </p>

                    {/* Perks list */}
                    <div className="space-y-3">
                        {PERKS.map((perk, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-400/30 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-emerald-200" />
                                </div>
                                <span className="text-emerald-100 text-sm font-medium">{perk}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative text-emerald-300 text-sm italic">
                    "Your kitchen, supercharged by AI." 🚀
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
                        <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
                        <p className="text-gray-500 mt-2">Get started for free in under a minute</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Full name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field pl-11"
                                    placeholder="Jane Doe"
                                    required
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-11 pr-11"
                                    placeholder="Minimum 6 characters"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
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
                            <p className="text-xs text-gray-400 mt-1.5">At least 6 characters</p>
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
                                    Creating account…
                                </>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        By creating an account, you agree to our terms of service.
                    </p>

                    <p className="text-center text-sm text-gray-500 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
