import React, { useState, useEffect } from 'react';
import { 
  Loader2, Plus, Edit2, Trash2, Shield, Search, X, 
  AlertCircle, UserCheck, Eye, GraduationCap, Briefcase, UserPlus
} from 'lucide-react';
import StorageImage from '../../components/StorageImage';

export default function ModuleSchoolUsers({ schoolId }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('generic'); // 'generic', 'profesor', 'alumno'

  // Form State
  const [formData, setFormData] = useState({
    email: '', 
    password: '', 
    first_name: '', 
    last_name: '',
    id_type: 'DNI', 
    id_number: '', 
    role_id: '', 
    phone: '', 
    birth_date: '', 
    address: '',
    emergency_contact_name: '', 
    emergency_contact_phone: '',
    is_active: true
  });

  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    if (!schoolId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8000/schools/${schoolId}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Error al descargar los usuarios');
      setUsers(Array.isArray(data) ? data : (data.items || []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    if (!schoolId) return;
    try {
      const response = await fetch(`http://localhost:8000/schools/${schoolId}/admin/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        const roleItems = Array.isArray(data) ? data : (data.items || []);
        setRoles(roleItems);
        if (roleItems.length > 0 && !formData.role_id) {
          setFormData(prev => ({ ...prev, role_id: roleItems[0].id }));
        }
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [schoolId]);

  const openCreateModal = (mode = 'generic') => {
    setEditingUser(null);
    setModalMode(mode);
    
    // Tries to find a matching role for the specific mode
    let targetRoleId = roles[0]?.id || '';
    if (mode === 'profesor') {
      const r = roles.find(x => 
        x.name.toLowerCase().includes('profesor') || 
        x.name.toLowerCase().includes('docente') || 
        x.name.toLowerCase().includes('maestro')
      );
      if (r) targetRoleId = r.id;
    } else if (mode === 'alumno') {
      const r = roles.find(x => 
        x.name.toLowerCase().includes('alumno') || 
        x.name.toLowerCase().includes('estudiante')
      );
      if (r) targetRoleId = r.id;
    }

    setFormData({
      email: '', 
      password: '', 
      first_name: '', 
      last_name: '',
      id_type: 'DNI', 
      id_number: '', 
      role_id: targetRoleId, 
      phone: '', 
      birth_date: '', 
      address: '',
      emergency_contact_name: '', 
      emergency_contact_phone: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      password: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      id_type: user.id_type || 'DNI',
      id_number: user.id_number || '',
      role_id: user.role_id || '',
      phone: user.phone || '',
      birth_date: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
      address: user.address || '',
      emergency_contact_name: user.emergency_contact_name || '',
      emergency_contact_phone: user.emergency_contact_phone || '',
      is_active: user.is_active !== undefined ? user.is_active : true
    });
    setIsModalOpen(true);
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const endpoint = editingUser 
      ? `http://localhost:8000/schools/${schoolId}/admin/users/${editingUser.id}` 
      : `http://localhost:8000/schools/${schoolId}/admin/users`;
    const method = editingUser ? 'PUT' : 'POST';

    const payload = { ...formData };
    if (editingUser && !payload.password) {
      delete payload.password;
    }
    
    // Format date for backend if present
    if (payload.birth_date) {
      payload.birth_date = new Date(payload.birth_date).toISOString();
    } else {
      payload.birth_date = null;
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Error en la petición');
      
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;
    try {
      const response = await fetch(`http://localhost:8000/schools/${schoolId}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Error al eliminar');
      }
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${u.first_name} ${u.last_name || ''}`.toLowerCase();
    return fullName.includes(term) || (u.email || '').includes(term) || (u.id_number || '').includes(term);
  });

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Cargando...';
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)', overflow: 'hidden' }}>
      
      {/* Upper Toolbar */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(45, 55, 63, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} color="var(--color-primary)" /> Usuarios del Colegio
        </h2>
        
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button onClick={() => openCreateModal('generic')} style={{ background: 'rgba(45, 55, 63, 0.05)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem' }}>
            <UserPlus size={16} /> Nuevo Usuario
          </button>
          <button onClick={() => openCreateModal('profesor')} style={{ background: 'rgba(224, 159, 57, 0.1)', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem' }}>
            <Briefcase size={16} /> Nuevo Profesor
          </button>
          <button onClick={() => openCreateModal('alumno')} style={{ background: 'var(--color-tertiary)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem' }}>
            <GraduationCap size={16} /> Nuevo Alumno
          </button>
        </div>
      </div>

      {/* Search Contextbar */}
      <div style={{ padding: '1rem 2rem', background: 'rgba(248, 244, 238, 0.5)', borderBottom: '1px solid rgba(45, 55, 63, 0.05)', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o DNI..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '0.5rem 1rem 0.5rem 2.2rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.1)', outline: 'none', width: '300px', fontSize: '0.85rem' }} 
          />
        </div>
      </div>

      {error && (
        <div style={{ margin: '1rem 2rem', background: '#FEE2E2', color: '#B91C1C', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div style={{ minHeight: '300px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'var(--color-secondary)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ overflowX: 'auto', padding: '0 1rem 1rem 1rem' }}>
            <table className="andean-table" style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ background: 'transparent' }}>Colaborador</th>
                  <th style={{ background: 'transparent' }}>Documento</th>
                  <th style={{ background: 'transparent' }}>Rol</th>
                  <th style={{ background: 'transparent' }}>Estado</th>
                  <th style={{ textAlign: 'right', background: 'transparent' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ transition: 'background 0.2s', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(45, 55, 63, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {u.avatar_path ? (
                            <StorageImage fileKey={u.avatar_path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (u.first_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>{u.first_name} {u.last_name || ''}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.id_type} {u.id_number}</td>
                    <td>
                      <span style={{ background: 'rgba(224, 159, 57, 0.1)', color: 'var(--color-secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                        {getRoleName(u.role_id).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: u.is_active ? 'var(--color-tertiary)' : '#B91C1C', fontSize: '0.8rem', fontWeight: 600 }}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => openDetailModal(u)} style={{ background: 'transparent', border: '1px solid rgba(45, 55, 63, 0.1)', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Ver Detalle">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openEditModal(u)} style={{ background: 'transparent', border: '1px solid rgba(45, 55, 63, 0.1)', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(u.id)} style={{ background: 'rgba(211, 73, 55, 0.05)', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    No se encontraron colaboradores.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL para Crear / Editar */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(45, 55, 63, 0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                {editingUser 
                  ? <Edit2 size={24} color="var(--color-primary)" /> 
                  : modalMode === 'profesor' 
                    ? <Briefcase size={24} color="var(--color-secondary)" /> 
                    : modalMode === 'alumno' 
                      ? <GraduationCap size={24} color="var(--color-tertiary)" /> 
                      : <UserPlus size={24} color="var(--color-primary)" />}
                <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--color-text)' }}>
                  {editingUser 
                    ? 'Editar Registro' 
                    : modalMode === 'profesor' 
                      ? 'Crear Profesor' 
                      : modalMode === 'alumno' 
                        ? 'Inscribir Alumno' 
                        : 'Nuevo Usuario'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Correo Electrónico</label>
                  <input name="email" type="email" required value={formData.email} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Nombres</label>
                  <input name="first_name" type="text" required value={formData.first_name} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Apellidos</label>
                  <input name="last_name" type="text" required value={formData.last_name} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Doc Identidad</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select name="id_type" value={formData.id_type} onChange={handleFormChange} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none', width: '35%' }}>
                      <option value="DNI">DNI</option>
                      <option value="CE">CE</option>
                      <option value="PASSPORT">PAS</option>
                    </select>
                    <input name="id_number" type="text" required value={formData.id_number} onChange={handleFormChange} style={{ width: '65%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ opacity: (!editingUser && modalMode !== 'generic') ? 0.7 : 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Rol Académico/Admin {(!editingUser && modalMode !== 'generic') && '(Auto)'}
                  </label>
                  <select 
                    name="role_id" 
                    required 
                    value={formData.role_id} 
                    onChange={handleFormChange} 
                    disabled={!editingUser && modalMode !== 'generic'}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none', background: (!editingUser && modalMode !== 'generic') ? '#f9f9f9' : 'white' }}
                  >
                    <option value="" disabled>Seleccione un rol</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Teléfono</label>
                  <input name="phone" type="text" value={formData.phone} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Fecha Nacimiento</label>
                  <input name="birth_date" type="date" value={formData.birth_date} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Dirección</label>
                  <input name="address" type="text" value={formData.address} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Contacto Emergencia</label>
                  <input name="emergency_contact_name" type="text" value={formData.emergency_contact_name} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Telf. Emergencia</label>
                  <input name="emergency_contact_phone" type="text" value={formData.emergency_contact_phone} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
                    Contraseña {editingUser && '(Dejar en blanco para conservar actual)'}
                  </label>
                  <input name="password" type="password" required={!editingUser} value={formData.password} onChange={handleFormChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <input name="is_active" type="checkbox" checked={formData.is_active} onChange={handleFormChange} id="is_active" />
                    <label htmlFor="is_active" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Colaborador Activo</label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={isSubmitting} style={{ background: 'var(--color-primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSubmitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  {editingUser 
                    ? 'Guardar Cambios' 
                    : modalMode === 'profesor'
                      ? 'Registrar Profesor'
                      : modalMode === 'alumno'
                        ? 'Confirmar Matrícula'
                        : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL para Ver Detalle (Vista Previa) */}
      {isDetailModalOpen && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(45, 55, 63, 0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Detalle de Colaborador</h3>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(45, 55, 63, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-primary)' }}>
                    {selectedUser.avatar_path ? (
                        <StorageImage fileKey={selectedUser.avatar_path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : selectedUser.first_name.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedUser.first_name} {selectedUser.last_name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 600 }}>{getRoleName(selectedUser.role_id)}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', background: 'rgba(45, 55, 63, 0.02)', padding: '1.5rem', borderRadius: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Email:</span>
                    <span style={{ fontSize: '0.85rem' }}>{selectedUser.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Identidad:</span>
                    <span style={{ fontSize: '0.85rem' }}>{selectedUser.id_type} {selectedUser.id_number}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Teléfono:</span>
                    <span style={{ fontSize: '0.85rem' }}>{selectedUser.phone || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Nacimiento:</span>
                    <span style={{ fontSize: '0.85rem' }}>{selectedUser.birth_date ? new Date(selectedUser.birth_date).toLocaleDateString() : '—'}</span>
                </div>
            </div>

            <button onClick={() => setIsDetailModalOpen(false)} style={{ width: '100%', marginTop: '2rem', padding: '0.8rem', borderRadius: '10px', border: '1px solid rgba(45, 55, 63, 0.1)', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
