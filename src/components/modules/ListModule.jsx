import { useState } from 'react';
import { useModuleData } from '../../lib/useModuleData';

export default function ListModule({ clientId, moduleId, tabDef }) {
  const { data, loading, save } = useModuleData(clientId, moduleId, []);
  const items = data || [];
  const [draft, setDraft] = useState({});

  if (loading) return <div className="panel">Loading…</div>;

  async function addItem() {
    const primaryKey = tabDef.itemFields[0].key;
    if (!draft[primaryKey]) return;
    const newItem = { _id: 'i_' + Date.now(), ...draft };
    await save([...items, newItem]);
    setDraft({});
  }

  async function deleteItem(id) {
    await save(items.filter((it) => it._id !== id));
  }

  return (
    <div className="panel">
      <h3>{tabDef.label}</h3>
      <div>
        {items.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>No entries yet — add the first one below.</div>
        )}
        {items.map((it) => (
          <div className="item-card" key={it._id}>
            <div className="item-main">
              <div className="item-title">{it[tabDef.itemFields[0].key] || 'Untitled'}</div>
              <div className="item-tags">
                {tabDef.itemFields.slice(1).map((f) =>
                  it[f.key] ? (
                    <span className="tag" key={f.key}>
                      {f.label}: {it[f.key]}
                    </span>
                  ) : null
                )}
              </div>
            </div>
            <button className="del-btn" onClick={() => deleteItem(it._id)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="add-item-form">
        {tabDef.itemFields.map((f) => (
          <div className="field" key={f.key}>
            <label>{f.label}</label>
            {f.type === 'select' ? (
              <select
                value={draft[f.key] || ''}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              >
                <option value=""></option>
                {f.options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                value={draft[f.key] || ''}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              />
            )}
          </div>
        ))}
        <div className="field">
          <label>&nbsp;</label>
          <button className="btn btn-primary" onClick={addItem}>
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}
