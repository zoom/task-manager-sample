import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getZoomUsersByIds(userIds: string[]) {
  const { data, error } = await supabase
    .from('zoom_users')
    .select('id, first_name, last_name')
    .in('id', userIds);
  if (error) {
    console.error('Error fetching zoom users:', error);
    return [];
  }
  return data;
}
