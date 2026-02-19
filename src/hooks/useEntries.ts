import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Entry } from '@/types/entry';
import { toast } from 'sonner';

export function useEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: Entry[] = (data || []).map((row) => ({
        id: row.id,
        text: row.text,
        folder: row.folder,
        location: row.location || '',
        timestamp: row.timestamp,
        timestampEnd: row.timestamp_end || undefined,
        attachments: {
          photos: row.photo_count || 0,
          audio: row.has_audio || false,
        },
      }));

      setEntries(mapped);

      // Derive unique folders
      const uniqueFolders = [...new Set(mapped.map((e) => e.folder))];
      // Add defaults if empty
      if (uniqueFolders.length === 0) {
        setFolders(['Personal Journal', 'Travel', 'Childhood Memories']);
      } else {
        setFolders(uniqueFolders);
      }
    } catch (err) {
      console.error('Failed to fetch entries:', err);
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = async (data: {
    text: string;
    folder: string;
    location: string;
    dateStart: string;
    dateEnd: string;
    galleryCount: number;
    hasAudio: boolean;
  }) => {
    if (!user) {
      toast.error('You must be logged in to save entries');
      return false;
    }

    try {
      const { error } = await supabase.from('entries').insert({
        user_id: user.id,
        text: data.text,
        folder: data.folder,
        location: data.location || null,
        timestamp: data.dateStart || new Date().toISOString(),
        timestamp_end: data.dateEnd || null,
        photo_count: data.galleryCount,
        has_audio: data.hasAudio,
      });

      if (error) throw error;

      await fetchEntries();
      toast.success('Memory archived successfully!');
      return true;
    } catch (err) {
      console.error('Failed to save entry:', err);
      toast.error('Failed to save entry');
      return false;
    }
  };

  return { entries, folders, loading, addEntry, refetch: fetchEntries };
}
