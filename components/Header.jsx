'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gauge, Shield, LogOut, Home } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { isAdmin, logout } = useAuth();

  const isHomePage = pathname === '/';
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <header style={{
      background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 100%)',
      borderBottom: '1px solid #2a2a2a',
      padding: '16px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #c9a227 0%, #e0b830 100%)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Gauge size={24} color="#1a1a1a" />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.4rem',
              margin: 0,
              background: 'linear-gradient(135deg, #c9a227 0%, #fff 50%, #c9a227 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '2px',
            }}>
              SUPREME
            </h1>
            <p style={{
              fontSize: '0.65rem',
              color: '#8a8a8a',
              margin: 0,
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}>
              Tuning Calculator
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {!isHomePage && (
            <Link
              href="/"
              className="btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.85rem' }}
            >
              <Home size={16} />
              Home
            </Link>
          )}

          {isAdmin ? (
            <>
              {!isAdminPage && (
                <Link
                  href="/admin"
                  className="btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                >
                  <Shield size={16} />
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="btn-secondary"
                style={{ padding: '10px 20px', fontSize: '0.85rem' }}
              >
                <LogOut size={16} />
                Uitloggen
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.85rem' }}
            >
              <Shield size={16} />
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

