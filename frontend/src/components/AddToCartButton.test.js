import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import cartReducer from "../redux/cartSlice";
import AddToCartButton from "./AddToCartButton";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

const product = { _id: "faral", name: "Faral", price: 120, stock: 2000 };

const renderAddToCartButton = (props = {}) => {
    const store = configureStore({
        reducer: { cart: cartReducer },
        preloadedState: { cart: { ownerId: "guest", cartItems: [] } },
    });

    render(
        <Provider store={store}>
            <AddToCartButton product={product} {...props} />
        </Provider>
    );

    return store;
};

describe("AddToCartButton", () => {
    beforeEach(() => mockNavigate.mockClear());

    test("shows both pack sizes and buys the selected pack", () => {
        const store = renderAddToCartButton();
        const oneKilogramOption = screen.getByRole("radio", { name: /1 kg ₹240\.00/i });

        expect(screen.getByRole("radio", { name: /500 g ₹120\.00/i })).toHaveProperty("checked", true);
        fireEvent.click(oneKilogramOption);
        fireEvent.click(screen.getByRole("button", { name: "Buy Now" }));

        expect(mockNavigate).toHaveBeenCalledWith("/checkout");
        expect(store.getState().cart.cartItems).toEqual([
            expect.objectContaining({ _id: "faral", price: 240, sizeGrams: 1000, quantity: 1 }),
        ]);
    });

    test("shows the call order contact when enabled", () => {
        renderAddToCartButton({ showCallOrder: true });

        expect(screen.getByText(/On call order accepted:/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "9860257564" })).toHaveAttribute("href", "tel:9860257564");
    });
});
