import React, { useState, useEffect } from 'react';
import { Loader2, ShieldAlert, Plus, ShieldCheck, CheckSquare, Square, Trash2 } from 'lucide-react';

const getResourceLabel = (slug) => {
  const labels = {
    'users': 'Usuarios y Staff',
    'students': 'Gestión de Alumnos',
    'schools': 'Configuración de Colegio',
    'academic_levels': 'Estructura: Niveles',
    'academic_grades': 'Estructura: Grados',
    'academic_courses': 'Catálogo de Cursos',
    'academic_grade_courses': 'Cursos por Grado',
    'academic_plans': 'Planes Académicos',
    'academic_terms': 'Períodos (Bimestres/Trimestres)',
    'academic_plan_courses': 'Cursos en Plan de Estudios',
    'billing': 'Pagos y Pensiones',
    'settings': 'Ajustes del Sistema'
  };
  return labels[slug] || slug.replace(/_/g, ' ').toUpperCase();
};

export default function ModuleSchoolRoles() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const [permissions, setPermissions] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [permsLoading, setPermsLoading] = useState(false);

  // Modal de Rol
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', category: 'administrativo' });
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchPermissions(selectedRole.id);
    } else {
      setPermissions([]);
    }
  }, [selectedRole]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/platform/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : (data.items || []));
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (roleId) => {
    try {
      setPermsLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/platform/roles/${roleId}/permissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPermissions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setPermsLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      setRoleSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/platform/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newRole)
      });
      if(!res.ok) throw new Error('Fallo al crear rol');
      setIsRoleModalOpen(false);
      setNewRole({ name: '', category: 'administrativo' });
      fetchRoles();
    } catch (err) {
      alert(err.message);
    } finally {
      setRoleSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if(!window.confirm('¿Seguro de desvincular este Rol? Los administradores con este rol perderán acceso.')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/platform/roles/${roleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(selectedRole?.id === roleId) setSelectedRole(null);
      fetchRoles();
    } catch (err) {}
  };

  const togglePermission = async (resource, action) => {
    if (!selectedRole) return;
    const existingPerm = permissions.find(p => p.resource === resource && p.action === action);
    const token = localStorage.getItem('token');

    try {
      if (!existingPerm) return;

      const permId = existingPerm.id || existingPerm.permission_id;
      await fetch(`${import.meta.env.VITE_API_URL}/platform/roles/${selectedRole.id}/permissions/${permId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_allowed: !existingPerm.is_allowed })
      });
      
      // Update local state for immediate feedback
      setPermissions(prev => prev.map(p => {
        const currentId = p.id || p.permission_id;
        if (permId && currentId === permId) {
          return { ...p, is_allowed: !p.is_allowed };
        }
        return p;
      }));
    } catch(err) {
      console.error("Fallo actualizando permisos: ", err);
      fetchPermissions(selectedRole.id); // Rollback on error
    }
  };

  const hasPermission = (resource, action) => {
    return permissions.some(p => p.resource === resource && p.action === action && p.is_allowed);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: '100%' }}>
      
      {/* Selector Cabecera */}
      <div style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><ShieldAlert color="var(--color-primary)"/> Auditoría Global de Plantillas</h2>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Modifica los accesos agnósticos del sistema. Se replicará automáticamente en los inquilinos.</p>
        </div>
      </div>

      {loading && !selectedRole && (
        <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} /></div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedRole ? '1fr 1fr' : '1fr', gap: '1.5rem', transition: 'all 0.3s' }}>
          
          {/* Columna Izquierda: Grilla de Roles */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', background: 'rgba(45, 55, 63, 0.02)', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text)' }}>Jerarquías Disponibles</h3>
              <button onClick={() => setIsRoleModalOpen(true)} style={{ background: 'var(--color-tertiary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600 }}>
                <Plus size={14}/> Nuevo Rol
              </button>
            </div>
            
            <div style={{ overflowX: 'auto', padding: '0.5rem' }}>
              <table className="andean-table" style={{ fontSize: '0.9rem', width: '100%' }}>
                <thead>
                  <tr>
                    <th>Nombre de Posición</th>
                    <th>Categoría</th>
                    <th style={{ textAlign: 'right' }}>Administración</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map(r => (
                    <tr 
                      key={r.id} 
                      onClick={() => setSelectedRole(r)}
                      style={{ cursor: 'pointer', background: selectedRole?.id === r.id ? 'rgba(105, 151, 126, 0.05)' : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.03)' }}
                    >
                      <td><div style={{ fontWeight: 600, color: selectedRole?.id === r.id ? 'var(--color-primary)' : 'var(--color-text)' }}>{r.name}</div></td>
                      <td style={{ textTransform: 'capitalize' }}>{r.category || 'General'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedRole(r); }} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', color: 'var(--color-text-muted)' }} title="Configurar Acceso"><ShieldCheck size={14}/></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteRole(r.id); }} style={{ background: 'transparent', border: 'none', padding: '0.4rem', borderRadius: '6px', color: 'var(--color-primary)', cursor: 'pointer' }}><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {roles.length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No existen roles aún. Crea el rol "Director" para empezar.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Columna Derecha: Panel de Permisos (Dinámico) */}
          {selectedRole && (
            <div style={{ background: 'white', borderRadius: '16px', border: '2px solid rgba(224, 159, 57, 0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1.2rem 1.5rem', background: 'rgba(224, 159, 57, 0.04)', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-secondary)' }}>Fijar Permisos</h3>
                   <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Configurando el perfil: <strong>{selectedRole.name}</strong></span>
                 </div>
                 {permsLoading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-secondary)' }}/>}
              </div>

              <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                 <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 1.5rem 0' }}>
                   Los permisos delimitan a qué componentes del sistema puede accceder este rol para un colegio determinado. Todo aquello que no está tildado, será denegado implícitamente `(HTTP 403)`.
                 </p>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {[...new Set(permissions.map(p => p.resource))]
                      .sort((a, b) => getResourceLabel(a).localeCompare(getResourceLabel(b)))
                      .map(resId => (
                      <div key={resId} style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                           {getResourceLabel(resId)} 
                           <span style={{ fontSize: '0.7rem', background: '#F3F4F6', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #E5E7EB', color: '#6B7280' }}>{resId}</span>
                        </h4>
                        
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {['create', 'read', 'update', 'delete'].map(act => {
                             const permObj = permissions.find(p => p.resource === resId && p.action === act);
                             if (!permObj) return null;
                             const checked = permObj.is_allowed;
                             return (
                               <label key={act} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', userSelect: 'none', background: checked ? 'rgba(105, 151, 126, 0.08)' : 'transparent', padding: '0.3rem 0.6rem', borderRadius: '6px', border: checked ? '1px solid rgba(105, 151, 126, 0.3)' : '1px solid transparent', transition: 'all 0.1s' }}>
                                 {checked ? <CheckSquare size={16} color="var(--color-tertiary)"/> : <Square size={16} color="var(--color-text-muted)"/>}
                                 {act === 'create' ? 'Crear' : act === 'read' ? 'Ver' : act === 'update' ? 'Editar' : 'Borrar'}
                                 {/* Checkbox oscuro/real por debajo */}
                                 <input type="checkbox" checked={checked} onChange={() => togglePermission(resId, act)} style={{ display: 'none' }} />
                               </label>
                             );
                          })}
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Crear Rol */}
      {isRoleModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(45, 55, 63, 0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
             <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text)' }}>Definir Nuevo Rol</h3>
             <form onSubmit={handleCreateRole}>
               <div style={{ marginBottom: '1rem' }}>
                 <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Denominación del Puesto</label>
                 <input autoFocus required type="text" value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value})} placeholder="Ej: Administrador TI" style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
               </div>
               <div style={{ marginBottom: '1.5rem' }}>
                 <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>Categoría / Agrupador</label>
                 <select value={newRole.category} onChange={e => setNewRole({...newRole, category: e.target.value})} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }}>
                   <option value="administrativo">Personal Administrativo</option>
                   <option value="docente">Docente Universitario</option>
                   <option value="legal">Representante Legal</option>
                 </select>
               </div>
               <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                 <button type="button" onClick={() => setIsRoleModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                 <button type="submit" disabled={roleSubmitting} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                   {roleSubmitting ? <Loader2 size={16} /> : 'Guardar y Cerrar'}
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
