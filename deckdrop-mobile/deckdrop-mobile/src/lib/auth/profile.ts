import type {User} from '@supabase/supabase-js';
import type {UserProfile} from '../../types';

export const toUserProfile = (user: User): UserProfile => ({
  id: user.id,
  full_name: user.user_metadata.full_name || user.email?.split('@')[0] || 'Berry Co. Collector',
  email: user.email || '',
  phone: user.phone || undefined,
  role: 'customer',
  status: 'active',
  created_at: user.created_at,
  reward_points: 0,
});