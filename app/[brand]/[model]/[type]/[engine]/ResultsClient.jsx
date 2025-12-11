'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Phone, ShoppingBag, Check, AlertCircle, Zap, Unlock, Edit3, X, Save } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/components/AuthContext';

export default function ResultsClient({ stages: initialStages, vehicleInfo, engineData }) {
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [stages, setStages] = useState(initialStages);
  const { t } = useLanguage();
  const { isAdmin, fetchAPI } = useAuth();

  // Navigation handlers
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
      {/* Stage Selector - Mobile First Design */}
      {stages.length > 1 && (
        <div className="stage-selector-wrapper">
          {/* Dropdown Selector */}
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

          {/* Navigation Arrows */}
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

      {/* Show only the selected stage */}
      <StageSection
        key={stages[selectedStageIndex]?.id || selectedStageIndex}
        stage={stages[selectedStageIndex]}
        stageIndex={selectedStageIndex}
        vehicleInfo={vehicleInfo}
        isStage2={stages[selectedStageIndex]?.stageName?.toLowerCase().includes('stage 2')}
        isAdmin={isAdmin}
        fetchAPI={fetchAPI}
        onStageUpdate={(updatedStage) => {
          const newStages = [...stages];
          newStages[selectedStageIndex] = updatedStage;
          setStages(newStages);
        }}
      />
    </div>
  );
}

function StageSection({ stage, stageIndex, vehicleInfo, isStage2, isAdmin, fetchAPI, onStageUpdate }) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    stageName: stage.stageName || 'Stage 1',
    stockHp: stage.stockHp || 0,
    tunedHp: stage.tunedHp || 0,
    stockNm: stage.stockNm || 0,
    tunedNm: stage.tunedNm || 0,
    price: stage.price || 0
  });
  const [saveMessage, setSaveMessage] = useState('');

  const stockHp = isEditing ? editData.stockHp : (stage.stockHp || 0);
  const tunedHp = isEditing ? editData.tunedHp : (stage.tunedHp || 0);
  const stockNm = isEditing ? editData.stockNm : (stage.stockNm || 0);
  const tunedNm = isEditing ? editData.tunedNm : (stage.tunedNm || 0);

  const hpGain = tunedHp - stockHp;
  const nmGain = tunedNm - stockNm;

  const maxPower = Math.max(tunedHp, stockHp, 400) * 1.1;
  const maxTorque = Math.max(tunedNm, stockNm, 500) * 1.1;

  // Check if ECU unlock is required
  const ecuUnlock = stage.ecuUnlock;
  const hasEcuUnlock = ecuUnlock && ecuUnlock.required;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await fetchAPI('data/stage', {
        method: 'PUT',
        isProtected: true,
        body: JSON.stringify({
          brand: vehicleInfo.brand,
          model: vehicleInfo.model,
          type: vehicleInfo.type,
          engine: vehicleInfo.engine,
          stageIndex: stageIndex,
          stageData: editData
        })
      });

      // Update local state
      onStageUpdate({ ...stage, ...editData });
      setIsEditing(false);
      setSaveMessage(t('changesSaved'));
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage(t('failedToSave') + ': ' + error.message);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditData({
      stageName: stage.stageName || 'Stage 1',
      stockHp: stage.stockHp || 0,
      tunedHp: stage.tunedHp || 0,
      stockNm: stage.stockNm || 0,
      tunedNm: stage.tunedNm || 0,
      price: stage.price || 0
    });
    setIsEditing(false);
  };

  return (
    <div className="stage-section animate-in" style={{ marginBottom: '24px' }}>
      <div className="stage-content">
        {/* Left Column - Description */}
        <div className="stage-description">
          <div className="stage-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2>{vehicleInfo.brand} {vehicleInfo.model}</h2>
              <h3>
                {isEditing ? editData.stageName : (stage.stageName || 'Stage 1')}
                <Zap size={20} color="#a8b0b8" />
              </h3>
            </div>
            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn"
                style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit3 size={14} /> {t('editStage')}
              </button>
            )}
            {isAdmin && isEditing && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCancel}
                  className="btn"
                  style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <X size={14} /> {t('cancelEdit')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn btn-search"
                  style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={14} /> {isSaving ? t('saving') : t('saveChanges')}
                </button>
              </div>
            )}
          </div>

          {saveMessage && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '6px',
              marginBottom: '12px',
              background: saveMessage.includes(t('failedToSave')) ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 255, 136, 0.1)',
              border: `1px solid ${saveMessage.includes(t('failedToSave')) ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
              color: saveMessage.includes(t('failedToSave')) ? '#ff4444' : '#00ff88',
              fontSize: '0.85rem'
            }}>
              {saveMessage}
            </div>
          )}

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
          {/* Admin Edit Form */}
          {isEditing && (
            <div style={{
              background: 'rgba(180, 190, 200, 0.1)',
              border: '1px solid rgba(180, 190, 200, 0.3)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--primary)' }}>{t('editStage')}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('stageName')}</label>
                  <input
                    type="text"
                    value={editData.stageName}
                    onChange={(e) => setEditData({ ...editData, stageName: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('price')} (€)</label>
                  <input
                    type="number"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('stockPower')}</label>
                  <input
                    type="number"
                    value={editData.stockHp}
                    onChange={(e) => setEditData({ ...editData, stockHp: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('tunedPower')}</label>
                  <input
                    type="number"
                    value={editData.tunedHp}
                    onChange={(e) => setEditData({ ...editData, tunedHp: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('stockTorque')}</label>
                  <input
                    type="number"
                    value={editData.stockNm}
                    onChange={(e) => setEditData({ ...editData, stockNm: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('tunedTorque')}</label>
                  <input
                    type="number"
                    value={editData.tunedNm}
                    onChange={(e) => setEditData({ ...editData, tunedNm: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>
            </div>
          )}

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
              <span>{isEditing ? editData.stageName : (stage.stageName || 'Stage 1')}</span>
              <span className="price-value">€{isEditing ? editData.price : (stage.price || '---')}</span>
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

