import React, { useState, useEffect } from 'react';
import { X, Save, Edit3 } from 'lucide-react';
import { GoogleTask } from '../types/spiritual';

interface EditTaskModalProps {
  task: GoogleTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: GoogleTask, updates: { title: string; notes?: string; due?: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [due, setDue] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setNotes(task.notes || '');
      if (task.due) {
        const date = new Date(task.due);
        if (!isNaN(date.getTime())) {
          setDue(date.toISOString().split('T')[0]);
        } else {
          setDue('');
        }
      } else {
        setDue('');
      }
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    await onSubmit(task, {
      title: title.trim(),
      notes: notes.trim() || undefined,
      due: due ? new Date(due + 'T00:00:00.000Z').toISOString() : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700/80 p-6 shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-title"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="edit-task-title" className="text-lg font-semibold text-neutral-100">
                Edit Spiritual Task
              </h3>
              <p className="text-xs text-neutral-400">
                Update task details in your Google Tasks account
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Task Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Devotional Notes / Scripture Focus
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-neutral-200 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-neutral-200 focus:outline-none focus:border-amber-500"
            />
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save to Google Tasks
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
