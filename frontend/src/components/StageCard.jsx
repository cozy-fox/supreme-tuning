import React from 'react';
import { Zap, TrendingUp, Wrench, Euro, Info } from 'lucide-react';

const StageCard = ({ stage, style }) => {
    const gainHp = stage.tunedHp - stage.stockHp;
    const gainNm = stage.tunedNm - stage.stockNm;
    const gainHpPercent = ((gainHp / stage.stockHp) * 100).toFixed(0);
    const gainNmPercent = ((gainNm / stage.stockNm) * 100).toFixed(0);

    // Calculate bar widths (max 100%)
    const maxHp = Math.max(stage.tunedHp, stage.stockHp);
    const maxNm = Math.max(stage.tunedNm, stage.stockNm);
    const stockHpWidth = (stage.stockHp / maxHp) * 100;
    const tunedHpWidth = (stage.tunedHp / maxHp) * 100;
    const stockNmWidth = (stage.stockNm / maxNm) * 100;
    const tunedNmWidth = (stage.tunedNm / maxNm) * 100;

    return (
        <div className="stage-card animate-in" style={style}>
            {/* Header with Stage Name and Price */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border)'
            }}>
                <div>
                    <h3 style={{
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '1.4rem'
                    }}>
                        <Zap size={22} />
                        {stage.stageName}
                    </h3>
                    {stage.ecuType && (
                        <p style={{
                            margin: '8px 0 0 0',
                            color: 'var(--text-muted)',
                            fontSize: '0.85rem'
                        }}>
                            ECU: {stage.ecuType}
                        </p>
                    )}
                </div>
                {stage.price != null && (
                    <div style={{ textAlign: 'right' }}>
                        <div className="price-tag">
                            <Euro size={20} style={{ verticalAlign: 'middle' }} />
                            {stage.price.toFixed(0)},-
                        </div>
                        <p style={{
                            margin: '4px 0 0 0',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase'
                        }}>
                            incl. BTW
                        </p>
                    </div>
                )}
            </div>

            {/* Power Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px',
                marginBottom: '24px'
            }}>
                {/* Horsepower Section */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Vermogen (PK)
                        </span>
                        <div className="gain-badge">
                            <TrendingUp size={14} />
                            +{gainHp} PK
                        </div>
                    </div>

                    {/* Stock HP Bar */}
                    <div className="power-bar-container" style={{ marginBottom: '6px' }}>
                        <div
                            className="power-bar power-bar-stock"
                            style={{ width: `${stockHpWidth}%` }}
                        >
                            <span className="power-value">{stage.stockHp}</span>
                        </div>
                    </div>
                    <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        margin: '0 0 8px 0'
                    }}>
                        Origineel
                    </p>

                    {/* Tuned HP Bar */}
                    <div className="power-bar-container">
                        <div
                            className="power-bar power-bar-tuned"
                            style={{ width: `${tunedHpWidth}%` }}
                        >
                            <span className="power-value" style={{ color: '#1a1a1a' }}>
                                {stage.tunedHp}
                            </span>
                        </div>
                    </div>
                    <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--primary)',
                        margin: '4px 0 0 0',
                        fontWeight: '600'
                    }}>
                        Na tuning (+{gainHpPercent}%)
                    </p>
                </div>

                {/* Torque Section */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Koppel (Nm)
                        </span>
                        <div className="gain-badge">
                            <TrendingUp size={14} />
                            +{gainNm} Nm
                        </div>
                    </div>

                    {/* Stock Nm Bar */}
                    <div className="power-bar-container" style={{ marginBottom: '6px' }}>
                        <div
                            className="power-bar power-bar-stock"
                            style={{ width: `${stockNmWidth}%` }}
                        >
                            <span className="power-value">{stage.stockNm}</span>
                        </div>
                    </div>
                    <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        margin: '0 0 8px 0'
                    }}>
                        Origineel
                    </p>

                    {/* Tuned Nm Bar */}
                    <div className="power-bar-container">
                        <div
                            className="power-bar power-bar-tuned"
                            style={{ width: `${tunedNmWidth}%` }}
                        >
                            <span className="power-value" style={{ color: '#1a1a1a' }}>
                                {stage.tunedNm}
                            </span>
                        </div>
                    </div>
                    <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--primary)',
                        margin: '4px 0 0 0',
                        fontWeight: '600'
                    }}>
                        Na tuning (+{gainNmPercent}%)
                    </p>
                </div>
            </div>

            {/* Additional Info Section */}
            {(stage.notes || stage.ecuNotes || stage.cpcUpgrade || stage.ecuUnlock) && (
                <div style={{
                    background: 'var(--bg-input)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '16px'
                }}>
                    {stage.notes && (
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            marginBottom: stage.ecuNotes || stage.cpcUpgrade || stage.ecuUnlock ? '12px' : 0
                        }}>
                            <Info size={16} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <p style={{
                                margin: 0,
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem'
                            }}>
                                {stage.notes}
                            </p>
                        </div>
                    )}

                    {(stage.cpcUpgrade || stage.ecuUnlock || stage.ecuNotes) && (
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'flex-start'
                        }}>
                            <Wrench size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                {stage.ecuNotes && (
                                    <p style={{
                                        margin: 0,
                                        color: 'var(--warning)',
                                        fontSize: '0.85rem',
                                        fontWeight: '500'
                                    }}>
                                        {stage.ecuNotes}
                                    </p>
                                )}
                                {(stage.cpcUpgrade || stage.ecuUnlock) && (
                                    <p style={{
                                        margin: stage.ecuNotes ? '6px 0 0 0' : 0,
                                        color: 'var(--text-muted)',
                                        fontSize: '0.85rem'
                                    }}>
                                        Vereist: {stage.cpcUpgrade && "CPC Upgrade"}{stage.cpcUpgrade && stage.ecuUnlock && " + "}{stage.ecuUnlock && "ECU Unlock"}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StageCard;