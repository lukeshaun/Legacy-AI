import React, { useMemo, useRef, useState } from 'react';
import { Entry } from '@/types/entry';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Mic, Image, Calendar, Award, TrendingUp, BarChart3, Camera, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProfileTabProps {
  entries: Entry[];
  folders: string[];
}

const LEVELS = [
  { name: 'Newcomer', threshold: 0 },
  { name: 'Collector', threshold: 5 },
  { name: 'Chronicler', threshold: 15 },
  { name: 'Historian', threshold: 30 },
  { name: 'Archivist', threshold: 60 },
  { name: 'Grand Archivist', threshold: 100 },
];

function getLevel(count: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (count >= LEVELS[i].threshold) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }
  return { current, next };
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ProfileTab: React.FC<ProfileTabProps> = ({ entries, folders }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState('Archivist Profile');
  const [motto, setMotto] = useState('Your preservation journey at a glance.');
  const [editingName, setEditingName] = useState(false);
  const [editingMotto, setEditingMotto] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const mottoInputRef = useRef<HTMLInputElement>(null);

  // Load avatar on mount
  React.useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('avatar_url, display_name, motto')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
        if (data?.motto) setMotto(data.motto);
        if (data?.avatar_url) {
          supabase.storage
            .from('user-media')
            .createSignedUrl(data.avatar_url, 3600)
            .then(({ data: urlData }) => {
              if (urlData) setAvatarUrl(urlData.signedUrl);
            });
        }
      });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar/profile.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('user-media')
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: path })
        .eq('id', user.id);
      if (updateErr) throw updateErr;

      const { data: urlData } = await supabase.storage
        .from('user-media')
        .createSignedUrl(path, 3600);
      if (urlData) setAvatarUrl(urlData.signedUrl);
      toast.success('Profile photo updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };
  const stats = useMemo(() => {
    const totalMemories = entries.length;
    const totalPhotos = entries.reduce((sum, e) => sum + (e.attachments.photos || 0), 0);
    const audioEntries = entries.filter((e) => e.attachments.audio).length;

    // Timeline span
    let earliestYear: number | null = null;
    let latestYear: number | null = null;
    entries.forEach((e) => {
      const year = new Date(e.timestamp).getFullYear();
      if (!earliestYear || year < earliestYear) earliestYear = year;
      if (!latestYear || year > latestYear) latestYear = year;
    });
    const spanYears = earliestYear && latestYear ? latestYear - earliestYear : 0;

    // Folder distribution
    const folderCounts: Record<string, number> = {};
    entries.forEach((e) => {
      folderCounts[e.folder] = (folderCounts[e.folder] || 0) + 1;
    });
    const maxFolderCount = Math.max(...Object.values(folderCounts), 1);

    // Activity heatmap — entries per month (last 12 months)
    const now = new Date();
    const monthlyActivity: number[] = Array(12).fill(0);
    entries.forEach((e) => {
      const d = new Date(e.timestamp);
      const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
      if (monthsAgo >= 0 && monthsAgo < 12) {
        monthlyActivity[11 - monthsAgo]++;
      }
    });
    const maxMonthly = Math.max(...monthlyActivity, 1);

    // Month labels for last 12 months
    const monthLabels: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthLabels.push(MONTH_LABELS[d.getMonth()]);
    }

    return {
      totalMemories,
      totalPhotos,
      audioEntries,
      earliestYear,
      latestYear,
      spanYears,
      folderCounts,
      maxFolderCount,
      monthlyActivity,
      maxMonthly,
      monthLabels,
    };
  }, [entries]);

  const { current: level, next: nextLevel } = getLevel(stats.totalMemories);
  const progressToNext = nextLevel
    ? ((stats.totalMemories - level.threshold) / (nextLevel.threshold - level.threshold)) * 100
    : 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative w-32 h-32 rounded-full border-4 border-border bg-muted overflow-hidden group transition-shadow hover:shadow-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Camera size={32} />
            </div>
          )}
          <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera size={24} className="text-background" />
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold tracking-tight">Archivist Profile</h2>
          <p className="text-sm text-muted-foreground mt-1">Your preservation journey at a glance.</p>
        </div>
      </div>

      {/* Archivist Level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award size={18} className="text-primary" />
            Archivist Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-display font-bold text-primary">{level.name}</span>
            {nextLevel && (
              <span className="text-xs text-muted-foreground">
                {nextLevel.threshold - stats.totalMemories} more to {nextLevel.name}
              </span>
            )}
          </div>
          <Progress value={progressToNext} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stats.totalMemories} {stats.totalMemories === 1 ? 'memory' : 'memories'} archived
          </p>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: 'Total Memories', value: stats.totalMemories },
          { icon: Image, label: 'Photos Preserved', value: stats.totalPhotos },
          { icon: Mic, label: 'Voice Recordings', value: stats.audioEntries },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <stat.icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Historical Span */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            Historical Span
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.earliestYear ? (
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <div className="h-1.5 bg-muted rounded-full" />
                <div
                  className="absolute top-0 h-1.5 bg-primary rounded-full transition-all"
                  style={{ width: '100%' }}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm font-mono font-bold">{stats.earliestYear}</span>
                  <span className="text-sm font-mono font-bold">{stats.latestYear}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-display font-bold tabular-nums text-primary">
                  {stats.spanYears}
                </p>
                <p className="text-xs text-muted-foreground">years covered</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No entries yet — start archiving to see your span.</p>
          )}
        </CardContent>
      </Card>

      {/* Archive Composition */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            Archive Composition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.keys(stats.folderCounts).length > 0 ? (
            Object.entries(stats.folderCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([folder, count]) => (
                <div key={folder} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate">{folder}</span>
                    <span className="text-muted-foreground tabular-nums shrink-0 ml-2">
                      {count} {count === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(count / stats.maxFolderCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
          ) : (
            <p className="text-sm text-muted-foreground">No folders yet — entries will appear here by book.</p>
          )}
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Activity — Last 12 Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1.5 h-28">
            {stats.monthlyActivity.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm transition-all"
                  style={{
                    height: `${Math.max((count / stats.maxMonthly) * 100, 4)}%`,
                    backgroundColor: count > 0
                      ? `hsl(var(--primary) / ${0.3 + (count / stats.maxMonthly) * 0.7})`
                      : 'hsl(var(--muted))',
                  }}
                  title={`${stats.monthLabels[i]}: ${count} entries`}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mt-1.5">
            {stats.monthLabels.map((label, i) => (
              <span key={i} className="flex-1 text-center text-[10px] text-muted-foreground">
                {label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
