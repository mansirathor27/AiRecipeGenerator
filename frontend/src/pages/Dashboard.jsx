import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NutritionTracker from '../components/NutritionTracker';
import SkeletonCard from '../components/SkeletonCard';
import {
    ChefHat, UtensilsCrossed, Calendar, ShoppingCart,
    Clock, DollarSign, AlertTriangle, Sparkles,
    ArrowRight, TrendingUp
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalRecipes: 0, pantryItems: 0, mealsThisWeek: 0 });
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [upcomingMeals, setUpcomingMeals] = useState([]);
    const [nutritionData, setNutritionData] = useState({
        daily: { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 },
        weekly: []
    });
    const [costData, setCostData] = useState({ totalCost: 0, budget: 0, isOverBudget: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchDashboardData(); }, []);

    const fetchDashboardData = async () => {
        try {
            const today = new Date().toLocaleDateString('en-CA');
            const results = await Promise.allSettled([
                api.get('/recipes/stats'),
                api.get('/pantry/stats'),
                api.get(`/meal-plans/stats?date=${today}`),
                api.get('/recipes/recent?limit=5'),
                api.get('/meal-plans/upcoming?limit=5'),
                api.get(`/nutrition/daily?date=${today}`),
                api.get(`/nutrition/weekly?date=${today}`),
                api.get(`/cost/weekly?date=${today}`),
            ]);

            const get = (i, path, fallback) => {
                if (results[i].status === 'fulfilled') {
                    return path.split('.').reduce((o, k) => (o || {})[k], results[i].value) ?? fallback;
                }
                return fallback;
            };

            setStats({
                totalRecipes: get(0, 'data.data.stats.total_recipes', 0),
                pantryItems: get(1, 'data.data.stats.total_items', 0),
                mealsThisWeek: get(2, 'data.data.stats.this_week_count', 0),
            });
            setRecentRecipes(get(3, 'data.data.recipes', []));
            setUpcomingMeals(get(4, 'data.data.meals', []));
            setNutritionData({
                daily: get(5, 'data.data.totals', { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }),
                weekly: get(6, 'data.data.weeklyData', []),
            });
            if (results[7].status === 'fulfilled') setCostData(results[7].value.data.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    if (loading) {
        return (
            <div className="page-container">
                <Navbar />
                <div className="page-content">
                    {/* Hero skeleton */}
                    <div className="skeleton h-40 w-full rounded-2xl mb-8" />
                    {/* Stat cards skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <SkeletonCard type="stat" count={4} />
                    </div>
                    {/* Nutrition skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="skeleton h-56 rounded-2xl" />
                        <div className="skeleton h-56 rounded-2xl lg:col-span-2" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Navbar />

            <div className="page-content animate-fade-in">

                {/* ── Hero Banner ── */}
                <div className="relative overflow-hidden rounded-2xl mb-8 bg-linear-to-r from-emerald-600 via-emerald-600 to-teal-600 p-8 text-white shadow-lg shadow-emerald-100">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `radial-gradient(circle at 20px 20px, white 1.5px, transparent 0)`,
                            backgroundSize: '60px 60px'
                        }}
                    />
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full" />
                    <div className="absolute -right-4 bottom-0 w-32 h-32 bg-white/5 rounded-full" />

                    <div className="relative flex items-start justify-between">
                        <div>
                            <p className="text-emerald-200 text-sm font-medium mb-1">{today}</p>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                {greeting()}, {user?.name?.split(' ')[0] || 'Chef'}! 👋
                            </h1>
                            <p className="text-emerald-100 mt-2 text-sm sm:text-base">
                                Here's what's happening in your kitchen today.
                            </p>
                        </div>
                        <div className="hidden sm:block">
                            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <ChefHat className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Quick stat pills */}
                    <div className="relative flex flex-wrap gap-3 mt-6">
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                            <ChefHat className="w-4 h-4" />
                            {stats.totalRecipes} recipes
                        </div>
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                            <Calendar className="w-4 h-4" />
                            {stats.mealsThisWeek} meals this week
                        </div>
                        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                            <UtensilsCrossed className="w-4 h-4" />
                            {stats.pantryItems} pantry items
                        </div>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<ChefHat className="w-5 h-5" />}
                        label="Total Recipes"
                        value={stats.totalRecipes}
                        to="/recipes"
                        colorClass="from-emerald-500 to-teal-500"
                        bgClass="bg-emerald-50"
                        textClass="text-emerald-600"
                    />
                    <StatCard
                        icon={<UtensilsCrossed className="w-5 h-5" />}
                        label="Pantry Items"
                        value={stats.pantryItems}
                        to="/pantry"
                        colorClass="from-blue-500 to-indigo-500"
                        bgClass="bg-blue-50"
                        textClass="text-blue-600"
                    />
                    <StatCard
                        icon={<Calendar className="w-5 h-5" />}
                        label="Meals This Week"
                        value={stats.mealsThisWeek}
                        to="/meal-plan"
                        colorClass="from-purple-500 to-violet-500"
                        bgClass="bg-purple-50"
                        textClass="text-purple-600"
                    />

                    {/* Cost card */}
                    <div className={`card-hover p-6 overflow-hidden relative ${costData.isOverBudget ? 'border-red-200 bg-red-50' : ''}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${costData.isOverBudget ? 'bg-red-100' : 'bg-amber-100'}`}>
                                <DollarSign className={`w-5 h-5 ${costData.isOverBudget ? 'text-red-600' : 'text-amber-600'}`} />
                            </div>
                            {costData.isOverBudget && (
                                <div className="flex items-center gap-1 text-red-600 bg-red-100 rounded-full px-2 py-0.5">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Over Budget</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm font-medium text-gray-500">Weekly Est. Cost</p>
                        <div className="flex items-baseline gap-1.5 mt-1">
                            <p className={`text-2xl font-bold ${costData.isOverBudget ? 'text-red-700' : 'text-gray-900'}`}>
                                ${(costData.totalCost || 0).toFixed(2)}
                            </p>
                            {costData.budget > 0 && (
                                <p className="text-sm text-gray-400">/ ${costData.budget.toFixed(2)}</p>
                            )}
                        </div>
                        {costData.budget > 0 && (
                            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all ${costData.isOverBudget ? 'bg-red-500' : 'bg-amber-500'}`}
                                    style={{ width: `${Math.min(100, (costData.totalCost / costData.budget) * 100)}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Nutrition Overview ── */}
                <NutritionTracker dailyData={nutritionData.daily} weeklyData={nutritionData.weekly} />

                {/* ── Quick Actions ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Link
                        to="/generate"
                        className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-md hover:shadow-lg hover:shadow-emerald-200 transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
                        <Sparkles className="w-7 h-7 mb-3" />
                        <h3 className="font-bold text-lg">Generate Recipe</h3>
                        <p className="text-emerald-100 text-sm mt-1">AI-powered cooking ideas</p>
                        <ArrowRight className="w-4 h-4 mt-3 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        to="/pantry"
                        className="group card-hover p-6"
                    >
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <UtensilsCrossed className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">Manage Pantry</h3>
                        <p className="text-gray-500 text-sm mt-1">Track & add ingredients</p>
                        <ArrowRight className="w-4 h-4 mt-3 text-gray-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                    </Link>

                    <Link
                        to="/shopping-list"
                        className="group card-hover p-6"
                    >
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <ShoppingCart className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">Shopping List</h3>
                        <p className="text-gray-500 text-sm mt-1">Plan your next grocery run</p>
                        <ArrowRight className="w-4 h-4 mt-3 text-gray-400 group-hover:translate-x-1 group-hover:text-purple-500 transition-all" />
                    </Link>
                </div>

                {/* ── Recent Recipes & Upcoming Meals ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Recipes */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Recent Recipes
                            </h2>
                            <Link to="/recipes" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                View all <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {recentRecipes.length > 0 ? (
                            <div className="space-y-2">
                                {recentRecipes.map((recipe) => (
                                    <Link
                                        key={recipe.id}
                                        to={`/recipes/${recipe.id}`}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="w-10 h-10 bg-linear-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center shrink-0">
                                            <ChefHat className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate group-hover:text-emerald-600 transition-colors text-sm">
                                                {recipe.name}
                                            </p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                {recipe.cook_time} mins
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 shrink-0 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<ChefHat className="w-10 h-10 text-emerald-300" />}
                                message="No recipes yet"
                                sub="Generate your first AI recipe to get started"
                                to="/generate"
                                cta="Generate Recipe"
                            />
                        )}
                    </div>

                    {/* Upcoming Meals */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-500" />
                                Upcoming Meals
                            </h2>
                            <Link to="/meal-plan" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                View calendar <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {upcomingMeals.length > 0 ? (
                            <div className="space-y-2">
                                {upcomingMeals.map((meal) => (
                                    <div
                                        key={meal.id}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                                            <span className="text-lg">
                                                {meal.meal_type === 'breakfast' ? '🌅'
                                                    : meal.meal_type === 'lunch' ? '☀️'
                                                    : '🌙'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate text-sm">{meal.recipe_name}</p>
                                            <p className="text-xs text-gray-400 capitalize mt-0.5">{meal.meal_type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<Calendar className="w-10 h-10 text-purple-300" />}
                                message="No meals planned"
                                sub="Start planning your week's meals"
                                to="/meal-plan"
                                cta="Plan Meals"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, to, colorClass, bgClass, textClass }) => (
    <Link to={to} className="card-hover p-6 group">
        <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 ${bgClass} rounded-xl flex items-center justify-center ${textClass}`}>
                {icon}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
        </div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        <div className={`mt-3 h-1 w-12 rounded-full bg-linear-to-r ${colorClass}`} />
    </Link>
);

const EmptyState = ({ icon, message, sub, to, cta }) => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-3">{icon}</div>
        <p className="font-semibold text-gray-700 text-sm">{message}</p>
        <p className="text-xs text-gray-400 mt-1 mb-4">{sub}</p>
        <Link
            to={to}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full transition-colors"
        >
            {cta} <ArrowRight className="w-3 h-3" />
        </Link>
    </div>
);

export default Dashboard;
