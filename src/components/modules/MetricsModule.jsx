import { useEffect, useState } from 'react';
import { useModuleData } from '../../lib/useModuleData';
import { METRIC_FIELDS } from '../../modules/config';

export default function MetricsModule({ clientId, moduleId }) {
  const { data, loading, save } = useModuleData(clientId, moduleId, {});
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => setValues(data || {}), [data]);

  if (loading) return <div className="panel">Loading…</div>;

  const score = parseFloat(values.brandScore) || 0;
  const rotation = (Math.min(Math.max(score, 0), 100) / 100) * 180 - 90;

  async function handleSave() {
    await save(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <>
      <div className="panel metrics-grid">
        <div className="gauge-panel">
          <svg width="200" height="120" viewBox="0 0 200 120">
            <path d="M10,110 A90,90 0 0 1 72.2,24.4" fill="none" stroke="#FF5D6C" strokeWidth="12" strokeLinecap="round" opacity="0.85" />
            <path d="M72.2,24.4 A90,90 0 0 1 127.8,24.4" fill="none" stroke="#FFC24B" strokeWidth="12" strokeLinecap="round" opacity="0.85" />
            <path d="M127.8,24.4 A90,90 0 0 1 190,110" fill="none" stroke="#3ADD8C" strokeWidth="12" strokeLinecap="round" opacity="0.85" />
            <g style={{ transformOrigin: '100px 110px', transform: `rotate(${rotation}deg)`, transition: 'transform 1s ease' }}>
              <line x1="100" y1="110" x2="100" y2="28" stroke="#E7ECF6" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <circle cx="100" cy="110" r="6" fill="#E7ECF6" />
          </svg>
          <div className="score-value">
            {score || '—'}
            <span>/100</span>
          </div>
        </div>
        <div>
          <div className="field">
            <label>Employer Brand Score (0-100)</label>
            <input value={values.brandScore || ''} onChange={(e) => setValues((v) => ({ ...v, brandScore: e.target.value }))} />
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.5 }}>
            This score drives the gauge on the left. Update it as new survey and review-site data comes in.
          </p>
        </div>
      </div>

      {METRIC_FIELDS.map((group) => (
        <div className="panel" key={group.group}>
          <h3>{group.group}</h3>
          <div className="metric-strip">
            {group.fields.map((f) => (
              <div className="mini-field" key={f.key}>
                <label>{f.label}</label>
                <input value={values[f.key] || ''} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="save-row">
        <button className="btn btn-primary" onClick={handleSave}>
          Save Metrics
        </button>
        <span className={`save-msg ${saved ? 'show' : ''}`}>Saved ✓</span>
      </div>
    </>
  );
}
