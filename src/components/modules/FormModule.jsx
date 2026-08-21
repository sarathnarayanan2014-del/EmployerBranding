import { useEffect, useState } from 'react';
import { useModuleData } from '../../lib/useModuleData';

export default function FormModule({ clientId, moduleId, tabDef }) {
  const { data, loading, save } = useModuleData(clientId, moduleId, {});
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => setValues(data || {}), [data]);

  if (loading) return <div className="panel">Loading…</div>;

  return (
    <div className="panel">
      <h3>{tabDef.label}</h3>
      <div className="form-grid">
        {tabDef.fields.map((f) => (
          <div className="field full" key={f.key}>
            <label>{f.label}</label>
            <textarea
              value={values[f.key] || ''}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <div className="save-row">
        <button
          className="btn btn-primary"
          onClick={async () => {
            await save(values);
            setSaved(true);
            setTimeout(() => setSaved(false), 1600);
          }}
        >
          Save
        </button>
        <span className={`save-msg ${saved ? 'show' : ''}`}>Saved ✓</span>
      </div>
    </div>
  );
}
