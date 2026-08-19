import React, { useState, useEffect } from "react";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2, 
  UserCheck, 
  UserX,
  X,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import administrationService, { UserItem } from "../../services/administrationService";

interface ExtendedUser extends UserItem {
  department: string;
  lastLogin: string;
  createdDate: string;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("CLIENT");
  const [formDept, setFormDept] = useState("Operations");
  const [formStatus, setFormStatus] = useState("ACTIVE");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await administrationService.getUsers();
        // Extend API users with UI-only fields
        const extended: ExtendedUser[] = data.map((u, index) => ({
          ...u,
          department: u.role === "ADMIN" ? "Engineering" : u.role === "BDM" ? "Business Development" : "Operations",
          lastLogin: new Date(Date.now() - index * 3600000 * 4).toLocaleString(),
          createdDate: new Date(Date.now() - index * 86400000 * 10).toLocaleDateString(),
        }));
        setUsers(extended);
      } catch (err) {
        // Fallback mock database
        setUsers([
          { id: "usr_10", name: "Venkat G.", email: "venkat@aurexion.io", role: "ADMIN", status: "ACTIVE", department: "Engineering", lastLogin: "8/15/2026, 2:30:12 PM", createdDate: "6/12/2026" },
          { id: "usr_11", name: "Alice S.", email: "alice@aurexion.io", role: "BDM", status: "ACTIVE", department: "Business Development", lastLogin: "8/15/2026, 1:15:30 PM", createdDate: "6/18/2026" },
          { id: "usr_12", name: "Marcus L.", email: "marcus@client.com", role: "CLIENT", status: "SUSPENDED", department: "External", lastLogin: "8/12/2026, 9:45:00 AM", createdDate: "7/01/2026" },
          { id: "usr_13", name: "Sarah K.", email: "sarah@aurexion.io", role: "SALES_EXECUTIVE", status: "ACTIVE", department: "Sales", lastLogin: "8/15/2026, 11:22:45 AM", createdDate: "6/20/2026" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleOpenAddDialog = () => {
    setDialogMode("add");
    setSelectedUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("CLIENT");
    setFormDept("Operations");
    setFormStatus("ACTIVE");
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (user: ExtendedUser) => {
    setDialogMode("edit");
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormDept(user.department);
    setFormStatus(user.status);
    setDialogOpen(true);
  };

  const handleOpenViewDialog = (user: ExtendedUser) => {
    setDialogMode("view");
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialogMode === "add") {
      const newUser: ExtendedUser = {
        id: `usr_${window.crypto ? window.crypto.getRandomValues(new Uint32Array(1))[0] % 900 + 100 : Date.now()}`,
        name: formName,
        email: formEmail,
        role: formRole,
        department: formDept,
        status: formStatus,
        lastLogin: "Never",
        createdDate: new Date().toLocaleDateString(),
      };
      setUsers([newUser, ...users]);
    } else if (dialogMode === "edit" && selectedUser) {
      setUsers(users.map(u => u.id === selectedUser.id ? {
        ...u,
        name: formName,
        email: formEmail,
        role: formRole,
        department: formDept,
        status: formStatus,
      } : u));
    }
    setDialogOpen(false);
  };

  const toggleUserStatus = (user: ExtendedUser) => {
    const updatedStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setUsers(users.map(u => u.id === user.id ? { ...u, status: updatedStatus } : u));
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this operator from system directory?")) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "ALL" || user.role.toUpperCase() === roleFilter.toUpperCase();
    const matchesStatus = statusFilter === "ALL" || user.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow">IDENTITY DIRECTORY</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>User Management</h1>
        </div>
        <Button glow onClick={handleOpenAddDialog} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <UserPlus size={16} /> ADD OPERATOR
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <div style={{
          padding: "1.25rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid var(--color-border)", borderRadius: "6px", padding: "0.5rem 0.75rem", backgroundColor: "var(--color-bg-primary)", flex: 1, minWidth: "260px", maxWidth: "400px" }}>
            <Search size={16} style={{ color: "var(--color-text-muted)" }} />
            <input
              type="text"
              placeholder="Search by ID, name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--color-text-primary)",
                outline: "none",
                width: "100%",
                fontSize: "0.9rem"
              }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>ROLE SCOPE</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  outline: "none",
                  fontSize: "0.85rem"
                }}
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Super Admin</option>
                <option value="BDM">BDM</option>
                <option value="SALES_EXECUTIVE">Sales Executive</option>
                <option value="HR_MANAGER">HR Manager</option>
                <option value="CONTENT_MANAGER">Content Manager</option>
                <option value="SUPPORT_EXECUTIVE">Support Executive</option>
                <option value="CLIENT">Client User</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>STATUS</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "6px",
                  outline: "none",
                  fontSize: "0.85rem"
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Directory Table */}
      <Card>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>
            RESOLVING DIRECTORY DATA NODE...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>OPERATOR ID</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>NAME</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>EMAIL</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>ROLE</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>DEPARTMENT</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>STATUS</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>CREATED DATE</th>
                  <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                      No operators found matching the active filter parameters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((usr) => (
                    <tr key={usr.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 150ms" }} className="hover:bg-muted/10">
                      <td style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--color-cyan)" }}>
                        {usr.id}
                      </td>
                      <td style={{ padding: "1rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                        {usr.name}
                      </td>
                      <td style={{ padding: "1rem", color: "var(--color-text-secondary)" }}>
                        {usr.email}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          fontSize: "0.7rem",
                          fontFamily: "var(--font-mono)",
                          color: "var(--color-cyan)",
                          backgroundColor: "rgba(99, 245, 232, 0.05)",
                          border: "1px solid rgba(99, 245, 232, 0.15)",
                          padding: "0.15rem 0.4rem",
                          borderRadius: "4px"
                        }}>{usr.role}</span>
                      </td>
                      <td style={{ padding: "1rem", color: "var(--color-text-secondary)" }}>
                        {usr.department}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: usr.status === "ACTIVE" ? "#10b981" : "#ef4444"
                        }}>{usr.status}</span>
                      </td>
                      <td style={{ padding: "1rem", color: "var(--color-text-muted)", fontSize: "0.85rem" }}>
                        {usr.createdDate}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                          <button
                            type="button"
                            aria-label="View Operator"
                            onClick={() => handleOpenViewDialog(usr)}
                            title="View Operator"
                            style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "0.25rem" }}
                            onMouseOver={(e) => e.currentTarget.style.color = "var(--color-cyan)"}
                            onMouseOut={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                            onFocus={(e) => e.currentTarget.style.color = "var(--color-cyan)"}
                            onBlur={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label="Edit Operator"
                            onClick={() => handleOpenEditDialog(usr)}
                            title="Edit Operator"
                            style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "0.25rem" }}
                            onMouseOver={(e) => e.currentTarget.style.color = "var(--color-cyan)"}
                            onMouseOut={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                            onFocus={(e) => e.currentTarget.style.color = "var(--color-cyan)"}
                            onBlur={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label={usr.status === "ACTIVE" ? "Deactivate Operator" : "Activate Operator"}
                            onClick={() => toggleUserStatus(usr)}
                            title={usr.status === "ACTIVE" ? "Deactivate Operator" : "Activate Operator"}
                            style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "0.25rem" }}
                            onMouseOver={(e) => e.currentTarget.style.color = usr.status === "ACTIVE" ? "#ef4444" : "#10b981"}
                            onMouseOut={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                            onFocus={(e) => e.currentTarget.style.color = usr.status === "ACTIVE" ? "#ef4444" : "#10b981"}
                            onBlur={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                          >
                            {usr.status === "ACTIVE" ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            type="button"
                            aria-label="Delete Operator"
                            onClick={() => handleDeleteUser(usr.id)}
                            title="Delete Operator"
                            style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", padding: "0.25rem" }}
                            onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"}
                            onMouseOut={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                            onFocus={(e) => e.currentTarget.style.color = "#ef4444"}
                            onBlur={(e) => e.currentTarget.style.color = "var(--color-text-muted)"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit / View Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ backgroundColor: "#0a111c", border: "1px solid #1e293b", color: "#f8fafc", maxWidth: "520px", maxHeight: "85vh", overflowY: "auto", padding: "1.75rem", zIndex: 100, boxSizing: "border-box" }}>
          <DialogHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "1rem" }}>
            <DialogTitle style={{ fontSize: "1.25rem", fontFamily: "var(--font-display)", fontWeight: 600, color: "#63f5e8" }}>
              {dialogMode === "add" ? "Register New Operator" : dialogMode === "edit" ? "Modify Operator Profile" : "Operator Detailed Metadata"}
            </DialogTitle>
          </DialogHeader>

          {dialogMode === "view" && selectedUser ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", margin: "1rem 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "0.75rem 1rem", fontSize: "0.88rem", alignItems: "center" }}>
                <span style={{ color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem" }}>OPERATOR ID:</span>
                <span style={{ color: "#63f5e8", fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 }}>{selectedUser.id}</span>
                
                <span style={{ color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem" }}>FULL NAME:</span>
                <span style={{ fontWeight: 600, color: "#f8fafc" }}>{selectedUser.name}</span>

                <span style={{ color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem" }}>EMAIL ADDRESS:</span>
                <span style={{ color: "#cbd5e1" }}>{selectedUser.email}</span>

                <span style={{ color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem" }}>ROLE SCOPE:</span>
                <span style={{ color: "#cbd5e1" }}>{selectedUser.role}</span>

                <span style={{ color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem" }}>DEPARTMENT:</span>
                <span style={{ color: "#cbd5e1" }}>{selectedUser.department}</span>

                <span style={{ color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem" }}>STATUS:</span>
                <span style={{ color: selectedUser.status === "ACTIVE" ? "#10b981" : "#ef4444", fontWeight: 600 }}>{selectedUser.status}</span>

                <span style={{ color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem" }}>LAST LOGGED IN:</span>
                <span style={{ color: "#cbd5e1" }}>{selectedUser.lastLogin}</span>

                <span style={{ color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem" }}>CREATED DATE:</span>
                <span style={{ color: "#cbd5e1" }}>{selectedUser.createdDate}</span>
              </div>
              <DialogFooter style={{ borderTop: "1px solid #1e293b", paddingTop: "1rem", marginTop: "0.5rem" }}>
                <Button variant="outline" onClick={() => setDialogOpen(false)} style={{ width: "100%" }}>CLOSE METADATA</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSaveUser} style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "1rem 0" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>FULL OPERATOR NAME</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{
                    backgroundColor: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  style={{
                    backgroundColor: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>ROLE SCOPE</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    style={{
                      backgroundColor: "var(--color-bg-primary)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      outline: "none"
                    }}
                  >
                    <option value="ADMIN">Super Admin</option>
                    <option value="BDM">BDM</option>
                    <option value="SALES_EXECUTIVE">Sales Executive</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="CONTENT_MANAGER">Content Manager</option>
                    <option value="SUPPORT_EXECUTIVE">Support Executive</option>
                    <option value="CLIENT">Client User</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>DEPARTMENT</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    style={{
                      backgroundColor: "var(--color-bg-primary)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-primary)",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      outline: "none"
                    }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Business Development">Business Development</option>
                    <option value="Sales">Sales</option>
                    <option value="Recruitment">Recruitment</option>
                    <option value="Support">Support Desk</option>
                    <option value="Content">CMS Catalog</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>SYSTEM STATUS</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  style={{
                    backgroundColor: "var(--color-bg-primary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    outline: "none"
                  }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <DialogFooter style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem", marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>CANCEL</Button>
                <Button glow type="submit">SAVE OPERATOR</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
