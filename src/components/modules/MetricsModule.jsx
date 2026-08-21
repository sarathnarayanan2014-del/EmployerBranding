import { useEffect, useState } from 'react';
import { useModuleData } from '../../lib/useModuleData';
import { METRIC_FIELDS } from '../../modules/config';

// Auto-calculates the Employer Brand Score from the other metrics
// instead of asking the admin to type it in by hand.
//
// Formula (weights sum to 100%, and re-normalize if some inputs are
// missing so an incomplete record still gets a sensible score):
//   50% - average of the 5 internal sentiment % fields
//   20% - average of Glassdoor + AmbitionBox ratings (scaled 0-5 -> 0-100)
//   15% - average of Candidate NPS + Employee NPS (scaled -100..100 -> 0-100)
//   15% - retention score = 100 - attrition rate (%)
function computeBrandScore(v) {
  const num = (s) => {
    const n = parseFloat(s);
    return Number.isNaN(n) ? null : n;
  };

  const sentimentKeys = ['employeeSentiment', 'leadershipTrust', 'workLifeBalance', 'careerGrowthScore', 'policySatisfaction'];
  const sentimentVals = sentimentKeys.map((k) => num(v[k])).filter((n) => n !== null);
  const sentimentAvg = sentimentVals.length ? sentimentVals.reduce((a, b) => a + b, 0) / sentimentVals.length : null;

  const reviewVals = [num(v.glassdoor), num(v.ambitionbox)].filter((n) => n !== null).map((n) => (n / 5) * 100);
  const reviewAvg = reviewVals.length ? reviewVals.reduce((a, b) => a + b, 0) / reviewVals.length : null;

  const npsVals = [num(v.candidateNPS), num(v.employeeNPS)].filter((n) => n !== null).map((n) => (n + 100) / 2);
  const npsAvg = npsVals.length ? npsVals.reduce((a, b) => a + b, 0) / npsVals.length : null;

  const attrition = num(v.attrition);
  const retentionScore = attrition !== null ? Math.max(0, 100 - attrition) : null;

  const components = [
    { label: 'Internal Sentiment', value: sentimentAvg, weight: 0.5 },
    { label: 'Review Sites', value: reviewAvg, weight: 0.2 },
    { label: 'NPS', value: npsAvg, weight: 0.15 },
    { label: 'Retention', value: retentionScore, weight: 0.15 },
  ];

  const usable = components.filter((c) => c.value !== null);
  if (!usable.length) return { score: null, components };

  const totalWeight = usable.reduce((a, c) => a + c.weight, 0);
  const weighted = usable.reduce((a, c) => a + c.value * c.weight, 0) / totalWeight;
  return { score: Math.round(weighted), components };
}

export default function MetricsModule({ clientId, moduleId }) {
  const { data, loading, save } = useModuleData(clientId, moduleId, {});
  const [values, setValues] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => setValues(data || {}), [data]);

  if (loading) return <div className="panel">Loading…</div>;

  const { score, components } = computeBrandScore(values);
  const displayScore = score ?? 0;
  const rotation = (Math.min(Math.max(displayScore, 0), 100) / 100) * 180 - 90;

  async function handleSave() {
    // Persist the freshly computed score alongside the raw inputs, so
    // other views/reports can read brandScore directly without
    // recomputing it themselves.
    const toSave = { ...values, brandScore: score !== null ? String(score) : '' };
    await save(toSave);
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
            {score ?? '—'}
            <span>/100</span>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
            Employer Brand Score (0-100) — Auto-calculated
          </label>
          <div style={{ background: 'var(--panel2)', border: '1px solid var(--line)', borderRadius: 7, padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--warn)', marginBottom: 10 }}>
            {score ?? '— (fill in some metrics below)'}
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
            This score is calculated automatically — 50% internal sentiment, 20% review-site ratings, 15% NPS, 15% retention.
            It updates as soon as you edit the fields below and recalculates live before you save.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {components.map((c) => (
              <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                <span>{c.label} ({Math.round(c.weight * 100)}%)</span>
                <span style={{ color: c.value !== null ? 'var(--text)' : 'var(--muted)' }}>
                  {c.value !== null ? Math.round(c.value) : 'no data'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {METRIC_FIELDS.map((group) => (
        <div className="panel" key={group.group}>
          <h3>{group.group}</h3>
          <div className="metric-strip">
            {group.fields
              .filter((f) => f.key !== 'brandScore')
              .map((f) => (
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
