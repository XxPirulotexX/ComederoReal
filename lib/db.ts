import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

export async function saveStatus(status: any) {
  await supabase.from('status').insert({
    device_id: status.deviceId ?? 'comedero-01',
    payload: status,
    created_at: new Date().toISOString(),
  });
}

export async function getLastStatus() {
  const { data } = await supabase.from('status')
    .select('payload')
    .eq('device_id', 'comedero-01')
    .order('created_at', { ascending: false })
    .limit(1);
  return data?.[0]?.payload ?? null;
}

export async function pushCommand(deviceId: string, cmd: any) {
  await supabase.from('commands').insert({
    device_id: deviceId, action: cmd.action, station: cmd.station,
    args: cmd.args ?? '', consumed: false, created_at: new Date().toISOString()
  });
}

export async function popCommands(deviceId: string) {
  const { data } = await supabase.from('commands')
    .select('*').eq('device_id', deviceId).eq('consumed', false)
    .order('created_at', { ascending: true }).limit(10);
  if (!data) return [];
  const ids = data.map(c => c.id);
  if (ids.length) await supabase.from('commands').update({ consumed: true }).in('id', ids);
  return data.map(c => ({ id: c.id, action: c.action, station: c.station, args: c.args }));
}
