import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, X, ChefHat, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import api from '../services/api';

const MEAL_TYPES = [
    { key: 'breakfast', label: 'Breakfast', emoji: '🌅', color: 'from-amber-400 to-orange-500',  light: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700' },
    { key: 'lunch',     label: 'Lunch',     emoji: '☀️', color: 'from-blue-400 to-cyan-500',    light: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-700' },
    { key: 'dinner',    label: 'Dinner',    emoji: '🌙', color: 'from-violet-400 to-purple-500', light: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MealPlanner = () => {
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
    const [mealPlan, setMealPlan] = useState({});
    const [recipes, setRecipes] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMealPlan();
        fetchRecipes();
    }, [weekStart]);

    const fetchMealPlan = async () => {
        try {
            const startDate = format(weekStart, 'yyyy-MM-dd');
            const endDate   = format(addDays(weekStart, 6), 'yyyy-MM-dd');
            const response  = await api.get(`/meal-plans/weekly?start_date=${startDate}&end_date=${endDate}`);
            const meals     = response.data.data.mealPlans;
            const organized = {};
            meals.forEach(meal => {
                if (!organized[meal.meal_date]) organized[meal.meal_date] = {};
                organized[meal.meal_date][meal.meal_type] = meal;
            });
            setMealPlan(organized);
        } catch {
            toast.error('Failed to load meal plan');
        } finally {
            setLoading(false);
        }
    };

    const fetchRecipes = async () => {
        try {
            const response = await api.get('/recipes');
            setRecipes(response.data.data.recipes);
        } catch {
            toast.error('Failed to load recipes');
        }
    };

    const handleAddMeal = (date, mealType) => {
        setSelectedSlot({ date, mealType });
        setShowAddModal(true);
    };

    const handleRemoveMeal = async (mealId) => {
        if (!confirm('Remove this meal from your plan?')) return;
        try {
            await api.delete(`/meal-plans/${mealId}`);
            await fetchMealPlan();
            toast.success('Meal removed');
        } catch {
            toast.error('Failed to remove meal');
        }
    };

    const getDayMeals = (dayIndex) => {
        const date = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
        return mealPlan[date] || {};
    };

    const totalMeals = Object.values(mealPlan).reduce((acc, day) => acc + Object.keys(day).length, 0);
    const isCurrentWeek = format(startOfWeek(new Date()), 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd');

    return (
        <div className="page-container">
            <Navbar />

            <div className="page-content animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <LayoutGrid className="w-7 h-7 text-emerald-500" />
                            Meal Planner
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {format(weekStart, 'MMMM d')} – {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
                            {totalMeals > 0 && <span className="ml-2 text-emerald-600 font-medium">· {totalMeals} meals planned</span>}
                        </p>
                    </div>

                    {/* Week navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setWeekStart(addDays(weekStart, -7))}
                            className="btn-secondary p-2.5"
                            title="Previous week"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setWeekStart(startOfWeek(new Date()))}
                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                isCurrentWeek
                                    ? 'bg-emerald-500 text-white shadow-sm'
                                    : 'btn-secondary'
                            }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setWeekStart(addDays(weekStart, 7))}
                            className="btn-secondary p-2.5"
                            title="Next week"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Calendar Grid ── */}
                <div className="card overflow-hidden mb-6">
                    {/* Day headers */}
                    <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-100">
                        {/* Meal label column */}
                        <div className="p-4 flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                        </div>

                        {DAYS_OF_WEEK.map((day, index) => {
                            const date     = addDays(weekStart, index);
                            const todayCol = isToday(date);
                            return (
                                <div
                                    key={day}
                                    className={`p-3 text-center border-l border-gray-100 ${todayCol ? 'bg-emerald-50' : ''}`}
                                >
                                    <p className={`text-xs font-bold uppercase tracking-wider ${todayCol ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {day}
                                    </p>
                                    <p className={`text-lg font-bold mt-0.5 ${todayCol ? 'text-emerald-700' : 'text-gray-700'}`}>
                                        {format(date, 'd')}
                                    </p>
                                    {todayCol && (
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mx-auto mt-1" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Meal rows */}
                    {MEAL_TYPES.map((mealType, mIndex) => (
                        <div
                            key={mealType.key}
                            className={`grid grid-cols-8 ${mIndex < MEAL_TYPES.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                            {/* Row label */}
                            <div className={`p-4 flex flex-col items-center justify-center gap-1.5 ${mealType.light} border-r border-gray-100`}>
                                <span className="text-xl">{mealType.emoji}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${mealType.text}`}>
                                    {mealType.label}
                                </span>
                            </div>

                            {/* Day cells */}
                            {DAYS_OF_WEEK.map((_, dayIndex) => {
                                const date     = format(addDays(weekStart, dayIndex), 'yyyy-MM-dd');
                                const dayMeals = getDayMeals(dayIndex);
                                const meal     = dayMeals[mealType.key];
                                const todayCol = isToday(addDays(weekStart, dayIndex));

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`p-2 border-l border-gray-100 min-h-[90px] ${todayCol ? 'bg-emerald-50/40' : ''}`}
                                    >
                                        {meal ? (
                                            <div className="relative group h-full">
                                                <div className={`rounded-xl overflow-hidden border ${mealType.border} h-full`}>
                                                    <div className={`h-1 bg-linear-to-r ${mealType.color}`} />
                                                    <div className={`p-2 ${mealType.light}`}>
                                                        <p className={`text-[11px] font-semibold line-clamp-2 ${mealType.text} leading-tight`}>
                                                            {meal.recipe_name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveMeal(meal.id)}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                                    title="Remove meal"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAddMeal(date, mealType.key)}
                                                className="w-full h-full min-h-[70px] flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-gray-300 hover:text-emerald-500 transition-all duration-200 group"
                                                title={`Add ${mealType.label}`}
                                            >
                                                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Footer stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Meals Planned',  value: totalMeals,         icon: '📅' },
                        { label: 'Total Recipes',   value: recipes.length,     icon: '📚' },
                        { label: 'Days Covered',    value: Object.keys(mealPlan).length, icon: '✅' },
                    ].map(({ label, value, icon }) => (
                        <div key={label} className="card p-5 flex items-center gap-4">
                            <span className="text-3xl">{icon}</span>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{value}</p>
                                <p className="text-sm text-gray-500">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Meal Modal */}
            {showAddModal && selectedSlot && (
                <AddMealModal
                    date={selectedSlot.date}
                    mealType={selectedSlot.mealType}
                    recipes={recipes}
                    onClose={() => { setShowAddModal(false); setSelectedSlot(null); }}
                    onSuccess={async () => {
                        await fetchMealPlan();
                        setShowAddModal(false);
                        setSelectedSlot(null);
                    }}
                />
            )}
        </div>
    );
};

/* ── Add Meal Modal ── */
const AddMealModal = ({ date, mealType, recipes, onClose, onSuccess }) => {
    const [selectedRecipe, setSelectedRecipe] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const mealMeta = MEAL_TYPES.find(m => m.key === mealType);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRecipe) { toast.error('Please select a recipe'); return; }
        setLoading(true);
        try {
            await api.post('meal-plans', {
                recipe_id: selectedRecipe,
                planned_date: date,
                meal_type: mealType
            });
            toast.success('Meal added! 🗓️');
            onSuccess();
        } catch {
            toast.error('Failed to add meal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className={`bg-linear-to-r ${mealMeta?.color || 'from-emerald-500 to-teal-600'} p-5 text-white`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                                {format(new Date(date + 'T12:00:00'), 'EEEE, MMMM d')}
                            </p>
                            <h2 className="text-lg font-bold flex items-center gap-2 mt-0.5">
                                <span>{mealMeta?.emoji}</span>
                                Add {mealMeta?.label || mealType}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search recipes…"
                            className="input-field"
                            autoFocus
                        />

                        <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                            {filteredRecipes.length > 0 ? (
                                filteredRecipes.map(recipe => (
                                    <label
                                        key={recipe.id}
                                        className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all duration-150 ${
                                            selectedRecipe === recipe.id
                                                ? 'border-emerald-500 bg-emerald-50'
                                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="recipe"
                                            value={recipe.id}
                                            checked={selectedRecipe === recipe.id}
                                            onChange={(e) => setSelectedRecipe(e.target.value)}
                                            className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
                                        />
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                                            <ChefHat className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{recipe.name}</p>
                                            {recipe.cuisine_type && (
                                                <p className="text-xs text-gray-400">{recipe.cuisine_type}</p>
                                            )}
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <ChefHat className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">No recipes found</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3">Cancel</button>
                            <button
                                type="submit"
                                disabled={loading || !selectedRecipe}
                                className="flex-1 btn-primary py-3"
                            >
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Adding…</>
                                ) : 'Add Meal'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MealPlanner;
