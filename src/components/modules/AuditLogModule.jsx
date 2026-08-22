import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const CATEGORY_OPTIONS = ['Market Perception', 'Digital Channels', 'Employee Engagement', 'Competitor Benchmark', 'Policy Review', 'Other'];

export default function AuditLogModule({ clientId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({});
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_entries')
      .select('*')
      .eq('client_id', clientId)
      .order('entry_date', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (clientId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function addEntry() {
    if (!draft.entry_date || !draft.finding) {
      setError('Date and Finding are required.');
      return;
    }
    setError('');
    const { error } = await supabase.from('audit_entries').insert({
      client_id: clientId,
      entry_date: draft.entry_date,
      auditor: draft.auditor || null,
      category: draft.category || null,
      finding: draft.finding,
      score: draft.score ? Number(draft.score) : null,
      evidence_link: draft.evidence_link || null,
    });
    if (error) {
      setError(error.message);
      return;
    }
    setDraft({});
    load();
  }

  if (loading) return <div className="panel">Loading…</div>;

  return (
    <div className="panel">
      <h3>Audit Log</h3>
      <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
        Stored in its own database table, so audits can be queried and reported on across every client.
        Once logged, an entry can't be edited or deleted from this screen — that keeps the audit trail intact.
      </p>

      {entries.length === 0 && (
        <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>No entries yet — add the first one below.</div>
      )}

      {entries.map((e) => (
        <div className="item-card" key={e.id}>
          <div className="item-main">
            <div className="item-title">
              {e.entry_date} — {e.category || 'Uncategorized'} {e.score !== null ? `(Score: ${e.score}/10)` : ''}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text)', margin: '4px 0' }}>{e.finding}</div>
            <div className="item-tags">
              {e.auditor && <span className="tag">By: {e.auditor}</span>}
              {e.evidence_link && (
                <a className="tag" href={e.evidence_link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  Evidence ↗
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="add-item-form">
        <div className="field">
          <label>Date</label>
          <input type="date" value={draft.entry_date || ''} onChange={(e) => setDraft((d) => ({ ...d, entry_date: e.target.value }))} />
        </div>
        <div className="field">
          <label>Conducted By</label>
          <input value={draft.auditor || ''} onChange={(e) => setDraft((d) => ({ ...d, auditor: e.target.value }))} />
        </div>
        <div className="field">
          <label>Category</label>
          <select value={draft.category || ''} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}>
            <option value=""></option>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div className="field full">
          <label>Finding / Notes</label>
          <textarea value={draft.finding || ''} onChange={(e) => setDraft((d) => ({ ...d, finding: e.target.value }))} />
        </div>
        <div className="field">
          <label>Score (0-10)</label>
          <input type="number" min="0" max="10" value={draft.score || ''} onChange={(e) => setDraft((d) => ({ ...d, score: e.target.value }))} />
        </div>
        <div className="field">
          <label>Evidence Link</label>
          <input value={draft.evidence_link || ''} onChange={(e) => setDraft((d) => ({ ...d, evidence_link: e.target.value }))} />
        </div>
        <div className="field">
          <label>&nbsp;</label>
          <button className="btn btn-primary" onClick={addEntry}>+ Add</button>
        </div>
      </div>
      {error && <div className="login-error">{error}</div>}
    </div>
  );
}
