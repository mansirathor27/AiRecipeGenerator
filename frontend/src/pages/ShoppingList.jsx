import { useState, useEffect } from 'react';
import {
    ShoppingCart, Plus, X, Check, Trash2, DollarSign,
    Package, Mic, Tag, ShoppingBag
} from 'lucide-react';
import Navbar from '../components/Navbar';
import VoiceInput from '../components/VoiceInput';
import SkeletonCard from '../components/SkeletonCard';
import toast from 'react-hot-toast';
import api from '../services/api';

const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Grains', 'Spices', 'Beverages', 'Other'];

/* Category color mapping */
const CATEGORY_COLORS = {
    Produce:   { bg: 'bg-green-50',   border: 'border-green-200',  text: 'text-green-700',   dot: 'bg-green-500',   header: 'from-green-500 to-emerald-600' },
    Dairy:     { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',    dot: 'bg-blue-500',    header: 'from-blue-500 to-cyan-600' },
    Meat:      { bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-700',     dot: 'bg-red-500',     header: 'from-red-500 to-rose-600' },
    Grains:    { bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',   dot: 'bg-amber-500',   header: 'from-amber-500 to-orange-500' },
    Spices:    { bg: 'bg-purple-50',  border: 'border-purple-200', text: 'text-purple-700',  dot: 'bg-purple-500',  header: 'from-purple-500 to-violet-600' },
    Beverages: { bg: 'bg-cyan-50',    border: 'border-cyan-200',   text: 'text-cyan-700',    dot: 'bg-cyan-500',    header: 'from-cyan-500 to-sky-600' },
    Other:     { bg: 'bg-gray-50',    border: 'border-gray-200',   text: 'text-gray-700',    dot: 'bg-gray-400',    header: 'from-gray-400 to-gray-600' },
};

const ShoppingList = () => {
    const [items, setItems] = useState([]);
    const [groupedItems, setGroupedItems] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => { fetchShoppingList(); }, []);

    const fetchShoppingList = async () => {
        try {
            const response = await api.get('/shopping-list?grouped=true');
            const grouped  = response.data.data.items;
            setGroupedItems(grouped);

            let total = 0;
            const flatItems = [];
            grouped.forEach(group => {
                total += parseFloat(group.category_total || 0);
                group.items.forEach(item => flatItems.push({ ...item, category: group.category }));
            });
            setItems(flatItems);
            setTotalCost(total);
        } catch {
            toast.error('Failed to load shopping list');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePrice = async (id, price) => {
        try {
            await api.put(`/shopping-list/${id}`, { estimated_price: parseFloat(price) });
            fetchShoppingList();
        } catch {
            toast.error('Failed to update price');
        }
    };

    const handleToggleChecked = async (id) => {
        try {
            await api.put(`/shopping-list/${id}/toggle`);
            fetchShoppingList();
        } catch {
            toast.error('Failed to update item');
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await api.delete(`/shopping-list/${id}`);
            fetchShoppingList();
            toast.success('Item removed');
        } catch {
            toast.error('Failed to delete item');
        }
    };

    const handleClearChecked = async () => {
        if (!confirm('Remove all checked items?')) return;
        try {
            await api.delete('/shopping-list/clear/checked');
            fetchShoppingList();
            toast.success('Checked items cleared');
        } catch {
            toast.error('Failed to clear items');
        }
    };

    const handleAddToPantry = async () => {
        const checkedCount = items.filter(i => i.is_checked).length;
        if (checkedCount === 0) { toast.error('No items checked'); return; }
        if (!confirm(`Add ${checkedCount} checked items to pantry?`)) return;
        try {
            await api.post('/shopping-list/add-to-pantry');
            fetchShoppingList();
            toast.success(`${checkedCount} items added to pantry! 🧺`);
        } catch {
            toast.error('Failed to add items to pantry');
        }
    };

    const handleVoiceItemAdd = async (itemData) => {
        await api.post('/shopping-list', itemData);
        await fetchShoppingList();
    };

    if (loading) {
        return (
            <div className="page-container">
                <Navbar />
                <div className="page-content max-w-4xl">
                    <div className="skeleton h-10 w-48 rounded-xl mb-6" />
                    <div className="skeleton h-16 w-full rounded-2xl mb-6" />
                    <div className="card overflow-hidden">
                        <SkeletonCard type="list" count={6} />
                    </div>
                </div>
            </div>
        );
    }

    const checkedCount = items.filter(i => i.is_checked).length;
    const totalCount   = items.length;

    return (
        <div className="page-container">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <ShoppingCart className="w-7 h-7 text-emerald-500" />
                            Shopping List
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {totalCount > 0
                                ? `${checkedCount} of ${totalCount} items checked`
                                : 'Your list is empty'}
                        </p>
                    </div>

                    {totalCount > 0 && (
                        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 text-right">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <div>
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Est. Total</p>
                                <p className="text-xl font-bold text-emerald-700">${totalCost.toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Sticky Action Bar ── */}
                <div className="sticky top-[64px] z-30 mb-6">
                    <div className="glass border border-gray-200 rounded-2xl p-3 shadow-sm flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary py-2 px-4 text-sm"
                        >
                            <Plus className="w-4 h-4" /> Add Item
                        </button>

                        <VoiceInput onItemAdded={handleVoiceItemAdd} />

                        {checkedCount > 0 && (
                            <>
                                <button
                                    onClick={handleAddToPantry}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all"
                                >
                                    <Package className="w-4 h-4" />
                                    Pantry ({checkedCount})
                                </button>
                                <button
                                    onClick={handleClearChecked}
                                    className="btn-secondary py-2 px-4 text-sm"
                                >
                                    <Trash2 className="w-4 h-4" /> Clear Checked
                                </button>
                            </>
                        )}

                        {/* Progress bar */}
                        {totalCount > 0 && (
                            <div className="flex-1 min-w-32 flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${(checkedCount / totalCount) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                                    {Math.round((checkedCount / totalCount) * 100)}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Grouped Items ── */}
                {totalCount > 0 ? (
                    <div className="space-y-5 animate-slide-up">
                        {groupedItems.map((group) => {
                            const colors = CATEGORY_COLORS[group.category] || CATEGORY_COLORS.Other;
                            const groupChecked = group.items.filter(i => i.is_checked).length;
                            return (
                                <div key={group.category} className="card overflow-hidden">
                                    {/* Category header */}
                                    <div className={`flex items-center justify-between px-5 py-3 bg-linear-to-r ${colors.header} text-white`}>
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4" />
                                            <h2 className="font-bold text-sm">{group.category}</h2>
                                            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                {groupChecked}/{group.items.length}
                                            </span>
                                        </div>
                                        <span className="text-white/80 text-xs font-semibold">
                                            ${parseFloat(group.category_total || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    <div className="divide-y divide-gray-50">
                                        {group.items.map(item => (
                                            <ShoppingListItem
                                                key={item.id}
                                                item={item}
                                                onToggle={handleToggleChecked}
                                                onDelete={handleDeleteItem}
                                                onUpdatePrice={handleUpdatePrice}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card p-16 text-center animate-scale-in">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <ShoppingBag className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Your list is empty</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Add items manually, by voice, or generate from your meal plan
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary inline-flex"
                        >
                            <Plus className="w-4 h-4" /> Add First Item
                        </button>
                    </div>
                )}
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <AddItemModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={async () => {
                        await fetchShoppingList();
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

/* ── Shopping List Item ── */
const ShoppingListItem = ({ item, onToggle, onDelete, onUpdatePrice }) => {
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [price, setPrice] = useState(item.estimated_price || 0);

    const handlePriceSubmit = (e) => {
        if (e.key === 'Enter' || e.type === 'blur') {
            onUpdatePrice(item.id, price);
            setIsEditingPrice(false);
        }
    };

    return (
        <div className={`flex items-center gap-4 px-5 py-3.5 transition-all duration-200 group ${
            item.is_checked ? 'bg-gray-50/80' : 'hover:bg-gray-50/50'
        }`}>
            {/* Custom checkbox */}
            <button
                onClick={() => onToggle(item.id)}
                className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                    borderColor: item.is_checked ? '#10b981' : '#d1d5db',
                    background:  item.is_checked ? '#10b981' : 'white',
                }}
            >
                {item.is_checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </button>

            {/* Item info */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold transition-all duration-200 ${
                    item.is_checked ? 'line-through text-gray-400' : 'text-gray-900'
                }`}>
                    {item.ingredient_name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs ${item.is_checked ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.quantity} {item.unit}
                    </span>
                    {item.from_meal_plan && (
                        <span className="pill bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5">
                            From Plan
                        </span>
                    )}
                </div>
            </div>

            {/* Price + delete */}
            <div className="flex items-center gap-3">
                <div>
                    {isEditingPrice ? (
                        <div className="flex items-center gap-1 border border-emerald-300 rounded-lg px-2 py-1 bg-white shadow-sm">
                            <span className="text-xs text-gray-400">$</span>
                            <input
                                type="number"
                                step="0.01"
                                autoFocus
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                onKeyDown={handlePriceSubmit}
                                onBlur={handlePriceSubmit}
                                className="w-14 text-xs outline-none font-semibold text-gray-900"
                            />
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsEditingPrice(true)}
                            className={`text-right transition-colors ${item.is_checked ? 'opacity-40 cursor-default' : 'hover:text-emerald-600'}`}
                            disabled={item.is_checked}
                        >
                            <p className="text-[10px] text-gray-400">Est. Price</p>
                            <p className="text-sm font-bold text-gray-900">${(item.estimated_price || 0).toFixed(2)}</p>
                        </button>
                    )}
                </div>

                <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

/* ── Add Item Modal ── */
const AddItemModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        ingredient_name: '',
        quantity: '',
        unit: 'pieces',
        category: 'Other',
        estimated_price: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/shopping-list', {
                ...formData,
                quantity: parseFloat(formData.quantity),
                estimated_price: parseFloat(formData.estimated_price || 0)
            });
            toast.success('Item added!');
            onSuccess();
        } catch {
            toast.error('Failed to add item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-card max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Add to Shopping List</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Fill in the item details below</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Item Name</label>
                        <input
                            type="text"
                            value={formData.ingredient_name}
                            onChange={(e) => setFormData({ ...formData, ingredient_name: e.target.value })}
                            className="input-field"
                            placeholder="e.g. Cherry Tomatoes"
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
                            Estimated Price <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="number"
                                step="0.01"
                                value={formData.estimated_price}
                                onChange={(e) => setFormData({ ...formData, estimated_price: e.target.value })}
                                className="input-field pl-9"
                                placeholder="0.00"
                            />
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

export default ShoppingList;
