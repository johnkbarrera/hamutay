import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Search,
  X,
  AlertCircle,
  RefreshCcw,
  UserCheck,
  UserX,
} from "lucide-react";
import { API_URL } from "../../config";

export default function ModuleUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // 'active' o 'deleted'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    document_type: "DNI",
    document_number: "",
    role: "support",
    phone: "",
    is_active: true,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      const endpoint =
        activeTab === "active" ? `${API_URL}/platform/users` : `${API_URL}/platform/users/deleted`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Error al descargar los usuarios");

      setUsers(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      document_type: "DNI",
      document_number: "",
      role: "support",
      phone: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || "",
      password: "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      document_type: user.document_type || "DNI",
      document_number: user.document_number || "",
      role: user.role_obj?.name || user.role || "support",
      phone: user.phone || "",
      is_active: user.is_active !== undefined ? user.is_active : true,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const token = localStorage.getItem("token");
    const endpoint = editingUser
      ? `${API_URL}/platform/users/${editingUser.id}`
      : `${API_URL}/platform/users`;
    const method = editingUser ? "PATCH" : "POST";

    const payload: Record<string, unknown> = { ...formData };
    if (editingUser && !payload.password) {
      delete payload.password;
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Error en la petición");

      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de mover este usuario a la papelera?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/platform/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Error al eliminar");
      }
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("¿Desea restaurar a este usuario y devolverle su acceso?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/platform/users/${id}/restore`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Error al restaurar");
      }
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${u.first_name} ${u.last_name || ""}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (u.email || "").includes(term) ||
      (u.document_number || "").includes(term)
    );
  });

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid rgba(45, 55, 63, 0.1)",
        boxShadow: "0 4px 15px rgba(45, 55, 63, 0.03)",
        overflow: "hidden",
      }}
    >
      {/* Upper Toolbar */}
      <div
        style={{
          padding: "1.5rem 2rem",
          borderBottom: "1px solid rgba(45, 55, 63, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "var(--color-text)",
            fontSize: "1.3rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Shield size={20} color="var(--color-primary)" /> Gestión de Usuarios
        </h2>

        <button
          onClick={openCreateModal}
          className="btn"
          style={{
            background: "var(--color-tertiary)",
            color: "white",
            gap: "0.4rem",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "0.9rem",
          }}
        >
          <Plus size={16} /> Agregar Usuario
        </button>
      </div>

      {/* Tabs and Search Context */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          background: "rgba(248, 244, 238, 0.5)",
          borderBottom: "1px solid rgba(45, 55, 63, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            background: "rgba(45, 55, 63, 0.05)",
            padding: "0.3rem",
            borderRadius: "8px",
          }}
        >
          <button
            onClick={() => setActiveTab("active")}
            style={{
              padding: "0.4rem 1rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontWeight: activeTab === "active" ? 600 : 400,
              background: activeTab === "active" ? "white" : "transparent",
              color: activeTab === "active" ? "var(--color-text)" : "var(--color-text-muted)",
              boxShadow: activeTab === "active" ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
              transition: "all 0.2s",
            }}
          >
            <UserCheck size={16} /> Activos
          </button>
          <button
            onClick={() => setActiveTab("deleted")}
            style={{
              padding: "0.4rem 1rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontWeight: activeTab === "deleted" ? 600 : 400,
              background: activeTab === "deleted" ? "white" : "transparent",
              color: activeTab === "deleted" ? "#B91C1C" : "var(--color-text-muted)",
              boxShadow: activeTab === "deleted" ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
              transition: "all 0.2s",
            }}
          >
            <UserX size={16} /> Papelera
          </button>
        </div>

        <div style={{ position: "relative" }}>
          <Search
            size={16}
            color="var(--color-text-muted)"
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "0.5rem 1rem 0.5rem 2rem",
              borderRadius: "8px",
              border: "1px solid rgba(45, 55, 63, 0.1)",
              outline: "none",
              width: "200px",
              fontSize: "0.85rem",
            }}
          />
        </div>
      </div>

      {error && !isModalOpen && (
        <div
          style={{
            margin: "1rem 2rem",
            background: "#FEE2E2",
            color: "#B91C1C",
            padding: "0.8rem",
            borderRadius: "8px",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div style={{ minHeight: "300px" }}>
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
            <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <div style={{ overflowX: "auto", padding: "0 1rem 1rem 1rem" }}>
            <table className="andean-table" style={{ fontSize: "0.9rem" }}>
              <thead>
                <tr>
                  <th style={{ background: "transparent" }}>Usuario</th>
                  <th style={{ background: "transparent" }}>Documento</th>
                  <th style={{ background: "transparent" }}>Rol</th>
                  <th style={{ textAlign: "right", background: "transparent" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    style={{
                      opacity: activeTab === "deleted" ? 0.6 : 1,
                      transition: "background 0.2s",
                      borderBottom: "1px solid rgba(0,0,0,0.03)",
                    }}
                  >
                    <td>
                      <div
                        style={{
                          fontWeight: "600",
                          color: "var(--color-text)",
                          marginBottom: "0.2rem",
                        }}
                      >
                        {u.first_name} {u.last_name || ""}
                      </div>
                      <div style={{ fontSize: "0.8rem" }}>{u.email}</div>
                    </td>
                    <td>
                      {u.document_type} {u.document_number}
                    </td>
                    <td>
                      <span
                        style={{
                          background: "rgba(224, 159, 57, 0.1)",
                          color: "var(--color-secondary)",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                        }}
                      >
                        {(u.role_obj?.name || u.role || "NA").toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {activeTab === "deleted" ? (
                        <button
                          onClick={() => handleRestore(u.id)}
                          style={{
                            background: "rgba(105, 151, 126, 0.1)",
                            border: "none",
                            color: "var(--color-tertiary)",
                            cursor: "pointer",
                            padding: "0.5rem",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontWeight: "600",
                          }}
                          title="Restaurar Usuario"
                        >
                          <RefreshCcw size={14} /> Restaurar
                        </button>
                      ) : (
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => openEditModal(u)}
                            style={{
                              background: "transparent",
                              border: "1px solid rgba(0,0,0,0.1)",
                              color: "var(--color-text-muted)",
                              cursor: "pointer",
                              padding: "0.4rem",
                              borderRadius: "6px",
                            }}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            style={{
                              background: "rgba(211, 73, 55, 0.05)",
                              border: "none",
                              color: "var(--color-primary)",
                              cursor: "pointer",
                              padding: "0.4rem",
                              borderRadius: "6px",
                            }}
                            title="Mover a Papelera"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      No hay registros en {activeTab === "deleted" ? "la papelera" : "el sistema"}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL para Crear / Editar */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(45, 55, 63, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "600px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.4rem" }}>
                {editingUser ? "Editar Registro" : "Nuevo Registro"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    marginBottom: "0.3rem",
                    fontWeight: 600,
                  }}
                >
                  Correo Electrónico
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(45, 55, 63, 0.2)",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    marginBottom: "0.3rem",
                    fontWeight: 600,
                  }}
                >
                  Nombres
                </label>
                <input
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(45, 55, 63, 0.2)",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    marginBottom: "0.3rem",
                    fontWeight: 600,
                  }}
                >
                  Apellidos
                </label>
                <input
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(45, 55, 63, 0.2)",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    marginBottom: "0.3rem",
                    fontWeight: 600,
                  }}
                >
                  Doc Identidad
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select
                    name="document_type"
                    value={formData.document_type}
                    onChange={handleFormChange}
                    style={{
                      padding: "0.7rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(45, 55, 63, 0.2)",
                      outline: "none",
                      width: "35%",
                    }}
                  >
                    <option value="DNI">DNI</option>
                    <option value="CE">CE</option>
                    <option value="PASSPORT">Pasaporte</option>
                  </select>
                  <input
                    name="document_number"
                    type="text"
                    required
                    value={formData.document_number}
                    onChange={handleFormChange}
                    style={{
                      width: "65%",
                      padding: "0.7rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(45, 55, 63, 0.2)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    marginBottom: "0.3rem",
                    fontWeight: 600,
                  }}
                >
                  Teléfono
                </label>
                <input
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(45, 55, 63, 0.2)",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    marginBottom: "0.3rem",
                    fontWeight: 600,
                  }}
                >
                  Rol del Sistema
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(45, 55, 63, 0.2)",
                    outline: "none",
                  }}
                >
                  <option value="superadmin">Superadmin</option>
                  <option value="support">Soporte</option>
                  <option value="sales">Ventas</option>
                  <option value="dev">Desarrollador</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    marginBottom: "0.3rem",
                    fontWeight: 600,
                  }}
                >
                  Contraseña {editingUser && "(Dejar en blanco para no cambiarla)"}
                </label>
                <input
                  name="password"
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: "0.7rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(45, 55, 63, 0.2)",
                    outline: "none",
                  }}
                />
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                  marginTop: "1rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid rgba(0,0,0,0.1)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-text-muted)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: "var(--color-primary)",
                    color: "white",
                    padding: "0.7rem 1.5rem",
                    borderRadius: "8px",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isSubmitting && (
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  )}
                  {editingUser ? "Guardar Cambios" : "Ingresar Perfil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
