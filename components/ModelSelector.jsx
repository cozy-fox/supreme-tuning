'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Search, Car, Settings, Gauge, ChevronRight } from 'lucide-react';

export default function ModelSelector({ brand, models: initialModels }) {
  const router = useRouter();
  const { t } = useLanguage();

  const [types, setTypes] = useState([]);
  const [engines, setEngines] = useState([]);

  const [selModel, setSelModel] = useState(null);
  const [selType, setSelType] = useState(null);
  const [selEngine, setSelEngine] = useState(null);
  const [engineType, setEngineType] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleModel = useCallback(async (e) => {
    const modelId = parseInt(e.target.value);
    const model = initialModels.find(m => m.id === modelId);
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
  }, [initialModels]);

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

  const handleEngineTypeFilter = useCallback((type) => {
    setEngineType(type === engineType ? null : type);
    setSelEngine(null);
  }, [engineType]);

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
    // <div style={{
    //   maxWidth: '1000px',
    //   margin: '32px auto 0',
    //   padding: '0 20px'
    // }}>
    <div className="selector-container animate-in">
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
            disabled={loading}
            className="selector-select"
          >
            <option value="">{t('selectModel')}</option>
            {initialModels.map(m => (
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
            disabled={!selModel || loading}
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
            disabled={!selType || loading}
            className="selector-select"
          >
            <option value="">{t('selectEngine')}</option>
            {filteredEngines.map(e => (
              <option key={e.id} value={e.id}>
                {e.name}{e.power ? ` ${e.power}${t('hp')}` : ''} - {e.description} ({e.type})
              </option>
            ))}
          </select>
        </div>
      </div>

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
    </div>
    // </div>
  );
}

