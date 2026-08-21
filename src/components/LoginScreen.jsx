import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import anjaliMitra from '../assets/anjali-mitra.png';
import arjunMitra from '../assets/arjun-mitra.png';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState('company'); // 'company' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const err = await signIn(email, password);
    setBusy(false);
    if (err) setError(err.message);
    // Role-based routing happens automatically once the profile loads —
    // if a "company" account logs in via the admin tab (or vice versa)
    // the app still routes them correctly by their actual profile role.
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-mascot">
          <img src={mode === 'admin' ? arjunMitra : anjaliMitra} alt="HR Mitra" />
        </div>
        <div className="login-body">
          <h2>Employer Brand Command Center</h2>
          <div className="sub">HR Mitra · Your Trusted Partner</div>

          <div className="login-toggle">
            <button className={mode === 'company' ? 'active' : ''} onClick={() => setMode('company')} type="button">
              Company Login
            </button>
            <button className={mode === 'admin' ? 'active' : ''} onClick={() => setMode('admin')} type="button">
              Admin Login
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
              {busy ? 'Signing in…' : mode === 'admin' ? 'Sign in as Admin' : 'Sign in'}
            </button>
            <div className="login-error">{error}</div>
          </form>

          <div className="login-hint">
            {mode === 'company'
              ? "Use the login your HR Mitra account manager sent you. Don't have one yet? Contact your admin."
              : 'Admin accounts are created directly in Supabase. See the README for setup steps.'}
          </div>
        </div>
      </div>
    </div>
  );
}
