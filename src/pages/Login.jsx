import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Users, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('tenant'); // 'tenant' | 'platform'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (loginType === 'platform') {
      // ──── Platform Admin Login ────
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/platform/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Credenciales inválidas o error de servidor');

        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginType', 'platform');
        navigate('/dashboard');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

    } else {
      // ──── School User Login (2-step flow) ────
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/schools/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Credenciales inválidas o error de servidor');

        if (data.requires_school_selection) {
          // Multiple schools → go to school selector page
          // Pass credentials and school list via sessionStorage (not localStorage for security)
          sessionStorage.setItem('pending_login', JSON.stringify({
            email,
            password,
            schools: data.schools
          }));
          navigate('/select-school');
        } else {
          // Single school → token returned directly
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('loginType', 'school');
          navigate('/school-portal');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
      {/* Decorative blobs for login view */}
      <div className="glow-blob blob-2" style={{ top: '10%', left: '-10%' }}></div>
      <div className="glow-blob blob-3" style={{ bottom: '-10%', right: '10%' }}></div>

      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/bear-logo.png" alt="Hamutay Logo" style={{ width: '56px', height: '56px', borderRadius: '12px', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Iniciar Sesión</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Bienvenido de nuevo a Hamutay</p>
        </div>

        {/* Login Type Selector */}
        <div style={{ display: 'flex', background: 'rgba(45, 55, 63, 0.05)', borderRadius: '12px', padding: '4px', marginBottom: '2rem' }}>
          <button 
            type="button"
            onClick={() => setLoginType('tenant')}
            style={{ 
              flex: 1, padding: '0.6rem', border: 'none', borderRadius: '10px', 
              background: loginType === 'tenant' ? 'white' : 'transparent',
              color: loginType === 'tenant' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: loginType === 'tenant' ? '600' : '400',
              boxShadow: loginType === 'tenant' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} /> Colegio
          </button>
          <button 
            type="button"
            onClick={() => setLoginType('platform')}
            style={{ 
              flex: 1, padding: '0.6rem', border: 'none', borderRadius: '10px', 
              background: loginType === 'platform' ? 'white' : 'transparent',
              color: loginType === 'platform' ? 'var(--color-secondary)' : 'var(--color-text-muted)',
              fontWeight: loginType === 'platform' ? '600' : '400',
              boxShadow: loginType === 'platform' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Shield size={16} /> Hamutay Admin
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #F87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 500 }}>Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={loginType === 'tenant' ? 'director@colegio.com' : 'admin@hamutay.com'}
              style={{ 
                width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', 
                border: '1px solid rgba(45, 55, 63, 0.2)', background: 'white',
                fontFamily: 'inherit', fontSize: '1rem', outline: 'none'
              }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', fontWeight: 500 }}>Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ 
                width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', 
                border: '1px solid rgba(45, 55, 63, 0.2)', background: 'white',
                fontFamily: 'inherit', fontSize: '1rem', outline: 'none'
              }} 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? <Loader2 className="spinner" size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>
            ¿No tienes cuenta aún? <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Contáctanos</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
