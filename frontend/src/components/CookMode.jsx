import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

const CookMode = ({ recipeName, instructions, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState(new Set());
    const [timer, setTimer] = useState(null); // { seconds: number, isActive: boolean }
    
    const steps = Array.isArray(instructions) ? instructions : [instructions];
    const totalSteps = steps.length;

    // Helper to extract time from step text (e.g., "Simmer for 10 minutes" -> 600)
    const extractTime = (text) => {
        if (typeof text !== 'string') return null;
        const timeMatch = text.match(/(\d+)\s*(min|minute|mins|minutes)/i);
        if (timeMatch) {
            return parseInt(timeMatch[1]) * 60;
        }
        return null;
    };

    // Initialize timer for current step if it has duration
    useEffect(() => {
        const step = steps[currentStep];
        const stepText = typeof step === 'string' ? step : step?.text || '';
        const duration = extractTime(stepText);
        
        if (duration) {
            setTimer({ seconds: duration, isActive: false, initialSeconds: duration });
        } else {
            setTimer(null);
        }
    }, [currentStep, instructions]);

    // Timer countdown logic
    useEffect(() => {
        let interval = null;
        if (timer?.isActive && timer.seconds > 0) {
            interval = setInterval(() => {
                setTimer(prev => ({ ...prev, seconds: prev.seconds - 1 }));
            }, 1000);
        } else if (timer?.seconds === 0) {
            clearInterval(interval);
            setTimer(prev => ({ ...prev, isActive: false }));
            // Optional: Alert or sound when timer ends
        }
        return () => clearInterval(interval);
    }, [timer?.isActive, timer?.seconds]);

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const toggleStepCompleted = () => {
        const newCompleted = new Set(completedSteps);
        if (newCompleted.has(currentStep)) {
            newCompleted.delete(currentStep);
        } else {
            newCompleted.add(currentStep);
        }
        setCompletedSteps(newCompleted);
    };

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentStepText = typeof steps[currentStep] === 'string' 
        ? steps[currentStep] 
        : steps[currentStep]?.text || '';

    const progress = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-white border-b border-gray-100">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Cooking Mode</span>
                    <h2 className="text-sm font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">{recipeName}</h2>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute top-[60px] left-0 right-0 h-1.5 bg-gray-100">
                <div 
                    className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content */}
            <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-8 mt-12">
                {/* Step Indicator */}
                <div className="flex flex-col items-center gap-2">
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold tracking-tight">
                        STEP {currentStep + 1} OF {totalSteps}
                    </span>
                    {completedSteps.has(currentStep) && (
                        <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Done
                        </span>
                    )}
                </div>

                {/* Instruction Text */}
                <div className="min-h-[200px] flex items-center justify-center">
                    <p className="text-2xl sm:text-4xl font-medium text-gray-800 leading-relaxed sm:leading-snug px-4">
                        {currentStepText}
                    </p>
                </div>

                {/* Timer Section */}
                {timer && (
                    <div className="bg-gray-50 rounded-3xl p-6 flex flex-col items-center gap-4 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="text-5xl font-mono font-bold text-gray-900 tabular-nums">
                            {formatTime(timer.seconds)}
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setTimer(prev => ({ ...prev, isActive: !prev.isActive }))}
                                className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${
                                    timer.isActive 
                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200'
                                }`}
                            >
                                {timer.isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                            </button>
                            <button
                                onClick={() => setTimer(prev => ({ ...prev, seconds: prev.initialSeconds, isActive: false }))}
                                className="w-14 h-14 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-all"
                            >
                                <RotateCcw className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Mark as Done Toggle */}
                <button
                    onClick={toggleStepCompleted}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                        completedSteps.has(currentStep)
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <CheckCircle2 className={`w-5 h-5 ${completedSteps.has(currentStep) ? 'fill-current' : ''}`} />
                    {completedSteps.has(currentStep) ? 'Completed' : 'Mark as Done'}
                </button>
            </div>

            {/* Navigation Controls */}
            <div className="fixed bottom-0 left-0 right-0 p-6 flex items-center justify-between max-w-5xl mx-auto">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-0 transition-all active:scale-95"
                >
                    <ChevronLeft className="w-6 h-6" />
                    <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex-1 flex justify-center px-4">
                    <div className="hidden sm:flex gap-1">
                        {steps.map((_, idx) => (
                            <div 
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    idx === currentStep ? 'bg-emerald-500 w-6' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {currentStep === totalSteps - 1 ? (
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                    >
                        <span>Finish</span>
                        <CheckCircle2 className="w-6 h-6" />
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95"
                    >
                        <span>Next Step</span>
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default CookMode;
