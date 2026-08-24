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
  Eye,
  Shield,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import administrationService, { UserItem, RoleChoiceItem } from "../../services/administrationService";

interface ExtendedUser extends UserItem {
  department?: string;
  lastLogin?: string;
  createdDate?: string;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [roleChoices, setRoleChoices] = useState<RoleChoiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);

  // Form State
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("client_user");
  const [formPassword, setFormPassword] = useState("");
  const [formStatus, setFormStatus] = useState("ACTIVE");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoleChoices = async () => {
      try {
        const choices = await administrationService.getRoleChoices();
        setRoleChoices(choices);
      } catch (err) {
        console.error("Failed to load role choices", err);
      }
    };
    fetchRoleChoices();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await administrationService.getUsers({
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        search: searchTerm.trim() || undefined,
      });
      const extended: ExtendedUser[] = data.map((u, index) => ({
        ...u,
        department: u.role === "SUPER_ADMIN" || u.role === "ADMINISTRATOR" ? "Administration" : u.role === "BDM" ? "Business Development" : u.role === "SALES_EXECUTIVE" ? "Sales" : "Operations",
        lastLogin: "Active Session",
        createdDate: u.date_joined ? new Date(u.date_joined).toLocaleDateString() : "N/A",
      }));
      setUsers(extended);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchTerm]);

  const handleOpenAddDialog = () => {
    setDialogMode("add");
    setSelectedUser(null);
    setFormUsername("");
    setFormEmail("");
    setFormRole(roleChoices[0]?.code || "client_user");
    setFormPassword("");
    setFormStatus("ACTIVE");
    setFormError("");
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (user: ExtendedUser) => {
    setDialogMode("edit");
    setSelectedUser(user);
    setFormUsername(user.name);
    setFormEmail(user.email);
    setFormRole(user.role.toLowerCase());
    setFormPassword("");
    setFormStatus(user.status);
    setFormError("");
    setDialogOpen(true);
  };

  const handleOpenViewDialog = (user: ExtendedUser) => {
    setDialogMode("view");
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      if (dialogMode === "add") {
        if (!formUsername || !formEmail) {
          setFormError("Username and Email are required.");
          setSubmitting(false);
          return;
        }
        await administrationService.createUser({
          username: formUsername,
          email: formEmail,
          role: formRole,
          password: formPassword || undefined,
        });
      } else if (dialogMode === "edit" && selectedUser) {
        await administrationService.updateUser(selectedUser.id, {
          username: formUsername,
          email: formEmail,
          role: formRole,
          is_active: formStatus === "ACTIVE",
        });
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || "Failed to save user account.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (user: ExtendedUser) => {
    const nextActiveState = user.status !== "ACTIVE";
    try {
      await administrationService.updateUser(user.id, { is_active: nextActiveState });
      fetchUsers();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user from the system directory?")) {
      try {
        await administrationService.deleteUser(userId);
        fetchUsers();
      } catch (err: any) {
        alert(err?.response?.data?.detail || "Failed to delete user.");
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesStatus = statusFilter === "ALL" || user.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesStatus;
  });

  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

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
              placeholder="Search by username, email or ID..."
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
                <option value="ALL">All Roles ({roleChoices.length})</option>
                {roleChoices.map((rc) => (
                  <option key={rc.code} value={rc.code}>
                    {rc.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <label style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>ACCOUNT STATUS</label>
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
                <option value="ACTIVE">Active Accounts</option>
                <option value="SUSPENDED">Suspended Accounts</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Directory Table */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>USER / EMAIL</th>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>SYSTEM ROLE</th>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>STATUS</th>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>JOINED DATE</th>
                <th style={{ padding: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>
                    FETCHING USER DIRECTORY...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-muted)" }}>
                    No users match your specified filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{user.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{user.email}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        fontSize: "0.72rem",
                        fontFamily: "var(--font-mono)",
                        color: user.role === "SUPER_ADMIN" || user.role === "ADMINISTRATOR" ? "#a855f7" : user.role === "BDM" ? "#3b82f6" : "var(--color-cyan)",
                        backgroundColor: user.role === "SUPER_ADMIN" ? "rgba(168, 85, 247, 0.1)" : "rgba(99, 245, 232, 0.08)",
                        border: "1px solid rgba(99, 245, 232, 0.15)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px"
                      }}>
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        fontFamily: "var(--font-mono)",
                        color: user.status === "ACTIVE" ? "#4ade80" : "#f87171",
                        backgroundColor: user.status === "ACTIVE" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "3px",
                        border: user.status === "ACTIVE" ? "1px solid rgba(34, 197, 94, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)"
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", color: "var(--color-text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                      {user.createdDate}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.4rem" }}>
                        <Button size="sm" variant="outline" onClick={() => handleOpenViewDialog(user)} style={{ padding: "0.25rem 0.5rem" }}>
                          <Eye size={14} />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEditDialog(user)} style={{ padding: "0.25rem 0.5rem" }}>
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleUserStatus(user)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            color: user.status === "ACTIVE" ? "#f87171" : "#4ade80",
                            borderColor: user.status === "ACTIVE" ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)"
                          }}
                        >
                          {user.status === "ACTIVE" ? <UserX size={14} /> : <UserCheck size={14} />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                          style={{ padding: "0.25rem 0.5rem", color: "#f87171", borderColor: "rgba(239, 68, 68, 0.3)" }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid rgba(140, 174, 187, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
          }}
        >
          <div>
            Showing <strong style={{ color: "var(--color-text-primary)" }}>{totalItems > 0 ? startIndex + 1 : 0}</strong> to{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>{endIndex}</strong> of{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>{totalItems}</strong> entries
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: "0.25rem 0.5rem",
                  backgroundColor: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  borderRadius: "4px",
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "0.4rem" }}>
              <Button
                variant="outline"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
              >
                Previous
              </Button>
              <span style={{ display: "flex", alignItems: "center", padding: "0 0.5rem", fontFamily: "var(--font-mono)", color: "var(--color-cyan)" }}>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* User Add / Edit / View Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ backgroundColor: "#0b0f19", border: "1px solid var(--color-border)", color: "#fff", maxWidth: "480px" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--color-cyan)", fontFamily: "var(--font-display)" }}>
              {dialogMode === "add" && "CREATE NEW OPERATOR ACCOUNT"}
              {dialogMode === "edit" && `EDIT OPERATOR: ${selectedUser?.name}`}
              {dialogMode === "view" && `OPERATOR DOSSIER: ${selectedUser?.name}`}
            </DialogTitle>
          </DialogHeader>

          {dialogMode === "view" && selectedUser ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>USER ID</label>
                  <div style={{ fontSize: "0.85rem", color: "#fff", fontFamily: "var(--font-mono)" }}>{selectedUser.id}</div>
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>USERNAME</label>
                  <div style={{ fontSize: "0.85rem", color: "#fff" }}>{selectedUser.name}</div>
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>EMAIL ADDRESS</label>
                  <div style={{ fontSize: "0.85rem", color: "#fff", wordBreak: "break-all" }}>{selectedUser.email}</div>
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>SYSTEM ROLE</label>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-cyan)", fontFamily: "var(--font-mono)" }}>{selectedUser.role}</div>
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>STATUS</label>
                  <div style={{ fontSize: "0.85rem", color: selectedUser.status === "ACTIVE" ? "#4ade80" : "#f87171" }}>
                    {selectedUser.status}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>DATE JOINED</label>
                  <div style={{ fontSize: "0.85rem", color: "#fff" }}>{selectedUser.createdDate}</div>
                </div>
              </div>
              <DialogFooter style={{ marginTop: "1.5rem" }}>
                <Button onClick={() => setDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSaveUser} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              {formError && (
                <div style={{ padding: "0.75rem", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "4px", color: "#f87171", fontSize: "0.8rem" }}>
                  {formError}
                </div>
              )}

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  Username *
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    backgroundColor: "#070a12",
                    color: "#fff",
                    border: "1px solid var(--color-border)",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    backgroundColor: "#070a12",
                    color: "#fff",
                    border: "1px solid var(--color-border)",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  System Role *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    backgroundColor: "#070a12",
                    color: "#fff",
                    border: "1px solid var(--color-border)",
                    outline: "none"
                  }}
                >
                  {roleChoices.map((rc) => (
                    <option key={rc.code} value={rc.code.toLowerCase()}>
                      {rc.name}
                    </option>
                  ))}
                </select>
              </div>

              {dialogMode === "add" && (
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                    Password (Optional - auto-generated if left blank)
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      backgroundColor: "#070a12",
                      color: "#fff",
                      border: "1px solid var(--color-border)",
                      outline: "none"
                    }}
                  />
                </div>
              )}

              {dialogMode === "edit" && (
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                    Account Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      backgroundColor: "#070a12",
                      color: "#fff",
                      border: "1px solid var(--color-border)",
                      outline: "none"
                    }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              )}

              <DialogFooter style={{ marginTop: "1rem" }}>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Operator Account"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
