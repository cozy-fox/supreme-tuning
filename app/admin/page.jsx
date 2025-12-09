'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import Header from '@/components/Header';
import { Shield, Database, Key, Save, RefreshCw, AlertCircle, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isLoading, fetchAPI, logout } = useAuth();

  // Data editor state
  const [jsonData, setJsonData] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [dataSaving, setDataSaving] = useState(false);
  const [dataMessage, setDataMessage] = useState({ type: '', text: '' });
  const [showDataEditor, setShowDataEditor] = useState(false);

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
      setDataMessage({ type: 'error', text: 'Failed to load data: ' + error.message });
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
      setDataMessage({ type: 'success', text: 'Data saved successfully!' });
    } catch (error) {
      if (error instanceof SyntaxError) {
        setDataMessage({ type: 'error', text: 'Invalid JSON format' });
      } else {
        setDataMessage({ type: 'error', text: 'Failed to save: ' + error.message });
      }
    }
    setDataSaving(false);
  };

  // Update credentials
  const updateCredentials = async (e) => {
    e.preventDefault();
    setCredsMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setCredsMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setCredsMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setCredsSaving(true);
    try {
      await fetchAPI('auth/update-credentials', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify({ currentPassword, newUsername, newPassword }),
      });
      setCredsMessage({ type: 'success', text: 'Credentials updated! Please login again.' });
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

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p>Loading...</p>
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
            background: 'linear-gradient(135deg, #c9a227 0%, #e0b830 100%)',
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
          <h1>Admin Dashboard</h1>
          <p style={{ color: '#8a8a8a' }}>Manage your tuning database and credentials</p>
        </div>

        {/* Data Editor Section */}
        <DataEditorSection
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

// Data Editor Section Component
function DataEditorSection({
  showDataEditor, setShowDataEditor, jsonData, setJsonData,
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
          <Database size={24} color="#c9a227" />
          Database Editor
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
              {dataLoading ? 'Loading...' : 'Load Data'}
            </button>
            <button
              onClick={saveData}
              disabled={dataSaving || !jsonData}
              className="btn btn-search"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              {dataSaving ? 'Saving...' : 'Save Data'}
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
            placeholder="Click 'Load Data' to load the database..."
            style={{
              width: '100%',
              minHeight: '400px',
              fontFamily: 'monospace',
              fontSize: '12px',
              background: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '16px',
              color: '#fff',
              resize: 'vertical'
            }}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            ⚠️ Be careful when editing. Invalid JSON will not be saved.
          </p>
        </div>
      )}
    </div>
  );
}

// Credentials Section Component
function CredentialsSection({
  showCredentials, setShowCredentials,
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
          <Key size={24} color="#c9a227" />
          Update Credentials
        </h3>
        {showCredentials ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>

      {showCredentials && (
        <form onSubmit={updateCredentials} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>New Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              required
              minLength={3}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              required
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
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
            {credsSaving ? 'Updating...' : 'Update Credentials'}
          </button>
        </form>
      )}
    </div>
  );
}
