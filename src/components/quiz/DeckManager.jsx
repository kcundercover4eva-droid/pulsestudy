import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, ArrowLeft, Save, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'
];

export default function DeckManager({ onBack }) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: 'other',
    color: '#10b981'
  });

  const { data: decks = [] } = useQuery({
    queryKey: ['decks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Deck.filter({ created_by: user.email }, '-created_date');
    },
  });

  const createDeckMutation = useMutation({
    mutationFn: (data) => base44.entities.Deck.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['decks']);
      toast.success('Deck created successfully!');
      resetForm();
    },
  });

  const updateDeckMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Deck.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['decks']);
      toast.success('Deck updated successfully!');
      resetForm();
    },
  });

  const deleteDeckMutation = useMutation({
    mutationFn: async (deckId) => {
      // Delete all flashcards in this deck
      const user = await base44.auth.me();
      const cards = await base44.entities.Flashcard.filter({ deckId, created_by: user.email });
      await Promise.all(cards.map(card => base44.entities.Flashcard.delete(card.id)));
      
      // Delete the deck
      await base44.entities.Deck.delete(deckId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['decks']);
      queryClient.invalidateQueries(['flashcards']);
      toast.success('Deck deleted successfully!');
      setDeleteConfirm(null);
    },
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', subject: 'other', color: '#10b981' });
    setIsCreating(false);
    setEditingDeck(null);
  };

  const handleEdit = (deck) => {
    setFormData({
      name: deck.name,
      description: deck.description || '',
      subject: deck.subject,
      color: deck.color
    });
    setEditingDeck(deck);
    setIsCreating(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Please enter a deck name');
      return;
    }

    if (editingDeck) {
      updateDeckMutation.mutate({ id: editingDeck.id, data: formData });
    } else {
      createDeckMutation.mutate(formData);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack} className="border-white/10 text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white">Manage Decks</h2>
          <p className="text-white/60">Create and organize your study decks</p>
        </div>
      </div>

      {/* Create/Edit Form */}
      {isCreating ? (
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-white">Deck Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Biology Chapter 5"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Subject</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Math</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Color</Label>
              <div className="flex gap-2 mt-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg transition-all ${formData.color === color ? 'ring-2 ring-white scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Save className="w-4 h-4 mr-2" />
                {editingDeck ? 'Update Deck' : 'Create Deck'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="border-white/10 text-white">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button onClick={() => setIsCreating(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
          <Plus className="w-4 h-4 mr-2" />
          Create New Deck
        </Button>
      )}

      {/* Decks List */}
      <div className="space-y-3">
        <AnimatePresence>
          {decks.map((deck) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl"
                      style={{ backgroundColor: deck.color + '40', border: `2px solid ${deck.color}`, color: deck.color }}
                    >
                      {deck.cardCount || 0}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{deck.name}</h3>
                      {deck.description && (
                        <p className="text-white/60 text-sm">{deck.description}</p>
                      )}
                      <p className="text-white/40 text-xs capitalize mt-1">{deck.subject}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(deck)}
                      className="border-white/10 text-white hover:bg-white/5"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteConfirm(deck)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {decks.length === 0 && !isCreating && (
          <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
            <p className="text-white/60">No decks yet. Create one to get started!</p>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-slate-900 text-white border-white/10">
          <DialogHeader>
            <DialogTitle>Delete Deck?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white/80 mb-2">
              Are you sure you want to delete "<span className="font-bold">{deleteConfirm?.name}</span>"?
            </p>
            <p className="text-red-400 text-sm">
              This will also delete all {deleteConfirm?.cardCount || 0} flashcards in this deck.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="border-white/10">
              Cancel
            </Button>
            <Button
              onClick={() => deleteDeckMutation.mutate(deleteConfirm.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}