import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Pencil, Trash2, CalendarDays, ClipboardList, Link2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const getToken = () => localStorage.getItem('token');
const isPlatform = () => localStorage.getItem('loginType') !== 'school';

const tabStyle = (active) => ({
  padding: '0.6rem 1.2rem', border: 'none', borderBottom: active ? '2px solid var(--color-secondary)' : '2px solid transparent',
  background: 'transparent', color: active ? 'var(--color-secondary)' : 'var(--color-text-muted)',
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

function DataTable({ columns, data, onEdit, onDelete, canWrite, hideEdit }) {
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
                    {!hideEdit && <button onClick={() => onEdit(row)} style={btnEdit} title="Editar"><Pencil size={14} /></button>}
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
            <button type="submit" disabled={submitting} style={{ background: 'var(--color-secondary)', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const DURATION_TYPES = [
  { value: 'annual', label: 'Anual' },
  { value: 'semester', label: 'Semestral' },
  { value: 'summer', label: 'Verano' },
  { value: 'winter', label: 'Invierno' },
];
const PERIOD_TYPES = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'bimester', label: 'Bimestral' },
  { value: 'trimester', label: 'Trimestral' },
  { value: 'quarter', label: 'Cuatrimestral' },
  { value: 'seasonal', label: 'Estacional' },
];

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function ModuleAcademicPlans() {
  const [tab, setTab] = useState('plans');
  const canWrite = isPlatform();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)' }}>
        <h2 style={{ margin: '0 0 0.3rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><CalendarDays color="var(--color-secondary)" /> Planes y Periodos Académicos</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Configura los planes académicos, sus períodos (bimestres, trimestres) y asigna cursos.</p>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(45, 55, 63, 0.08)', padding: '0 1rem' }}>
          <button onClick={() => setTab('plans')} style={tabStyle(tab === 'plans')}>Planes Académicos</button>
          <button onClick={() => setTab('terms')} style={tabStyle(tab === 'terms')}>Períodos</button>
          <button onClick={() => setTab('plan-courses')} style={tabStyle(tab === 'plan-courses')}>Cursos en Plan</button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {tab === 'plans' && <TabPlans canWrite={canWrite} />}
          {tab === 'terms' && <TabTerms canWrite={canWrite} />}
          {tab === 'plan-courses' && <TabPlanCourses canWrite={canWrite} />}
        </div>
      </div>
    </div>
  );
}

// ═══ TAB: PLANES ACADÉMICOS ═══
function TabPlans({ canWrite }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', duration_type: 'annual', period_type: 'bimester', period_count: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetch_ = async () => { setLoading(true); try { const d = await apiFetch(`${API}/academic/plans`); setData(Array.isArray(d) ? d : []); } catch (e) { } finally { setLoading(false); } };
  useEffect(() => { fetch_(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', duration_type: 'annual', period_type: 'bimester', period_count: '' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ name: row.name, duration_type: row.duration_type || 'annual', period_type: row.period_type || 'bimester', period_count: row.period_count ?? '' }); setModal(true); };
  const handleDelete = async (row) => { if (!confirm(`¿Eliminar plan "${row.name}"?`)) return; try { await apiFetch(`${API}/platform/academic/plans/${row.plan_id}`, { method: 'DELETE' }); fetch_(); } catch (e) { alert(e.message); } };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const body = { name: form.name, duration_type: form.duration_type, period_type: form.period_type, period_count: form.period_count ? Number(form.period_count) : null };
      if (editing) { await apiFetch(`${API}/platform/academic/plans/${editing.plan_id}`, { method: 'PUT', body: JSON.stringify(body) }); }
      else { await apiFetch(`${API}/platform/academic/plans`, { method: 'POST', body: JSON.stringify(body) }); }
      setModal(false); fetch_();
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  const durationLabel = (v) => DURATION_TYPES.find(d => d.value === v)?.label || v || '—';
  const periodLabel = (v) => PERIOD_TYPES.find(p => p.value === v)?.label || v || '—';

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-secondary)' }} /></div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Planes académicos globales que definen la estructura temporal del año escolar.</p>
        {canWrite && <button onClick={openCreate} style={btnPrimary}><Plus size={14} /> Nuevo Plan</button>}
      </div>
      <DataTable columns={[
        { header: 'Nombre', accessor: r => r.name },
        { header: 'Duración', accessor: r => <span style={{ background: 'rgba(105,151,126,0.1)', color: 'var(--color-tertiary)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>{durationLabel(r.duration_type)}</span> },
        { header: 'Tipo de Período', accessor: r => <span style={{ background: 'rgba(224,159,57,0.1)', color: 'var(--color-secondary)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>{periodLabel(r.period_type)}</span> },
        { header: '# Períodos', accessor: r => r.period_count ?? '—' },
      ]} data={data} onEdit={openEdit} onDelete={handleDelete} canWrite={canWrite} />

      <FormModal title={editing ? 'Editar Plan' : 'Nuevo Plan'} open={modal} onClose={() => setModal(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Nombre del Plan</label>
          <input required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Plan Anual Bimestral" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Duración</label>
            <select style={inputStyle} value={form.duration_type} onChange={e => setForm({ ...form, duration_type: e.target.value })}>
              {DURATION_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tipo de Período</label>
            <select style={inputStyle} value={form.period_type} onChange={e => setForm({ ...form, period_type: e.target.value })}>
              {PERIOD_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Cantidad de Períodos</label>
          <input type="number" style={inputStyle} value={form.period_count} onChange={e => setForm({ ...form, period_count: e.target.value })} placeholder="Ej: 4" />
        </div>
      </FormModal>
    </>
  );
}

// ═══ TAB: PERÍODOS ═══
function TabTerms({ canWrite }) {
  const [data, setData] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ plan_id: '', name: '', order: '' });
  const [submitting, setSubmitting] = useState(false);
  const [filterPlan, setFilterPlan] = useState('');

  const fetch_ = async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([apiFetch(`${API}/academic/terms`), apiFetch(`${API}/academic/plans`)]);
      setData(Array.isArray(t) ? t : []);
      setPlans(Array.isArray(p) ? p : []);
    } catch (e) { } finally { setLoading(false); }
  };
  useEffect(() => { fetch_(); }, []);

  const planName = (id) => plans.find(p => p.plan_id === id)?.name || id;
  const filtered = filterPlan ? data.filter(t => t.plan_id === filterPlan) : data;

  const openCreate = () => { setEditing(null); setForm({ plan_id: plans[0]?.plan_id || '', name: '', order: '' }); setModal(true); };
  const openEdit = (row) => { setEditing(row); setForm({ plan_id: row.plan_id, name: row.name, order: row.order ?? '' }); setModal(true); };
  const handleDelete = async (row) => { if (!confirm(`¿Eliminar período "${row.name}"?`)) return; try { await apiFetch(`${API}/platform/academic/terms/${row.term_id}`, { method: 'DELETE' }); fetch_(); } catch (e) { alert(e.message); } };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const body = { plan_id: form.plan_id, name: form.name, order: Number(form.order) };
      if (editing) { await apiFetch(`${API}/platform/academic/terms/${editing.term_id}`, { method: 'PUT', body: JSON.stringify({ name: body.name, order: body.order }) }); }
      else { await apiFetch(`${API}/platform/academic/terms`, { method: 'POST', body: JSON.stringify(body) }); }
      setModal(false); fetch_();
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-secondary)' }} /></div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Bimestres, trimestres u otros períodos de cada plan.</p>
          <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}>
            <option value="">Todos los planes</option>
            {plans.map(p => <option key={p.plan_id} value={p.plan_id}>{p.name}</option>)}
          </select>
        </div>
        {canWrite && <button onClick={openCreate} style={btnPrimary}><Plus size={14} /> Nuevo Período</button>}
      </div>
      <DataTable columns={[
        { header: 'Período', accessor: r => r.name },
        { header: 'Plan', accessor: r => planName(r.plan_id) },
        { header: 'Orden', accessor: r => r.order ?? '—' },
      ]} data={filtered} onEdit={openEdit} onDelete={handleDelete} canWrite={canWrite} />

      <FormModal title={editing ? 'Editar Período' : 'Nuevo Período'} open={modal} onClose={() => setModal(false)} onSubmit={handleSubmit} submitting={submitting}>
        {!editing && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Plan Académico</label>
            <select required style={inputStyle} value={form.plan_id} onChange={e => setForm({ ...form, plan_id: e.target.value })}>
              <option value="" disabled>Seleccionar plan</option>
              {plans.map(p => <option key={p.plan_id} value={p.plan_id}>{p.name}</option>)}
            </select>
          </div>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Nombre</label>
          <input required style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: I Bimestre" />
        </div>
        <div>
          <label style={labelStyle}>Orden</label>
          <input type="number" required style={inputStyle} value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} placeholder="Ej: 1" />
        </div>
      </FormModal>
    </>
  );
}

// ═══ TAB: CURSOS EN PLAN ═══
function TabPlanCourses({ canWrite }) {
  const [data, setData] = useState([]);
  const [plans, setPlans] = useState([]);
  const [gradeCourses, setGradeCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ plan_id: '', grade_course_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [filterPlan, setFilterPlan] = useState('');

  const fetch_ = async () => {
    setLoading(true);
    try {
      const [pc, p, gc] = await Promise.all([
        apiFetch(`${API}/academic/plan-courses`),
        apiFetch(`${API}/academic/plans`),
        apiFetch(`${API}/academic/grade-courses`),
      ]);
      setData(Array.isArray(pc) ? pc : []);
      setPlans(Array.isArray(p) ? p : []);
      setGradeCourses(Array.isArray(gc) ? gc : []);
    } catch (e) { } finally { setLoading(false); }
  };
  useEffect(() => { fetch_(); }, []);

  const planName = (id) => plans.find(p => p.plan_id === id)?.name || id;
  const gcName = (id) => gradeCourses.find(gc => gc.grade_course_id === id)?.name || id;
  const filtered = filterPlan ? data.filter(pc => pc.plan_id === filterPlan) : data;

  const openCreate = () => { setForm({ plan_id: plans[0]?.plan_id || '', grade_course_id: gradeCourses[0]?.grade_course_id || '' }); setModal(true); };
  const handleDelete = async (row) => { if (!confirm('¿Desasignar este curso del plan?')) return; try { await apiFetch(`${API}/platform/academic/plan-courses/${row.plan_course_id}`, { method: 'DELETE' }); fetch_(); } catch (e) { alert(e.message); } };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await apiFetch(`${API}/platform/academic/plan-courses`, { method: 'POST', body: JSON.stringify(form) });
      setModal(false); fetch_();
    } catch (e) { alert(e.message); } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-secondary)' }} /></div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Vinculación entre planes y cursos de grado.</p>
          <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} style={{ ...inputStyle, width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}>
            <option value="">Todos los planes</option>
            {plans.map(p => <option key={p.plan_id} value={p.plan_id}>{p.name}</option>)}
          </select>
        </div>
        {canWrite && <button onClick={openCreate} style={btnPrimary}><Plus size={14} /> Asignar Curso</button>}
      </div>
      <DataTable columns={[
        { header: 'Plan', accessor: r => planName(r.plan_id) },
        { header: 'Curso (Grado)', accessor: r => gcName(r.grade_course_id) },
      ]} data={filtered} onEdit={() => { }} onDelete={handleDelete} canWrite={canWrite} hideEdit />

      <FormModal title="Asignar Curso a Plan" open={modal} onClose={() => setModal(false)} onSubmit={handleSubmit} submitting={submitting}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Plan Académico</label>
          <select required style={inputStyle} value={form.plan_id} onChange={e => setForm({ ...form, plan_id: e.target.value })}>
            <option value="" disabled>Seleccionar plan</option>
            {plans.map(p => <option key={p.plan_id} value={p.plan_id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Curso de Grado</label>
          <select required style={inputStyle} value={form.grade_course_id} onChange={e => setForm({ ...form, grade_course_id: e.target.value })}>
            <option value="" disabled>Seleccionar curso</option>
            {gradeCourses.map(gc => <option key={gc.grade_course_id} value={gc.grade_course_id}>{gc.name}</option>)}
          </select>
        </div>
      </FormModal>
    </>
  );
}
