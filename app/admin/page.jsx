'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import Header from '@/components/Header';
import {
  Shield, Database, Key, Save, RefreshCw, AlertCircle, Check, ChevronDown, ChevronUp,
  Download, Upload, Trash2, Car, Archive
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isLoading, fetchAPI, logout } = useAuth();
  const { t } = useLanguage();

  // Data editor state
  const [jsonData, setJsonData] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [dataSaving, setDataSaving] = useState(false);
  const [dataMessage, setDataMessage] = useState({ type: '', text: '' });
  const [showDataEditor, setShowDataEditor] = useState(false);

  // Visual editor state
  const [showVisualEditor, setShowVisualEditor] = useState(false);
  const [visualData, setVisualData] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedEngine, setSelectedEngine] = useState(null);

  // Backup state
  const [showBackups, setShowBackups] = useState(false);
  const [backups, setBackups] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState({ type: '', text: '' });

  // Credentials state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credsSaving, setCredsSaving] = useState(false);
  const [credsMessage, setCredsMessage] = useState({ type: '', text: '' });
  const [showCredentials, setShowCredentials] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login');
    }
  }, [isAdmin, isLoading, router]);

  // Load data
  const loadData = async () => {
    setDataLoading(true);
    setDataMessage({ type: '', text: '' });
    try {
      const data = await fetchAPI('data', { isProtected: true });
      setJsonData(JSON.stringify(data, null, 2));
    } catch (error) {
      setDataMessage({ type: 'error', text: t('failedToLoad') + ': ' + error.message });
    }
    setDataLoading(false);
  };

  // Save data
  const saveData = async () => {
    setDataSaving(true);
    setDataMessage({ type: '', text: '' });
    try {
      const parsedData = JSON.parse(jsonData);
      await fetchAPI('data', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify(parsedData),
      });
      setDataMessage({ type: 'success', text: t('dataSavedSuccessfully') });
    } catch (error) {
      if (error instanceof SyntaxError) {
        setDataMessage({ type: 'error', text: t('invalidJsonFormat') });
      } else {
        setDataMessage({ type: 'error', text: t('failedToSave') + ': ' + error.message });
      }
    }
    setDataSaving(false);
  };

  // Update credentials
  const updateCredentials = async (e) => {
    e.preventDefault();
    setCredsMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setCredsMessage({ type: 'error', text: t('passwordsDoNotMatch') });
      return;
    }

    if (newPassword.length < 6) {
      setCredsMessage({ type: 'error', text: t('passwordTooShort') });
      return;
    }

    setCredsSaving(true);
    try {
      await fetchAPI('auth/update-credentials', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify({ currentPassword, newUsername, newPassword }),
      });
      setCredsMessage({ type: 'success', text: t('credentialsUpdated') });
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      // Logout after credential change
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 2000);
    } catch (error) {
      setCredsMessage({ type: 'error', text: error.message });
    }
    setCredsSaving(false);
  };

  // Load visual editor data
  const loadVisualData = async () => {
    setDataLoading(true);
    try {
      const data = await fetchAPI('data', { isProtected: true });
      setVisualData(data);
      setDataMessage({ type: 'success', text: 'Data loaded successfully' });
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to load: ' + error.message });
    }
    setDataLoading(false);
  };

  // Download backup
  const downloadBackup = () => {
    if (!jsonData) {
      setDataMessage({ type: 'error', text: 'No data loaded. Please load data first.' });
      return;
    }
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDataMessage({ type: 'success', text: 'Backup downloaded successfully' });
  };

  // Upload/restore backup
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        JSON.parse(content); // Validate JSON
        setJsonData(content);
        setDataMessage({ type: 'success', text: 'Backup file loaded. Click Save to apply.' });
      } catch (error) {
        setDataMessage({ type: 'error', text: 'Invalid JSON file' });
      }
    };
    reader.readAsText(file);
  };

  // Delete brand (CASCADE: brand → models → types → engines → stages)
  const deleteBrand = async (brandId) => {
    if (!confirm('Are you sure you want to delete this brand and ALL its data (models, types, engines, stages)?')) return;

    const newData = { ...visualData };

    // Get all related IDs for cascade delete
    const modelIds = newData.models.filter(m => m.brandId === brandId).map(m => m.id);
    const typeIds = newData.types.filter(t => t.brandId === brandId).map(t => t.id);
    const engineIds = newData.engines.filter(e => typeIds.includes(e.typeId)).map(e => e.id);

    // Cascade delete in reverse order
    newData.stages = newData.stages.filter(s => !engineIds.includes(s.engineId));
    newData.engines = newData.engines.filter(e => !typeIds.includes(e.typeId));
    newData.types = newData.types.filter(t => t.brandId !== brandId);
    newData.models = newData.models.filter(m => m.brandId !== brandId);
    newData.brands = newData.brands.filter(b => b.id !== brandId);

    try {
      await fetchAPI('data', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify(newData),
      });
      setVisualData(newData);
      setSelectedBrand(null);
      setSelectedModel(null);
      setSelectedType(null);
      setSelectedEngine(null);
      setDataMessage({ type: 'success', text: 'Brand and all related data deleted successfully' });
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to delete: ' + error.message });
    }
  };

  // Delete model (CASCADE: model → types → engines → stages)
  const deleteModel = async (modelId) => {
    if (!confirm('Are you sure you want to delete this model and ALL its data (types, engines, stages)?')) return;

    const newData = { ...visualData };

    // Get all related IDs for cascade delete
    const typeIds = newData.types.filter(t => t.modelId === modelId).map(t => t.id);
    const engineIds = newData.engines.filter(e => typeIds.includes(e.typeId)).map(e => e.id);

    // Cascade delete in reverse order
    newData.stages = newData.stages.filter(s => !engineIds.includes(s.engineId));
    newData.engines = newData.engines.filter(e => !typeIds.includes(e.typeId));
    newData.types = newData.types.filter(t => t.modelId !== modelId);
    newData.models = newData.models.filter(m => m.id !== modelId);

    try {
      await fetchAPI('data', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify(newData),
      });
      setVisualData(newData);
      setSelectedModel(null);
      setSelectedType(null);
      setSelectedEngine(null);
      setDataMessage({ type: 'success', text: 'Model and all related data deleted successfully' });
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to delete: ' + error.message });
    }
  };

  // Delete type/generation (CASCADE: type → engines → stages)
  const deleteType = async (typeId) => {
    if (!confirm('Are you sure you want to delete this generation and ALL its data (engines, stages)?')) return;

    const newData = { ...visualData };

    // Get all related IDs for cascade delete
    const engineIds = newData.engines.filter(e => e.typeId === typeId).map(e => e.id);

    // Cascade delete in reverse order
    newData.stages = newData.stages.filter(s => !engineIds.includes(s.engineId));
    newData.engines = newData.engines.filter(e => e.typeId !== typeId);
    newData.types = newData.types.filter(t => t.id !== typeId);

    try {
      await fetchAPI('data', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify(newData),
      });
      setVisualData(newData);
      setSelectedType(null);
      setSelectedEngine(null);
      setDataMessage({ type: 'success', text: 'Generation and all related data deleted successfully' });
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to delete: ' + error.message });
    }
  };

  // Delete engine (CASCADE: engine → stages)
  const deleteEngine = async (engineId) => {
    if (!confirm('Are you sure you want to delete this engine and ALL its stages?')) return;

    const newData = { ...visualData };

    // Cascade delete in reverse order
    newData.stages = newData.stages.filter(s => s.engineId !== engineId);
    newData.engines = newData.engines.filter(e => e.id !== engineId);

    try {
      await fetchAPI('data', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify(newData),
      });
      setVisualData(newData);
      setSelectedEngine(null);
      setDataMessage({ type: 'success', text: 'Engine and all stages deleted successfully' });
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to delete: ' + error.message });
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p>{t('loading')}</p>
        </main>
      </>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '40px 24px', maxWidth: '1200px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #a8b0b8 0%, #d0d8e0 100%)',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Shield size={32} color="#1a1a1a" />
          </div>
          <h1>{t('adminDashboard')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('manageDatabaseAndCredentials')}</p>
        </div>

        {/* Backup Section */}
        <BackupSection
          t={t}
          showBackups={showBackups}
          setShowBackups={setShowBackups}
          jsonData={jsonData}
          dataMessage={dataMessage}
          downloadBackup={downloadBackup}
          handleFileUpload={handleFileUpload}
        />

        {/* Visual Editor Section */}
        <VisualEditorSection
          t={t}
          showVisualEditor={showVisualEditor}
          setShowVisualEditor={setShowVisualEditor}
          visualData={visualData}
          dataLoading={dataLoading}
          dataMessage={dataMessage}
          loadVisualData={loadVisualData}
          deleteBrand={deleteBrand}
          deleteModel={deleteModel}
          deleteType={deleteType}
          deleteEngine={deleteEngine}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedEngine={selectedEngine}
          setSelectedEngine={setSelectedEngine}
        />

        {/* Data Editor Section */}
        <DataEditorSection
          t={t}
          showDataEditor={showDataEditor}
          setShowDataEditor={setShowDataEditor}
          jsonData={jsonData}
          setJsonData={setJsonData}
          dataLoading={dataLoading}
          dataSaving={dataSaving}
          dataMessage={dataMessage}
          loadData={loadData}
          saveData={saveData}
        />

        {/* Credentials Section */}
        <CredentialsSection
          t={t}
          showCredentials={showCredentials}
          setShowCredentials={setShowCredentials}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newUsername={newUsername}
          setNewUsername={setNewUsername}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          credsSaving={credsSaving}
          credsMessage={credsMessage}
          updateCredentials={updateCredentials}
        />
      </main>
    </>
  );
}

