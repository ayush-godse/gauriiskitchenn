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

const loadCartItems = (ownerId) => {
    const savedCart = localStorage.getItem(getCartStorageKey(ownerId));
    return savedCart ? JSON.parse(savedCart) : [];
};

const mergeCarts = (savedItems, guestItems) => {
    const mergedItems = savedItems.map((item) => ({ ...item }));
    guestItems.forEach((guestItem) => {
        const existingItem = mergedItems.find((item) => item._id === guestItem._id);
        if (!existingItem) {
            mergedItems.push({ ...guestItem });
            return;
        }

        const requestedQuantity = existingItem.quantity + guestItem.quantity;
        existingItem.quantity = typeof existingItem.stock === 'number'
            ? Math.min(requestedQuantity, existingItem.stock)
            : requestedQuantity;
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
            if (typeof item.stock === 'number' && item.stock <= 0) return;
            const existingItem = state.cartItems.find(cartItem => cartItem._id === item._id);
            if (existingItem) {
                if (typeof item.stock !== 'number' || existingItem.quantity < item.stock) {
                    existingItem.quantity += 1;
                }
            } else {
                state.cartItems=[...state.cartItems, { ...item, quantity: 1 }];
            }
            localStorage.setItem(getCartStorageKey(state.ownerId), JSON.stringify(state.cartItems));
        },
        incrementQuantity: (state, action) => {
            const item = state.cartItems.find((cartItem) => cartItem._id === action.payload);
            if (item && (typeof item.stock !== 'number' || item.quantity < item.stock)) {
                item.quantity += 1;
                localStorage.setItem(getCartStorageKey(state.ownerId), JSON.stringify(state.cartItems));
            }
        },
        decrementQuantity: (state, action) => {
            const item = state.cartItems.find((cartItem) => cartItem._id === action.payload);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                localStorage.setItem(getCartStorageKey(state.ownerId), JSON.stringify(state.cartItems));
            }
        },
        removeFromCart: (state, action) => {
           const itemId = action.payload;
            state.cartItems = state.cartItems.filter((item) => item._id !== itemId);
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