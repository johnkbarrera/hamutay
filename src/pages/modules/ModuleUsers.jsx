import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Edit2, Trash2, Shield, Search, X, AlertCircle, RefreshCcw } from 'lucide-react';

export default function ModuleUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // Si es null => Crear, si tiene Data => Editar
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    document_type: 'DNI',
    document_number: '',
    role: 'support',
    phone: '',
    is_active: true
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const responseActive = await fetch('http://localhost:8000/platform/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataActive = await responseActive.json();
      if (!responseActive.ok) throw new Error(dataActive.detail || 'Error al descargar los usuarios activos');
      
      let allUsers = Array.isArray(dataActive) ? dataActive : (dataActive.items || []);

      if (showDeleted) {
        const responseDeleted = await fetch('http://localhost:8000/platform/users/deleted', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataDeleted = await responseDeleted.json();
        if (responseDeleted.ok) {
           const deletedArr = Array.isArray(dataDeleted) ? dataDeleted : (dataDeleted.items || []);
           allUsers = [...allUsers, ...deletedArr];
        }
      }
      
      setUsers(allUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [showDeleted]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      email: '', password: '', first_name: '', last_name: '',
      document_type: 'DNI', document_number: '', role: 'support', phone: '', is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      password: '', // Password is blank on edit unless they want to change it
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      document_type: user.document_type || 'DNI',
      document_number: user.document_number || '',
      role: user.role_obj?.name || user.role || 'support',
      phone: user.phone || '',
      is_active: user.is_active !== undefined ? user.is_active : true
    });
    setIsModalOpen(true);
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

    const token = localStorage.getItem('token');
    const endpoint = editingUser 
      ? `http://localhost:8000/platform/users/${editingUser.id}` 
      : 'http://localhost:8000/platform/users';
    const method = editingUser ? 'PATCH' : 'POST';

    // Para PATCH, omitir password si está en blanco. Para nuevo, sí enviarlo.
    const payload = { ...formData };
    if (editingUser && !payload.password) {
      delete payload.password;
    }
    // En el backend PATCH (según spec) no se debiera mandar el email si es primary, pero si se permite, ok.

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Error en la petición');
      
      setIsModalOpen(false);
      fetchUsers(); // Actualizar tabla
    } catch (err) {
      alert(err.message); // O mostrar en un toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar lógicamente este usuario?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/platform/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Error al eliminar');
      }
      
      alert('Se eliminó lógicamente con éxito.');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('¿Está seguro de restaurar (reactivar) a este usuario?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/platform/users/${id}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Error al restaurar');
      }
      
      alert('Usuario restaurado con éxito.');
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${u.first_name} ${u.last_name || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const doc = (u.document_number || '').toLowerCase();
    return fullName.includes(term) || email.includes(term) || doc.includes(term);
  });

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)' }}>
      {/* Cabecera del Módulo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={24} color="var(--color-primary)" /> Usuarios de Plataforma
          </h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Gestiona los accesos, roles y *soft deletes* administrativos.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            <input 
              type="checkbox" 
              checked={showDeleted} 
              onChange={(e) => setShowDeleted(e.target.checked)} 
              style={{ accentColor: 'var(--color-primary)' }}
            />
            {showDeleted ? 'Ocultar Eliminados' : 'Ver Eliminados'}
          </label>

          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar usuario o correo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.6rem 1rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none', width: '220px', fontSize: '0.9rem' }} 
            />
          </div>
          <button onClick={openCreateModal} className="btn" style={{ background: 'var(--color-tertiary)', color: 'white', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
            <Plus size={18} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {error && !isModalOpen && (
        <div style={{ display: 'flex', gap: '0.8rem', background: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <AlertCircle size={20} />
          <span><strong>Ocurrió un error:</strong> {error}</span>
        </div>
      )}

      {/* Tabla de Usuarios */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'var(--color-secondary)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="andean-table">
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Correo (Email)</th>
                <th>Documento</th>
                <th>Rol</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                // ELIMINACION LOGICA: is_active == false or deleted_at is not null
                const isDeleted = u.is_active === false || u.deleted_at;
                
                return (
                  <tr key={u.id} style={{ opacity: isDeleted ? 0.5 : 1, transition: 'opacity 0.2s', background: isDeleted ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                    <td style={{ fontWeight: '500', textDecoration: isDeleted ? 'line-through' : 'none' }}>
                      {u.first_name} {u.last_name || ''}
                    </td>
                    <td style={{ textDecoration: isDeleted ? 'line-through' : 'none' }}>{u.email}</td>
                    <td>{u.document_type} {u.document_number}</td>
                    <td>
                      <span style={{ background: 'rgba(224, 159, 57, 0.15)', color: 'var(--color-secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                        {(u.role_obj?.name || u.role || 'NA').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {isDeleted ? (
                        <span style={{ color: '#B91C1C', fontWeight: '500', fontSize: '0.85rem' }}>Eliminado</span>
                      ) : (
                        <span style={{ color: 'var(--color-tertiary)', fontWeight: '500', fontSize: '0.85rem' }}>Activo</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isDeleted ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleRestore(u.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-tertiary)', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 'bold' }} title="Restaurar Usuario">
                            <RefreshCcw size={16} /> Restaurar
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => openEditModal(u)} style={{ background: 'transparent', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', padding: '0.3rem' }} title="Editar">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(u.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.3rem' }} title="Eliminar (Logic)">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No se encontraron coincidencias.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL para Crear / Editar */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(45, 55, 63, 0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '600px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Correo Electrónico</label>
                <input name="email" type="email" required value={formData.email} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Nombres</label>
                <input name="first_name" type="text" required value={formData.first_name} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Apellidos</label>
                <input name="last_name" type="text" required value={formData.last_name} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Tipo de Doc</label>
                <select name="document_type" value={formData.document_type} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)' }}>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="PASSPORT">Pasaporte</option>
                  <option value="CDI">CDI</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Número de Doc</label>
                <input name="document_number" type="text" required value={formData.document_number} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Teléfono</label>
                <input name="phone" type="text" value={formData.phone} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Rol en Plataforma</label>
                <select name="role" value={formData.role} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)' }}>
                  <option value="superadmin">Superadmin</option>
                  <option value="support">Soporte</option>
                  <option value="sales">Ventas</option>
                  <option value="dev">Desarrollador</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>
                  Contraseña {editingUser && '(Dejar en blanco para no cambiar)'}
                </label>
                <input name="password" type="password" required={!editingUser} value={formData.password} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)' }} />
              </div>

              {editingUser && (
                 <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" id="isActive" name="is_active" checked={formData.is_active} onChange={handleFormChange} />
                    <label htmlFor="isActive" style={{ fontSize: '0.9rem' }}>Usuario Activo (Desmarcar para bloqueo rápido)</label>
                 </div>
              )}

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={isSubmitting} style={{ background: 'var(--color-primary)', color: 'white', padding: '0.7rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSubmitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
