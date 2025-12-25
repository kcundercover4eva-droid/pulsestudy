import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, Target, Trophy } from 'lucide-react';

export default function TeamLeaderboard({ teams }) {
  const sortedTeams = [...teams].sort((a, b) => b.totalXP - a.totalXP);

  return (
    <div className="space-y-4">
      {sortedTeams.map((team, index) => {
        const rank = index + 1;
        
        return (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className="p-5 bg-gradient-to-r from-slate-800 to-slate-900 border-2"
              style={{ borderColor: rank <= 3 ? team.color : '#334155' }}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold"
                  style={{ backgroundColor: team.color + '33' }}
                >
                  {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
                </div>

                {/* Team Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{team.emoji}</span>
                    <h3 className="text-xl font-bold text-white">{team.name}</h3>
                  </div>
                  
                  {team.motto && (
                    <p className="text-sm text-slate-400 mb-2 italic">"{team.motto}"</p>
                  )}

                  {/* Team Stats */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Zap className="w-4 h-4" />
                      <span className="font-bold">{team.totalXP.toLocaleString()} XP</span>
                    </div>
                    <div className="flex items-center gap-1 text-cyan-400">
                      <Target className="w-4 h-4" />
                      <span>{team.questsCompleted} quests</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{team.memberIds?.length || 0} members</span>
                    </div>
                  </div>
                </div>

                {/* Trophy for top 3 */}
                {rank <= 3 && (
                  <Trophy 
                    className="w-8 h-8" 
                    style={{ color: team.color }}
                  />
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}