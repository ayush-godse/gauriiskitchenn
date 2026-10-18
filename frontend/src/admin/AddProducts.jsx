import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '', description: '', price: '', category: '', stock: ''
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'admin') navigate('/');
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            alert('Please select an image');
            return;
        }
        if (!user || user.role !== 'admin') return;

        setLoading(true);
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));
        data.append('image', image);

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                body: data,
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Unable to add product');
            }
            alert('Product added successfully');
            setFormData({ name: '', description: '', price: '', category: '', stock: '' });
            setImage(null);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Add Product</h1>
            <label>
                Name
                <input name="name" value={formData.name} onChange={handleChange} required />
            </label>
            <label>
                Description
                <textarea name="description" value={formData.description} onChange={handleChange} required />
            </label>
            <label>
                Price
                <input name="price" type="number" min="0" value={formData.price} onChange={handleChange} required />
            </label>
            <label>
                Category
                <input name="category" value={formData.category} onChange={handleChange} required />
            </label>
            <label>
                Stock
                <input name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} required />
            </label>
            <label>
                Image
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} required />
            </label>
            <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Product'}
            </button>
        </form>
    );
};

export default AddProduct;