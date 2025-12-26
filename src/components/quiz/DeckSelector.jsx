import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Layers, Edit, Trash2, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function DeckSelector({ onSelectDeck, onManageDecks }) {
  const { data: decks = [], isLoading } = useQuery({
    queryKey: ['decks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Deck.filter({ created_by: user.email }, '-created_date');
    },
  });

  if (isLoading) {
    return <div className="p-10 text-center text-white/60">Loading decks...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Study Decks</h2>
          <p className="text-white/60">Select a deck to start studying</p>
        </div>
        <Button
          onClick={onManageDecks}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Manage Decks
        </Button>
      </div>

      {decks.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
          <Layers className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No decks yet</h3>
          <p className="text-white/60 mb-6">Create your first deck to organize your flashcards</p>
          <Button onClick={onManageDecks} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Deck
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck, index) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="bg-slate-800 border-slate-700 p-6 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onSelectDeck(deck)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: deck.color + '40', border: `2px solid ${deck.color}` }}
                  >
                    <BookOpen className="w-6 h-6" style={{ color: deck.color }} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{deck.name}</h3>
                {deck.description && (
                  <p className="text-white/60 text-sm mb-4 line-clamp-2">{deck.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-white/80 font-bold">{deck.cardCount || 0}</span>
                    <span className="text-white/40 ml-1">cards</span>
                  </div>
                  <span className="text-xs text-white/40 capitalize">{deck.subject}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}