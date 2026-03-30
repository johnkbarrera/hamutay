import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

export default function PlatformTable({ title, description, endpoint, columns }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/platform/${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || 'Error al obtener la información');
        }

        // Sometimes APIs return { items: [...] } or just an array [...]
        // Adjust depending on actual API structure. Assuming array for now based on typical FastAPI behavior.
        setData(Array.isArray(result) ? result : (result.items || result.data || []));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(45, 55, 63, 0.1)', boxShadow: '0 4px 15px rgba(45, 55, 63, 0.03)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.5rem' }}>{title}</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{description}</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'var(--color-secondary)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>Cargando datos desde el servidor...</p>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', gap: '0.8rem', background: '#FEE2E2', color: '#B91C1C', padding: '1rem', borderRadius: '8px', border: '1px solid #F87171' }}>
          <AlertCircle size={20} />
          <div>
            <strong>Ocurrió un error:</strong> {error}
          </div>
        </div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)' }}>
          No se encontraron registros para {title}.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="andean-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {columns.map((col, colIdx) => (
                    <td key={colIdx}>
                      {/* En caso de objetos anidados o booleanos */}
                      {typeof col.accessor(row) === 'boolean' 
                        ? (col.accessor(row) ? 'Sí' : 'No') 
                        : col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
