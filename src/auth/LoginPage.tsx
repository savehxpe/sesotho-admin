import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../shared/rbac/AdminAuthCtx";

export function LoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = login(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/admin", { replace: true });
    } else {
      setError(result.error ?? "Login failed.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-name">Sesotho Fashioning</div>
          <div className="login-brand-sub">Super Admin</div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="team@outworldcreative.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error" role="alert">
              <i className="ti ti-alert-circle" aria-hidden="true" />
              {error}
            </div>
          )}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="login-footer">
          Sesotho Fashioning &copy; 2026
        </div>
      </div>
    </div>
  );
}
