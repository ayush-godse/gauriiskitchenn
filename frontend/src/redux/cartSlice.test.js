import cartReducer, {
    addToCart,
    decrementQuantity,
    incrementQuantity,
    setCartOwner,
} from './cartSlice';

describe('cart ownership', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('merges the guest cart into the signed-in user cart without mixing accounts', () => {
        let state = cartReducer(undefined, setCartOwner(null));
        state = cartReducer(state, addToCart({ _id: 'shared-item', name: 'Guest item', quantity: 1, stock: 5 }));
        state = cartReducer(state, addToCart({ _id: 'guest-item', name: 'Guest-only item' }));

        state = cartReducer(state, setCartOwner('user-a'));
        expect(state.cartItems.map((item) => item._id)).toEqual(['shared-item', 'guest-item']);
        state = cartReducer(state, addToCart({ _id: 'shared-item', name: 'User item', stock: 5 }));
        expect(state.cartItems.find((item) => item._id === 'shared-item').quantity).toBe(2);
        state = cartReducer(state, addToCart({ _id: 'user-a-item', name: 'User A item' }));

        state = cartReducer(state, setCartOwner('user-b'));
        expect(state.cartItems).toEqual([]);
        state = cartReducer(state, addToCart({ _id: 'user-b-item', name: 'User B item' }));

        state = cartReducer(state, setCartOwner('user-a'));
        expect(state.cartItems.map((item) => item._id)).toEqual(['shared-item', 'guest-item', 'user-a-item']);

        state = cartReducer(state, setCartOwner(null));
        expect(state.cartItems).toEqual([]);
    });

    test('caps merged quantities to stock', () => {
        let state = cartReducer(undefined, setCartOwner(null));
        state = cartReducer(state, addToCart({ _id: 'limited-item', name: 'Limited', stock: 3 }));
        state = cartReducer(state, addToCart({ _id: 'limited-item', name: 'Limited', stock: 3 }));
        localStorage.setItem('cartItems:user:user-a', JSON.stringify([
            { _id: 'limited-item', name: 'Limited', stock: 3, quantity: 2 },
        ]));

        state = cartReducer(state, setCartOwner('user-a'));
        expect(state.cartItems[0].quantity).toBe(3);
    });

    test('increments and decrements item quantity and persists updates', () => {
        let state = cartReducer(undefined, setCartOwner('user-a'));
        state = cartReducer(state, addToCart({ _id: 'item-a', name: 'Faral', price: 100, stock: 5 }));
        state = cartReducer(state, incrementQuantity('item-a'));
        expect(state.cartItems[0].quantity).toBe(2);

        state = cartReducer(state, decrementQuantity('item-a'));
        expect(state.cartItems[0].quantity).toBe(1);
        expect(JSON.parse(localStorage.getItem('cartItems:user:user-a'))[0].quantity).toBe(1);
    });

    test('does not decrement below one or increment beyond stock', () => {
        let state = cartReducer(undefined, setCartOwner('user-a'));
        state = cartReducer(state, addToCart({ _id: 'item-a', name: 'Faral', stock: 1 }));
        state = cartReducer(state, incrementQuantity('item-a'));
        state = cartReducer(state, decrementQuantity('item-a'));
        expect(state.cartItems[0].quantity).toBe(1);
    });
});
