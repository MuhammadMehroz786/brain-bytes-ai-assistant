import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_session_date: string | null;
}

export const StreakCounter = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    current_streak: 0,
    longest_streak: 0,
    last_session_date: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_streaks')
          .select('current_streak, longest_streak, last_session_date')
          .eq('user_id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // No streak record exists yet
          setStreakData({
            current_streak: 0,
            longest_streak: 0,
            last_session_date: null
          });
        } else if (data) {
          setStreakData(data);
        }
      } catch (error) {
        console.error('Error fetching streak data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreakData();
  }, []);

  const isStreakActive = () => {
    if (!streakData.last_session_date) return false;
    
    const lastSession = new Date(streakData.last_session_date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return lastSession.toDateString() === today.toDateString() || 
           lastSession.toDateString() === yesterday.toDateString();
  };

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center animate-pulse">
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Loading streak...</h4>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center border border-orange-200">
            <Flame className={`w-4 h-4 ${isStreakActive() ? 'text-orange-500' : 'text-gray-400'}`} />
          </div>
          <div>
            <h4 className="font-medium text-foreground">Focus Streak</h4>
            <p className="text-sm text-muted-foreground">
              {streakData.current_streak > 0 ? 
                `${streakData.current_streak} day${streakData.current_streak > 1 ? 's' : ''} in a row` : 
                'Start your streak today!'
              }
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">
            {streakData.current_streak}
          </div>
          {streakData.longest_streak > 0 && (
            <Badge variant="outline" className="text-xs mt-1">
              Best: {streakData.longest_streak}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};