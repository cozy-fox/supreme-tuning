import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Zap, LogOut, Shield } from 'lucide-react';

const Header = () => {
  const { isAdmin, logout } = useAuth();

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 0',
      marginBottom: '2rem',
      borderBottom: '1px solid var(--border)',
      position: 'relative'
    }}>
      {/* Decorative line accent */}
      <div style={{
        position: 'absolute',
        bottom: '-1px',
        left: '0',
        width: '120px',
        height: '2px',
        background: 'linear-gradient(90deg, var(--primary), transparent)'
      }} />

      {/* Logo */}
      <Link to="/calculator" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #d4a82a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(201, 162, 39, 0.3)'
          }}>
            <Zap size={24} color="#1a1a1a" />
          </div>
          <div>
            <h2 style={{
              margin: 0,
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '1.5rem',
              fontWeight: '700',
              letterSpacing: '2px',
              lineHeight: 1
            }}>
              SUPREME<span style={{ color: 'var(--primary)' }}>TUNING</span>
            </h2>
            <p style={{
              margin: 0,
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}>
              Professional ECU Tuning
            </p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {isAdmin && (
          <Link to="/admin" style={{ textDecoration: 'none' }}>
            <button
              className="btn-secondary"
              style={{
                padding: '10px 18px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Shield size={16} />
              Admin
            </button>
          </Link>
        )}
        {isAdmin && (
          <button
            onClick={logout}
            className="btn-secondary"
            style={{
              padding: '10px 18px',
              fontSize: '0.85rem',
              color: 'var(--error)',
              borderColor: 'var(--error)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={16} />
            Uitloggen
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;