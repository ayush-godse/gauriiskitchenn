import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import cartReducer from "../redux/cartSlice";
import Cart from "./cart";

const ShippingDestination = () => <p>Shipping Address</p>;

describe("Cart", () => {
    test("Continue opens the shipping address page directly", () => {
        const store = configureStore({
            reducer: { cart: cartReducer },
            preloadedState: {
                cart: {
                    ownerId: "guest",
                    cartItems: [{ _id: "faral", name: "Faral", price: 120, quantity: 1, sizeGrams: 500 }],
                },
            },
        });

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={["/cart"]}>
                    <Routes>
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<ShippingDestination />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        fireEvent.click(screen.getByRole("link", { name: "Continue" }));

        expect(screen.getByText("Shipping Address")).toBeInTheDocument();
    });
});
