import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ChefHat, Trash2, BookOpen, ArrowRight, Utensils } from 'lucide-react';
import Navbar from '../components/Navbar';
import SkeletonCard from '../components/SkeletonCard';
import toast from 'react-hot-toast';
import api from '../services/api';

const CUISINES    = ['All', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
const DIFFICULTIES = ['All', 'easy', 'medium', 'hard'];

const DIFFICULTY_STYLE = {
    easy:   { pill: 'bg-green-100 text-green-700',  label: 'Easy' },
    medium: { pill: 'bg-amber-100 text-amber-700',  label: 'Medium' },
    hard:   { pill: 'bg-red-100 text-red-700',      label: 'Hard' },
};

const MyRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchRecipes(); }, []);
    useEffect(() => { filterRecipes(); }, [recipes, searchQuery, selectedCuisine, selectedDifficulty]);

    const fetchRecipes = async () => {
        try {
            const response = await api.get('/recipes');
            setRecipes(response.data.data.recipes);
        } catch (error) {
            toast.error('Failed to load recipes');
        } finally {
            setLoading(false);
        }
    };

    const filterRecipes = () => {
        let filtered = recipes;
        if (searchQuery) {
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (selectedCuisine !== 'All') filtered = filtered.filter(r => r.cuisine_type === selectedCuisine);
        if (selectedDifficulty !== 'All') filtered = filtered.filter(r => r.difficulty === selectedDifficulty);
        setFilteredRecipes(filtered);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this recipe?')) return;
        try {
            await api.delete(`/recipes/${id}`);
            setRecipes(recipes.filter(r => r.id !== id));
            toast.success('Recipe deleted');
        } catch {
            toast.error('Failed to delete recipe');
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <Navbar />
                <div className="page-content">
                    <div className="skeleton h-10 w-64 rounded-xl mb-6" />
                    <div className="skeleton h-14 w-full rounded-2xl mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkeletonCard type="recipe" count={6} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <Navbar />

            <div className="page-content animate-fade-in">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="w-7 h-7 text-emerald-500" />
                        My Recipes
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {recipes.length > 0
                            ? `${filteredRecipes.length} of ${recipes.length} recipes`
                            : 'Your saved recipe collection'}
                    </p>
                </div>

                {/* Search + Filters */}
                <div className="card p-4 mb-6 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search recipes by name or description…"
                            className="input-field pl-11"
                        />
                    </div>

                    {/* Cuisine pills */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cuisine</p>
                        <div className="flex flex-wrap gap-2">
                            {CUISINES.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setSelectedCuisine(c)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                                        selectedCuisine === c
                                            ? 'bg-emerald-500 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {c === 'All' ? 'All Cuisines' : c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty pills */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Difficulty</p>
                        <div className="flex flex-wrap gap-2">
                            {DIFFICULTIES.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setSelectedDifficulty(d)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                                        selectedDifficulty === d
                                            ? 'bg-emerald-500 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {d === 'All' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recipes Grid */}
                {filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                        {filteredRecipes.map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
                        ))}
                    </div>
                ) : (
                    <div className="card p-16 text-center animate-scale-in">
                        <div className="relative inline-block mb-6">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                                <ChefHat className="w-10 h-10 text-emerald-300" />
                            </div>
                            <div className="absolute inset-0 rounded-full border-2 border-emerald-100 animate-pulse-ring" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {recipes.length === 0 ? 'No recipes yet' : 'No recipes match your filters'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            {recipes.length === 0
                                ? 'Generate your first AI recipe and it will appear here'
                                : 'Try adjusting your search or clearing the filters'}
                        </p>
                        {recipes.length === 0 ? (
                            <Link to="/generate" className="btn-primary inline-flex">
                                <Utensils className="w-4 h-4" />
                                Generate First Recipe
                            </Link>
                        ) : (
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCuisine('All'); setSelectedDifficulty('All'); }}
                                className="btn-secondary inline-flex"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Recipe Card ── */
const CARD_GRADIENTS = [
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-indigo-500',
    'from-violet-400 to-purple-500',
    'from-amber-400 to-orange-500',
    'from-pink-400 to-rose-500',
    'from-cyan-400 to-sky-500',
];

const RecipeCard = ({ recipe, onDelete }) => {
    const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const gradient  = CARD_GRADIENTS[recipe.id % CARD_GRADIENTS.length] || CARD_GRADIENTS[0];
    const initial   = recipe.name?.charAt(0)?.toUpperCase() || '?';
    const diff      = DIFFICULTY_STYLE[recipe.difficulty];

    return (
        <div className="card group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-250">
            {/* Image area */}
            <Link to={`/recipes/${recipe.id}`} className="block">
                <div className={`h-44 bg-linear-to-br ${gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-8xl font-black text-white/20 select-none">{initial}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ChefHat className="w-12 h-12 text-white/60" />
                    </div>
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full px-4 py-2 text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                            View Recipe <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>

            {/* Content */}
            <div className="p-5">
                <Link to={`/recipes/${recipe.id}`}>
                    <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {recipe.name}
                    </h3>
                </Link>
                {recipe.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{recipe.description}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {recipe.cuisine_type && (
                        <span className="pill pill-emerald text-xs">{recipe.cuisine_type}</span>
                    )}
                    {diff && (
                        <span className={`pill text-xs ${diff.pill}`}>{diff.label}</span>
                    )}
                    {recipe.dietary_tags?.slice(0, 1).map(tag => (
                        <span key={tag} className="pill pill-purple text-xs">{tag}</span>
                    ))}
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-400 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{totalTime} mins</span>
                    </div>
                    {recipe.calories && <span>{recipe.calories} cal</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                    <Link
                        to={`/recipes/${recipe.id}`}
                        className="flex-1 btn-primary py-2 text-sm"
                    >
                        View Recipe
                    </Link>
                    <button
                        onClick={() => onDelete(recipe.id)}
                        className="px-3 py-2 border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 rounded-xl transition-all duration-200"
                        title="Delete recipe"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyRecipes;
