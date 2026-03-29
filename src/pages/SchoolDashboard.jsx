import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Building2, UserPlus, Shield, Mail, Phone, MapPin, Globe, Search, UserCheck, UserX, X, Edit2, Trash2, RefreshCcw, UploadCloud, User, Eye, Menu, LogOut } from 'lucide-react';
import StorageImage from '../components/StorageImage';

export default function SchoolDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [school, setSchool] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tablas y Estado de Inquilinos
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // active | deleted
  const [usersLoading, setUsersLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Parse user data from localStorage for the top header
  let userProfile = { first_name: 'Usuario', role: 'invitado' };
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      userProfile = JSON.parse(rawUser);
    }
  } catch(e) {}

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Modal para Usuario
  const [viewingUser, setViewingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', password: '',
    id_type: 'DNI', id_number: '', role_id: '', phone: '',
    birth_date: '', address: '', emergency_contact_name: '', emergency_contact_phone: ''
  });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSchoolData();
  }, [id]);

  useEffect(() => {
    if (school) {
      fetchUsers();
    }
  }, [school, activeTab]);

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
        if (rData && rData.items) rData = rData.items; 
        setRoles(Array.isArray(rData) ? rData : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'active' 
        ? `http://localhost:8000/platform/schools/${id}/users`
        : `http://localhost:8000/platform/schools/${id}/users/deleted`;

      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Fallo lista usuarios');
      
      setUsers(Array.isArray(data) ? data : (data.items || []));
    } catch (e) {
      console.error(e);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormMsg({ type: '', text: '' });
    setSelectedAvatar(null);
    setAvatarPreview(null);
    setFormData({
      first_name: '', last_name: '', email: '', password: '',
      id_type: 'DNI', id_number: '', role_id: roles.length > 0 ? roles[0].id : '', phone: '',
      birth_date: '', address: '', emergency_contact_name: '', emergency_contact_phone: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormMsg({ type: '', text: '' });
    setSelectedAvatar(null);
    setAvatarPreview(null);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      password: '',
      id_type: user.id_type || 'DNI',
      id_number: user.id_number || '',
      role_id: user.role_id || (roles.length > 0 ? roles[0].id : ''),
      phone: user.phone || '',
      birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
      address: user.address || '',
      emergency_contact_name: user.emergency_contact_name || '',
      emergency_contact_phone: user.emergency_contact_phone || ''
    });
    setIsModalOpen(true);
  };

  const uploadAvatarToCloud = async (userId, file, token) => {
    try {
      const preRes = await fetch('http://localhost:8000/platform/storage/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ entity: 'school_user', entity_id: userId, filename: file.name, content_type: file.type || 'image/jpeg' })
      });
      const preData = await preRes.json();
      if (!preRes.ok) throw new Error('Firma Cloudflare rechazada');
      
      const uploadRes = await fetch(preData.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file
      });
      if (!uploadRes.ok) throw new Error('Cloudflare rechazó el avatar');

      const confirmRes = await fetch('http://localhost:8000/platform/storage/confirm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ entity: 'school_user', entity_id: userId, key: preData.key })
      });
      if (!confirmRes.ok) throw new Error('Error al confirmar foto en DB');
    } catch (e) {
      console.error('Avatar Error:', e);
      throw e;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const payload = { ...formData };
      if (!payload.birth_date) payload.birth_date = null;
      if (editingUser && !payload.password) delete payload.password;

      const url = editingUser ? `http://localhost:8000/platform/schools/${id}/users/${editingUser.id}` : `http://localhost:8000/platform/schools/${id}/users`;
      const method = editingUser ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)) : 'Fallo en servidor.');
      
      const userId = editingUser ? editingUser.id : data.id;
      if (selectedAvatar && userId) {
        setFormMsg({ type: 'success', text: `Datos guardados, subiendo fotografía...` });
        await uploadAvatarToCloud(userId, selectedAvatar, token);
      }

      setFormMsg({ type: 'success', text: `Usuario guardado exitosamente.` });
      setTimeout(() => {
        setIsModalOpen(false);
        fetchUsers();
      }, 1000);
      
    } catch (err) {
      setFormMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Desactivar y mover este usuario a la papelera? Perderá su acceso.')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/platform/schools/${id}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRestore = async (userId) => {
    if (!window.confirm('¿Restaurar acceso a este usuario del colegio?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8000/platform/schools/${id}/users/${userId}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    if (filterRole && u.role_id !== filterRole) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${u.first_name} ${u.last_name || ''}`.toLowerCase();
    return fullName.includes(term) || (u.email || '').includes(term) || (u.id_number || '').includes(term);
  });

  const getRoleName = (rId) => {
    const r = roles.find(x => x.id === rId);
    return r ? r.name : 'Desc';
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Global Navbar (Top Header) */}
      <header style={{ height: '70px', background: 'white', borderBottom: '1px solid rgba(45, 55, 63, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text)', transition: 'background 0.2s' }}>
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <img src="/bear-logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-text)', fontWeight: '700' }}>Hamutay</h3>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
             <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
               {(userProfile.first_name || userProfile.name || 'U').charAt(0).toUpperCase()}
             </div>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>{userProfile.first_name || userProfile.name || 'Usuario'}</span>
               <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{userProfile.role || 'Super Admin'}</span>
             </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(211, 73, 55, 0.1)', border: 'none', color: '#B91C1C', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '8px' }} title="Cerrar Sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Nav Lateral Collapsable */}
        <aside style={{ width: isCollapsed ? '0px' : '80px', background: 'white', borderRight: isCollapsed ? 'none' : '1px solid rgba(45, 55, 63, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1.5rem', flexShrink: 0, transition: 'all 0.3s cubic-bezier(0.2, 0, 0, 1)', overflow: 'hidden', opacity: isCollapsed ? 0 : 1, zIndex: 5 }}>
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

        {/* DATAGRID DE USUARIOS DEL COLEGIO */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)', overflow: 'hidden' }}>
          
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(45, 55, 63, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--color-tertiary)" /> Usuarios del Colegio
            </h2>
            <button onClick={openCreateModal} style={{ background: 'var(--color-tertiary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <UserPlus size={16} /> Agregar Perfil
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'rgba(248, 244, 238, 0.5)', borderBottom: '1px solid rgba(45, 55, 63, 0.05)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(45, 55, 63, 0.05)', padding: '0.3rem', borderRadius: '8px' }}>
              <button 
                onClick={() => setActiveTab('active')}
                style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: activeTab === 'active' ? 600 : 400, background: activeTab === 'active' ? 'white' : 'transparent', color: activeTab === 'active' ? 'var(--color-text)' : 'var(--color-text-muted)', boxShadow: activeTab === 'active' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
              ><UserCheck size={16} /> Activos</button>
              <button 
                onClick={() => setActiveTab('deleted')}
                style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: activeTab === 'deleted' ? 600 : 400, background: activeTab === 'deleted' ? 'white' : 'transparent', color: activeTab === 'deleted' ? '#B91C1C' : 'var(--color-text-muted)', boxShadow: activeTab === 'deleted' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
              ><UserX size={16} /> Papelera</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <select 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
                style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.1)', outline: 'none', fontSize: '0.85rem', color: filterRole ? 'var(--color-text)' : 'var(--color-text-muted)', background: 'white', cursor: 'pointer' }}
              >
                <option value="">Todos los perfiles</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>

              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Buscar empleado..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.5rem 1rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.1)', outline: 'none', width: '220px', fontSize: '0.85rem' }} />
              </div>
            </div>
          </div>

          <div style={{ minHeight: '250px' }}>
            {usersLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-tertiary)' }} /></div>
            ) : (
              <div style={{ overflowX: 'auto', padding: '0 1rem 1rem 1rem' }}>
                <table className="andean-table" style={{ fontSize: '0.9rem' }}>
                  <thead>
                    <tr>
                      <th style={{ background: 'transparent' }}>Usuario Corporativo</th>
                      <th style={{ background: 'transparent' }}>Documento</th>
                      <th style={{ background: 'transparent' }}>Perfil Jerárquico</th>
                      <th style={{ textAlign: 'right', background: 'transparent' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} style={{ opacity: activeTab === 'deleted' ? 0.6 : 1, transition: 'background 0.2s', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(45, 55, 63, 0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {u.avatar_path ? (
                              <StorageImage fileKey={u.avatar_path} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <User size={20} color="var(--color-text-muted)" />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.2rem' }}>{u.first_name} {u.last_name || ''}</div>
                            <div style={{ fontSize: '0.8rem' }}>{u.email}</div>
                          </div>
                        </td>
                        <td>{u.id_type} {u.id_number}</td>
                        <td>
                          <span style={{ background: 'rgba(224, 159, 57, 0.1)', color: 'var(--color-secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                            {getRoleName(u.role_id).toUpperCase()}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {activeTab === 'deleted' ? (
                            <button onClick={() => handleRestore(u.id)} style={{ background: 'rgba(105, 151, 126, 0.1)', border: 'none', color: 'var(--color-tertiary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }} title="Restaurar Usuario"><RefreshCcw size={14} /> Recuperar</button>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button onClick={() => setViewingUser(u)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Ver Detalle"><Eye size={16} /></button>
                              <button onClick={() => openEditModal(u)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Modificar"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(u.id)} style={{ background: 'rgba(211, 73, 55, 0.05)', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="A Papelera"><Trash2 size={16} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No encontramos registros disponibles.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </main>
      </div>

      {/* MODAL para Crear / Editar USUARIO */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(45, 55, 63, 0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '700px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <UserPlus size={24} color="var(--color-tertiary)" />
                <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--color-text)' }}>{editingUser ? 'Ajustar Expediente' : 'Provisionar Usuario de Colegio'}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ width: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(45, 55, 63, 0.05)', border: '2px dashed rgba(45, 55, 63, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (editingUser && editingUser.avatar_path) ? (
                      <StorageImage fileKey={editingUser.avatar_path} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={40} color="var(--color-text-muted)" />
                    )}
                  </div>
                  <label style={{ background: 'white', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'center', fontWeight: 600 }}>
                    <UploadCloud size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> Foto
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                  </label>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.2rem' }}>
                    <div><label className="input-label">Nombres *</label><input required type="text" name="first_name" value={formData.first_name} onChange={handleFormChange} className="sys-input" placeholder="Ej: Carlos" /></div>
                    <div><label className="input-label">Apellidos *</label><input required type="text" name="last_name" value={formData.last_name} onChange={handleFormChange} className="sys-input" placeholder="Ej: Ramos" /></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.2rem' }}>
                    <div><label className="input-label">Correo (Email) *</label><input required type="email" name="email" value={formData.email} onChange={handleFormChange} className="sys-input" placeholder="director@colegio.com" /></div>
                    <div><label className="input-label">Contraseña {editingUser && '(Opcional)'}</label><input required={!editingUser} type="password" name="password" value={formData.password} onChange={handleFormChange} className="sys-input" placeholder="Mínimo 8 caracteres" /></div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <label className="input-label">Tipo Doc</label>
                  <select name="id_type" value={formData.id_type} onChange={handleFormChange} className="sys-input">
                    <option value="DNI">DNI</option><option value="CE">CE</option><option value="PASSPORT">PAS</option>
                  </select>
                </div>
                <div><label className="input-label">N° Documento *</label><input required type="text" name="id_number" value={formData.id_number} onChange={handleFormChange} className="sys-input" /></div>
                <div><label className="input-label">Móvil</label><input type="text" name="phone" value={formData.phone} onChange={handleFormChange} className="sys-input" placeholder="+51..." /></div>
                <div><label className="input-label">F. Nacimiento</label><input type="date" name="birth_date" value={formData.birth_date} onChange={handleFormChange} className="sys-input" style={{ color: formData.birth_date ? 'inherit' : 'var(--color-text-muted)' }} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '1.2rem' }}>
                <div><label className="input-label">Dirección</label><input type="text" name="address" value={formData.address} onChange={handleFormChange} className="sys-input" placeholder="Av. Principal 123" /></div>
                <div><label className="input-label">Emergencia (Persona)</label><input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleFormChange} className="sys-input" placeholder="Nombre contacto" /></div>
                <div><label className="input-label">Emergencia (Telf)</label><input type="text" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleFormChange} className="sys-input" placeholder="Telf urgencias" /></div>
              </div>

              <fieldset style={{ border: '1px solid rgba(105, 151, 126, 0.3)', borderRadius: '12px', padding: '1rem', background: 'rgba(105, 151, 126, 0.02)', marginTop: '0.5rem' }}>
                <legend style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-tertiary)', padding: '0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Shield size={14} /> Autorizaciones</legend>
                <label className="input-label">Rol Jerárquico *</label>
                {roles.length === 0 ? (
                  <div style={{ color: '#B91C1C', fontSize: '0.85rem', width: '100%' }}>No hay roles globales disponibles.</div>
                ) : (
                  <select required name="role_id" value={formData.role_id} onChange={handleFormChange} className="sys-input" style={{ width: '100%', background: 'white' }}>
                    {roles.map(r => (<option key={r.id} value={r.id}>{r.name} ({r.category || 'General'})</option>))}
                  </select>
                )}
              </fieldset>

              {formMsg.text && (
                 <div style={{ background: formMsg.type === 'success' ? '#D1FAE5' : '#FEE2E2', color: formMsg.type === 'success' ? '#065F46' : '#B91C1C', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>{formMsg.text}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                 <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                 <button type="submit" disabled={submitting || roles.length === 0} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: (submitting || roles.length === 0) ? 0.6 : 1 }}>
                   {submitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />} Mapear en Base de Datos
                 </button>
              </div>
            </form>
          </div>
          <style>{`
            .input-label { display: block; font-size: 0.85rem; margin-bottom: 0.4rem; font-weight: 600; color: var(--color-text); }
            .sys-input { width: 100%; padding: 0.7rem; border-radius: 8px; border: 1px solid rgba(45, 55, 63, 0.2); outline: none; }
          `}</style>
        </div>
      )}

      {/* MODAL para VER DETALLES DE USUARIO */}
      {viewingUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(45, 55, 63, 0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '2.5rem', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(45, 55, 63, 0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)' }}>
                  {viewingUser.avatar_path ? <StorageImage fileKey={viewingUser.avatar_path} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={30} color="var(--color-text-muted)" />}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--color-text)' }}>{viewingUser.first_name} {viewingUser.last_name || ''}</h2>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{getRoleName(viewingUser.role_id).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setViewingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', background: 'rgba(248, 244, 238, 0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Documento:</span>
                <span style={{ color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 500 }}>{viewingUser.id_type} {viewingUser.id_number}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Correo:</span>
                <span style={{ color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 500 }}>{viewingUser.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Móvil:</span>
                <span style={{ color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 500 }}>{viewingUser.phone || 'No registrado'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>F. Nacimiento:</span>
                <span style={{ color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 500 }}>{viewingUser.birth_date ? new Date(viewingUser.birth_date).toLocaleDateString() : 'No registrada'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Dirección:</span>
                <span style={{ color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 500 }}>{viewingUser.address || 'No registrada'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Contacto de Emergencia:</span>
                <span style={{ color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 500 }}>
                  {viewingUser.emergency_contact_name ? `${viewingUser.emergency_contact_name} (${viewingUser.emergency_contact_phone || 'Sin número'})` : 'No registrada'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button type="button" onClick={() => setViewingUser(null)} style={{ background: 'var(--color-bg)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--color-text)', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cerrar Detalle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
