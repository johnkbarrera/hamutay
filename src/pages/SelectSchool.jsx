import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Loader2, ChevronRight } from 'lucide-react';

export default function SelectSchool() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [pendingLogin, setPendingLogin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectingId, setSelectingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('pending_login');
    if (!raw) {
      navigate('/login');
      return;
    }
    try {
      const data = JSON.parse(raw);
      setPendingLogin(data);
      setSchools(data.schools || []);
    } catch {
      navigate('/login');
    }
  }, []);

  const handleSelect = async (schoolId) => {
    if (!pendingLogin) return;
    setLoading(true);
    setSelectingId(schoolId);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/schools/auth/select-school`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingLogin.email,
          password: pendingLogin.password,
          school_id: schoolId
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Error al seleccionar colegio');

      // Clean up temp data
      sessionStorage.removeItem('pending_login');

      // Store session
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('loginType', 'school');
      navigate('/school-portal');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSelectingId(null);
    }
  };

  const handleBack = () => {
    sessionStorage.removeItem('pending_login');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src="/bear-logo.png" alt="Hamutay" style={{ width: '48px', height: '48px', borderRadius: '12px', marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-text)', margin: '0 0 0.5rem' }}>Selecciona tu Colegio</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            Tu cuenta está vinculada a múltiples establecimientos. Elige uno para continuar.
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #F87171' }}>
            {error}
          </div>
        )}

        {/* School Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {schools.map(school => (
            <button
              key={school.id}
              onClick={() => handleSelect(school.id)}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: 'white', border: '1px solid rgba(45, 55, 63, 0.1)',
                borderRadius: '14px', padding: '1.2rem 1.5rem',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectingId === school.id ? '0 4px 20px rgba(211, 73, 55, 0.15)' : '0 2px 8px rgba(45, 55, 63, 0.04)',
                borderColor: selectingId === school.id ? 'var(--color-primary)' : 'rgba(45, 55, 63, 0.1)',
                opacity: loading && selectingId !== school.id ? 0.5 : 1,
                textAlign: 'left', width: '100%', fontFamily: 'inherit'
              }}
            >
              <div style={{
                width: '50px', height: '50px', borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(211, 73, 55, 0.08), rgba(224, 159, 57, 0.08))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <Building2 size={24} color="var(--color-primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '1.05rem', lineHeight: 1.3 }}>
                  {school.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                  Acceder al portal escolar
                </div>
              </div>
              <div style={{ flexShrink: 0, color: 'var(--color-text-muted)' }}>
                {selectingId === school.id ? (
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Back to login */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={handleBack}
            style={{
              background: 'transparent', border: 'none', color: 'var(--color-text-muted)',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              fontWeight: 500, fontSize: '0.9rem', fontFamily: 'inherit'
            }}
          >
            <ArrowLeft size={16} /> Volver al Login
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
