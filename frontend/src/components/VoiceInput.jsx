import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const VoiceInput = ({ onItemAdded }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        
        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const result = event.results[current][0].transcript;
            setTranscript(result);

            if (event.results[current].isFinal) {
                handleParseAndAdd(result);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                toast.error('Microphone access denied');
            }
        };

        recognitionRef.current = recognition;
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setTranscript('');
            recognitionRef.current.start();
        }
    };

    const handleParseAndAdd = async (text) => {
        setIsProcessing(true);
        const lowerText = text.toLowerCase().trim();
        
        // Regex to match: [add] {quantity} {unit} {name}
        // Example: "add 2 kg onions" or "5 pieces eggs"
        const regex = /(?:add\s+)?(\d+(?:\.\d+)?)\s*([a-z]+)?\s+(.+)$/i;
        const match = lowerText.match(regex);

        if (match) {
            const quantity = parseFloat(match[1]);
            const unit = match[2] || 'pieces';
            const name = match[3];

            try {
                await onItemAdded({
                    ingredient_name: name,
                    quantity,
                    unit,
                    category: 'Other'
                });
                toast.success(`Added ${quantity} ${unit} ${name}`);
            } catch (error) {
                toast.error('Failed to add item from voice');
            }
        } else {
            toast.error("Couldn't parse: try 'Add 2 kg onions'");
        }
        setIsProcessing(false);
    };

    if (!isSupported) {
        return (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 text-sm">
                <AlertCircle className="w-4 h-4" />
                Voice input not supported in this browser.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleListening}
                    disabled={isProcessing}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                        isListening 
                        ? 'bg-red-100 text-red-600 animate-pulse' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    } disabled:opacity-50`}
                >
                    {isListening ? (
                        <>
                            <MicOff className="w-5 h-5" />
                            Stop Voice Input
                        </>
                    ) : (
                        <>
                            <Mic className="w-5 h-5" />
                            Start Voice Input
                        </>
                    )}
                </button>

                {isProcessing && (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </div>
                )}
            </div>

            {transcript && (
                <div className="bg-white border border-emerald-100 rounded-lg p-3 shadow-sm animate-in fade-in slide-in-from-top-1">
                    <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider mb-1">Live Transcript</p>
                    <p className="text-gray-700 italic">"{transcript}"</p>
                </div>
            )}
        </div>
    );
};

export default VoiceInput;
