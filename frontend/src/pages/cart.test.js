import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import cartReducer from "../redux/cartSlice";
import Cart from "./cart";

const RegistrationDestination = () => {
    const location = useLocation();
    return <p>Register page: {location.state?.from}</p>;
};

describe("Cart", () => {
    test("Continue opens registration with checkout as the return destination", () => {
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
                        <Route path="/register" element={<RegistrationDestination />} />
                    </Routes>
                </MemoryRouter>
            </Provider>
        );

        fireEvent.click(screen.getByRole("link", { name: "Continue" }));

        expect(screen.getByText("Register page: /checkout")).toBeInTheDocument();
    });
});
