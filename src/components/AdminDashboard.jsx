import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { TIER_MODULES, TAB_DEFS } from '../modules/config';
import ModuleView from './ModuleView';
import arjunMitra from '../assets/arjun-mitra.png';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [clients, setClients] = useState([]);
  const [currentClientId, setCurrentClientId] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [view, setView] = useState('client'); // 'client' | 'logins'
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', industry: '' });

  async function loadClients() {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    setClients(data || []);
    if (!currentClientId && data?.length) setCurrentClientId(data[0].id);
  }

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const client = clients.find((c) => c.id === currentClientId);

  async function addClient() {
    if (!newClient.name) return;
    const { data, error } = await supabase
      .from('clients')
      .insert({ name: newClient.name, industry: newClient.industry, package: 'Starter' })
      .select()
      .single();
    if (!error) {
      setClients((c) => [data, ...c]);
      setCurrentClientId(data.id);
      setTab('dashboard');
      setView('client');
    }
    setNewClient({ name: '', industry: '' });
    setShowAddClient(false);
  }

  async function changeTier(newTier) {
    await supabase.from('clients').update({ package: newTier }).eq('id', client.id);
    setClients((cs) => cs.map((c) => (c.id === client.id ? { ...c, package: newTier } : c)));
    const stillValid = TIER_MODULES[newTier].includes(tab);
    if (!stillValid) setTab('dashboard');
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="brand">
          <div className="brand-mark"><img src={arjunMitra} alt="HR Mitra" /></div>
          <div>
            <div className="brand-name">HR Mitra</div>
            <div className="brand-sub">Command Center · Admin</div>
          </div>
        </div>

        <div className="sidebar-label">Clients</div>
        <div className="client-list">
          {clients.map((c) => (
            <div
              key={c.id}
              className={`client-item ${c.id === currentClientId && view === 'client' ? 'active' : ''}`}
              onClick={() => { setCurrentClientId(c.id); setView('client'); }}
            >
              <div className="cname">{c.name}</div>
              <div className="cmeta">{c.industry || '—'}</div>
              <span className={`tier-pill tier-${c.package}`}>{c.package === '360' ? 'EB 360' : 'EB ' + c.package}</span>
            </div>
          ))}
          {clients.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 12, padding: 8 }}>No clients yet.</div>}
        </div>

        {showAddClient ? (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              placeholder="Client name"
              value={newClient.name}
              onChange={(e) => setNewClient((n) => ({ ...n, name: e.target.value }))}
              style={{ background: 'var(--panel2)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '7px 9px', fontSize: 12.5 }}
            />
            <input
              placeholder="Industry (optional)"
              value={newClient.industry}
              onChange={(e) => setNewClient((n) => ({ ...n, industry: e.target.value }))}
              style={{ background: 'var(--panel2)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, padding: '7px 9px', fontSize: 12.5 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={addClient}>Add</button>
              <button className="btn btn-ghost" onClick={() => setShowAddClient(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="add-client-btn" onClick={() => setShowAddClient(true)}>+ Add Client</button>
        )}

        <div className="sidebar-footer">
          <button className={`nav-link ${view === 'logins' ? 'active' : ''}`} onClick={() => setView('logins')}>
            ⚙ Manage Company Logins
          </button>
          <button className="nav-link" onClick={signOut}>Log out</button>
        </div>
      </div>

      <div className="main">
        {view === 'logins' ? (
          <ManageLogins clients={clients} />
        ) : !client ? (
          <div className="empty-state" style={{ height: '100vh' }}>
            <h2>No client selected</h2>
            <p>Add a client on the left to start tracking their Employer Brand Command Center.</p>
          </div>
        ) : (
          <>
            <div className="topbar">
              <div>
                <h1>{client.name}</h1>
                <div className="cindustry">{client.industry || '—'} · Client since {client.created_at?.slice(0, 10)}</div>
              </div>
              <select className="tier-select" value={client.package} onChange={(e) => changeTier(e.target.value)}>
                <option value="Starter">EB Starter — Audit + EVP + Strategy</option>
                <option value="Growth">EB Growth — + Content + Advocacy</option>
                <option value="360">EB 360 — Full Suite + AI</option>
              </select>
            </div>
            <div className="tabs">
              {TIER_MODULES[client.package].map((m) => (
                <button key={m} className={`tab-btn ${tab === m ? 'active' : ''}`} onClick={() => setTab(m)}>
                  {TAB_DEFS[m].label}
                </button>
              ))}
            </div>
            <div className="content">
              <ModuleView clientId={client.id} moduleId={tab} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ManageLogins({ clients }) {
  const [logins, setLogins] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', displayName: '', clientId: '', accessLevel: 'edit' });
  const [status, setStatus] = useState('');
  const [rowState, setRowState] = useState({}); // per-login: { newPassword, busy, msg }

  async function loadLogins() {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, client_id, role, access_level, clients(name)')
      .eq('role', 'company');
    setLogins(data || []);
  }

  useEffect(() => { loadLogins(); }, []);

  async function createLogin() {
    if (!form.email || !form.password || !form.clientId) {
      setStatus('Email, password and client are required.');
      return;
    }
    setStatus('Creating…');
    const { data, error } = await supabase.functions.invoke('create-company-user', {
      body: { action: 'create', ...form },
    });
    if (error || data?.error) {
      setStatus('Error: ' + (data?.error || error.message));
      return;
    }
    setStatus('Login created ✓');
    setForm({ email: '', password: '', displayName: '', clientId: '', accessLevel: 'edit' });
    loadLogins();
  }

  function setRow(id, patch) {
    setRowState((s) => ({ ...s, [id]: { ...s[id], ...patch } }));
  }

  async function setAccessLevel(userId, newLevel) {
    setRow(userId, { busy: true });
    const { error } = await supabase.from('profiles').update({ access_level: newLevel }).eq('id', userId);
    if (error) {
      setRow(userId, { busy: false, msg: 'Error: ' + error.message });
      return;
    }
    setRow(userId, { busy: false, msg: 'Access level updated ✓' });
    loadLogins();
  }

  async function resetPassword(userId) {
    const newPassword = rowState[userId]?.newPassword;
    if (!newPassword || newPassword.length < 6) {
      setRow(userId, { msg: 'Enter a password (6+ characters).' });
      return;
    }
    setRow(userId, { busy: true, msg: '' });
    const { data, error } = await supabase.functions.invoke('create-company-user', {
      body: { action: 'reset_password', userId, newPassword },
    });
    if (error || data?.error) {
      setRow(userId, { busy: false, msg: 'Error: ' + (data?.error || error.message) });
      return;
    }
    setRow(userId, { busy: false, msg: 'Password updated ✓', newPassword: '' });
  }

  async function reassignClient(userId, newClientId) {
    setRow(userId, { busy: true });
    const { error } = await supabase.from('profiles').update({ client_id: newClientId }).eq('id', userId);
    if (error) {
      setRow(userId, { busy: false, msg: 'Error: ' + error.message });
      return;
    }
    setRow(userId, { busy: false, msg: 'Access updated ✓' });
    loadLogins();
  }

  async function setAccess(userId, action) {
    setRow(userId, { busy: true, msg: '' });
    const { data, error } = await supabase.functions.invoke('create-company-user', {
      body: { action, userId },
    });
    if (error || data?.error) {
      setRow(userId, { busy: false, msg: 'Error: ' + (data?.error || error.message) });
      return;
    }
    setRow(userId, { busy: false, msg: action === 'deactivate' ? 'Access revoked ✓' : 'Access restored ✓' });
  }

  return (
    <div className="content">
      <div className="panel">
        <h3>Create a Company Login</h3>
        <p style={{ color: 'var(--muted)', fontSize: 12.5, marginBottom: 16, lineHeight: 1.5 }}>
          This creates a real Supabase Auth account scoped to a single client. That client's team will only
          ever see their own data — Row Level Security enforces this at the database level, not just in the UI.
        </p>
        <div className="login-row">
          <div className="field">
            <label>Client</label>
            <select value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}>
              <option value="">Select client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Contact Name</label>
            <input value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} />
          </div>
          <div className="field">
            <label>Login Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="field">
            <label>Temporary Password</label>
            <input type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="field">
            <label>Access Level</label>
            <select value={form.accessLevel} onChange={(e) => setForm((f) => ({ ...f, accessLevel: e.target.value }))}>
              <option value="edit">Can Edit</option>
              <option value="view">View Only</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={createLogin}>Create</button>
        </div>
        <div className="login-error" style={{ color: status.startsWith('Error') ? 'var(--bad)' : 'var(--good)' }}>{status}</div>
      </div>

      <div className="panel">
        <h3>Existing Company Logins</h3>
        {logins.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>No company logins yet.</div>}
        {logins.map((l) => {
          const rs = rowState[l.id] || {};
          return (
            <div className="item-card" key={l.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div className="item-main" style={{ marginBottom: 10 }}>
                <div className="item-title">{l.display_name || '(no name)'}</div>
                <div className="item-tags">
                  <span className="tag">Client: {l.clients?.name || '—'}</span>
                </div>
              </div>

              <div className="add-item-form" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
                <div className="field">
                  <label>Reassign Access To</label>
                  <select
                    value={l.client_id || ''}
                    onChange={(e) => reassignClient(l.id, e.target.value)}
                    disabled={rs.busy}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Access Level</label>
                  <select
                    value={l.access_level || 'edit'}
                    onChange={(e) => setAccessLevel(l.id, e.target.value)}
                    disabled={rs.busy}
                  >
                    <option value="edit">Can Edit</option>
                    <option value="view">View Only</option>
                  </select>
                </div>
                <div className="field">
                  <label>New Password</label>
                  <input
                    type="text"
                    value={rs.newPassword || ''}
                    onChange={(e) => setRow(l.id, { newPassword: e.target.value })}
                    placeholder="min 6 characters"
                  />
                </div>
                <div className="field" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <button className="btn btn-ghost" disabled={rs.busy} onClick={() => resetPassword(l.id)}>Reset Password</button>
                  <button className="btn btn-danger" disabled={rs.busy} onClick={() => setAccess(l.id, 'deactivate')}>Deactivate</button>
                  <button className="btn btn-ghost" disabled={rs.busy} onClick={() => setAccess(l.id, 'reactivate')}>Reactivate</button>
                </div>
              </div>
              {rs.msg && (
                <div className="login-error" style={{ color: rs.msg.startsWith('Error') ? 'var(--bad)' : 'var(--good)' }}>{rs.msg}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
