import React, { useState, useEffect, type ReactNode } from "react";
import { API_URL } from "../config";
import { Loader2, AlertCircle } from "lucide-react";

type PlatformTableProps = {
  title: string;
  description: string;
  endpoint: string;
  // Row shape comes from the API; keep accessor loosely typed for ergonomics.
  columns: { header: string; accessor: (row: Record<string, unknown>) => unknown }[];
};

export default function PlatformTable({
  title,
  description,
  endpoint,
  columns,
}: PlatformTableProps) {
  const [data, setData] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/platform/${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result: unknown = await response.json();

        if (!response.ok) {
          const detail =
            typeof result === "object" && result !== null && "detail" in result
              ? String((result as { detail?: unknown }).detail)
              : "Error al obtener la información";
          throw new Error(detail);
        }

        const rows = result as Record<string, unknown>[] | { items?: unknown; data?: unknown };
        const list: Record<string, unknown>[] = Array.isArray(rows)
          ? rows
          : Array.isArray((rows as { items?: unknown }).items)
            ? (rows as { items: Record<string, unknown>[] }).items
            : Array.isArray((rows as { data?: unknown }).data)
              ? (rows as { data: Record<string, unknown>[] }).data
              : [];
        setData(list);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return (
    <div
      style={{
        background: "white",
        padding: "2rem",
        borderRadius: "16px",
        border: "1px solid rgba(45, 55, 63, 0.1)",
        boxShadow: "0 4px 15px rgba(45, 55, 63, 0.03)",
      }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, color: "var(--color-text)", fontSize: "1.5rem" }}>{title}</h2>
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>{description}</p>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 0",
            color: "var(--color-secondary)",
          }}
        >
          <Loader2
            size={32}
            style={{ animation: "spin 1s linear infinite", marginBottom: "1rem" }}
          />
          <p style={{ color: "var(--color-text-muted)" }}>Cargando datos desde el servidor...</p>
        </div>
      ) : error ? (
        <div
          style={{
            display: "flex",
            gap: "0.8rem",
            background: "#FEE2E2",
            color: "#B91C1C",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #F87171",
          }}
        >
          <AlertCircle size={20} />
          <div>
            <strong>Ocurrió un error:</strong> {error}
          </div>
        </div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-text-muted)" }}>
          No se encontraron registros para {title}.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
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
                  {columns.map((col, colIdx) => {
                    const cell = col.accessor(row);
                    return (
                      <td key={colIdx}>
                        {typeof cell === "boolean" ? (cell ? "Sí" : "No") : (cell as ReactNode)}
                      </td>
                    );
                  })}
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
