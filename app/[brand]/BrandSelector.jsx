'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Search, Car, Settings, Gauge, ChevronRight, Zap } from 'lucide-react';

export default function BrandSelector({ brand, models: initialModels, brandGroups }) {
  const router = useRouter();
  const { t } = useLanguage();

  // Group selection state (for Audi RS, BMW M, Mercedes-AMG)
  const [selGroup, setSelGroup] = useState(null);
  const [filteredModels, setFilteredModels] = useState(initialModels);

  const [types, setTypes] = useState([]);
  const [engines, setEngines] = useState([]);

  const [selModel, setSelModel] = useState(null);
  const [selType, setSelType] = useState(null);
  const [selEngine, setSelEngine] = useState(null);
  const [engineType, setEngineType] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if this brand has groups (Audi, BMW, Mercedes)
  const hasGroups = brandGroups?.hasGroups || false;
  const groups = brandGroups?.groups || [];

  // Handle group selection (for brands with performance divisions)
  const handleGroup = useCallback(async (groupId) => {
    setSelGroup(groupId);
    setSelModel(null);
    setTypes([]);
    setSelType(null);
    setEngines([]);
    setSelEngine(null);

    if (groupId) {
      setLoading(true);
      try {
        const res = await fetch(`/api/models?brandId=${brand.id}&groupId=${groupId}`);
        const data = await res.json();
        setFilteredModels(data);
      } catch (error) {
        console.error("Error fetching models by group:", error);
        setFilteredModels(initialModels);
      }
      setLoading(false);
    } else {
      setFilteredModels(initialModels);
    }
  }, [brand.id, initialModels]);

  const handleModel = useCallback(async (e) => {
    const modelId = parseInt(e.target.value);
    const model = filteredModels.find(m => m.id === modelId);
    setSelModel(model);
    setTypes([]);
    setSelType(null);
    setEngines([]);
    setSelEngine(null);

    if (model) {
      setLoading(true);
      try {
        const res = await fetch(`/api/types?modelId=${modelId}`);
        const data = await res.json();
        setTypes(data);
      } catch (error) {
        console.error("Error fetching types:", error);
      }
      setLoading(false);
    }
  }, [filteredModels]);

  const handleType = useCallback(async (e) => {
    const typeId = parseInt(e.target.value);
    const type = types.find(t => t.id === typeId);
    setSelType(type);
    setEngines([]);
    setSelEngine(null);
    setEngineType(null);

    if (type) {
      setLoading(true);
      try {
        const res = await fetch(`/api/engines?typeId=${typeId}`);
        const data = await res.json();
        setEngines(data);
      } catch (error) {
        console.error("Error fetching engines:", error);
      }
      setLoading(false);
    }
  }, [types]);

  const handleEngine = useCallback((e) => {
    const engineId = parseInt(e.target.value);
    const engine = engines.find(eng => eng.id === engineId);
    setSelEngine(engine);
  }, [engines]);

  const filteredEngines = useMemo(() => {
    if (!engineType) return engines;
    return engines.filter(e => e.type === engineType);
  }, [engines, engineType]);

  const canSearch = selModel && selType && selEngine;

  const handleSearch = useCallback(() => {
    if (!canSearch) return;
    const url = `/${brand.name.toLowerCase()}/${encodeURIComponent(selModel.name)}/${encodeURIComponent(selType.name)}/${selEngine.id}`;
    router.push(url);
  }, [canSearch, brand, selModel, selType, selEngine, router]);

  return (
    <div className="selector-container animate-in" style={{ marginTop: '32px' }}>
      {/* Group Selection for brands with performance divisions */}
      {hasGroups && (
        <div className="group-selector-row" style={{ marginBottom: '24px' }}>
          <div className="group-buttons">
            {groups.map(group => (
              <button
                key={group.id}
                className={`group-btn ${selGroup === group.id ? 'active' : ''}`}
                onClick={() => handleGroup(group.id)}
              >
                <Zap size={16} />
                <span>{group.displayName}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Horizontal Selector Row */}
      <div className="selector-row">
        {/* Model Selector */}
        <div className="selector-item">
          <label className="selector-label">
            <Car size={16} />
            <span>{t('model')}</span>
          </label>
          <select
            onChange={handleModel}
            value={selModel?.id || ''}
            disabled={loading || (hasGroups && !selGroup)}
            className="selector-select"
          >
            <option value="">{hasGroups && !selGroup ? t('selectGroupFirst') || 'Select category first' : t('selectModel')}</option>
            {filteredModels.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <ChevronRight size={24} className="selector-arrow" />

        {/* Type/Generation Selector */}
        <div className="selector-item">
          <label className="selector-label">
            <Settings size={16} />
            <span>{t('generation')}</span>
          </label>
          <select
            onChange={handleType}
            value={selType?.id || ''}
            disabled={loading || !selModel}
            className="selector-select"
          >
            <option value="">{t('selectGeneration')}</option>
            {types.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <ChevronRight size={24} className="selector-arrow" />

        {/* Engine Selector */}
        <div className="selector-item">
          <label className="selector-label">
            <Gauge size={16} />
            <span>{t('engine')}</span>
          </label>
          <select
            onChange={handleEngine}
            value={selEngine?.id || ''}
            disabled={loading || !selType || filteredEngines.length === 0}
            className="selector-select"
          >
            <option value="">{t('selectEngine')}</option>
            {filteredEngines.map(e => (
              <option key={e.id} value={e.id}>
                {e.name}{e.power ? ` ${e.power}${t('enginePowerUnit')}` : ''} - {e.description} ({e.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fuel Type Filter (shown when multiple types available)
      {selType && engineTypes.length > 1 && (
        <div className="fuel-filter animate-in">
          <label className="selector-label">
            <Zap size={16} />
            <span>{t('fuelType')}</span>
          </label>
          <div className="fuel-buttons">
            <button
              className={`fuel-btn ${!engineType ? 'active' : ''}`}
              onClick={() => { setEngineType(null); setSelEngine(null); }}
            >
              {t('allTypes')}
            </button>
            {engineTypes.map(type => (
              <button
                key={type}
                className={`fuel-btn ${engineType === type ? 'active' : ''}`}
                onClick={() => { setEngineType(type); setSelEngine(null); }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )} */}

      {/* Search Button */}
      <div className="search-row">
        <button
          onClick={handleSearch}
          className="btn-search-modern"
          disabled={!canSearch}
        >
          <Search size={22} />
          <span>{t('search')}</span>
          <div className="btn-arrow">
            <ChevronRight size={20} />
          </div>
        </button>
      </div>

      {loading && (
        <div className="flex-center" style={{ padding: '20px 0' }}>
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}

