import React, { useState, createContext, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { setCartOwner } from "../redux/cartSlice";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = useCallback((userData, token) => {
        const authenticatedUser = token ? { ...userData, token } : userData;
        setUser(authenticatedUser);
        localStorage.setItem("user", JSON.stringify(authenticatedUser));
        dispatch(setCartOwner(authenticatedUser?._id));
    }, [dispatch]);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem("user");
        dispatch(setCartOwner(null));
    }, [dispatch]);

    const authValue = useMemo(() => ({ user, login, logout }), [user, login, logout]);

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};
