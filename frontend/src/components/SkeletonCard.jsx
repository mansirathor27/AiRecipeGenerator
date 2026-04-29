/**
 * SkeletonCard — reusable shimmer loading placeholder
 * Renders a grid of skeleton cards that match the exact layout
 * of the card being loaded (recipe cards, pantry cards, etc.)
 */
const SkeletonCard = ({ type = 'recipe', count = 6 }) => {
    const cards = Array.from({ length: count });

    if (type === 'recipe') {
        return (
            <>
                {cards.map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="skeleton h-48 w-full rounded-none" />
                        <div className="p-5 space-y-3">
                            <div className="skeleton h-5 w-3/4 rounded-lg" />
                            <div className="skeleton h-4 w-full rounded-lg" />
                            <div className="skeleton h-4 w-1/2 rounded-lg" />
                            <div className="flex gap-2 pt-1">
                                <div className="skeleton h-6 w-16 rounded-full" />
                                <div className="skeleton h-6 w-16 rounded-full" />
                            </div>
                            <div className="skeleton h-9 w-full rounded-xl mt-2" />
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (type === 'stat') {
        return (
            <>
                {cards.map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-4">
                            <div className="skeleton w-12 h-12 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <div className="skeleton h-4 w-2/3 rounded-lg" />
                                <div className="skeleton h-7 w-1/2 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </>
        );
    }

    if (type === 'pantry') {
        return (
            <>
                {cards.map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                        <div className="flex justify-between">
                            <div className="skeleton h-5 w-1/2 rounded-lg" />
                            <div className="skeleton h-5 w-5 rounded-full" />
                        </div>
                        <div className="skeleton h-4 w-1/4 rounded-full" />
                        <div className="skeleton h-16 w-full rounded-xl" />
                    </div>
                ))}
            </>
        );
    }

    if (type === 'list') {
        return (
            <>
                {cards.map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
                        <div className="skeleton w-6 h-6 rounded-md shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 w-1/2 rounded-lg" />
                            <div className="skeleton h-3 w-1/4 rounded-lg" />
                        </div>
                        <div className="skeleton h-4 w-12 rounded-lg" />
                    </div>
                ))}
            </>
        );
    }

    // Default: generic block
    return (
        <>
            {cards.map((_, i) => (
                <div key={i} className="skeleton h-20 w-full rounded-2xl" />
            ))}
        </>
    );
};

export default SkeletonCard;
