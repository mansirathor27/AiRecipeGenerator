import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Clock, Users, ChefHat, ArrowLeft, Trash2,
    DollarSign, Flame, Beef, Wheat, Droplets,
    Play, CheckCircle2, Circle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import CookMode from '../components/CookMode';
import toast from 'react-hot-toast';
import api from '../services/api';

const DIFF_STYLE = {
    easy:   { pill: 'bg-green-100 text-green-700',  label: 'Easy' },
    medium: { pill: 'bg-amber-100 text-amber-700',  label: 'Medium' },
    hard:   { pill: 'bg-red-100 text-red-700',      label: 'Hard' },
};

const CARD_GRADIENTS = [
    'from-emerald-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-pink-500 to-rose-600',
];

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [servings, setServings] = useState(4);
    const [checkedIngredients, setCheckedIngredients] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [isCooking, setIsCooking] = useState(false);
    const [baseCost, setBaseCost] = useState(0);

    useEffect(() => { fetchRecipe(); }, [id]);

    const fetchRecipe = async () => {
        try {
            const [recipeRes, costRes] = await Promise.allSettled([
                api.get(`/recipes/${id}`),
                api.get(`/cost/recipe/${id}`)
            ]);

            if (recipeRes.status === 'rejected') {
                toast.error('Failed to load recipe');
                navigate('/recipes');
                return;
            }

            const recipeData = recipeRes.value.data.data.recipe;
            setRecipe(recipeData);
            setServings(recipeData.servings || 4);

            if (costRes.status === 'fulfilled') {
                setBaseCost(costRes.value.data.data.totalCost || 0);
            }
        } catch {
            toast.error('Failed to load recipe');
            navigate('/recipes');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this recipe?')) return;
        try {
            await api.delete(`/recipes/${id}`);
            toast.success('Recipe deleted');
            navigate('/recipes');
        } catch {
            toast.error('Failed to delete recipe');
        }
    };

    const toggleIngredient = (index) => {
        const newChecked = new Set(checkedIngredients);
        newChecked.has(index) ? newChecked.delete(index) : newChecked.add(index);
        setCheckedIngredients(newChecked);
    };

    const adjustQuantity = (originalQty, originalServings) =>
        ((originalQty * servings) / originalServings).toFixed(2);

    if (loading) {
        return (
            <div className="page-container">
                <Navbar />
                <div className="page-content max-w-5xl">
                    <div className="skeleton h-8 w-32 rounded-xl mb-6" />
                    <div className="skeleton h-56 w-full rounded-2xl mb-6" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="skeleton h-96 rounded-2xl" />
                        <div className="skeleton h-96 rounded-2xl lg:col-span-2" />
                    </div>
                </div>
            </div>
        );
    }

    if (!recipe) return null;

    const totalTime       = (recipe.prep_time || 0) + (recipe.cook_time || 0);
    const originalServings = recipe.servings || 4;
    const diff            = DIFF_STYLE[recipe.difficulty];
    const gradient        = CARD_GRADIENTS[recipe.id % CARD_GRADIENTS.length] || CARD_GRADIENTS[0];
    const checkedCount    = checkedIngredients.size;
    const totalIngredients = recipe.ingredients?.length || 0;

    return (
        <div className="page-container">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {/* Back */}
                <Link
                    to="/recipes"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Recipes
                </Link>

                {/* ── Hero Banner ── */}
                <div className={`relative overflow-hidden rounded-2xl mb-6 bg-linear-to-br ${gradient} text-white shadow-lg`}>
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `radial-gradient(circle at 20px 20px, white 1px, transparent 0)`,
                            backgroundSize: '40px 40px'
                        }}
                    />
                    {/* Big initial watermark */}
                    <div className="absolute -right-8 -bottom-8 text-[160px] font-black text-white/10 leading-none select-none">
                        {recipe.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="relative p-8">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 pr-4">
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {recipe.cuisine_type && (
                                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                                            {recipe.cuisine_type}
                                        </span>
                                    )}
                                    {diff && (
                                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
                                            {diff.label}
                                        </span>
                                    )}
                                    {recipe.dietary_tags?.map(tag => (
                                        <span key={tag} className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2">{recipe.name}</h1>
                                {recipe.description && (
                                    <p className="text-white/80 text-sm sm:text-base">{recipe.description}</p>
                                )}
                            </div>

                            {/* Delete */}
                            <button
                                onClick={handleDelete}
                                className="p-2 bg-white/15 hover:bg-red-500/80 text-white rounded-xl transition-all backdrop-blur-sm"
                                title="Delete recipe"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Meta strip */}
                        <div className="flex flex-wrap gap-4 mt-6 text-sm text-white/90">
                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">{totalTime} min total</span>
                            </div>
                            {recipe.prep_time && (
                                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                                    <span>Prep: {recipe.prep_time} min</span>
                                </div>
                            )}
                            {recipe.cook_time && (
                                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                                    <span>Cook: {recipe.cook_time} min</span>
                                </div>
                            )}
                            {baseCost > 0 && (
                                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 font-semibold">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Est. ${((baseCost * servings) / originalServings).toFixed(2)}</span>
                                    <span className="text-white/70 font-normal text-xs">
                                        (${(baseCost / originalServings).toFixed(2)}/serving)
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Ingredients (sticky sidebar) ── */}
                    <div className="lg:col-span-1">
                        <div className="card p-6 lg:sticky lg:top-24">
                            {/* Header with servings adjuster */}
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-gray-900">Ingredients</h2>
                                <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
                                    <button
                                        onClick={() => setServings(Math.max(1, servings - 1))}
                                        className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 font-bold transition-colors text-lg leading-none"
                                    >
                                        −
                                    </button>
                                    <div className="flex items-center gap-1 px-2">
                                        <Users className="w-3.5 h-3.5 text-gray-500" />
                                        <span className="text-sm font-bold text-gray-900 w-5 text-center">{servings}</span>
                                    </div>
                                    <button
                                        onClick={() => setServings(servings + 1)}
                                        className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 font-bold transition-colors text-lg leading-none"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {servings !== originalServings && (
                                <button
                                    onClick={() => setServings(originalServings)}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold mb-4 block"
                                >
                                    Reset to {originalServings} servings
                                </button>
                            )}

                            {/* Progress */}
                            {totalIngredients > 0 && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Checked off</span>
                                        <span>{checkedCount}/{totalIngredients}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                            style={{ width: `${totalIngredients ? (checkedCount / totalIngredients) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Ingredients list */}
                            <div className="space-y-2 custom-scrollbar" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                {recipe.ingredients?.map((ingredient, index) => {
                                    const adjustedQty = adjustQuantity(ingredient.quantity, originalServings);
                                    const isChecked   = checkedIngredients.has(index);
                                    return (
                                        <label
                                            key={index}
                                            className={`flex items-start gap-3 cursor-pointer p-2.5 rounded-xl transition-all ${
                                                isChecked ? 'bg-gray-50' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleIngredient(index)}
                                                className="mt-0.5 shrink-0"
                                            >
                                                {isChecked
                                                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    : <Circle className="w-5 h-5 text-gray-300" />
                                                }
                                            </button>
                                            <span className={`text-sm flex-1 ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                <span className="font-semibold">{adjustedQty}</span> {ingredient.unit}{' '}
                                                <span className="capitalize">{ingredient.name}</span>
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── Instructions + Nutrition ── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Instructions */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-base font-bold text-gray-900">Instructions</h2>
                                <button
                                    onClick={() => setIsCooking(true)}
                                    className="btn-primary py-2 px-4 text-sm"
                                >
                                    <Play className="w-4 h-4" />
                                    Start Cooking
                                </button>
                            </div>

                            <ol className="space-y-5">
                                {recipe.instructions?.map((step, index) => (
                                    <li key={index} className="flex gap-4 group">
                                        <div className="shrink-0 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm group-hover:scale-110 transition-transform">
                                            {index + 1}
                                        </div>
                                        <p className="text-gray-700 pt-1.5 text-sm leading-relaxed flex-1">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Nutrition */}
                        {recipe.nutrition && (
                            <div className="card p-6">
                                <h2 className="text-base font-bold text-gray-900 mb-5">
                                    Nutrition <span className="text-gray-400 font-normal text-sm">per serving</span>
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    <NutritionCard label="Calories" value={recipe.nutrition.calories} unit="kcal"
                                        icon={<Flame className="w-4 h-4" />} color="text-orange-500" bg="bg-orange-50" />
                                    <NutritionCard label="Protein"  value={recipe.nutrition.protein}  unit="g"
                                        icon={<Beef className="w-4 h-4" />} color="text-blue-500" bg="bg-blue-50" />
                                    <NutritionCard label="Carbs"    value={recipe.nutrition.carbs}    unit="g"
                                        icon={<Wheat className="w-4 h-4" />} color="text-amber-500" bg="bg-amber-50" />
                                    <NutritionCard label="Fats"     value={recipe.nutrition.fats}     unit="g"
                                        icon={<Droplets className="w-4 h-4" />} color="text-rose-500" bg="bg-rose-50" />
                                    <NutritionCard label="Fiber"    value={recipe.nutrition.fiber}    unit="g"
                                        icon={<span className="text-xs">🌿</span>} color="text-green-600" bg="bg-green-50" />
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {recipe.user_notes && (
                            <div className="card p-6 border-l-4 border-emerald-400 bg-emerald-50/30">
                                <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                    📝 Chef's Notes
                                </h3>
                                <p className="text-emerald-800 text-sm leading-relaxed">{recipe.user_notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cook Mode */}
            {isCooking && (
                <CookMode
                    recipeName={recipe.name}
                    instructions={recipe.instructions}
                    onClose={() => setIsCooking(false)}
                />
            )}
        </div>
    );
};

const NutritionCard = ({ label, value, unit, icon, color, bg }) => (
    <div className={`${bg} rounded-xl p-4 text-center`}>
        <div className={`flex justify-center mb-2 ${color}`}>{icon}</div>
        <div className="text-xl font-bold text-gray-900">{value}<span className="text-xs text-gray-400 ml-0.5">{unit}</span></div>
        <div className="text-xs text-gray-500 mt-0.5 font-medium">{label}</div>
    </div>
);

export default RecipeDetail;
