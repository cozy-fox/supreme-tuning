import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from '../context/AuthContext.jsx'; // Added .js
import Header from '../components/Header.jsx'; // Added .jsx
import { useNavigate } from 'react-router-dom';

// Global cache for static brands data. This ensures the brands API is only called once 
// per session, even if the component unmounts and remounts.
let brandsCache = null;

const CalculatorPage = () => {

    const navigate = useNavigate();
    const { fetchAPI } = useApi();
    // State to hold all brands permanently after initial fetch
    const [loadedBrands, setLoadedBrands] = useState([]);
    // State for brands to display (will be loadedBrands)
    const [brands, setBrands] = useState([]);

    const [selBrand, setSelBrand] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Initial load of brands (runs only once, and checks cache first)
    useEffect(() => {
        // 1. Check if data is already cached
        if (brandsCache) {
            setBrands(brandsCache);
            setLoadedBrands(brandsCache);
            return;
        }

        // 2. If not cached, fetch data
        setLoading(true);
        fetchAPI('brands')
            .then(data => {
                setBrands(data);
                setLoadedBrands(data);
                brandsCache = data; // Populate the global cache
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [fetchAPI]);

    const handleBrand = useCallback(async (brand) => {
        setSelBrand(brand);
        setLoading(true);

        navigate(`${brand.name}`)

    }, [fetchAPI]);

    return (
        <div className="container">
            <Header />

            {/* Step 1: Brands */}
            {!selBrand && (
                <div className="animate-in">
                    <h2 style={{ marginBottom: '20px', marginTop: '70px' }}>Select Manufacturer</h2>
                    {loading && brands.length === 0 ? (
                        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--secondary)' }}>Loading brands...</p>
                    ) : (
                        <div className="grid-brands">
                            {brands.map(b => (
                                <div
                                    key={b.id}
                                    onClick={() => handleBrand(b)}
                                    className="card"
                                    style={{ cursor: 'pointer', textAlign: 'center', padding: '20px', border: '1px solid var(--border)', backgroundColor: `isHovered? #111111` }}
                                    onMouseEnter={() => setIsHovered(true)}
                                    onMouseLeave={() => setIsHovered(false)}
                                    >
                                    <img
                                        src={b.logoUrl || `assets/brand_logo/${b.name}.png`}
                                        alt={b.name}
                                        style={{ marginBottom: '10px', height: '90px', objectFit: 'contain' }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x40/555/FFF?text=Logo' }}

                                    />
                                    <div style={{ fontWeight: 'bold' }}>{b.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CalculatorPage;