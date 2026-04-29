import React from 'react';
import { TrendingUp, Activity, Zap, Flame, Beef, Wheat, Droplets } from 'lucide-react';

const NutritionTracker = ({ dailyData, weeklyData }) => {
    const safe = dailyData || {};
    const safeWeekly = weeklyData || [];

    const goals = { calories: 2000, protein: 150, carbs: 250, fats: 70 };

    const getProgress = (value, goal) => Math.min(((value || 0) / goal) * 100, 100);

    const maxWeeklyCalories = safeWeekly.length
        ? Math.max(...safeWeekly.map(d => d.calories || 0), 1)
        : 1;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const macros = [
        {
            label: 'Protein',
            icon: Beef,
            value: safe.protein || 0,
            goal: goals.protein,
            unit: 'g',
            color: 'bg-blue-500',
            light: 'bg-blue-50',
            text: 'text-blue-600',
        },
        {
            label: 'Carbs',
            icon: Wheat,
            value: safe.carbs || 0,
            goal: goals.carbs,
            unit: 'g',
            color: 'bg-amber-500',
            light: 'bg-amber-50',
            text: 'text-amber-600',
        },
        {
            label: 'Fats',
            icon: Droplets,
            value: safe.fats || 0,
            goal: goals.fats,
            unit: 'g',
            color: 'bg-rose-500',
            light: 'bg-rose-50',
            text: 'text-rose-600',
        },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Daily Macros Card */}
            <div className="lg:col-span-1 card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">Today's Nutrition</h2>
                </div>

                {/* Calories big display */}
                <div className="mb-5">
                    <div className="flex justify-between items-baseline mb-2">
                        <div>
                            <span className="text-3xl font-bold text-gray-900">{Math.round(safe.calories || 0)}</span>
                            <span className="text-sm text-gray-400 ml-1">/ {goals.calories} kcal</span>
                        </div>
                        <span className="text-sm font-semibold text-emerald-600">
                            {Math.round(getProgress(safe.calories || 0, goals.calories))}%
                        </span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${getProgress(safe.calories || 0, goals.calories)}%`,
                                background: 'linear-gradient(90deg, #10b981, #0d9488)'
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-xs text-gray-400">Daily calorie goal</span>
                    </div>
                </div>

                {/* Macros */}
                <div className="space-y-4">
                    {macros.map(({ label, icon: Icon, value, goal, unit, color, light, text }) => (
                        <div key={label} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-5 h-5 ${light} rounded flex items-center justify-center`}>
                                        <Icon className={`w-3 h-3 ${text}`} />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-600">{label}</span>
                                </div>
                                <span className="text-xs font-bold text-gray-900">
                                    {Math.round(value)}{unit}
                                    <span className="text-gray-400 font-normal"> / {goal}{unit}</span>
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${getProgress(value, goal)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Chart Card */}
            <div className="lg:col-span-2 card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">Weekly Overview</h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-1.5">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" />
                        <span>Calories consumed</span>
                    </div>
                </div>

                {safeWeekly.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                        <Zap className="w-10 h-10 mb-2 opacity-30" />
                        <p className="text-sm">No meal data this week yet</p>
                        <p className="text-xs text-gray-300 mt-1">Plan some meals to see your nutrition trends</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-end justify-between gap-2 px-1" style={{ height: '160px' }}>
                            {safeWeekly.map((day, index) => {
                                const heightPct = ((day.calories || 0) / maxWeeklyCalories) * 100;
                                const isToday = index === safeWeekly.length - 1;
                                return (
                                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                                        {/* Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-medium py-1 px-2 rounded-lg whitespace-nowrap transition-all duration-150 pointer-events-none z-10 shadow-lg">
                                            {Math.round(day.calories || 0)} kcal
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                        </div>

                                        {/* Bar */}
                                        <div
                                            className={`w-full max-w-[36px] rounded-t-lg transition-all duration-700 ease-out cursor-pointer ${
                                                isToday
                                                    ? 'shadow-lg shadow-emerald-100'
                                                    : 'hover:brightness-90'
                                            }`}
                                            style={{
                                                height: `${Math.max(heightPct, 4)}%`,
                                                background: isToday
                                                    ? 'linear-gradient(180deg, #10b981, #0d9488)'
                                                    : '#d1fae5'
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Day labels */}
                        <div className="flex items-center justify-between px-1 mt-2">
                            {safeWeekly.map((day, index) => {
                                const isToday = index === safeWeekly.length - 1;
                                return (
                                    <div key={day.date} className="flex-1 text-center">
                                        <span className={`text-xs font-semibold ${isToday ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {formatDate(day.date)}
                                        </span>
                                        {isToday && (
                                            <div className="w-1 h-1 bg-emerald-500 rounded-full mx-auto mt-0.5" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NutritionTracker;
