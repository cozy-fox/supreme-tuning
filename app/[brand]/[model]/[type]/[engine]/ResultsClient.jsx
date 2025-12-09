'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, Phone, ShoppingBag, Check, AlertCircle, Zap, Unlock } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function ResultsClient({ stages, vehicleInfo, engineData }) {
  const [activeTab, setActiveTab] = useState(1);
  const { t } = useLanguage();

  // Group stages by category
  const groupedStages = useMemo(() => {
    const stage1Group = stages.filter(s =>
      s.stageName?.toLowerCase().includes('stage 1') ||
      s.stageName?.toLowerCase().includes('stage1')
    );
    const stage2Group = stages.filter(s =>
      s.stageName?.toLowerCase().includes('stage 2') ||
      s.stageName?.toLowerCase().includes('stage2')
    );

    if (stage1Group.length === 0 && stage2Group.length === 0) {
      return {
        stage1: stages.slice(0, Math.ceil(stages.length / 2)),
        stage2: stages.slice(Math.ceil(stages.length / 2))
      };
    }

    return { stage1: stage1Group, stage2: stage2Group };
  }, [stages]);

  const currentStages = activeTab === 1 ? groupedStages.stage1 : groupedStages.stage2;

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
    <>
      {/* Stage Tabs */}
      <div className="stage-tabs">
        <button
          className={`stage-tab ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => setActiveTab(1)}
        >
          Stage 1
        </button>
        <button
          className={`stage-tab ${activeTab === 2 ? 'active' : ''}`}
          onClick={() => setActiveTab(2)}
        >
          Stage 2
        </button>
      </div>

      {/* Stage Sections */}
      {currentStages.map((stage, index) => (
        <StageSection
          key={stage.id || index}
          stage={stage}
          vehicleInfo={vehicleInfo}
          isStage2={activeTab === 2}
        />
      ))}

      {currentStages.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#8a8a8a' }}>
            {t('noStageOptions').replace('{stage}', activeTab)}
          </p>
        </div>
      )}
    </>
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

  // Check if ECU unlock is required
  const ecuUnlock = stage.ecuUnlock;
  const hasEcuUnlock = ecuUnlock && ecuUnlock.required;

  return (
    <div className="stage-section animate-in" style={{ marginBottom: '24px' }}>
      <div className="stage-content">
        {/* Left Column - Description */}
        <div className="stage-description">
          <div className="stage-header">
            <h2>{vehicleInfo.brand} {vehicleInfo.model}</h2>
            <h3>
              {stage.stageName || 'Stage 1'}
              <Zap size={20} color="#c9a227" />
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

          {/* ECU Unlock Warning */}
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

        {/* Right Column - Stats with clear before/after distinction */}
        <div className="stage-stats">
          {/* Power */}
          <div className="power-stat">
            <div className="stat-header">
              <h4>{t('power')}</h4>
              <span className="gain-badge">+{hpGain} PK</span>
            </div>

            {/* Stock Bar */}
            <div className="bar-row">
              <span className="bar-label stock-label">{t('stock')}</span>
              <div className="bar-track">
                <div className="bar-fill bar-stock" style={{ width: `${(stockHp / maxPower) * 100}%` }}>
                  <span className="bar-value">{stockHp} PK</span>
                </div>
              </div>
            </div>

            {/* Tuned Bar */}
            <div className="bar-row">
              <span className="bar-label tuned-label">{t('tuned')}</span>
              <div className="bar-track">
                <div className="bar-fill bar-tuned" style={{ width: `${(tunedHp / maxPower) * 100}%` }}>
                  <span className="bar-value">{tunedHp} PK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Torque */}
          <div className="power-stat">
            <div className="stat-header">
              <h4>{t('torque')}</h4>
              <span className="gain-badge">+{nmGain} Nm</span>
            </div>

            {/* Stock Bar */}
            <div className="bar-row">
              <span className="bar-label stock-label">{t('stock')}</span>
              <div className="bar-track">
                <div className="bar-fill bar-stock" style={{ width: `${(stockNm / maxTorque) * 100}%` }}>
                  <span className="bar-value">{stockNm} Nm</span>
                </div>
              </div>
            </div>

            {/* Tuned Bar */}
            <div className="bar-row">
              <span className="bar-label tuned-label">{t('tuned')}</span>
              <div className="bar-track">
                <div className="bar-fill bar-tuned" style={{ width: `${(tunedNm / maxTorque) * 100}%` }}>
                  <span className="bar-value">{tunedNm} Nm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="price-box">
            <div className="price-row">
              <span>{stage.stageName || 'Stage 1'}</span>
              <span className="price-value">€{stage.price || '---'}</span>
            </div>
          </div>

          {/* Action Buttons */}
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

