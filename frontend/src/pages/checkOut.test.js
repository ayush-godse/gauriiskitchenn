import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import cartReducer from "../redux/cartSlice";
import Checkout from "./checkOut";
import Login from "./login";

const renderCheckout = () => {
    const store = configureStore({
        reducer: { cart: cartReducer },
        preloadedState: {
            cart: {
                ownerId: "guest",
                cartItems: [{ _id: "faral", name: "Faral", price: 120, quantity: 1, sizeGrams: 500 }],
            },
        },
    });

    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={["/checkout"]}>
                <AuthContext.Provider value={{ user: null }}>
                    <Routes>
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </AuthContext.Provider>
            </MemoryRouter>
        </Provider>
    );
};

describe("Checkout", () => {
    test("redirects unauthenticated checkout to login with a registration link", () => {
        renderCheckout();

        expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
        expect(screen.getByText(/if you are new/i)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "register" })).toHaveAttribute("href", "/register");
        expect(screen.queryByText("Shipping Address")).not.toBeInTheDocument();
    });
});
