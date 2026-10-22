import { createSlice } from '@reduxjs/toolkit';

const GUEST_CART_OWNER = 'guest';
const getCartStorageKey = (ownerId) => (
    ownerId === GUEST_CART_OWNER ? 'cartItems:guest' : `cartItems:user:${ownerId}`
);

const getStoredCartOwner = () => {
    const savedUser = localStorage.getItem('user');
    const userId = savedUser ? JSON.parse(savedUser)?._id : null;
    return userId ? String(userId) : GUEST_CART_OWNER;
};

const getItemSize = (item) => Number(item.sizeGrams) || 500;
const isSameVariant = (first, second) => (
    first._id === second._id && getItemSize(first) === getItemSize(second)
);
const getReservedGrams = (items, productId) => items
    .filter((item) => item._id === productId)
    .reduce((total, item) => total + item.quantity * getItemSize(item), 0);
const getVariantFromAction = (state, payload) => {
    const variant = typeof payload === 'object' ? payload : { _id: payload };
    return state.cartItems.find((item) => (
        item._id === variant._id &&
        (variant.sizeGrams === undefined || getItemSize(item) === variant.sizeGrams)
    ));
};

const loadCartItems = (ownerId) => {
    const savedCart = localStorage.getItem(getCartStorageKey(ownerId));
    return savedCart ? JSON.parse(savedCart) : [];
};

const mergeCarts = (savedItems, guestItems) => {
    const mergedItems = savedItems.map((item) => ({ ...item }));
    guestItems.forEach((guestItem) => {
        const existingItem = mergedItems.find((item) => isSameVariant(item, guestItem));
        const stock = Number(guestItem.stock);
        const availableGrams = Number.isFinite(stock)
            ? Math.max(0, stock - getReservedGrams(mergedItems, guestItem._id))
            : Infinity;
        const additionalQuantity = Math.min(
            guestItem.quantity,
            Math.floor(availableGrams / getItemSize(guestItem))
        );
        if (additionalQuantity <= 0) return;

        if (!existingItem) {
            mergedItems.push({ ...guestItem, quantity: additionalQuantity });
            return;
        }

        existingItem.quantity += additionalQuantity;
    });
    return mergedItems;
};

const initialOwnerId = getStoredCartOwner();
const initialState = {
    ownerId: initialOwnerId,
    cartItems: loadCartItems(initialOwnerId),
};

localStorage.removeItem('cartItems');

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartOwner: (state, action) => {
            const nextOwnerId = action.payload ? String(action.payload) : GUEST_CART_OWNER;
            const savedItems = loadCartItems(nextOwnerId);
            if (nextOwnerId !== GUEST_CART_OWNER && state.ownerId === GUEST_CART_OWNER) {
                state.cartItems = mergeCarts(savedItems, state.cartItems);
                localStorage.removeItem(getCartStorageKey(GUEST_CART_OWNER));
            } else {
                state.cartItems = savedItems;
            }
            state.ownerId = nextOwnerId;
            localStorage.setItem(getCartStorageKey(state.ownerId), JSON.stringify(state.cartItems));
        },
        addToCart: (state, action) => {
            const item = action.payload;
            const itemSize = getItemSize(item);
            const availableGrams = Number(item.stock) - getReservedGrams(state.cartItems, item._id);
            if (Number.isFinite(availableGrams) && availableGrams < itemSize) return;
            const existingItem = state.cartItems.find(cartItem => isSameVariant(cartItem, item));
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.cartItems=[...state.cartItems, { ...item, quantity: 1 }];
            }
            localStorage.setItem(getCartStorageKey(state.ownerId), JSON.stringify(state.cartItems));
        },
        incrementQuantity: (state, action) => {
            const item = getVariantFromAction(state, action.payload);
            const stock = Number(item?.stock);
            if (item && (!Number.isFinite(stock) ||
                getReservedGrams(state.cartItems, item._id) + getItemSize(item) <= stock)) {
                item.quantity += 1;
                localStorage.setItem(getCartStorageKey(state.ownerId), JSON.stringify(state.cartItems));
            }
        },
        decrementQuantity: (state, action) => {
            const item = getVariantFromAction(state, action.payload);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                localStorage.setItem(getCartStorageKey(state.ownerId), JSON.stringify(state.cartItems));
            }
        },
        removeFromCart: (state, action) => {
            const variant = typeof action.payload === 'object' ? action.payload : { _id: action.payload };
            state.cartItems = state.cartItems.filter((item) => !(
                item._id === variant._id &&
                (variant.sizeGrams === undefined || getItemSize(item) === variant.sizeGrams)
            ));
            localStorage.setItem(getCartStorageKey(state.ownerId), JSON.stringify(state.cartItems));
        },
        clearCart: (state) => {
            state.cartItems = [];
            localStorage.removeItem(getCartStorageKey(state.ownerId));
        }
    }
});

export const {
    setCartOwner,
    addToCart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
} = cartSlice.actions;
export default cartSlice.reducer; 