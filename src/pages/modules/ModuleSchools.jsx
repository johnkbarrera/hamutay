import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Edit2, Trash2, Building2, Search, X, AlertCircle, RefreshCcw, LayoutGrid, AlertTriangle, UploadCloud, Eye } from 'lucide-react';
import StorageImage from '../../components/StorageImage';

export default function ModuleSchools() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' o 'deleted'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null); 
  
  // Form State - Basado fielmente en el Endpoint de POST /platform/schools
  const [formData, setFormData] = useState({
    name: '', slug: '', email: '', phone: '', country: 'PE', region: 'Lima',
    province: 'Lima', district: '', address: '', institution_code: '',
    institution_type: 'private', founding_year: new Date().getFullYear(),
    modality: 'presencial', language: 'es', timezone: 'America/Lima', plan_code: 'free'
  });
  
  // Storage (R2 / S3) state
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Generador inteligente de Slugs (e.g. "Mi Colegio 123" -> "mi-colegio-123")
  const generateSlug = (nameStr) => {
    return nameStr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (!editingSchool) {
      setFormData(prev => ({ ...prev, name: val, slug: generateSlug(val) }));
    } else {
      setFormData(prev => ({ ...prev, name: val }));
    }
  };

  const fetchSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const endpoint = activeTab === 'active' 
        ? `${import.meta.env.VITE_API_URL}/platform/schools` 
        : `${import.meta.env.VITE_API_URL}/platform/schools/deleted`;

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail || 'Error al descargar el catálogo educacional');
      
      setSchools(Array.isArray(data) ? data : (data.items || []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [activeTab]);

  const openCreateModal = () => {
    setEditingSchool(null);
    setFormData({
      name: '', slug: '', email: '', phone: '', country: 'PE', region: 'Lima',
      province: 'Lima', district: '', address: '', institution_code: '',
      institution_type: 'private', founding_year: new Date().getFullYear(),
      modality: 'presencial', language: 'es', timezone: 'America/Lima', plan_code: 'free'
    });
    setSelectedLogo(null);
    setLogoPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name || '', slug: school.slug || '', email: school.email || '', phone: school.phone || '', 
      country: school.country || 'PE', region: school.region || 'Lima', province: school.province || 'Lima', 
      district: school.district || '', address: school.address || '', institution_code: school.institution_code || '',
      institution_type: school.institution_type || 'private', founding_year: school.founding_year || new Date().getFullYear(),
      modality: school.modality || 'presencial', language: school.language || 'es', 
      timezone: school.timezone || 'America/Lima', plan_code: school.plan_code || 'free'
    });
    setSelectedLogo(null);
    setLogoPreview(school.logo_url || null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type && !file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
      }
      setSelectedLogo(file);
      const tempUrl = URL.createObjectURL(file);
      setLogoPreview(tempUrl);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Lógica Maestra de Carga asíncrona hacia R2 usando Presigned URLs Privados
  const uploadLogoToCloud = async (schoolId, file, token) => {
    let upload_url, file_key;
    
    // 1. Obtener boleto de Subida y Key interna
    try {
      const preRes = await fetch(`${import.meta.env.VITE_API_URL}/platform/storage/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ entity: 'school', entity_id: schoolId, filename: file.name, content_type: file.type || 'image/jpeg' })
      });
      const data = await preRes.json();
      if (!preRes.ok) throw new Error(data.detail || 'Firma rechazada');
      upload_url = data.upload_url;
      file_key = data.key;
    } catch(e) {
      throw new Error('Fallo al obtener Presigned URL del Backend: ' + e.message);
    }

    // 2. Transferencia Binaria Directa
    try {
      const uploadRes = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file
      });
      if (!uploadRes.ok) throw new Error('Cloudflare rechazó la subida (403).');
    } catch(e) {
      throw new Error('CORS Falló: Revisa la configuración CORS en tu Cloudflare R2: ' + e.message);
    }

    // 3. Confirmación ligando el KEY a la DB
    try {
      const confirmRes = await fetch(`${import.meta.env.VITE_API_URL}/platform/storage/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ entity: 'school', entity_id: schoolId, key: file_key })
      });
      if (!confirmRes.ok) throw new Error('El backend no enlazó la Key.');
    } catch(e) {
       throw new Error('Fallo en la confirmación a Base de Datos: ' + e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem('token');
    const endpoint = editingSchool 
      ? `${import.meta.env.VITE_API_URL}/platform/schools/${editingSchool.id}` 
      : `${import.meta.env.VITE_API_URL}/platform/schools`;
    const method = editingSchool ? 'PATCH' : 'POST';

    try {
      let finalPayload = { ...formData };
      finalPayload.founding_year = parseInt(finalPayload.founding_year) || 1990;

      // Despliegue del texto al DB
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(finalPayload)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail ? JSON.stringify(data.detail) : 'Fallo de registro crudo al servidor.');
      }
      
      // Capturamos el ID asegurado que nos responde FastAPI, o usamos el existente
      const securedSchoolId = editingSchool ? editingSchool.id : data.id;

      // Si el equipo subió un nuevo binario, enlazamos el uploadLogoToCloud pasándole el id seguro
      if (selectedLogo && securedSchoolId) {
        await uploadLogoToCloud(securedSchoolId, selectedLogo, token);
      }
      
      setIsModalOpen(false);
      fetchSchools();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas suspender este Colegio moviéndolo a la papelera (Soft Delete)?')) return;
    try {
       const token = localStorage.getItem('token');
       const response = await fetch(`${import.meta.env.VITE_API_URL}/platform/schools/${id}`, {
         method: 'DELETE',
         headers: { 'Authorization': `Bearer ${token}` }
       });
       if (!response.ok) throw new Error('Imposible suspender al colegio en este momento.');
       fetchSchools();
    } catch (err) { alert(err.message); }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('¿Estás seguro de reactivar este colegio para reconectarlo al sistema?')) return;
    try {
       const token = localStorage.getItem('token');
       const response = await fetch(`${import.meta.env.VITE_API_URL}/platform/schools/${id}/restore`, {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${token}` }
       });
       if (!response.ok) throw new Error('Fallo crítico re-activando la infraestructura.');
       fetchSchools();
    } catch (err) { alert(err.message); }
  };

  const filteredSchools = schools.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (s.name || '').toLowerCase().includes(term) || (s.slug || '').toLowerCase().includes(term) || (s.email || '').toLowerCase().includes(term);
  });

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)', overflow: 'hidden' }}>
      
      {/* Upper Toolbar */}
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(45, 55, 63, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={20} color="var(--color-primary)" /> Infraestructura Escolar
        </h2>
        <button onClick={openCreateModal} className="btn" style={{ background: 'var(--color-tertiary)', color: 'white', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}>
          <Plus size={16} /> Incorporar Colegio
        </button>
      </div>

      {/* Tabs and Search Context */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'rgba(248, 244, 238, 0.5)', borderBottom: '1px solid rgba(45, 55, 63, 0.05)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(45, 55, 63, 0.05)', padding: '0.3rem', borderRadius: '8px' }}>
          <button 
            onClick={() => setActiveTab('active')}
            style={{ 
              padding: '0.4rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: activeTab === 'active' ? 600 : 400,
              background: activeTab === 'active' ? 'white' : 'transparent', color: activeTab === 'active' ? 'var(--color-text)' : 'var(--color-text-muted)',
              boxShadow: activeTab === 'active' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s'
            }}
          >
            <LayoutGrid size={16} /> Operando
          </button>
          <button 
            onClick={() => setActiveTab('deleted')}
            style={{ 
              padding: '0.4rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: activeTab === 'deleted' ? 600 : 400,
              background: activeTab === 'deleted' ? 'white' : 'transparent', color: activeTab === 'deleted' ? '#B91C1C' : 'var(--color-text-muted)',
              boxShadow: activeTab === 'deleted' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s'
            }}
          >
            <AlertTriangle size={16} /> Suspendidos
          </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '0.5rem 1rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.1)', outline: 'none', width: '220px', fontSize: '0.85rem' }} 
          />
        </div>
      </div>

      {error && !isModalOpen && (
        <div style={{ margin: '1rem 2rem', background: '#FEE2E2', color: '#B91C1C', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Tabla de Resultados */}
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
                  <th style={{ background: 'transparent' }}>Institución</th>
                  <th style={{ background: 'transparent' }}>Contacto Comercial</th>
                  <th style={{ background: 'transparent' }}>Contrato (Plan)</th>
                  <th style={{ background: 'transparent' }}>Modalidad</th>
                  <th style={{ textAlign: 'right', background: 'transparent' }}>Gestión</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.map(sch => (
                  <tr key={sch.id} style={{ opacity: activeTab === 'deleted' ? 0.5 : 1, transition: 'background 0.2s', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                         <StorageImage 
                            fileKey={sch.logo_url} 
                            fallbackName={sch.name} 
                            alt="logo" 
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }} 
                         />
                         <div>
                            <div style={{ fontWeight: '600', color: 'var(--color-text)', marginBottom: '0.2rem', textDecoration: activeTab === 'deleted' ? 'line-through' : 'none' }}>
                              {sch.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{sch.slug} | {sch.district || 'NA'}</div>
                         </div>
                      </div>
                    </td>
                    <td>
                      <div>{sch.email}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{sch.phone || '-'}</div>
                    </td>
                    <td>
                      <span style={{ background: 'rgba(224, 159, 57, 0.1)', color: 'var(--color-secondary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                        {(sch.plan_code || 'FREE').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--color-text-muted)' }}>
                      {sch.modality}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {activeTab === 'deleted' ? (
                        <button onClick={() => handleRestore(sch.id)} style={{ background: 'rgba(105, 151, 126, 0.1)', border: 'none', color: 'var(--color-tertiary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600' }} title="Reconectar">
                          <RefreshCcw size={14} /> Restaurar
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                         {/* Ojo: La doc dice que Support no puede editar todo, aquí mostramos el full modal a manera general, el backend se encarga de rebotar 403 si el rol no alcanza */}
                          <button onClick={() => navigate(`/dashboard/schools/${sch.id}`)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Ver Dashboard de Colegio">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => openEditModal(sch)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Modificar Contrato">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(sch.id)} style={{ background: 'rgba(211, 73, 55, 0.05)', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }} title="Suspender Institución">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredSchools.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    No hay colegios {activeTab === 'deleted' ? 'suspendidos/cancelados' : 'actualmente registrados'}.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL GIGANTE DE COLEGIO */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(45, 55, 63, 0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '95%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building2 size={24} color="var(--color-secondary)"/> {editingSchool ? 'Modificar Institución' : 'Onboarding Institucional'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
              
              {/* COLUMNA 1: Datos Base y Archivo Logo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 
                 <fieldset style={{ border: '1px dashed rgba(105, 151, 126, 0.5)', borderRadius: '12px', padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(105, 151, 126, 0.02)' }}>
                     <legend style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-tertiary)' }}>Isotipo Emblema (S3 / R2 Logo)</legend>
                     <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                     
                     <div 
                        onClick={() => fileInputRef.current.click()} 
                        style={{ width: '80px', height: '80px', borderRadius: '50%', background: logoPreview ? 'white' : 'rgba(45, 55, 63, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '0.5rem', transition: 'all 0.2s' }}
                        title="Haz clic para subir un logo"
                     >
                       {logoPreview ? (
                          <StorageImage fileKey={logoPreview} fallbackName={formData.name} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       ) : (
                          <UploadCloud size={28} color="var(--color-text-muted)" />
                       )}
                     </div>
                     <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                       {selectedLogo ? selectedLogo.name : 'Haz clic para explorar fototeca.'}
                     </span>
                 </fieldset>

                 <fieldset style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1rem', flex: 1 }}>
                     <legend style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-secondary)' }}>Identidad de Marca</legend>
                     <div>
                       <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Razón Social / Nombre Comercial *</label>
                       <input name="name" type="text" required value={formData.name} onChange={handleNameChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none', marginBottom: '0.8rem' }} />
                     </div>
                     <div>
                       <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Dominio Inteligente (Slug) *</label>
                       <input name="slug" type="text" readOnly={!!editingSchool} required value={formData.slug} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} title="Generado automáticamente, invariable en edición." />
                     </div>
                 </fieldset>

                 <fieldset style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1rem', flex: 1 }}>
                     <legend style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-secondary)' }}>Contacto Autorizado</legend>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Coreo Administrativo *</label>
                          <input name="email" type="email" required value={formData.email} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Teléfono Financiero</label>
                          <input name="phone" type="text" value={formData.phone} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                        </div>
                     </div>
                 </fieldset>
                 
                 <fieldset style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1rem', flex: 1 }}>
                     <legend style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-secondary)' }}>Ficha Operacional</legend>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Tipo de Institución</label>
                          <select name="institution_type" value={formData.institution_type} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }}>
                            <option value="private">Privado Independiente</option>
                            <option value="public">Público Estatal</option>
                            <option value="international">Organización Internacional</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Modalidad Educativa</label>
                          <select name="modality" value={formData.modality} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }}>
                            <option value="presencial">Presencial Física</option>
                            <option value="semipresencial">Híbrido (Blended)</option>
                            <option value="virtual">100% Remoto (Virtual)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Año de Fundación</label>
                          <input name="founding_year" type="number" min="1800" max="2100" value={formData.founding_year} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Código SIE / Modular</label>
                          <input name="institution_code" type="text" value={formData.institution_code} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                        </div>
                     </div>
                 </fieldset>
              </div>

              {/* COLUMNA 2: Geografía y SaaS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <fieldset style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1rem', flex: 1 }}>
                     <legend style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-secondary)' }}>Ubicación Geográfica</legend>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>País Origen</label>
                          <input name="country" type="text" value={formData.country} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Región / Estado</label>
                          <input name="region" type="text" value={formData.region} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Provincia / Ciudad</label>
                          <input name="province" type="text" value={formData.province} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Distrito / Localidad</label>
                          <input name="district" type="text" value={formData.district} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                        </div>
                     </div>
                     <div>
                       <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Dirección Legal Física</label>
                       <input name="address" type="text" value={formData.address} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }} />
                     </div>
                 </fieldset>

                 <fieldset style={{ border: '1px solid rgba(224, 159, 57, 0.3)', borderRadius: '12px', padding: '1rem', flex: 1, background: 'rgba(224, 159, 57, 0.02)' }}>
                     <legend style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-tertiary)' }}>Ecosistema Hamutay SaaS</legend>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Suscripción Contratada *</label>
                          <select name="plan_code" value={formData.plan_code} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(224, 159, 57, 0.4)', background: 'white', outline: 'none', fontWeight: 600 }}>
                            <option value="free">Beca Hamutay Libre (Free)</option>
                            <option value="basic">Plan Básico Inicial</option>
                            <option value="pro">Plan Profesional Avanzado</option>
                            <option value="enterprise">Multi-Sede Enterprise</option>
                          </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Idioma Central</label>
                            <select name="language" value={formData.language} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }}>
                              <option value="es">Español Andino</option>
                              <option value="en">Inglés (Global)</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>Zona Horaria API</label>
                            <select name="timezone" value={formData.timezone} onChange={handleFormChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none' }}>
                              <option value="America/Lima">PERÚ (America/Lima)</option>
                              <option value="America/Bogota">COL (America/Bogota)</option>
                              <option value="America/Santiago">CHI (America/Santiago)</option>
                            </select>
                          </div>
                        </div>
                     </div>
                 </fieldset>
              </div>

              {/* Botoneria inferior */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontWeight: 600, cursor: 'pointer' }}>Cancelar Despliegue</button>
                <button type="submit" disabled={isSubmitting} style={{ background: 'var(--color-primary)', color: 'white', padding: '0.7rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isSubmitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  {editingSchool ? 'Actualizar Servidores' : 'Firmar Infraestructura Escolar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
