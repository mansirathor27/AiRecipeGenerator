import { useState, useEffect } from 'react';
import { ChefHat, Sparkles, Plus, X, Clock, Users, Flame, Beef, Wheat, Droplets, Package } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const CUISINES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'French', 'Mediterranean', 'American'];
const DIETARY_OPTIONS = [
    { label: 'Vegetarian', emoji: '🥗' },
    { label: 'Vegan',       emoji: '🌱' },
    { label: 'Gluten-Free', emoji: '🌾' },
    { label: 'Dairy-Free',  emoji: '🥛' },
    { label: 'Keto',        emoji: '🥑' },
    { label: 'Paleo',       emoji: '🍖' },
];
const COOKING_TIMES = [
    { value: 'quick',  label: 'Quick',  sub: '< 30 min', emoji: '⚡' },
    { value: 'medium', label: 'Medium', sub: '30–60 min', emoji: '🕐' },
    { value: 'long',   label: 'Long',   sub: '> 60 min', emoji: '🍲' },
];

const RecipeGenerator = () => {
    const [ingredients, setIngredients] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [usePantry, setUsePantry] = useState(false);
    const [cuisineType, setCuisineType] = useState('Any');
    const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
    const [servings, setServings] = useState(4);
    const [cookingTime, setCookingTime] = useState('medium');
    const [generating, setGenerating] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUserPreferences = async () => {
            try {
                const response = await api.get('/users/profile');
                const preferences = response.data.data.preferences;
                if (preferences) {
                    if (preferences.dietary_restrictions?.length > 0) setDietaryRestrictions(preferences.dietary_restrictions);
                    if (preferences.preferred_cuisines?.length > 0) setCuisineType(preferences.preferred_cuisines[0]);
                    if (preferences.default_servings) setServings(preferences.default_servings);
                }
            } catch { /* silent */ }
        };
        fetchUserPreferences();
    }, []);

    const addIngredient = () => {
        if (inputValue.trim() && !ingredients.includes(inputValue.trim())) {
            setIngredients([...ingredients, inputValue.trim()]);
            setInputValue('');
        }
    };

    const removeIngredient = (ingredient) => setIngredients(ingredients.filter(i => i !== ingredient));

    const toggleDietary = (option) => {
        setDietaryRestrictions(
            dietaryRestrictions.includes(option)
                ? dietaryRestrictions.filter(d => d !== option)
                : [...dietaryRestrictions, option]
        );
    };

    const handleGenerate = async () => {
        if (!usePantry && ingredients.length === 0) {
            toast.error('Please add at least one ingredient or use pantry items');
            return;
        }
        setGenerating(true);
        setGeneratedRecipe(null);
        try {
            const response = await api.post('/recipes/generate', {
                ingredients,
                usePantryIngredients: usePantry,
                dietaryRestrictions,
                cuisineType: cuisineType === 'Any' ? 'any' : cuisineType,
                servings,
                cookingTime
            });

            if (response.data?.success && response.data?.data?.recipe) {
                setGeneratedRecipe(response.data.data.recipe);
                toast.success('Recipe generated! 🎉');
            } else {
                throw new Error('No recipe returned from server');
            }
        } catch (error) {
            console.error('Generation Error:', error);
            const errMsg = error.response?.data?.message || error.message || 'Failed to generate recipe';
            toast.error(errMsg);
        } finally {
            setGenerating(false);
        }
    };

    const handleSaveRecipe = async () => {
        if (!generatedRecipe) return;
        setSaving(true);
        try {
            await api.post('/recipes', {
                name: generatedRecipe.name,
                description: generatedRecipe.description,
                cuisine_type: generatedRecipe.cuisineType,
                difficulty: generatedRecipe.difficulty,
                prep_time: generatedRecipe.prepTime,
                cook_time: generatedRecipe.cookTime,
                servings: generatedRecipe.servings,
                instructions: generatedRecipe.instructions,
                dietary_tags: generatedRecipe.dietaryTags || [],
                ingredients: generatedRecipe.ingredients,
                nutrition: generatedRecipe.nutrition
            });
            toast.success('Recipe saved to your collection! 📚');
        } catch {
            toast.error('Failed to save recipe');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container">
            <Navbar />

            <div className="page-content animate-fade-in">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl mb-5 shadow-lg shadow-emerald-200 animate-float">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Recipe Generator</h1>
                    <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
                        Tell us what you have and we'll create a delicious recipe tailored just for you
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* ── Left: Inputs ── */}
                    <div className="space-y-5">

                        {/* Ingredients */}
                        <div className="card p-6">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Ingredients</h2>

                            {/* Pantry toggle */}
                            <div
                                onClick={() => setUsePantry(!usePantry)}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 mb-4 ${
                                    usePantry
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Package className={`w-5 h-5 ${usePantry ? 'text-emerald-600' : 'text-gray-400'}`} />
                                    <div>
                                        <p className={`text-sm font-semibold ${usePantry ? 'text-emerald-900' : 'text-gray-700'}`}>
                                            Use my pantry
                                        </p>
                                        <p className="text-xs text-gray-400">Auto-include pantry ingredients</p>
                                    </div>
                                </div>
                                {/* Toggle switch */}
                                <div className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${usePantry ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 shadow-sm ${usePantry ? 'translate-x-6' : 'translate-x-1'}`} />
                                </div>
                            </div>

                            {/* Ingredient input */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                                    placeholder="Add ingredient (e.g., tomatoes)…"
                                    className="input-field flex-1"
                                />
                                <button onClick={addIngredient} className="btn-primary px-4 py-2.5 shrink-0">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Ingredient chips */}
                            {ingredients.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {ingredients.map((ingredient, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-800 rounded-full text-sm font-medium"
                                        >
                                            {ingredient}
                                            <button
                                                onClick={() => removeIngredient(ingredient)}
                                                className="w-4 h-4 rounded-full hover:bg-emerald-200 flex items-center justify-center transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                !usePantry && (
                                    <p className="text-xs text-gray-400 text-center py-3">
                                        Add ingredients above or enable pantry mode
                                    </p>
                                )
                            )}
                        </div>

                        {/* Preferences */}
                        <div className="card p-6 space-y-6">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Preferences</h2>

                            {/* Cuisine */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cuisine Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {CUISINES.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setCuisineType(c)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                                                cuisineType === c
                                                    ? 'bg-emerald-500 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dietary */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Dietary Restrictions</label>
                                <div className="flex flex-wrap gap-2">
                                    {DIETARY_OPTIONS.map(({ label, emoji }) => (
                                        <button
                                            key={label}
                                            onClick={() => toggleDietary(label)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                                                dietaryRestrictions.includes(label)
                                                    ? 'bg-emerald-500 text-white shadow-sm'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <span>{emoji}</span> {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Servings */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Servings — <span className="text-emerald-600 text-sm font-bold">{servings}</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">1</span>
                                    <input
                                        type="range"
                                        min="1"
                                        max="12"
                                        value={servings}
                                        onChange={(e) => setServings(parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <span className="text-xs text-gray-400">12</span>
                                </div>
                            </div>

                            {/* Cooking time */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cooking Time</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {COOKING_TIMES.map(time => (
                                        <button
                                            key={time.value}
                                            onClick={() => setCookingTime(time.value)}
                                            className={`flex flex-col items-center p-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                                                cookingTime === time.value
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-xl mb-1">{time.emoji}</span>
                                            <span>{time.label}</span>
                                            <span className="text-[10px] text-gray-400 font-normal">{time.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Generate button */}
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5"
                            style={{ background: generating ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #0d9488)' }}
                        >
                            {generating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Generating your recipe…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Recipe
                                </>
                            )}
                        </button>
                    </div>

                    {/* ── Right: Result ── */}
                    <div>
                        {generating && <GeneratingSkeleton />}

                        {!generating && generatedRecipe && (
                            <div className="card overflow-hidden animate-scale-in">
                                {/* Recipe header stripe */}
                                <div className="bg-linear-to-br from-emerald-500 to-teal-600 p-6 text-white">
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="bg-white/20 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full">
                                            {generatedRecipe.cuisineType}
                                        </span>
                                        <span className="bg-white/20 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full capitalize">
                                            {generatedRecipe.difficulty}
                                        </span>
                                        {generatedRecipe.dietaryTags?.map(tag => (
                                            <span key={tag} className="bg-white/20 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                    <h2 className="text-xl font-bold">{generatedRecipe.name}</h2>
                                    <p className="text-emerald-100 text-sm mt-1">{generatedRecipe.description}</p>
                                    <div className="flex gap-4 mt-4 text-sm text-white/80">
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {generatedRecipe.prepTime + generatedRecipe.cookTime} min</span>
                                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {generatedRecipe.servings} servings</span>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Ingredients */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Ingredients</h3>
                                        <ul className="space-y-1.5">
                                            {generatedRecipe.ingredients?.map((ing, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                                                    <span className="font-medium">{ing.quantity}</span> {ing.unit} {ing.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Instructions */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Instructions</h3>
                                        <ol className="space-y-3">
                                            {generatedRecipe.instructions?.map((step, i) => (
                                                <li key={i} className="flex gap-3">
                                                    <span className="shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-sm text-gray-700 pt-0.5">{step}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    {/* Nutrition */}
                                    {generatedRecipe.nutrition && (
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Nutrition / serving</h3>
                                            <div className="grid grid-cols-5 gap-2">
                                                {[
                                                    { label: 'Cal',     value: generatedRecipe.nutrition.calories, unit: 'kcal', icon: <Flame className="w-3.5 h-3.5" />, color: 'text-orange-500', bg: 'bg-orange-50' },
                                                    { label: 'Protein', value: generatedRecipe.nutrition.protein,  unit: 'g',    icon: <Beef className="w-3.5 h-3.5" />, color: 'text-blue-500', bg: 'bg-blue-50' },
                                                    { label: 'Carbs',   value: generatedRecipe.nutrition.carbs,    unit: 'g',    icon: <Wheat className="w-3.5 h-3.5" />, color: 'text-amber-500', bg: 'bg-amber-50' },
                                                    { label: 'Fats',    value: generatedRecipe.nutrition.fats,     unit: 'g',    icon: <Droplets className="w-3.5 h-3.5" />, color: 'text-rose-500', bg: 'bg-rose-50' },
                                                    { label: 'Fiber',   value: generatedRecipe.nutrition.fiber,    unit: 'g',    icon: <span className="text-xs">🌿</span>, color: 'text-green-600', bg: 'bg-green-50' },
                                                ].map(({ label, value, unit, icon, color, bg }) => (
                                                    <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                                                        <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
                                                        <div className="text-sm font-bold text-gray-900">{value}<span className="text-[10px] text-gray-400">{unit}</span></div>
                                                        <div className="text-[10px] text-gray-500 font-medium">{label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tips */}
                                    {generatedRecipe.cookingTips?.length > 0 && (
                                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                            <h3 className="font-bold text-amber-900 mb-2 text-sm flex items-center gap-1.5">
                                                💡 Cooking Tips
                                            </h3>
                                            <ul className="space-y-1">
                                                {generatedRecipe.cookingTips.map((tip, i) => (
                                                    <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                                                        <span className="mt-1 w-1 h-1 bg-amber-500 rounded-full shrink-0" />
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={handleSaveRecipe}
                                            disabled={saving}
                                            className="flex-1 btn-primary py-3"
                                        >
                                            {saving ? (
                                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                                            ) : '💾 Save Recipe'}
                                        </button>
                                        <button
                                            onClick={() => setGeneratedRecipe(null)}
                                            className="btn-secondary px-5"
                                        >
                                            New
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!generating && !generatedRecipe && (
                            <div className="card p-16 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                                <div className="w-20 h-20 bg-linear-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-5">
                                    <ChefHat className="w-10 h-10 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Ready to cook?</h3>
                                <p className="text-gray-400 text-sm max-w-xs">
                                    Add your ingredients, set your preferences, and hit generate to get a personalized recipe
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const GeneratingSkeleton = () => (
    <div className="card overflow-hidden animate-pulse">
        <div className="skeleton h-40 rounded-none" />
        <div className="p-6 space-y-4">
            <div className="skeleton h-5 w-2/3 rounded-lg" />
            <div className="skeleton h-4 w-full rounded-lg" />
            <div className="skeleton h-4 w-5/6 rounded-lg" />
            <div className="grid grid-cols-5 gap-2 pt-2">
                {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
            <div className="skeleton h-10 w-full rounded-xl mt-4" />
        </div>
    </div>
);

export default RecipeGenerator;
