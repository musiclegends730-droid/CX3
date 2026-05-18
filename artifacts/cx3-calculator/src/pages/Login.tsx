import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { resetPassword } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

type Mode = "login" | "signup" | "reset";

const SECURITY_QUESTIONS = [
  "What was the name of your first aircraft?",
  "What is your home airport ICAO code?",
  "What was your first instructor's last name?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What street did you grow up on?",
];

export default function Login() {
  const { login, signup, user } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [secQ, setSecQ] = useState(SECURITY_QUESTIONS[0]);
  const [secA, setSecA] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in — go straight to the calculator
  useEffect(() => {
    if (user) navigate("~/");
  }, [user]);

  if (user) return null;

  const clear = () => { setError(""); setSuccess(""); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); clear(); setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate("~/");
    } else {
      setError(result.error ?? "Login failed. Check your email and password.");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); clear();
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const result = await signup(email, name, password, secQ, secA);
    if (result.success) {
      navigate("~/");
    } else {
      setError(result.error ?? "Sign up failed. Try a different email.");
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); clear();
    if (newPassword.length < 6) { setError("New password must be at least 6 characters."); return; }
    const result = await resetPassword(email, secA, newPassword);
    if (result.success) {
      setSuccess("Password reset successfully. You can now log in.");
      setMode("login");
      setPassword("");
    } else {
      setError(result.error ?? "Reset failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl mb-4">
            <span className="text-primary-foreground font-mono font-black text-xl">CX3</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Flight Computer</h1>
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest mt-1">Aviation Calculation Engine</p>
        </div>

        {/* Tab selector */}
        <div className="flex rounded-lg bg-muted p-1 mb-6 gap-1">
          {([["login", "Sign In"], ["signup", "Create Account"]] as [Mode, string][]).map(([m, label]) => (
            <button
              key={m}
              data-testid={`tab-${m}`}
              onClick={() => { setMode(m); clear(); }}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
          {/* Error / success */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm">
              {success}
            </div>
          )}

          {/* ── Login ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" data-testid="input-login-email" type="email" placeholder="pilot@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-pw">Password</Label>
                <div className="relative">
                  <Input id="login-pw" data-testid="input-login-password" type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button data-testid="btn-login" type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
              <button type="button" onClick={() => { setMode("reset"); clear(); }} className="w-full text-xs text-muted-foreground hover:text-primary transition-colors text-center mt-2">
                Forgot password?
              </button>
            </form>
          )}

          {/* ── Signup ── */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="su-name">Full Name</Label>
                <Input id="su-name" data-testid="input-signup-name" placeholder="Capt. John Smith" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-email">Email</Label>
                <Input id="su-email" data-testid="input-signup-email" type="email" placeholder="pilot@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-pw">Password</Label>
                <div className="relative">
                  <Input id="su-pw" data-testid="input-signup-password" type={showPw ? "text" : "password"} placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-cpw">Confirm Password</Label>
                <Input id="su-cpw" data-testid="input-signup-confirm" type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-secq">Security Question <span className="text-xs text-muted-foreground">(for password reset)</span></Label>
                <select id="su-secq" data-testid="select-security-question" value={secQ} onChange={(e) => setSecQ(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  {SECURITY_QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-seca">Security Answer</Label>
                <Input id="su-seca" data-testid="input-security-answer" placeholder="Your answer" value={secA} onChange={(e) => setSecA(e.target.value)} />
              </div>
              <Button data-testid="btn-signup" type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </form>
          )}

          {/* ── Reset Password ── */}
          {mode === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-sm text-muted-foreground">Answer your security question to reset your password.</p>
              <div className="space-y-1.5">
                <Label htmlFor="rst-email">Email</Label>
                <Input id="rst-email" data-testid="input-reset-email" type="email" placeholder="pilot@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rst-sec">Security Answer</Label>
                <Input id="rst-sec" data-testid="input-reset-security" placeholder="Your answer" value={secA} onChange={(e) => setSecA(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rst-newpw">New Password</Label>
                <Input id="rst-newpw" data-testid="input-reset-newpw" type="password" placeholder="Min. 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <Button data-testid="btn-reset" type="submit" className="w-full">Reset Password</Button>
              <button type="button" onClick={() => { setMode("login"); clear(); }} className="w-full text-xs text-muted-foreground hover:text-primary transition-colors text-center">
                Back to sign in
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 font-mono">
          CX-3 Flight Computer &nbsp;·&nbsp; All calculations per FAA/ASA standards
        </p>
      </div>
    </div>
  );
}
