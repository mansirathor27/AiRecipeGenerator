import { useState, useEffect } from 'react';
import { Plus, Search, X, Calendar, AlertCircle, Package, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import SkeletonCard from '../components/SkeletonCard';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../services/api';

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Grains', 'Spices', 'Other'];

const getExpiryInfo = (item) => {
    const daysLeft  = parseInt(item.days_left);
    const isExpired = item.expiry_date && daysLeft < 0;
    const isSoon    = item.expiry_date && daysLeft >= 0 && daysLeft <= 2;
    const isWarning = item.expiry_date && daysLeft > 2 && daysLeft <= 7;
    return { daysLeft, isExpired, isSoon, isWarning };
};

const Pantry = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expiringItems, setExpiringItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchPantryItems(); fetchExpiringItems(); }, []);
    useEffect(() => { filterItems(); }, [items, searchQuery, selectedCategory]);

    const fetchPantryItems = async () => {
        try {
            const response = await api.get('/pantry');
            setItems(response.data.data.items);
        } catch {
            toast.error('Failed to load pantry items');
        } finally {
            setLoading(false);
        }
    };

    const fetchExpiringItems = async () => {
        try {
            const response = await api.get('/pantry/expiring');
            setExpiringItems(response.data.data.items);
        } catch {
            console.error('Failed to load expiring items');
        }
    };

    const filterItems = () => {
        let filtered = [...items];
        if (searchQuery) {
            filtered = filtered.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(i => i.category === selectedCategory);
        }
        filtered.sort((a, b) => {
            if (!a.expiry_date) return 1;
            if (!b.expiry_date) return -1;
            return new Date(a.expiry_date) - new Date(b.expiry_date);
        });
        setFilteredItems(filtered);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/pantry/${id}`);
            setItems(items.filter(i => i.id !== id));
            toast.success('Item deleted');
        } catch {
            toast.error('Failed to delete item');
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <Navbar />
                <div className="page-content">
                    <div className="skeleton h-10 w-40 rounded-xl mb-6" />
                    <div className="skeleton h-16 w-full rounded-2xl mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <SkeletonCard type="pantry" count={6} />
                    </div>
                </div>
            </div>
        );
    }

    const expiredCount  = expiringItems.filter(i => parseInt(i.days_left) < 0).length;
    const expiringSoonCount = expiringItems.filter(i => parseInt(i.days_left) >= 0).length;

    return (
        <div className="page-container">
            <Navbar />

            <div className="page-content animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Package className="w-7 h-7 text-emerald-500" />
                            Pantry
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {items.length} items · Manage your ingredients &amp; expiry dates
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-primary"
                    >
                        <Plus className="w-5 h-5" />
                        Add Item
                    </button>
                </div>

                {/* Expiry Alert Banner */}
                {expiringItems.length > 0 && (
                    <div className="rounded-2xl border mb-6 overflow-hidden animate-slide-down">
                        {/* Banner header */}
                        <div className="bg-linear-to-r from-rose-500 to-red-600 px-5 py-3 flex items-center gap-3 text-white">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="font-bold text-sm">Pantry Attention Required</p>
                        </div>
                        {/* Banner body */}
                        <div className="bg-rose-50 border-t border-rose-100 px-5 py-4 flex flex-wrap items-center gap-4">
                            <div className="flex flex-wrap gap-3 flex-1">
                                {expiredCount > 0 && (
                                    <div className="flex items-center gap-2 bg-white border border-red-200 rounded-xl px-3 py-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <span className="text-sm font-semibold text-red-700">{expiredCount} expired</span>
                                    </div>
                                )}
                                {expiringSoonCount > 0 && (
                                    <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-3 py-2">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        <span className="text-sm font-semibold text-amber-700">{expiringSoonCount} expiring soon</span>
                                    </div>
                                )}
                            </div>
                            {/* Item avatars */}
                            <div className="flex -space-x-2">
                                {expiringItems.slice(0, 4).map(item => (
                                    <div
                                        key={item.id}
                                        className="w-8 h-8 rounded-full bg-white border-2 border-rose-200 flex items-center justify-center text-[10px] font-bold text-rose-700 uppercase shadow-sm"
                                        title={item.name}
                                    >
                                        {item.name.substring(0, 2)}
                                    </div>
                                ))}
                                {expiringItems.length > 4 && (
                                    <div className="w-8 h-8 rounded-full bg-rose-100 border-2 border-rose-200 flex items-center justify-center text-[10px] font-bold text-rose-600">
                                        +{expiringItems.length - 4}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Search + Filter */}
                <div className="card p-4 mb-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search ingredients…"
                            className="input-field pl-11"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['All', ...CATEGORIES].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                                    selectedCategory === cat
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {cat === 'All' ? '🏷️ All' : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Items Grid */}
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
                        {filteredItems.map(item => (
                            <PantryItemCard
                                key={item.id}
                                item={item}
                                onDelete={handleDelete}
                                isExpiring={expiringItems.some(e => e.id === item.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="card p-16 text-center animate-scale-in">
                        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <Package className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                            {items.length === 0 ? 'Your pantry is empty' : 'No items match your search'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            {items.length === 0
                                ? 'Add your first ingredient to start tracking'
                                : 'Try a different search or category filter'}
                        </p>
                        {items.length === 0 && (
                            <button onClick={() => setShowAddModal(true)} className="btn-primary inline-flex">
                                <Plus className="w-4 h-4" /> Add First Item
                            </button>
                        )}
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddItemModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => { fetchPantryItems(); fetchExpiringItems(); }}
                />
            )}
        </div>
    );
};

/* ── Pantry Item Card ── */
const PantryItemCard = ({ item, onDelete }) => {
    const { daysLeft, isExpired, isSoon, isWarning } = getExpiryInfo(item);

    const borderColor = isExpired ? 'border-red-300'   : isSoon ? 'border-amber-300'   : isWarning ? 'border-yellow-200' : 'border-gray-100';
    const stripColor  = isExpired ? 'bg-red-500'        : isSoon ? 'bg-amber-500'        : isWarning ? 'bg-yellow-400'     : 'bg-emerald-500';
    const cardBg      = isExpired ? 'bg-red-50/40'      : isSoon ? 'bg-amber-50/40'      : 'bg-white';

    const getExpiryText = () => {
        if (!item.expiry_date) return null;
        if (isExpired) return `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago`;
        if (daysLeft === 0) return 'Expires today!';
        if (daysLeft === 1) return 'Expires tomorrow';
        if (isSoon || isWarning) return `Expires in ${daysLeft} days`;
        return `${daysLeft} days left`;
    };

    const expiryText   = getExpiryText();
    const expiryBadge  = isExpired ? 'bg-red-100 text-red-700'    : isSoon ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';

    return (
        <div className={`rounded-2xl border ${borderColor} ${cardBg} overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
            {/* Color strip indicator */}
            <div className={`h-1 w-full ${stripColor}`} />

            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{item.name}</h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isExpired ? 'bg-red-100 text-red-600' : isSoon ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                            {item.category}
                        </span>
                    </div>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400 font-medium">Quantity</span>
                    <span className="text-sm font-bold text-gray-900">{item.quantity} {item.unit}</span>
                </div>

                {/* Expiry info */}
                {item.expiry_date && (
                    <div className={`rounded-xl p-3 ${isExpired ? 'bg-red-100/60' : isSoon ? 'bg-amber-100/60' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Calendar className={`w-3.5 h-3.5 ${isExpired ? 'text-red-500' : isSoon ? 'text-amber-500' : 'text-gray-400'}`} />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expiry</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`text-sm font-semibold ${isExpired ? 'text-red-700' : isSoon ? 'text-amber-700' : 'text-gray-700'}`}>
                                {format(new Date(item.expiry_date), 'MMM dd, yyyy')}
                            </span>
                            {expiryText && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${expiryBadge}`}>
                                    {expiryText}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Running low */}
                {item.is_running_low && (
                    <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                        <span className="text-xs font-bold text-orange-700">Running low on stock</span>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Add Item Modal ── */
const AddItemModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        unit: 'pieces',
        category: 'Other',
        expiry_date: '',
        is_running_low: false
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/pantry', {
                ...formData,
                quantity: parseFloat(formData.quantity),
                expiry_date: formData.expiry_date || null
            });
            toast.success('Item added to pantry! 🧺');
            onSuccess();
            onClose();
        } catch {
            toast.error('Failed to add item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Add Pantry Item</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Track a new ingredient in your pantry</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input-field"
                            placeholder="e.g. Organic Spinach"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Quantity</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="input-field"
                                placeholder="1"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="input-field"
                            >
                                {['pieces', 'kg', 'g', 'l', 'ml', 'cups', 'tbsp', 'tsp'].map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat })}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                        formData.category === cat
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                            Expiry Date <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            type="date"
                            value={formData.expiry_date}
                            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    {/* Running low toggle */}
                    <div
                        onClick={() => setFormData({ ...formData, is_running_low: !formData.is_running_low })}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.is_running_low ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Mark as running low</p>
                            <p className="text-xs text-gray-400">Get a reminder to restock this item</p>
                        </div>
                        <div className={`w-11 h-6 rounded-full transition-colors relative ${formData.is_running_low ? 'bg-orange-400' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${formData.is_running_low ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 btn-secondary py-3">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 btn-primary py-3">
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Adding…</>
                            ) : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Pantry;
