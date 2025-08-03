import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  Coffee, 
  Moon, 
  Sun, 
  Headphones,
  Sparkles,
  Focus,
  Heart,
  TreePine
} from "lucide-react";

interface Playlist {
  id: string;
  name: string;
  mood: string;
  description: string;
  embedUrl: string;
  icon: any;
  color: string;
}

const playlists: Playlist[] = [
  {
    id: "focused",
    name: "Deep Focus",
    mood: "Focused",
    description: "Instrumental beats for maximum concentration",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0",
    icon: Brain,
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200"
  },
  {
    id: "energized",
    name: "Energy Boost",
    mood: "Energized", 
    description: "Upbeat tracks to power through tasks",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd?utm_source=generator&theme=0",
    icon: Zap,
    color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
  },
  {
    id: "tired",
    name: "Gentle Wake-Up",
    mood: "Tired",
    description: "Soft melodies to gently energize",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX1s9knjP51Oa?utm_source=generator&theme=0",
    icon: Coffee,
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200"
  },
  {
    id: "calm",
    name: "Zen Zone",
    mood: "Calm",
    description: "Peaceful sounds for relaxed productivity",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWU0ScTcjJBdj?utm_source=generator&theme=0",
    icon: Heart,
    color: "bg-green-100 text-green-700 hover:bg-green-200"
  },
  {
    id: "distracted",
    name: "Focus Flow",
    mood: "Distracted",
    description: "Minimal music to regain concentration",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX3rxVfibe1L0?utm_source=generator&theme=0",
    icon: Focus,
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200"
  },
  {
    id: "creative", 
    name: "Creative Spark",
    mood: "Creative",
    description: "Inspiring soundscapes for innovation",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWSiZ3zgHTWqm?utm_source=generator&theme=0",
    icon: Sparkles,
    color: "bg-pink-100 text-pink-700 hover:bg-pink-200"
  },
  {
    id: "evening",
    name: "Evening Wind Down", 
    mood: "Evening",
    description: "Smooth tunes for late work sessions",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX13ZzXoot6Jc?utm_source=generator&theme=0",
    icon: Moon,
    color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
  },
  {
    id: "nature",
    name: "Nature Sounds",
    mood: "Natural",
    description: "Ambient nature sounds for focus",
    embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWOaEBTMWvDjl?utm_source=generator&theme=0",
    icon: TreePine,
    color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
  }
];

export const FocusPlaylistSection = () => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(playlists[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Headphones className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Your Focus Playlist</h2>
      </div>

      {/* Mood Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {playlists.map((playlist) => {
          const Icon = playlist.icon;
          const isSelected = selectedPlaylist?.id === playlist.id;
          
          return (
            <Button
              key={playlist.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSelectedPlaylist(playlist)}
              className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 ${
                isSelected 
                  ? "bg-primary/10 border-primary/20 text-primary" 
                  : "hover:bg-muted/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{playlist.mood}</span>
            </Button>
          );
        })}
      </div>

      {/* Selected Playlist */}
      {selectedPlaylist && (
        <Card className="p-6 bg-white/50 backdrop-blur-sm border border-primary/10">
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedPlaylist.color}`}>
              <selectedPlaylist.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {selectedPlaylist.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedPlaylist.description}
              </p>
              <Badge variant="secondary" className="text-xs">
                {selectedPlaylist.mood} Mood
              </Badge>
            </div>
          </div>
          
          {/* Spotify Embed */}
          <div className="rounded-xl overflow-hidden">
            <iframe
              src={selectedPlaylist.embedUrl}
              width="100%"
              height="60vh"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl min-h-[300px] md:min-h-[60vh]"
              title={`${selectedPlaylist.name} playlist`}
              style={{ border: 'none' }}
            />
          </div>
        </Card>
      )}
    </div>
  );
};