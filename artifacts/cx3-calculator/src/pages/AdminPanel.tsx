import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, useAdminTheme } from "@/contexts/ThemeContext";
import { getAllUsers, adminResetPassword, adminDeleteUser, setGlobalTheme } from "@/lib/auth";
import { THEMES } from "@/lib/themes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Palette, Users, Shield, Trash2, Key, Check } from "lucide-react";
import type { User } from "@/lib/auth";

type Section = "themes" | "users";

export default function AdminPanel() {
  const { user, logout, refreshUser } = useAuth();
  const { currentTheme, setTheme } = useTheme();
  const { setGlobal } = useAdminTheme();
  const [section, setSection] = useState<Section>("themes");
  const [users, setUsers] = useState<User[]>(() => getAllUsers());
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");
  const [globalApplied, setGlobalApplied] = useState(false);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-foreground font-semibold">Admin access required.</p>
          <a href="/" className="text-primary text-sm mt-2 block hover:underline">Return to calculator</a>
        </div>
      </div>
    );
  }

  const applyGlobal = (id: string) => {
    setGlobal(id);
    setGlobalApplied(true);
    setTimeout(() => setGlobalApplied(false), 2000);
  };

  const handleReset = (userId: string) => {
    if (!newPw || newPw.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    const result = adminResetPassword(userId, newPw);
    if (result.success) {
      setMsg("Password updated.");
      setResetTarget(null);
      setNewPw("");
      refreshUser();
    } else {
      setMsg(result.error ?? "Failed.");
    }
  };

  const handleDelete = (userId: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    const result = adminDeleteUser(userId);
    if (result.success) {
      setUsers(getAllUsers());
      setMsg(`User "${name}" deleted.`);
    } else {
      setMsg(result.error ?? "Failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Calculator
          </a>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono">{user.email}</span>
            <Button variant="outline" size="sm" onClick={() => { logout(); }}>Sign Out</Button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">CX-3 Flight Computer</p>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 mb-6">
          {([["themes", <Palette className="w-4 h-4" />, "Themes"] as const, ["users", <Users className="w-4 h-4" />, "Users"] as const]).map(([id, icon, label]) => (
            <button
              key={id}
              data-testid={`admin-tab-${id}`}
              onClick={() => setSection(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                section === id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {icon}{label}
            </button>
          ))}
        </div>

        {msg && (
          <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm flex items-center justify-between">
            {msg}
            <button onClick={() => setMsg("")} className="text-accent hover:text-accent/70 text-lg leading-none">×</button>
          </div>
        )}

        {/* ── Themes ── */}
        {section === "themes" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Click a theme to preview instantly. Use "Set as Global Default" to apply for all users.</p>
              {globalApplied && (
                <div className="flex items-center gap-1.5 text-accent text-sm font-semibold">
                  <Check className="w-4 h-4" /> Global default saved
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <div
                  key={theme.id}
                  data-testid={`theme-card-${theme.id}`}
                  className={`border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                    currentTheme.id === theme.id ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setTheme(theme.id)}
                >
                  {/* Color swatches */}
                  <div className="flex gap-1.5 mb-3">
                    {theme.preview.map((color, i) => (
                      <div key={i} className="w-6 h-6 rounded-full border border-white/10 shadow-inner" style={{ backgroundColor: color }} />
                    ))}
                    {currentTheme.id === theme.id && (
                      <div className="ml-auto flex items-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-foreground">{theme.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
                  <button
                    data-testid={`theme-global-${theme.id}`}
                    onClick={(e) => { e.stopPropagation(); applyGlobal(theme.id); }}
                    className="mt-3 w-full text-xs py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors font-medium"
                  >
                    Set as Global Default
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {section === "users" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">{users.length} registered account{users.length !== 1 ? "s" : ""}</p>
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} data-testid={`user-row-${u.id}`} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{u.name}</span>
                        {u.role === "admin" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold">ADMIN</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{u.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                    </div>
                    {u.id !== "admin-001" && (
                      <div className="flex gap-2">
                        <button
                          data-testid={`user-reset-${u.id}`}
                          onClick={() => { setResetTarget(resetTarget === u.id ? null : u.id); setNewPw(""); setMsg(""); }}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                        >
                          <Key className="w-3.5 h-3.5" /> Reset PW
                        </button>
                        <button
                          data-testid={`user-delete-${u.id}`}
                          onClick={() => handleDelete(u.id, u.name)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {resetTarget === u.id && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        data-testid={`input-new-pw-${u.id}`}
                        type="password"
                        placeholder="New password (min 6 chars)"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button size="sm" onClick={() => handleReset(u.id)} className="h-8 whitespace-nowrap">Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setResetTarget(null)} className="h-8">Cancel</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
