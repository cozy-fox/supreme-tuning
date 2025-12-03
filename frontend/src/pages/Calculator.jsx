import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronRight } from 'lucide-react';

// Global cache for static brands data
let brandsCache = null;

const CalculatorPage = () => {
    const navigate = useNavigate();
    const { fetchAPI } = useApi();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (brandsCache) {
            setBrands(brandsCache);
            return;
        }

        setLoading(true);
        fetchAPI('brands')
            .then(data => {
                setBrands(data);
                brandsCache = data;
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [fetchAPI]);

    const handleBrand = useCallback((brand) => {
        navigate(`${brand.name}`);
    }, [navigate]);

    return (
        <div className="container">
            <Header />

            {/* Hero Section */}
            <div className="hero-section animate-in">
                <div style={{ marginBottom: '12px' }}>
                    <Zap size={48} color="var(--primary)" />
                </div>
                <h1>Chiptuning Calculator</h1>
                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '1.1rem',
                    maxWidth: '600px',
                    margin: '16px auto 0'
                }}>
                    Ontdek het vermogenspotentieel van uw voertuig.
                    Selecteer uw merk om te beginnen.
                </p>
            </div>

            {/* Brand Selection */}
            <div className="animate-in" style={{ animationDelay: '0.1s' }}>
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '32px',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    letterSpacing: '2px'
                }}>
                    KIES UW MERK
                </h2>

                {loading && brands.length === 0 ? (
                    <div className="flex-center" style={{ padding: '60px 0' }}>
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <div className="grid-brands">
                        {brands.map((b, index) => (
                            <div
                                key={b.id}
                                onClick={() => handleBrand(b)}
                                className="brand-card animate-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <img
                                    src={b.logoUrl || `assets/brand_logo/${b.name}.png`}
                                    alt={b.name}
                                    style={{
                                        height: '70px',
                                        objectFit: 'contain',
                                        marginBottom: '12px',
                                        filter: 'brightness(0.9)',
                                        transition: 'filter 0.3s ease'
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/80x60/1a1a1a/666?text=' + b.name.charAt(0);
                                    }}
                                />
                                <div style={{
                                    fontFamily: "'Rajdhani', sans-serif",
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    color: 'var(--text-main)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}>
                                    {b.name}
                                    <ChevronRight size={14} color="var(--primary)" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div style={{
                textAlign: 'center',
                marginTop: '60px',
                paddingTop: '40px',
                borderTop: '1px solid var(--border)'
            }}>
                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    Professionele ECU-tuning met gegarandeerde resultaten.
                    Alle vermogenswaarden zijn getest op onze eigen dyno.
                </p>
            </div>
        </div>
    );
};

export default CalculatorPage;