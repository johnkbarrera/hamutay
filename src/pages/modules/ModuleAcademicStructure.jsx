import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Pencil, Trash2, BookOpen, GraduationCap, Library, Link2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const getToken = () => localStorage.getItem('token');
const isPlatform = () => localStorage.getItem('loginType') !== 'school';

const tabStyle = (active) => ({
  padding: '0.6rem 1.2rem', border: 'none', borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
  background: 'transparent', color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
  fontWeight: active ? '600' : '400', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s', fontFamily: 'inherit'
});

const btnPrimary = { background: 'var(--color-tertiary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600 };
const btnDanger = { background: 'transparent', border: 'none', padding: '0.3rem', borderRadius: '6px', color: 'var(--color-primary)', cursor: 'pointer' };
const btnEdit = { background: 'transparent', border: '1px solid rgba(0,0,0,0.1)', padding: '0.3rem', borderRadius: '6px', color: 'var(--color-text-muted)', cursor: 'pointer' };
const inputStyle = { width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid rgba(45, 55, 63, 0.2)', outline: 'none', fontFamily: 'inherit', fontSize: '0.95rem' };
const labelStyle = { display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(45, 55, 63, 0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalBox = { background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '460px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' };

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}`, ...opts.headers } });
  if (opts.method === 'DELETE' && res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error del servidor');
  return data;
}

// ─── Generic Table ───
function DataTable({ columns, data, onEdit, onDelete, canWrite }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="andean-table" style={{ fontSize: '0.9rem', width: '100%' }}>
        <thead><tr>{columns.map(c => <th key={c.header}>{c.header}</th>)}{canWrite && <th style={{ textAlign: 'right', width: '100px' }}>Acciones</th>}</tr></thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
              {columns.map(c => <td key={c.header}>{c.accessor(row)}</td>)}
              {canWrite && (
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <button onClick={() => onEdit(row)} style={btnEdit} title="Editar"><Pencil size={14} /></button>
                    <button onClick={() => onDelete(row)} style={btnDanger} title="Eliminar"><Trash2 size={14} /></button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={columns.length + (canWrite ? 1 : 0)} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Sin registros</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// ─── Modal Form ───
function FormModal({ title, open, onClose, onSubmit, submitting, children }) {
  if (!open) return null;
  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={modalBox} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 1.5rem', color: 'var(--color-text)' }}>{title}</h3>
        <form onSubmit={onSubmit}>
          {children}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={submitting} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function ModuleAcademicStructure() {
  const [tab, setTab] = useState('levels');
  const canWrite = isPlatform();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)' }}>
        <h2 style={{ margin: '0 0 0.3rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><BookOpen color="var(--color-primary)" /> Malla Curricular</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Administra la estructura académica global: niveles, grados, y catálogo de cursos.</p>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(45, 55, 63, 0.08)', padding: '0 1rem' }}>
          <button onClick={() => setTab('levels')} style={tabStyle(tab === 'levels')}>Niveles</button>
          <button onClick={() => setTab('grades')} style={tabStyle(tab === 'grades')}>Grados</button>
          <button onClick={() => setTab('courses')} style={tabStyle(tab === 'courses')}>Catálogo de Cursos</button>
          <button onClick={() => setTab('grade-courses')} style={tabStyle(tab === 'grade-courses')}>Cursos por Grado</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {tab === 'levels' && <TabLevels canWrite={canWrite} />}
          {tab === 'grades' && <TabGrades canWrite={canWrite} />}
          {tab === 'courses' && <TabCourses canWrite={canWrite} />}
          {tab === 'grade-courses' && <TabGradeCourses canWrite={canWrite} />}
        </div>
      </div>
    </div>
  );
}

// ═══ TAB: NIVELES ═══
function TabLevels({ canWrite }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', order: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetch_ = async () => { setLoading(true); try { const d = await apiFetch(`${API}/academic/levels`); setData(Array.isArray(d) ? d : []); } catch(e){} finally { setLoading(false); } };
  useEffect(() => { fetch_(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', order: '' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ name: row.name, order: row.order ?? '' }); setModal(true); };
  const handleDelete = async (row) => { if (!confirm(`¿Eliminar nivel "${row.name}"?`)) return; try { await apiFetch(`${API}/platform/academic/levels/${row.level_id}`, { method: 'DELETE' }); fetch_(); } catch(e) { alert(e.message); } };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const body = { name: form.name, order: form.order ? Number(form.order) : null };
      if (editing) { await apiFetch(`${API}/platform/academic/levels/${editing.level_id}`, { method: 'PUT', body: JSON.stringify(body) }); }
      else { await apiFetch(`${API}/platform/academic/levels`, { method: 'POST', body: JSON.stringify(body) }); }
      setModal(false); fetch_();
    } catch(e) { alert(e.message); } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} /></div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Niveles educativos: Inicial, Primaria, Secundaria, etc.</p>
        {canWrite && <button onClick={openCreate} style={btnPrimary}><Plus size={14} /> Nuevo Nivel</button>}
      </div>
      <DataTable columns={[
        { header: 'Nombre', accessor: r => r.name },
        { header: 'Orden', accessor: r => r.order ?? '—' },
      ]} data={data} onEdit={openEdit} onDelete={handleDelete} canWrite={canWrite} />

      <FormModal title={editing ? 'Editar Nivel' : 'Nuevo Nivel'} open={modal} onClose={() => setModal(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Nombre</label>
          <input required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Primaria" />
        </div>
        <div>
          <label style={labelStyle}>Orden</label>
          <input type="number" style={inputStyle} value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} placeholder="Ej: 1" />
        </div>
      </FormModal>
    </>
  );
}

// ═══ TAB: GRADOS ═══
function TabGrades({ canWrite }) {
  const [data, setData] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ level_id: '', name: '', order: '' });
  const [submitting, setSubmitting] = useState(false);
  const [filterLevel, setFilterLevel] = useState('');

  const fetch_ = async () => {
    setLoading(true);
    try {
      const [g, l] = await Promise.all([apiFetch(`${API}/academic/grades`), apiFetch(`${API}/academic/levels`)]);
      setData(Array.isArray(g) ? g : []);
      setLevels(Array.isArray(l) ? l : []);
    } catch(e){} finally { setLoading(false); }
  };
  useEffect(() => { fetch_(); }, []);

  const levelName = (id) => levels.find(l => l.level_id === id)?.name || id;
  const filtered = filterLevel ? data.filter(g => g.level_id === filterLevel) : data;

  const openCreate = () => { setEditing(null); setForm({ level_id: levels[0]?.level_id || '', name: '', order: '' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ level_id: row.level_id, name: row.name, order: row.order ?? '' }); setModal(true); };
  const handleDelete = async (row) => { if (!confirm(`¿Eliminar grado "${row.name}"?`)) return; try { await apiFetch(`${API}/platform/academic/grades/${row.grade_id}`, { method: 'DELETE' }); fetch_(); } catch(e) { alert(e.message); } };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const body = { level_id: form.level_id, name: form.name, order: form.order ? Number(form.order) : null };
      if (editing) { await apiFetch(`${API}/platform/academic/grades/${editing.grade_id}`, { method: 'PUT', body: JSON.stringify(body) }); }
      else { await apiFetch(`${API}/platform/academic/grades`, { method: 'POST', body: JSON.stringify(body) }); }
      setModal(false); fetch_();
    } catch(e) { alert(e.message); } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} /></div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Grados dentro de cada nivel.</p>
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}>
            <option value="">Todos los niveles</option>
            {levels.map(l => <option key={l.level_id} value={l.level_id}>{l.name}</option>)}
          </select>
        </div>
        {canWrite && <button onClick={openCreate} style={btnPrimary}><Plus size={14} /> Nuevo Grado</button>}
      </div>
      <DataTable columns={[
        { header: 'Grado', accessor: r => r.name },
        { header: 'Nivel', accessor: r => levelName(r.level_id) },
        { header: 'Orden', accessor: r => r.order ?? '—' },
      ]} data={filtered} onEdit={openEdit} onDelete={handleDelete} canWrite={canWrite} />

      <FormModal title={editing ? 'Editar Grado' : 'Nuevo Grado'} open={modal} onClose={() => setModal(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Nivel</label>
          <select required style={inputStyle} value={form.level_id} onChange={e => setForm({ ...form, level_id: e.target.value })}>
            <option value="" disabled>Seleccionar nivel</option>
            {levels.map(l => <option key={l.level_id} value={l.level_id}>{l.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Nombre del Grado</label>
          <input required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: 1er Grado" />
        </div>
        <div>
          <label style={labelStyle}>Orden</label>
          <input type="number" style={inputStyle} value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} placeholder="Ej: 1" />
        </div>
      </FormModal>
    </>
  );
}

// ═══ TAB: CATÁLOGO DE CURSOS ═══
function TabCourses({ canWrite }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: '', name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetch_ = async () => { setLoading(true); try { const d = await apiFetch(`${API}/academic/courses`); setData(Array.isArray(d) ? d : []); } catch(e){} finally { setLoading(false); } };
  useEffect(() => { fetch_(); }, []);

  const filtered = search ? data.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())) : data;

  const openCreate = () => { setEditing(null); setForm({ code: '', name: '' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ code: row.code, name: row.name }); setModal(true); };
  const handleDelete = async (row) => { if (!confirm(`¿Eliminar curso "${row.name}"?`)) return; try { await apiFetch(`${API}/platform/academic/courses/${row.course_id}`, { method: 'DELETE' }); fetch_(); } catch(e) { alert(e.message); } };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const body = { code: form.code, name: form.name };
      if (editing) { await apiFetch(`${API}/platform/academic/courses/${editing.course_id}`, { method: 'PUT', body: JSON.stringify(body) }); }
      else { await apiFetch(`${API}/platform/academic/courses`, { method: 'POST', body: JSON.stringify(body) }); }
      setModal(false); fetch_();
    } catch(e) { alert(e.message); } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} /></div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar curso..." style={{ ...inputStyle, width: '240px', padding: '0.5rem 0.8rem', fontSize: '0.85rem' }} />
        {canWrite && <button onClick={openCreate} style={btnPrimary}><Plus size={14} /> Nuevo Curso</button>}
      </div>
      <DataTable columns={[
        { header: 'Código', accessor: r => <span style={{ fontFamily: 'monospace', background: 'rgba(45,55,63,0.05)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>{r.code}</span> },
        { header: 'Nombre', accessor: r => r.name },
      ]} data={filtered} onEdit={openEdit} onDelete={handleDelete} canWrite={canWrite} />

      <FormModal title={editing ? 'Editar Curso' : 'Nuevo Curso'} open={modal} onClose={() => setModal(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Código</label>
          <input required style={inputStyle} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Ej: MAT" />
        </div>
        <div>
          <label style={labelStyle}>Nombre</label>
          <input required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Matemáticas" />
        </div>
      </FormModal>
    </>
  );
}

// ═══ TAB: CURSOS POR GRADO ═══
function TabGradeCourses({ canWrite }) {
  const [data, setData] = useState([]);
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ grade_id: '', course_id: '', name: '', weekly_hours: '' });
  const [submitting, setSubmitting] = useState(false);
  const [filterGrade, setFilterGrade] = useState('');

  const fetch_ = async () => {
    setLoading(true);
    try {
      const [gc, g, c] = await Promise.all([
        apiFetch(`${API}/academic/grade-courses`),
        apiFetch(`${API}/academic/grades`),
        apiFetch(`${API}/academic/courses`),
      ]);
      setData(Array.isArray(gc) ? gc : []);
      setGrades(Array.isArray(g) ? g : []);
      setCourses(Array.isArray(c) ? c : []);
    } catch(e){} finally { setLoading(false); }
  };
  useEffect(() => { fetch_(); }, []);

  const gradeName = (id) => grades.find(g => g.grade_id === id)?.name || id;
  const courseName = (id) => courses.find(c => c.course_id === id)?.name || id;
  const filtered = filterGrade ? data.filter(gc => gc.grade_id === filterGrade) : data;

  const openCreate = () => { setEditing(null); setForm({ grade_id: grades[0]?.grade_id || '', course_id: courses[0]?.course_id || '', name: '', weekly_hours: '' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ grade_id: row.grade_id, course_id: row.course_id, name: row.name, weekly_hours: row.weekly_hours ?? '' }); setModal(true); };
  const handleDelete = async (row) => { if (!confirm(`¿Eliminar asignación "${row.name}"?`)) return; try { await apiFetch(`${API}/platform/academic/grade-courses/${row.grade_course_id}`, { method: 'DELETE' }); fetch_(); } catch(e) { alert(e.message); } };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const body = { grade_id: form.grade_id, course_id: form.course_id, name: form.name, weekly_hours: form.weekly_hours ? Number(form.weekly_hours) : null };
      if (editing) { await apiFetch(`${API}/platform/academic/grade-courses/${editing.grade_course_id}`, { method: 'PUT', body: JSON.stringify({ name: body.name, weekly_hours: body.weekly_hours }) }); }
      else { await apiFetch(`${API}/platform/academic/grade-courses`, { method: 'POST', body: JSON.stringify(body) }); }
      setModal(false); fetch_();
    } catch(e) { alert(e.message); } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} /></div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Asignación de cursos a grados específicos.</p>
          <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}>
            <option value="">Todos los grados</option>
            {grades.map(g => <option key={g.grade_id} value={g.grade_id}>{g.name}</option>)}
          </select>
        </div>
        {canWrite && <button onClick={openCreate} style={btnPrimary}><Plus size={14} /> Asignar Curso</button>}
      </div>
      <DataTable columns={[
        { header: 'Nombre', accessor: r => r.name },
        { header: 'Grado', accessor: r => gradeName(r.grade_id) },
        { header: 'Curso Base', accessor: r => courseName(r.course_id) },
        { header: 'Hrs/Semana', accessor: r => r.weekly_hours ?? '—' },
      ]} data={filtered} onEdit={openEdit} onDelete={handleDelete} canWrite={canWrite} />

      <FormModal title={editing ? 'Editar Asignación' : 'Asignar Curso a Grado'} open={modal} onClose={() => setModal(false)} onSubmit={handleSubmit} submitting={submitting}>
        {!editing && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Grado</label>
              <select required style={inputStyle} value={form.grade_id} onChange={e => setForm({ ...form, grade_id: e.target.value })}>
                <option value="" disabled>Seleccionar grado</option>
                {grades.map(g => <option key={g.grade_id} value={g.grade_id}>{g.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Curso del Catálogo</label>
              <select required style={inputStyle} value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })}>
                <option value="" disabled>Seleccionar curso</option>
                {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.code} — {c.name}</option>)}
              </select>
            </div>
          </>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Nombre de la materia en este grado</label>
          <input required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Matemáticas 1er Grado" />
        </div>
        <div>
          <label style={labelStyle}>Horas por semana</label>
          <input type="number" style={inputStyle} value={form.weekly_hours} onChange={e => setForm({ ...form, weekly_hours: e.target.value })} placeholder="Ej: 5" />
        </div>
      </FormModal>
    </>
  );
}
