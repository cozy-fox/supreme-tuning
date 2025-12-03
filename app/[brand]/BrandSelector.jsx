'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { Search, Car, Settings, Gauge, Zap } from 'lucide-react';

export default function BrandSelector({ brand, models }) {
  const router = useRouter();
  const { fetchAPI } = useAuth();

  const [types, setTypes] = useState([]);
  const [engines, setEngines] = useState([]);
  
  const [selModel, setSelModel] = useState(null);
  const [selType, setSelType] = useState(null);
  const [selEngine, setSelEngine] = useState(null);
  const [engineType, setEngineType] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleModel = useCallback(async (e) => {
    const modelId = parseInt(e.target.value);
    const model = models.find(m => m.id === modelId);
    setSelModel(model);
    setTypes([]);
    setSelType(null);
    setEngines([]);
    setSelEngine(null);

    if (model) {
      setLoading(true);
      try {
        const data = await fetchAPI(`types?modelId=${modelId}`);
        setTypes(data);
      } catch (error) {
        console.error("Error fetching types:", error);
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
    setEngineType(null);

    if (type) {
      setLoading(true);
      try {
        const data = await fetchAPI(`engines?typeId=${typeId}`);
        setEngines(data);
      } catch (error) {
        console.error("Error fetching engines:", error);
      }
      setLoading(false);
    }
  }, [types, fetchAPI]);

  const handleEngineType = useCallback((e) => {
    setEngineType(e.target.value || null);
    setSelEngine(null);
  }, []);

  const handleEngine = useCallback((e) => {
    const engineId = parseInt(e.target.value);
    const engine = engines.find(eng => eng.id === engineId);
    setSelEngine(engine);
  }, [engines]);

  const filteredEngines = useMemo(() => {
    if (!engineType) return engines;
    return engines.filter(e => e.type === engineType);
  }, [engines, engineType]);

  const engineTypes = useMemo(() => {
    const types = [...new Set(engines.map(e => e.type).filter(Boolean))];
    return types;
  }, [engines]);

  const canSearch = selModel && selType && selEngine;

  const handleSearch = useCallback(() => {
    if (!canSearch) return;
    
    // Navigate to SEO-friendly URL
    const url = `/${brand.name.toLowerCase()}/${encodeURIComponent(selModel.name)}/${encodeURIComponent(selType.name)}/${selEngine.id}`;
    router.push(url);
  }, [canSearch, brand, selModel, selType, selEngine, router]);

  return (
    <div className="selection-card animate-in" style={{ marginTop: '32px' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Model Selector */}
          <div>
            <label><Car size={14} style={{ marginRight: '8px' }} />Model</label>
            <select onChange={handleModel} value={selModel?.id || ''} disabled={loading}>
              <option value="">-- Selecteer Model --</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Type/Generation Selector */}
          {selModel && types.length > 0 && (
            <div className="animate-in">
              <label><Settings size={14} style={{ marginRight: '8px' }} />Generatie / Type</label>
              <select onChange={handleType} value={selType?.id || ''} disabled={loading}>
                <option value="">-- Selecteer Generatie --</option>
                {types.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Engine Type Filter */}
          {selType && engineTypes.length > 1 && (
            <div className="animate-in">
              <label><Zap size={14} style={{ marginRight: '8px' }} />Brandstof Type</label>
              <select onChange={handleEngineType} value={engineType || ''}>
                <option value="">Alle Types</option>
                {engineTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          {/* Engine Selector */}
          {selType && filteredEngines.length > 0 && (
            <div className="animate-in">
              <label><Gauge size={14} style={{ marginRight: '8px' }} />Motor</label>
              <select onChange={handleEngine} value={selEngine?.id || ''} disabled={loading}>
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
        <button onClick={handleSearch} className="btn btn-search" disabled={!canSearch} style={{ marginTop: '24px' }}>
          <Search size={20} />
          Zoeken
        </button>

        {loading && (
          <div className="flex-center" style={{ padding: '20px 0' }}>
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
}

