import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { TIER_MODULES, TAB_DEFS } from '../modules/config';
import ModuleView from './ModuleView';
import anjaliMitra from '../assets/anjali-mitra.png';

export default function CompanyDashboard() {
  const { profile, signOut } = useAuth();
  const [client, setClient] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClient() {
      const { data, error } = await supabase.from('clients').select('*').eq('id', profile.client_id).single();
      if (!error) setClient(data);
      setLoading(false);
    }
    if (profile?.client_id) loadClient();
  }, [profile]);

  if (loading) return <div className="center-loading">Loading your dashboard…</div>;
  if (!client) {
    return (
      <div className="empty-state" style={{ height: '100vh' }}>
        <h2>No client linked to this login</h2>
        <p>Contact your HR Mitra account manager to get this set up.</p>
        <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={signOut}>Log out</button>
      </div>
    );
  }

  const activeModules = TIER_MODULES[client.package] || TIER_MODULES.Starter;

  return (
    <div className="app" style={{ gridTemplateColumns: '1fr' }}>
      <div className="main">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="brand-mark"><img src={anjaliMitra} alt="HR Mitra" /></div>
            <div>
              <h1>{client.name}</h1>
              <div className="cindustry">{client.industry || '—'} · {client.package === '360' ? 'EB 360' : 'EB ' + client.package}</div>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="session-badge">COMPANY LOGIN</span>
            <button className="logout-btn" onClick={signOut}>Log out</button>
          </div>
        </div>
        <div className="tabs">
          {activeModules.map((m) => (
            <button key={m} className={`tab-btn ${tab === m ? 'active' : ''}`} onClick={() => setTab(m)}>
              {TAB_DEFS[m].label}
            </button>
          ))}
        </div>
        <div className="content">
          <ModuleView clientId={client.id} moduleId={tab} />
        </div>
      </div>
    </div>
  );
}
