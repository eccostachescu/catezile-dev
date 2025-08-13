import { supabase } from '@/integrations/supabase/client';
import { withCacheVersion } from '@/lib/cache';

// Enhanced search component that uses cache-aware fetching
export const useSearchSuggestions = () => {
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) return [];

    try {
      // Use cache-aware URL for search suggestions
      const response = await supabase.functions.invoke('search_suggest', {
        body: { q: query.trim() }
      });

      if (response.error) {
        console.error('Search suggestions error:', response.error);
        return [];
      }

      return response.data?.suggestions || [];
    } catch (error) {
      console.error('Search suggestions failed:', error);
      return [];
    }
  };

  return { fetchSuggestions };
};

// Enhanced TV status component with cache-aware fetching
export const useTVStatus = () => {
  const fetchTVStatus = async () => {
    try {
      const response = await supabase.functions.invoke('tv_now_status');

      if (response.error) {
        console.error('TV status error:', response.error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('TV status failed:', error);
      return null;
    }
  };

  return { fetchTVStatus };
};

// Helper for triggering rebuilds from admin actions
export const triggerManualRebuild = async (reason: string, force = false) => {
  try {
    const { data, error } = await supabase.functions.invoke('rebuild_hook', {
      body: { reason, force }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Manual rebuild failed:', error);
    throw error;
  }
};

// Helper for checking system health
export const checkSystemHealth = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('healthcheck');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default {
  useSearchSuggestions,
  useTVStatus,
  triggerManualRebuild,
  checkSystemHealth
};