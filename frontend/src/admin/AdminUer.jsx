import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
const AdminUsers = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch('/api/auth/users', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        };
    }, [user]);

    return null;
};