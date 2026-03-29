import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Building2, UserPlus, Shield, Mail, Phone, MapPin, Globe } from 'lucide-react';
import StorageImage from '../components/StorageImage';

export default function SchoolDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [school, setSchool] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // User Form State
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', password: '',
    id_type: 'DNI', id_number: '', role_id: '', phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSchoolData();
  }, [id]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch school details
      const schRes = await fetch(`http://localhost:8000/platform/schools/${id}`, { headers });
      if (!schRes.ok) throw new Error('No se pudo cargar la información del colegio.');
      const schData = await schRes.json();
      setSchool(schData);

      // 2. Fetch global roles (para el dropdown del form de creación)
      const rolesRes = await fetch(`http://localhost:8000/platform/roles`, { headers });
      if (rolesRes.ok) {
        let rData = await rolesRes.json();
        if (rData && rData.items) rData = rData.items; // depends on backend pagination format
        setRoles(Array.isArray(rData) ? rData : []);
        
        // Auto-select first role if available
        if (Array.isArray(rData) && rData.length > 0) {
          setFormData(prev => ({ ...prev, role_id: rData[0].id }));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const payload = { ...formData };
      
      const res = await fetch(`http://localhost:8000/platform/schools/${id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ? JSON.stringify(data.detail) : 'Fallo de registro al servidor.');
      
      setFormMsg({ type: 'success', text: `Usuario ${formData.first_name} creado exitosamente.` });
      setFormData({
        first_name: '', last_name: '', email: '', password: '',
        id_type: 'DNI', id_number: '', phone: '', role_id: formData.role_id
      });
    } catch (err) {
      setFormMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
        <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Cargando infraestructura escolar...</p>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '1rem 2rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {error || 'Colegio no encontrado'}
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ marginTop: '1rem', background: 'transparent', border: '1px solid rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Volver al Panel</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Mini Sidebar to maintain dashboard context */}
      <aside style={{ width: '80px', background: 'white', borderRight: '1px solid rgba(45, 55, 63, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1.5rem', flexShrink: 0 }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(45,55,63,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)', transition: 'all 0.2s', marginBottom: '2rem' }}
          title="Volver al inicio"
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(105, 151, 126, 0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-tertiary)' }} title="Sub-Dashboard Escolar">
          <Building2 size={20} />
        </div>
      </aside>

      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        {/* CABECERA (Detalles Superiores) */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '2rem', border: '1px solid rgba(45, 55, 63, 0.1)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)', marginBottom: '2rem' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden', flexShrink: 0, padding: school.logo_url ? 0 : '1rem', background: 'rgba(45, 55, 63, 0.02)' }}>
            {school.logo_url ? (
              <StorageImage fileKey={school.logo_url} fallbackName={school.name} alt="Logo de Colegio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Building2 size={86} color="rgba(45, 55, 63, 0.2)" />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h1 style={{ fontSize: '2rem', margin: '0 0 0.2rem 0', color: 'var(--color-text)' }}>{school.name}</h1>
                <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.9rem' }}>
                  Dominio interno: <strong>{school.slug}</strong> | Tipo: <strong>{school.institution_type === 'private' ? 'Privado' : 'Estatal'}</strong>
                </p>
              </div>
              <span style={{ background: 'rgba(224, 159, 57, 0.1)', color: 'var(--color-secondary)', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                Plan: {(school.plan_code || 'FREE').toUpperCase()}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-text)' }}>
                <Mail size={16} color="var(--color-text-muted)" /> {school.email}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-text)' }}>
                <Phone size={16} color="var(--color-text-muted)" /> {school.phone || 'No registrado'}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-text)' }}>
                <MapPin size={16} color="var(--color-text-muted)" /> {school.district || school.province || 'Geografía no definida'}
              </div>
              {school.website && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-primary)' }}>
                  <Globe size={16} /> <a href={school.website} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{school.website.replace(/^https?:\/\//,'')}</a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FORMULARIO DE USUARIO */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(45, 55, 63, 0.1)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)', maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <UserPlus size={24} color="var(--color-tertiary)" />
            <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--color-text)' }}>Provisionar Usuario Administrativo</h2>
          </div>
          
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Nombres *</label>
                <input required type="text" name="first_name" value={formData.first_name} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} placeholder="Ej: Carlos" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Apellidos *</label>
                <input required type="text" name="last_name" value={formData.last_name} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} placeholder="Ej: Ramos" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Correo de Acceso (Email) *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} placeholder="director@colegio.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Contraseña Segura *</label>
                <input required type="password" name="password" value={formData.password} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} placeholder="Mínimo 8 caracteres" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Tipo Doc</label>
                <select name="id_type" value={formData.id_type} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }}>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="PASSPORT">PAS</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>N° de Documento *</label>
                <input required type="text" name="id_number" value={formData.id_number} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Teléfono Móvil</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} placeholder="+51..." />
              </div>
            </div>

            <fieldset style={{ border: '1px solid rgba(105, 151, 126, 0.3)', borderRadius: '12px', padding: '1rem', background: 'rgba(105, 151, 126, 0.02)' }}>
              <legend style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-tertiary)', padding: '0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Shield size={14} /> Permisos y Seguridad</legend>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Rol Jerárquico *</label>
              {roles.length === 0 ? (
                <div style={{ color: '#B91C1C', fontSize: '0.85rem', border: '1px solid #F87171', padding: '0.5rem', borderRadius: '6px', background: '#FEE2E2' }}>
                  Aún no hay roles en este colegio. Ve a crear roles primero o el usuario fallará.
                </div>
              ) : (
                <select required name="role_id" value={formData.role_id} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none', background: 'white' }}>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.category || 'General'})</option>
                  ))}
                </select>
              )}
            </fieldset>

            {formMsg.text && (
               <div style={{ background: formMsg.type === 'success' ? '#D1FAE5' : '#FEE2E2', color: formMsg.type === 'success' ? '#065F46' : '#B91C1C', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                 {formMsg.text}
               </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
               <button type="submit" disabled={submitting || roles.length === 0} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (submitting || roles.length === 0) ? 0.6 : 1 }}>
                 {submitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                 Registrar Usuario en el Inquilino
               </button>
            </div>
          </form>
        </div>

      </main>
    </div>
  );
}
