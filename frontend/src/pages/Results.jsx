import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useApi } from '../context/AuthContext.jsx';
import Header from '../components/Header.jsx';
import { ChevronRight, ArrowLeft, Phone, ShoppingBag, Check, AlertCircle, Zap, Euro } from 'lucide-react';

const Results = () => {
    const { brand, model, type, engine } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchAPI } = useApi();

    // Get engine info from navigation state
    const engineState = location.state || {};

    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(1); // 1 = Stage 1/1+, 2 = Stage 2/2+
    const [engineData, setEngineData] = useState({
        name: engineState.engineName || '',
        description: engineState.engineDescription || '',
        type: engineState.engineType || ''
    });
    const [vehicleInfo, setVehicleInfo] = useState({ brand: '', model: '', type: '', engine: '' });

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            setLoading(true);
            try {
                // Fetch stages for this engine
                const stagesData = await fetchAPI(`stages?engineId=${engine}`);
                if (!isMounted) return;
                setStages(stagesData);

                // Decode URL params for display
                setVehicleInfo({
                    brand: decodeURIComponent(brand),
                    model: decodeURIComponent(model),
                    type: decodeURIComponent(type),
                    engine: engineState.engineName || ''
                });
            } catch (error) {
                console.error('Error loading data:', error);
            }
            if (isMounted) {
                setLoading(false);
            }
        };
        loadData();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [engine, brand, model, type]);

    // Group stages by category (1/1+ vs 2/2+)
    const groupedStages = useMemo(() => {
        const stage1Group = stages.filter(s => 
            s.stageName?.toLowerCase().includes('stage 1') || 
            s.stageName?.toLowerCase().includes('stage1') ||
            s.stageName?.toLowerCase() === 'stage 1' ||
            s.stageName?.toLowerCase() === 'stage 1+'
        );
        const stage2Group = stages.filter(s => 
            s.stageName?.toLowerCase().includes('stage 2') || 
            s.stageName?.toLowerCase().includes('stage2') ||
            s.stageName?.toLowerCase() === 'stage 2' ||
            s.stageName?.toLowerCase() === 'stage 2+'
        );
        
        // If no clear grouping, split evenly or put all in stage 1
        if (stage1Group.length === 0 && stage2Group.length === 0) {
            return {
                stage1: stages.slice(0, Math.ceil(stages.length / 2)),
                stage2: stages.slice(Math.ceil(stages.length / 2))
            };
        }
        
        return { stage1: stage1Group, stage2: stage2Group };
    }, [stages]);

    const currentStages = activeTab === 1 ? groupedStages.stage1 : groupedStages.stage2;
    const hasStage2 = groupedStages.stage2.length > 0;

    if (loading) {
        return (
            <div className="container">
                <Header />
                <div className="flex-center" style={{ padding: '100px 0' }}>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="results-page">
            <Header />
            
            {/* Stage Tabs */}
            <div className="stage-tabs">
                <button 
                    className={`stage-tab ${activeTab === 1 ? 'active' : ''}`}
                    onClick={() => setActiveTab(1)}
                >
                    Stage 1
                </button>
                {hasStage2 && (
                    <button 
                        className={`stage-tab ${activeTab === 2 ? 'active' : ''}`}
                        onClick={() => setActiveTab(2)}
                    >
                        Stage 2
                    </button>
                )}
            </div>

            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/calculator">{vehicleInfo.brand}</Link>
                    <ChevronRight size={14} />
                    <span>{vehicleInfo.model}</span>
                    <ChevronRight size={14} />
                    <span>{vehicleInfo.type}</span>
                    <ChevronRight size={14} />
                    <span className="current">{engineData?.name} {engineData?.description}</span>
                </div>

                {/* Main Content */}
                {currentStages.map((stage, index) => (
                    <StageSection 
                        key={stage.id} 
                        stage={stage} 
                        isFirst={index === 0}
                        engineData={engineData}
                        vehicleInfo={vehicleInfo}
                    />
                ))}

                {currentStages.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            Geen Stage {activeTab} tuning beschikbaar voor deze motor.
                        </p>
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="btn-secondary"
                    style={{ marginTop: '40px', marginBottom: '40px' }}
                >
                    <ArrowLeft size={18} />
                    Terug naar selectie
                </button>
            </div>
        </div>
    );
};

// Stage Section Component
const StageSection = ({ stage, isFirst, engineData, vehicleInfo }) => {
    const gainHp = stage.tunedHp - stage.stockHp;
    const gainNm = stage.tunedNm - stage.stockNm;

    // Parse upgrade requirements from notes or ecuNotes
    const getUpgradeRequirements = () => {
        const requirements = [];

        if (stage.cpcUpgrade) {
            requirements.push({ name: 'CPC Upgrade', required: true });
        }
        if (stage.ecuUnlock) {
            requirements.push({ name: 'ECU Unlock', required: true });
        }

        // Check notes for common upgrades
        const notes = (stage.notes || '').toLowerCase();
        if (notes.includes('downpipe')) {
            requirements.push({ name: 'Downpipe', required: notes.includes('vereist') || notes.includes('required') });
        }
        if (notes.includes('intake') || notes.includes('air filter')) {
            requirements.push({ name: 'Cold Air Intake', required: false });
        }
        if (notes.includes('intercooler')) {
            requirements.push({ name: 'Intercooler Upgrade', required: notes.includes('vereist') || notes.includes('required') });
        }
        if (notes.includes('exhaust')) {
            requirements.push({ name: 'Sport Exhaust', required: false });
        }

        return requirements;
    };

    const upgradeRequirements = getUpgradeRequirements();
    const isStage2 = stage.stageName?.toLowerCase().includes('2');

    return (
        <div className="stage-section animate-in" style={{ marginBottom: '40px' }}>
            <div className="stage-content">
                {/* Left Column - Description */}
                <div className="stage-description">
                    <div className="stage-header">
                        <h2>Omschrijving</h2>
                        <h3>
                            {stage.stageName}
                            {isFirst && <span className="new-badge">NEW!</span>}
                        </h3>
                    </div>

                    <ul className="feature-list">
                        <li>
                            <ChevronRight size={16} color="var(--primary)" />
                            Herprogrammatie op maat op onze 4x4 vermogensbank
                        </li>
                        <li>
                            <ChevronRight size={16} color="var(--primary)" />
                            5 jaar garantie en service
                        </li>
                        <li>
                            <ChevronRight size={16} color="var(--primary)" />
                            Grafiek van uw wagen
                        </li>
                        <li>
                            <ChevronRight size={16} color="var(--primary)" />
                            Testrit met logs indien nodig
                        </li>
                        <li>
                            <ChevronRight size={16} color="var(--primary)" />
                            Emissie-normen ongewijzigd
                        </li>
                    </ul>

                    {/* Upgrade Requirements for Stage 2 */}
                    {(isStage2 || upgradeRequirements.length > 0) && (
                        <div className="upgrade-requirements">
                            <h4>
                                <AlertCircle size={18} />
                                Upgrade vereisten
                            </h4>
                            <ul>
                                {upgradeRequirements.map((req, idx) => (
                                    <li key={idx}>
                                        <Check size={14} color={req.required ? 'var(--warning)' : 'var(--success)'} />
                                        {req.name}
                                        <span className={req.required ? 'required' : 'optional'}>
                                            ({req.required ? 'vereist' : 'optioneel'})
                                        </span>
                                    </li>
                                ))}
                                {upgradeRequirements.length === 0 && isStage2 && (
                                    <>
                                        <li>
                                            <Check size={14} color="var(--warning)" />
                                            Downpipe <span className="required">(vereist)</span>
                                        </li>
                                        <li>
                                            <Check size={14} color="var(--success)" />
                                            Cold Air Intake <span className="optional">(optioneel)</span>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    )}

                    {stage.notes && !isStage2 && (
                        <p className="stage-notes">{stage.notes}</p>
                    )}

                    <div className="contact-info">
                        <p>
                            Indien u een afspraak wenst te maken vragen wij u vriendelijk ons even te bellen op{' '}
                            <a href="tel:+31619828216">+31 6 19 82 82 16</a>
                        </p>
                    </div>
                </div>

                {/* Right Column - Power Stats */}
                <div className="stage-stats">
                    {/* Vermogen (HP) */}
                    <div className="power-stat">
                        <div className="stat-header">
                            <h4>Vermogen</h4>
                            <span className="gain-value">+{gainHp} PK</span>
                        </div>
                        <div className="power-bar-visual">
                            <div className="bar-track">
                                <div
                                    className="bar-fill bar-stock"
                                    style={{ width: `${(stage.stockHp / stage.tunedHp) * 100}%` }}
                                />
                                <div className="bar-fill bar-tuned" style={{ width: '100%' }} />
                            </div>
                            <div className="bar-labels">
                                <span>{stage.stockHp} PK</span>
                                <span className="arrow">→</span>
                                <span className="tuned-value">{stage.tunedHp}</span>
                            </div>
                        </div>
                    </div>

                    {/* Koppel (Torque) */}
                    <div className="power-stat">
                        <div className="stat-header">
                            <h4>Koppel</h4>
                            <span className="gain-value">+{gainNm} Nm</span>
                        </div>
                        <div className="power-bar-visual">
                            <div className="bar-track">
                                <div
                                    className="bar-fill bar-stock"
                                    style={{ width: `${(stage.stockNm / stage.tunedNm) * 100}%` }}
                                />
                                <div className="bar-fill bar-tuned" style={{ width: '100%' }} />
                            </div>
                            <div className="bar-labels">
                                <span>{stage.stockNm} Nm</span>
                                <span className="arrow">→</span>
                                <span className="tuned-value">{stage.tunedNm}</span>
                            </div>
                        </div>
                    </div>

                    {/* Price Box */}
                    <div className="price-box">
                        <div className="price-header">
                            <span className="stage-label">{stage.stageName}</span>
                            <span className="price-label">Prijs</span>
                        </div>
                        <div className="price-row">
                            <span className="vehicle-name">
                                {vehicleInfo.model} {engineData?.name}
                            </span>
                            <span className="price-value">
                                € {stage.price?.toLocaleString('nl-NL') || '-'}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <a href="tel:+31619828216" className="btn btn-contact">
                            <Phone size={18} />
                            Contacteer ons voor info
                        </a>
                        <a href="https://supremetuning.nl" target="_blank" rel="noopener noreferrer" className="btn btn-shop">
                            <ShoppingBag size={18} />
                            Webshop
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Results;

