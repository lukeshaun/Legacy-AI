import React, { useState, useMemo } from 'react';
import { MapPin, Calendar, ImageIcon, Mic, Globe } from 'lucide-react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { Entry } from '@/types/entry';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Simple geocoding lookup for demo locations
const LOCATION_COORDS: Record<string, [number, number]> = {
  'paris, france': [2.3522, 48.8566],
  'new york, usa': [-74.006, 40.7128],
  'london, uk': [-0.1276, 51.5074],
  'tokyo, japan': [139.6917, 35.6895],
  'sydney, australia': [151.2093, -33.8688],
  'rome, italy': [12.4964, 41.9028],
  'berlin, germany': [13.405, 52.52],
  'los angeles, usa': [-118.2437, 34.0522],
  'san francisco, usa': [-122.4194, 37.7749],
  'chicago, usa': [-87.6298, 41.8781],
  'toronto, canada': [-79.3832, 43.6532],
  'dubai, uae': [55.2708, 25.2048],
  'mumbai, india': [72.8777, 19.076],
  'beijing, china': [116.4074, 39.9042],
  'cairo, egypt': [31.2357, 30.0444],
  'rio de janeiro, brazil': [-43.1729, -22.9068],
  'cape town, south africa': [18.4241, -33.9249],
  'bangkok, thailand': [100.5018, 13.7563],
  'singapore': [103.8198, 1.3521],
  'amsterdam, netherlands': [4.9041, 52.3676],
  'barcelona, spain': [2.1734, 41.3851],
  'moscow, russia': [37.6173, 55.7558],
  'istanbul, turkey': [28.9784, 41.0082],
  'seoul, south korea': [126.978, 37.5665],
  'mexico city, mexico': [-99.1332, 19.4326],
};

function getCoords(location: string): [number, number] | null {
  const key = location.toLowerCase().trim();
  if (LOCATION_COORDS[key]) return LOCATION_COORDS[key];
  for (const [k, v] of Object.entries(LOCATION_COORDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

interface TimelineTabProps {
  entries: Entry[];
}

const TimelineTab: React.FC<TimelineTabProps> = ({ entries }) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const markers = useMemo(() => {
    return entries
      .map((entry) => {
        const coords = getCoords(entry.location);
        if (!coords) return null;
        return { ...entry, coords };
      })
      .filter(Boolean) as (Entry & { coords: [number, number] })[];
  }, [entries]);

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-2xl font-display font-bold mb-2">Location Timeline</h2>
      <p className="text-sm text-muted-foreground mb-6">Your memories mapped across the world.</p>

      {/* Interactive Map */}
      <div className="bg-card rounded-3xl border border-border shadow-soft overflow-hidden mb-10">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <Globe size={16} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">World Map</span>
          <span className="ml-auto text-xs text-muted-foreground">{markers.length} pinned locations</span>
        </div>
        <div className="relative" style={{ aspectRatio: '2 / 1' }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 130, center: [10, 30] }}
            style={{ width: '100%', height: '100%' }}
          >
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="hsl(var(--muted))"
                      stroke="hsl(var(--border))"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: { fill: 'hsl(var(--secondary))', outline: 'none' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  coordinates={marker.coords}
                  onMouseEnter={() => setHoveredId(marker.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedId(selectedId === marker.id ? null : marker.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    r={selectedId === marker.id ? 7 : hoveredId === marker.id ? 6 : 4}
                    fill="hsl(var(--primary))"
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                    style={{ transition: 'r 0.2s ease' }}
                  />
                  {(hoveredId === marker.id || selectedId === marker.id) && (
                    <g>
                      <circle
                        r={12}
                        fill="hsl(var(--primary) / 0.15)"
                        style={{ transition: 'all 0.2s ease' }}
                      />
                      <text
                        textAnchor="middle"
                        y={-16}
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '8px',
                          fontWeight: 700,
                          fill: 'hsl(var(--foreground))',
                        }}
                      >
                        {marker.location}
                      </text>
                    </g>
                  )}
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </div>

      {/* Timeline list */}
      <div className="relative border-l-2 border-border ml-4 pl-8 space-y-10">
        {entries.map((entry) => {
          const isHighlighted = selectedId === entry.id;
          return (
            <div
              key={entry.id}
              className="relative"
              onClick={() => setSelectedId(selectedId === entry.id ? null : entry.id)}
            >
              <div className={`absolute -left-[41px] top-1 w-4 h-4 rounded-full border-4 border-card shadow-sm transition-colors ${isHighlighted ? 'bg-accent' : 'bg-primary'}`} />
              <div className={`bg-card p-6 rounded-3xl border shadow-soft cursor-pointer transition-all ${isHighlighted ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <MapPin size={16} />
                    {entry.location}
                  </div>
                  <div className="flex gap-2">
                    {entry.attachments.photos > 0 && <ImageIcon size={14} className="text-primary/50" />}
                    {entry.attachments.audio && <Mic size={14} className="text-success/70" />}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 mb-3">{entry.text}</p>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  <span>{entry.folder}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={10} /> {entry.timestamp}
                    {entry.timestampEnd && ` — ${entry.timestampEnd}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineTab;
