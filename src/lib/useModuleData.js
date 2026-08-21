import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

// Loads/saves the JSONB `data` blob for one (clientId, moduleId) pair
// in the module_data table. RLS ensures company users can only touch
// rows for their own client_id.
export function useModuleData(clientId, moduleId, defaultValue) {
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!clientId || !moduleId) return;
    setLoading(true);
    const { data: row, error } = await supabase
      .from('module_data')
      .select('data')
      .eq('client_id', clientId)
      .eq('module_id', moduleId)
      .maybeSingle();
    if (error) {
      console.error('load module_data failed', error);
      setData(defaultValue);
    } else {
      setData(row?.data ?? defaultValue);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, moduleId]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(newData) {
    const { error } = await supabase
      .from('module_data')
      .upsert(
        { client_id: clientId, module_id: moduleId, data: newData, updated_at: new Date().toISOString() },
        { onConflict: 'client_id,module_id' }
      );
    if (error) {
      console.error('save module_data failed', error);
      return false;
    }
    setData(newData);
    return true;
  }

  return { data, loading, save, reload: load };
}
