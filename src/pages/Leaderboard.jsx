import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Users, Calendar, Crown, Sparkles } from 'lucide-react';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import TeamLeaderboard from '../components/leaderboard/TeamLeaderboard';

export default function Leaderboard() {
  const [period, setPeriod] = useState('weekly');
  const [season, setSeason] = useState('current');

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch leaderboard entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['leaderboard', period, season],
    queryFn: async () => {
      const allEntries = await base44.entities.LeaderboardEntry.filter(
        { period, season },
        '-totalXP',
        20
      );
      
      // Calculate ranks
      return allEntries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
    },
  });

  // Fetch teams
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.filter({ isActive: true }, '-totalXP', 20),
  });

  // Get current user's entry
  const currentUserEntry = entries.find(e => e.userId === currentUser?.id);
  const currentUserRank = currentUserEntry?.rank || '-';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">Leaderboards</h1>
          </div>
          <p className="text-white/60">Compete with fellow learners and climb the ranks</p>
        </div>

        {/* Your Rank Card */}
        {currentUserEntry && (
          <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/60 mb-1">Your Current Rank</div>
                <div className="text-4xl font-bold text-white flex items-center gap-2">
                  {currentUserRank <= 3 && <Crown className="w-8 h-8 text-yellow-400" />}
                  #{currentUserRank}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/60 mb-1">Total XP</div>
                <div className="text-3xl font-bold text-yellow-400">
                  {currentUserEntry.totalXP.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="seasonal">This Season</SelectItem>
              <SelectItem value="alltime">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current</SelectItem>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="fall">Fall</SelectItem>
              <SelectItem value="winter">Winter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md bg-slate-800 border border-slate-700">
            <TabsTrigger value="individual">
              <Trophy className="w-4 h-4 mr-2" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="teams">
              <Users className="w-4 h-4 mr-2" />
              Teams
            </TabsTrigger>
          </TabsList>

          {/* Individual Leaderboard */}
          <TabsContent value="individual">
            {isLoading ? (
              <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
                <div className="text-white/60">Loading leaderboard...</div>
              </Card>
            ) : entries.length > 0 ? (
              <LeaderboardTable entries={entries} currentUserId={currentUser?.id} />
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
                <Trophy className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Rankings Yet</h3>
                <p className="text-white/60">Start studying to appear on the leaderboard!</p>
              </Card>
            )}
          </TabsContent>

          {/* Team Leaderboard */}
          <TabsContent value="teams">
            {teams.length > 0 ? (
              <TeamLeaderboard teams={teams} />
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
                <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Teams Yet</h3>
                <p className="text-white/60 mb-4">Create or join a team to compete together!</p>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600">
                  Create Team
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Season Info */}
        {period === 'seasonal' && (
          <Card className="bg-slate-800/30 border-slate-700 p-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Sparkles className="w-4 h-4" />
              <span>Season rankings reset at the start of each season. Weekly rankings reset every Monday.</span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}