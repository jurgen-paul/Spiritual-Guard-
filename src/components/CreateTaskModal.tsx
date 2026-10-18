import React, { useState } from 'react';
import { X, Sparkles, Plus, Calendar, BookOpen, Shield, Flame, HeartHandshake } from 'lucide-react';
import { GoogleTaskList } from '../types/spiritual';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { title: string; notes?: string; due?: string }) => Promise<void>;
  lists: GoogleTaskList[];
  selectedListId: string;
  onSelectListId: (id: string) => void;
  isSubmitting?: boolean;
}

const PRESET_ROUTINES = [
  {
    title: '🛡️ Put on the Full Armor of God (Ephesians 6)',
    notes: 'Declare truth, righteousness, peace, faith, salvation, and the living Word over your day.',
    icon: Shield,
    badge: 'Armor',
  },
  {
    title: '🙏 15-Minute Contemplative Vigil & Centering Prayer',
    notes: 'Be still and know God. Guard your inner sanctuary against noise and worldly haste.',
    icon: Flame,
    badge: 'Vigil',
  },
  {
    title: '📖 Sacred Scripture Meditation (Psalm 91 Shield)',
    notes: 'He who dwells in the shelter of the Most High will rest in the shadow of the Almighty.',
    icon: BookOpen,
    badge: 'Scripture',
  },
  {
    title: '🤝 Act of Compassion & Guarded Speech',
    notes: 'Speak only grace and life today. Guard the gates of your speech with kindness.',
    icon: HeartHandshake,
    badge: 'Grace',
  },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lists,
  selectedListId,
  onSelectListId,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [due, setDue] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    await onSubmit({
      title: title.trim(),
      notes: notes.trim() || undefined,
      due: due ? new Date(due + 'T00:00:00.000Z').toISOString() : undefined,
    });

    setTitle('');
    setNotes('');
    onClose();
  };

  const handleSelectPreset = (preset: { title: string; notes: string }) => {
    setTitle(preset.title);
    setNotes(preset.notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700/80 p-6 shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="create-task-title" className="text-lg font-semibold text-neutral-100">
                New Spiritual Guard Task
              </h3>
              <p className="text-xs text-neutral-400">
                Will be synchronized instantly with your Google Tasks account
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            Spiritual Guard Presets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_ROUTINES.map((preset, idx) => {
              const Icon = preset.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 text-left transition-all group cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-amber-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <span className="block text-xs font-medium text-neutral-200 truncate">
                      {preset.badge}
                    </span>
                    <span className="block text-[11px] text-neutral-400 line-clamp-1">
                      {preset.title.replace(/^[^\s]+\s/, '')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target List selection */}
          {lists.length > 1 && (
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Target Google Tasks List
              </label>
              <select
                value={selectedListId}
                onChange={(e) => onSelectListId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-neutral-200 focus:outline-none focus:border-amber-500"
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Task Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Shield of Faith: Midday Protection Prayer"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Devotional Notes / Scripture Focus
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Scripture verses, personal intentions, prayer points..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-xl text-neutral-300 hover:bg-neutral-800 border border-neutral-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="px-5 py-2 text-sm font-medium rounded-xl text-neutral-950 bg-amber-400 hover:bg-amber-300 transition-colors font-semibold shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                  Adding to Tasks...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Google Tasks
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
