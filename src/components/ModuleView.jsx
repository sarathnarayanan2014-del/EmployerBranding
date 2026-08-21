import FormModule from './modules/FormModule';
import ListModule from './modules/ListModule';
import ChecklistModule from './modules/ChecklistModule';
import PipelineModule from './modules/PipelineModule';
import MetricsModule from './modules/MetricsModule';
import { TAB_DEFS } from '../modules/config';

export default function ModuleView({ clientId, moduleId }) {
  const tabDef = TAB_DEFS[moduleId];
  if (!tabDef) return null;

  switch (tabDef.type) {
    case 'form':
      return <FormModule clientId={clientId} moduleId={moduleId} tabDef={tabDef} />;
    case 'list':
      return <ListModule clientId={clientId} moduleId={moduleId} tabDef={tabDef} />;
    case 'checklist':
      return <ChecklistModule clientId={clientId} moduleId={moduleId} tabDef={tabDef} />;
    case 'pipeline':
      return <PipelineModule clientId={clientId} moduleId={moduleId} tabDef={tabDef} />;
    case 'metrics':
      return <MetricsModule clientId={clientId} moduleId={moduleId} />;
    default:
      return null;
  }
}