// Backup Section Component
function BackupSection({
  t, showBackups, setShowBackups, jsonData, dataMessage,
  downloadBackup, handleFileUpload
}) {
  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '8px 0'
        }}
        onClick={() => setShowBackups(!showBackups)}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <Archive size={24} color="#a8b0b8" />
          Backup & Restore
        </h3>
        {showBackups ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>

      {showBackups && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={downloadBackup}
              disabled={!jsonData}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Download size={16} />
              Download Backup
            </button>
            <label className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
              <Upload size={16} />
              Upload Backup
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {dataMessage.text && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              background: dataMessage.type === 'error'
                ? 'rgba(255, 68, 68, 0.1)'
                : 'rgba(0, 255, 136, 0.1)',
              border: `1px solid ${dataMessage.type === 'error' ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
              color: dataMessage.type === 'error' ? '#ff4444' : '#00ff88',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {dataMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {dataMessage.text}
            </div>
          )}

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
            💾 <strong>Download Backup:</strong> Save current database to your computer<br />
            📤 <strong>Upload Backup:</strong> Restore database from a backup file (requires Save)
          </p>
        </div>
      )}
    </div>
  );
}

// Visual Editor Section Component
function VisualEditorSection({
  t, showVisualEditor, setShowVisualEditor, visualData, dataLoading, dataMessage,
  loadVisualData, deleteBrand, deleteModel, deleteType, deleteEngine,
  selectedBrand, setSelectedBrand, selectedModel, setSelectedModel,
  selectedType, setSelectedType, selectedEngine, setSelectedEngine
}) {
  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '8px 0'
        }}
        onClick={() => setShowVisualEditor(!showVisualEditor)}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <Car size={24} color="#a8b0b8" />
          Visual Data Manager
        </h3>
        {showVisualEditor ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>

      {showVisualEditor && (
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={loadVisualData}
            disabled={dataLoading}
            className="btn btn-search"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}
          >
            <RefreshCw size={16} className={dataLoading ? 'spin' : ''} />
            {dataLoading ? 'Loading...' : 'Load Data'}
          </button>

          {dataMessage.text && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: dataMessage.type === 'error'
                ? 'rgba(255, 68, 68, 0.1)'
                : 'rgba(0, 255, 136, 0.1)',
              border: `1px solid ${dataMessage.type === 'error' ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
              color: dataMessage.type === 'error' ? '#ff4444' : '#00ff88',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {dataMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {dataMessage.text}
            </div>
          )}

          {visualData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {/* Brands List */}
              <div style={{ background: 'rgba(50, 55, 60, 0.3)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>
                  Brands ({visualData.brands?.length || 0})
                </h4>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {visualData.brands?.map(brand => (
                    <div
                      key={brand.id}
                      style={{
                        padding: '8px',
                        marginBottom: '4px',
                        background: selectedBrand?.id === brand.id ? 'rgba(184, 192, 200, 0.2)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => {
                        setSelectedBrand(brand);
                        setSelectedModel(null);
                        setSelectedType(null);
                        setSelectedEngine(null);
                      }}
                    >
                      <span style={{ fontSize: '0.85rem' }}>{brand.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBrand(brand.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff4444',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Models List */}
              {selectedBrand && (
                <div style={{ background: 'rgba(50, 55, 60, 0.3)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>
                    Models - {selectedBrand.name} ({visualData.models?.filter(m => m.brandId === selectedBrand.id).length || 0})
                  </h4>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {visualData.models?.filter(m => m.brandId === selectedBrand.id).map(model => (
                      <div
                        key={model.id}
                        style={{
                          padding: '8px',
                          marginBottom: '4px',
                          background: selectedModel?.id === model.id ? 'rgba(184, 192, 200, 0.2)' : 'rgba(255,255,255,0.05)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onClick={() => {
                          setSelectedModel(model);
                          setSelectedType(null);
                          setSelectedEngine(null);
                        }}
                      >
                        <span style={{ fontSize: '0.85rem' }}>{model.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteModel(model.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Types/Generations List */}
              {selectedModel && (
                <div style={{ background: 'rgba(50, 55, 60, 0.3)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>
                    Generations - {selectedModel.name} ({visualData.types?.filter(t => t.modelId === selectedModel.id).length || 0})
                  </h4>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {visualData.types?.filter(t => t.modelId === selectedModel.id).map(type => (
                      <div
                        key={type.id}
                        style={{
                          padding: '8px',
                          marginBottom: '4px',
                          background: selectedType?.id === type.id ? 'rgba(184, 192, 200, 0.2)' : 'rgba(255,255,255,0.05)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onClick={() => {
                          setSelectedType(type);
                          setSelectedEngine(null);
                        }}
                      >
                        <span style={{ fontSize: '0.85rem' }}>{type.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteType(type.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Engines List */}
              {selectedType && (
                <div style={{ background: 'rgba(50, 55, 60, 0.3)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>
                    Engines - {selectedType.name} ({visualData.engines?.filter(e => e.typeId === selectedType.id).length || 0})
                  </h4>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {visualData.engines?.filter(e => e.typeId === selectedType.id).map(engine => (
                      <div
                        key={engine.id}
                        style={{
                          padding: '8px',
                          marginBottom: '4px',
                          background: selectedEngine?.id === engine.id ? 'rgba(184, 192, 200, 0.2)' : 'rgba(255,255,255,0.05)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onClick={() => setSelectedEngine(engine)}
                      >
                        <div style={{ fontSize: '0.85rem' }}>
                          <div>{engine.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {engine.power}hp • {engine.type}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEngine(engine.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Data Editor Section Component
function DataEditorSection({
  t, showDataEditor, setShowDataEditor, jsonData, setJsonData,
  dataLoading, dataSaving, dataMessage, loadData, saveData
}) {
  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '8px 0'
        }}
        onClick={() => setShowDataEditor(!showDataEditor)}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <Database size={24} color="#a8b0b8" />
          {t('databaseEditor')}
        </h3>
        {showDataEditor ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>

      {showDataEditor && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              onClick={loadData}
              disabled={dataLoading}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} className={dataLoading ? 'spin' : ''} />
              {dataLoading ? t('loading') : t('loadData')}
            </button>
            <button
              onClick={saveData}
              disabled={dataSaving || !jsonData}
              className="btn btn-search"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              {dataSaving ? t('saving') : t('saveData')}
            </button>
          </div>

          {dataMessage.text && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: dataMessage.type === 'error'
                ? 'rgba(255, 68, 68, 0.1)'
                : 'rgba(0, 255, 136, 0.1)',
              border: `1px solid ${dataMessage.type === 'error' ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
              color: dataMessage.type === 'error' ? '#ff4444' : '#00ff88',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {dataMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {dataMessage.text}
            </div>
          )}

          <textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder={t('loadDataPlaceholder')}
            style={{
              width: '100%',
              minHeight: '400px',
              fontFamily: 'monospace',
              fontSize: '12px',
              background: 'rgba(50, 55, 60, 0.5)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              color: 'var(--text-main)',
              resize: 'vertical'
            }}
          />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            {t('jsonWarning')}
          </p>
        </div>
      )}
    </div>
  );
}

// Credentials Section Component
function CredentialsSection({
  t, showCredentials, setShowCredentials,
  currentPassword, setCurrentPassword,
  newUsername, setNewUsername,
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  credsSaving, credsMessage, updateCredentials
}) {
  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '8px 0'
        }}
        onClick={() => setShowCredentials(!showCredentials)}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <Key size={24} color="#a8b0b8" />
          {t('updateCredentials')}
        </h3>
        {showCredentials ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>

      {showCredentials && (
        <form onSubmit={updateCredentials} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label>{t('currentPassword')}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>{t('newUsername')}</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              minLength={3}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>{t('newPassword')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>{t('confirmNewPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {credsMessage.text && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: credsMessage.type === 'error'
                ? 'rgba(255, 68, 68, 0.1)'
                : 'rgba(0, 255, 136, 0.1)',
              border: `1px solid ${credsMessage.type === 'error' ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
              color: credsMessage.type === 'error' ? '#ff4444' : '#00ff88',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {credsMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {credsMessage.text}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-search"
            disabled={credsSaving}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Key size={16} />
            {credsSaving ? t('updating') : t('updateCredentials')}
          </button>
        </form>
      )}
    </div>
  );
}
