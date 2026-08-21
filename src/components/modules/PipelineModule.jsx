import { useModuleData } from '../../lib/useModuleData';

const CYCLE = ['Not Started', 'In Progress', 'Done'];

export default function PipelineModule({ clientId, moduleId, tabDef }) {
  const { data, loading, save } = useModuleData(clientId, moduleId, {});
  const statuses = data || {};

  if (loading) return <div className="panel">Loading…</div>;

  function advance(stage) {
    const cur = statuses[stage] || 'Not Started';
    const next = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
    save({ ...statuses, [stage]: next });
  }

  return (
    <div className="panel">
      <h3>{tabDef.label}</h3>
      <div className="pipeline-row">
        {tabDef.stages.map((s) => {
          const status = statuses[s] || 'Not Started';
          return (
            <div className="pstage" key={s}>
              <div className="pname">{s}</div>
              <button className="pstatus-btn" data-status={status} onClick={() => advance(s)}>
                {status}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
