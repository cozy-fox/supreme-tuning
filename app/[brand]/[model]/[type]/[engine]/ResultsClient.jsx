'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Phone, ShoppingBag, Check, AlertCircle, Zap, Unlock } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function ResultsClient({ stages, vehicleInfo }) {
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const { t } = useLanguage();

  const handlePrevStage = () => {
    setSelectedStageIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextStage = () => {
    setSelectedStageIndex(prev => Math.min(stages.length - 1, prev + 1));
  };

  const handleStageSelect = (index) => {
    setSelectedStageIndex(index);
  };

  if (stages.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 40px', marginTop: '40px' }}>
        <AlertCircle size={48} color="#ffaa00" style={{ marginBottom: '20px' }} />
        <h2>{t('noTuningData')}</h2>
        <p style={{ color: '#8a8a8a' }}>
          {t('contactForQuote')} {vehicleInfo.brand} {vehicleInfo.model}.
        </p>
      </div>
    );
  }

  return (
    <div className="results-container">
      {stages.length > 1 && (
        <div className="stage-selector-wrapper">
          <div className="stage-dropdown-container">
            <select
              value={selectedStageIndex}
              onChange={(e) => handleStageSelect(parseInt(e.target.value))}
              className="stage-dropdown"
            >
              {stages.map((stage, index) => (
                <option key={stage.id || index} value={index}>
                  {stage.stageName || `Option ${index + 1}`}
                </option>
              ))}
            </select>
            <div className="stage-counter">
              {selectedStageIndex + 1} / {stages.length}
            </div>
          </div>

          <div className="stage-nav-arrows">
            <button
              onClick={handlePrevStage}
              disabled={selectedStageIndex === 0}
              className="stage-arrow-btn"
              aria-label="Previous stage"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextStage}
              disabled={selectedStageIndex === stages.length - 1}
              className="stage-arrow-btn"
              aria-label="Next stage"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

      <StageSection
        key={stages[selectedStageIndex]?.id || selectedStageIndex}
        stage={stages[selectedStageIndex]}
        vehicleInfo={vehicleInfo}
        isStage2={stages[selectedStageIndex]?.stageName?.toLowerCase().includes('stage 2')}
      />
    </div>
  );
}

function StageSection({ stage, vehicleInfo, isStage2 }) {
  const { t } = useLanguage();

  const stockHp = stage.stockHp || 0;
  const tunedHp = stage.tunedHp || 0;
  const stockNm = stage.stockNm || 0;
  const tunedNm = stage.tunedNm || 0;

  const hpGain = tunedHp - stockHp;
  const nmGain = tunedNm - stockNm;

  const maxPower = Math.max(tunedHp, stockHp, 400) * 1.1;
  const maxTorque = Math.max(tunedNm, stockNm, 500) * 1.1;

  const ecuUnlock = stage.ecuUnlock;
  const hasEcuUnlock = ecuUnlock && ecuUnlock.required;

  return (
    <div className="stage-section animate-in" style={{ marginBottom: '24px' }}>
      <div className="stage-content">
        <div className="stage-description">
          <div className="stage-header">
            <h2>{vehicleInfo.brand} {vehicleInfo.model}</h2>
            <h3>
              {stage.stageName || 'Stage 1'}
              <Zap size={20} color="#a8b0b8" />
            </h3>
          </div>

          <ul className="feature-list">
            <li><Check size={16} color="#00ff88" /> {t('ecuOptimization')}</li>
            <li><Check size={16} color="#00ff88" /> {t('powerTorqueIncrease')}</li>
            <li><Check size={16} color="#00ff88" /> {t('improvedThrottle')}</li>
            <li><Check size={16} color="#00ff88" /> {t('fuelOptimization')}</li>
            {stage.features?.map((feature, i) => (
              <li key={i}><Check size={16} color="#00ff88" /> {feature}</li>
            ))}
          </ul>

          {isStage2 && (
            <div className="upgrade-requirements">
              <h4><AlertCircle size={16} /> {t('upgradeRequirements')}</h4>
              <ul>
                <li><ChevronRight size={14} /> {t('downpipe')} <span className="required">({t('required')})</span></li>
                <li><ChevronRight size={14} /> {t('coldAirIntake')} <span className="optional">({t('optional')})</span></li>
              </ul>
            </div>
          )}

          {hasEcuUnlock && (
            <div className="ecu-unlock-warning" style={{
              marginTop: '16px',
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.15) 0%, rgba(255, 100, 0, 0.1) 100%)',
              border: '1px solid rgba(255, 170, 0, 0.4)',
              borderRadius: '8px'
            }}>
              <h4 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ffaa00',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <Unlock size={18} /> {t('ecuUnlockRequired')}
              </h4>
              {ecuUnlock.fromDate && (
                <p style={{ fontSize: '13px', color: '#ccc', marginBottom: '8px' }}>
                  <strong>{t('fromDate')}:</strong> {ecuUnlock.fromDate}
                </p>
              )}
              {ecuUnlock.extraCost && (
                <p style={{ fontSize: '13px', color: '#ccc', marginBottom: '8px' }}>
                  <strong>{t('extraCost')}:</strong> {ecuUnlock.extraCost}
                </p>
              )}
              {ecuUnlock.note && (
                <p style={{ fontSize: '12px', color: '#aaa', lineHeight: '1.5' }}>
                  {ecuUnlock.note}
                </p>
              )}
            </div>
          )}

          {stage.notes && (
            <p className="stage-notes">{stage.notes}</p>
          )}
        </div>

        <div className="stage-stats">
          <div className="power-stat">
            <div className="stat-header">
              <h4>{t('power')}</h4>
              <span className="gain-badge">+{hpGain} {t('hp')}</span>
            </div>
            <div className="bar-row">
              <span className="bar-label stock-label">{t('stock')}</span>
              <div className="bar-track">
                <div className="bar-fill bar-stock" style={{ width: `${(stockHp / maxPower) * 100}%` }}>
                  <span className="bar-value">{stockHp} {t('enginePowerUnit')}</span>
                </div>
              </div>
            </div>
            <div className="bar-row">
              <span className="bar-label tuned-label">{t('tuned')}</span>
              <div className="bar-track">
                <div className="bar-fill bar-tuned" style={{ width: `${(tunedHp / maxPower) * 100}%` }}>
                  <span className="bar-value">{tunedHp} {t('enginePowerUnit')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="power-stat">
            <div className="stat-header">
              <h4>{t('torque')}</h4>
              <span className="gain-badge">+{nmGain} Nm</span>
            </div>
            <div className="bar-row">
              <span className="bar-label stock-label">{t('stock')}</span>
              <div className="bar-track">
                <div className="bar-fill bar-stock" style={{ width: `${(stockNm / maxTorque) * 100}%` }}>
                  <span className="bar-value">{stockNm} Nm</span>
                </div>
              </div>
            </div>
            <div className="bar-row">
              <span className="bar-label tuned-label">{t('tuned')}</span>
              <div className="bar-track">
                <div className="bar-fill bar-tuned" style={{ width: `${(tunedNm / maxTorque) * 100}%` }}>
                  <span className="bar-value">{tunedNm} Nm</span>
                </div>
              </div>
            </div>
          </div>

          <div className="price-box">
            <div className="price-row">
              <span>{stage.stageName || 'Stage 1'}</span>
              <span className="price-value">€{stage.price || '---'}</span>
            </div>
          </div>

          <div className="action-buttons">
            <a href="tel:+31619828216" className="btn-contact">
              <Phone size={18} />
              {t('contact')}
            </a>
            <a href="#" className="btn-shop">
              <ShoppingBag size={18} />
              {t('shop')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

