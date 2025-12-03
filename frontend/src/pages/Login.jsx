import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ChevronRight, Zap, Lock, User } from 'lucide-react';

const WelcomePage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdmin) {
      navigate('/calculator');
    }
  }, [isAdmin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (!success) {
      setError("Ongeldige inloggegevens");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'radial-gradient(ellipse at top, #1a1a1a 0%, #0a0a0a 100%)'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("/assets/New folder/background color (1).jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.1,
        pointerEvents: 'none'
      }} />

      <div className="animate-in" style={{
        width: '420px',
        maxWidth: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #d4a82a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 40px rgba(201, 162, 39, 0.4)'
          }}>
            <Zap size={40} color="#1a1a1a" />
          </div>
          <h1 style={{ margin: '0 0 8px 0' }}>SUPREME TUNING</h1>
          <p style={{
            color: 'var(--text-muted)',
            margin: 0,
            fontSize: '0.9rem',
            letterSpacing: '2px'
          }}>
            PROFESSIONELE ECU TUNING
          </p>
        </div>

        {/* Main CTA Card */}
        <div className="card" style={{
          marginBottom: '20px',
          background: 'var(--chrome-gradient)',
          border: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--brushed-metal)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{
              margin: '0 0 12px 0',
              color: 'var(--text-main)'
            }}>
              Chiptuning Calculator
            </h3>
            <p style={{
              color: 'var(--text-muted)',
              margin: '0 0 20px 0',
              fontSize: '0.9rem'
            }}>
              Ontdek het vermogenspotentieel van uw voertuig
            </p>
            <Link to="/calculator" style={{ textDecoration: 'none', display: 'block' }}>
              <button className="btn btn-search" style={{ width: '100%' }}>
                Start Calculator
                <ChevronRight size={20} />
              </button>
            </Link>
          </div>
        </div>

        {/* Admin Login Section */}
        <div className="card" style={{
          background: 'rgba(26, 26, 26, 0.8)',
          border: '1px solid var(--border)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border)'
          }}>
            <Lock size={14} color="var(--text-muted)" />
            <span style={{
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Administrator Toegang
            </span>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                marginBottom: '16px'
              }} />
              <input
                type="text"
                placeholder="Gebruikersnaam"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-75%)'
              }} />
              <input
                type="password"
                placeholder="Wachtwoord"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>

            {error && (
              <p style={{
                color: 'var(--error)',
                margin: '0 0 16px 0',
                fontSize: '0.85rem',
                padding: '10px',
                background: 'rgba(255, 68, 68, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(255, 68, 68, 0.2)'
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-secondary"
              style={{ width: '100%' }}
            >
              Inloggen
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          marginTop: '32px',
          color: 'var(--text-muted)',
          fontSize: '0.8rem'
        }}>
          © 2024 Supreme Tuning. Alle rechten voorbehouden.
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;