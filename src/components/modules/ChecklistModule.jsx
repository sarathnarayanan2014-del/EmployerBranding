import { useModuleData } from '../../lib/useModuleData';

export default function ChecklistModule({ clientId, moduleId, tabDef }) {
  const { data, loading, save } = useModuleData(clientId, moduleId, {});
  const checked = data || {};

  if (loading) return <div className="panel">Loading…</div>;

  return (
    <div className="panel">
      <h3>{tabDef.label}</h3>
      {tabDef.items.map((label) => (
        <div className="checklist-item" key={label}>
          <input
            type="checkbox"
            checked={!!checked[label]}
            onChange={(e) => save({ ...checked, [label]: e.target.checked })}
          />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
