import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx';
import StageCard from '../components/StageCard.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Car, Settings, Gauge, Zap } from 'lucide-react';

const BrandPage = () => {
    const navigate = useNavigate();
    const { brand } = useParams();
    const { fetchAPI } = useApi();

    const [models, setModels] = useState([]);
    const [types, setTypes] = useState([]);
    const [engines, setEngines] = useState([]);
    const [stages, setStages] = useState([]);

    const [selBrand, setSelBrand] = useState(null);
    const [selModel, setSelModel] = useState(null);
    const [selType, setSelType] = useState(null);
    const [selEngine, setSelEngine] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const [engineType, setEngineType] = useState(null);
    const engineTypes = useMemo(() => {
        const types = engines.map(e => e.type).filter(Boolean);
        return [...new Set(types)];
    }, [engines]);

    useEffect(() => {
        setLoading(true);
        fetchAPI('brands')
            .then(data => {
                const foundBrand = data.find(b => b.name === brand);
                if (foundBrand) handleBrand(foundBrand);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [brand]);

    const handleBrand = useCallback(async (brand) => {
        setSelBrand(brand);
        setSelModel(null);
        setSelEngine(null);
        setStages([]);
        setEngineType(null);
        setSelType(null);
        setTypes([]);
        setShowResults(false);
        setLoading(true);

        try {
            const data = await fetchAPI(`models?brandId=${brand.id}`);
            setModels(data);
        } catch (error) {
            console.error("Error fetching models:", error);
            setModels([]);
        }
        setLoading(false);
    }, [fetchAPI]);

    const handleModel = useCallback(async (e) => {
        setTypes([]);
        setSelType(null);
        setEngines([]);
        setSelEngine(null);
        setStages([]);
        setShowResults(false);

        const modelId = parseInt(e.target.value);
        const model = models.find(m => m.id === modelId);
        setSelModel(model);

        if (model) {
            setLoading(true);
            try {
                const data = await fetchAPI(`types?modelId=${modelId}`);
                setTypes(data);
            } catch (error) {
                console.error("Error fetching types:", error);
                setTypes([]);
            }
            setLoading(false);
        }
    }, [models, fetchAPI]);

    const handleType = useCallback(async (e) => {
        const typeId = parseInt(e.target.value);
        const type = types.find(t => t.id === typeId);
        setSelType(type);
        setEngines([]);
        setSelEngine(null);
        setStages([]);
        setEngineType(null);
        setShowResults(false);

        if (type) {
            setLoading(true);
            try {
                const data = await fetchAPI(`engines?typeId=${typeId}`);
                setEngines(data);
            } catch (error) {
                console.error("Error fetching engines:", error);
                setEngines([]);
            }
            setLoading(false);
        }
    }, [types, fetchAPI]);

    const handleEngineType = useCallback((e) => {
        setEngineType(e.target.value || null);
        setSelEngine(null);
        setStages([]);
        setShowResults(false);
    }, []);

    const handleEngine = useCallback((e) => {
        const engineId = parseInt(e.target.value);
        const engine = engines.find(eng => eng.id === engineId);
        setSelEngine(engine);
        setStages([]);
        setShowResults(false);
    }, [engines]);

    const handleSearch = useCallback(async () => {
        if (!selEngine) return;

        setLoading(true);
        try {
            const data = await fetchAPI(`stages?engineId=${selEngine.id}`);
            setStages(data);
            setShowResults(true);
        } catch (error) {
            console.error("Error fetching stages:", error);
            setStages([]);
        }
        setLoading(false);
    }, [selEngine, fetchAPI]);

    const filteredEngines = useMemo(() => {
        if (!engineType) return engines;
        return engines.filter(e => e.type === engineType);
    }, [engines, engineType]);

    const reset = () => {
        navigate('/calculator');
    };

    const canSearch = selEngine && !loading;

    return (
        <div className="container">
            <Header />

            {selBrand && (
                <div className="animate-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {/* Brand Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '32px',
                        paddingBottom: '24px',
                        borderBottom: '1px solid var(--border)'
                    }}>
                        <button
                            onClick={reset}
                            className="btn-secondary"
                            style={{ padding: '10px 16px' }}
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img
                                src={`/assets/brand_logo/${selBrand.name}.png`}
                                alt={selBrand.name}
                                style={{ height: '50px', objectFit: 'contain' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <div>
                                <h2 style={{ margin: 0 }}>{selBrand.name}</h2>
                                <p style={{
                                    margin: 0,
                                    color: 'var(--text-muted)',
                                    fontSize: '0.9rem'
                                }}>
                                    Chiptuning Calculator
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Selection Card */}
                    <div className="selection-card" style={{ marginBottom: '32px' }}>
                        <h3 style={{
                            margin: '0 0 24px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <Settings size={20} />
                            Voertuig Configuratie
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            {/* Model Selection */}
                            <div>
                                <label>
                                    <Car size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    Kies uw Model
                                </label>
                                <select
                                    onChange={handleModel}
                                    value={selModel?.id || ''}
                                    disabled={loading}
                                >
                                    <option value="">-- Selecteer Model --</option>
                                    {models.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Generation/Chassis Selection */}
                            {types.length > 0 && (
                                <div>
                                    <label>
                                        <Gauge size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                        Kies uw Generatie
                                    </label>
                                    <select
                                        onChange={handleType}
                                        value={selType?.id || ''}
                                        disabled={loading}
                                    >
                                        <option value="">-- Selecteer Generatie --</option>
                                        {types.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Engine Type Filter */}
                            {selType && engineTypes.length > 0 && (
                                <div>
                                    <label>
                                        <Zap size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                        Brandstof Type
                                    </label>
                                    <select
                                        onChange={handleEngineType}
                                        value={engineType || ''}
                                        disabled={loading}
                                    >
                                        <option value="">-- Alle Types --</option>
                                        {engineTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Engine Variant Selection */}
                            {selType && filteredEngines.length > 0 && (
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label>Kies uw Motortype</label>
                                    <select
                                        onChange={handleEngine}
                                        value={selEngine?.id || ''}
                                        disabled={loading}
                                    >
                                        <option value="">-- Selecteer Motor --</option>
                                        {filteredEngines.map(e => (
                                            <option key={e.id} value={e.id}>
                                                {e.name} - {e.description} ({e.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            className="btn btn-search"
                            disabled={!canSearch}
                            style={{ marginTop: '24px' }}
                        >
                            <Search size={20} />
                            Zoeken
                        </button>

                        {selModel && selType && filteredEngines.length === 0 && (
                            <p style={{
                                color: 'var(--warning)',
                                marginTop: '16px',
                                marginBottom: 0
                            }}>
                                Geen motoren gevonden voor deze selectie.
                            </p>
                        )}
                    </div>

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex-center" style={{ padding: '40px 0' }}>
                            <div className="spinner"></div>
                        </div>
                    )}

                    {/* Results Section */}
                    {showResults && !loading && (
                        <div className="results-section animate-in">
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '24px'
                            }}>
                                <Zap size={24} color="var(--primary)" />
                                <h2 style={{ margin: 0 }}>Performance Stages</h2>
                            </div>

                            {/* Selected Vehicle Summary */}
                            <div className="card" style={{
                                marginBottom: '24px',
                                borderLeft: '4px solid var(--primary)'
                            }}>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                                    <strong style={{ color: 'var(--text-main)' }}>
                                        {selBrand.name} {selModel?.name}
                                    </strong>
                                    {' '}&bull;{' '}
                                    {selType?.name}
                                    {' '}&bull;{' '}
                                    <span style={{ color: 'var(--primary)' }}>
                                        {selEngine?.name} {selEngine?.description}
                                    </span>
                                </p>
                            </div>

                            {stages.length > 0 ? (
                                stages.map((stage, index) => (
                                    <StageCard
                                        key={stage.id}
                                        stage={stage}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    />
                                ))
                            ) : (
                                <div className="card" style={{
                                    borderLeft: '4px solid var(--warning)',
                                    textAlign: 'center',
                                    padding: '40px'
                                }}>
                                    <p style={{
                                        color: 'var(--warning)',
                                        margin: 0,
                                        fontSize: '1.1rem'
                                    }}>
                                        Geen tuning pakketten beschikbaar voor deze motor.
                                    </p>
                                    <p style={{
                                        color: 'var(--text-muted)',
                                        margin: '12px 0 0 0',
                                        fontSize: '0.9rem'
                                    }}>
                                        Neem contact met ons op voor een offerte op maat.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BrandPage;