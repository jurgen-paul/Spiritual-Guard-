import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  Calendar, 
  Shield, 
  Sparkles, 
  BookOpen, 
  HeartHandshake, 
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleTask } from '../types/spiritual';
import { spiritualAudio } from '../utils/audioChime';

interface TaskItemProps {
  task: GoogleTask;
  onToggleStatus: (task: GoogleTask) => Promise<void>;
  onEdit: (task: GoogleTask) => void;
  onDeleteRequest: (task: GoogleTask) => void;
  isUpdating?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDeleteRequest,
  isUpdating = false,
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const isCompleted = task.status === 'completed';

  // Determine category badge based on text content
  const lowerTitle = (task.title + ' ' + (task.notes || '')).toLowerCase();
  let categoryTag = {
    label: 'Spiritual Task',
    icon: Sparkles,
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  };

  if (lowerTitle.includes('armor') || lowerTitle.includes('shield') || lowerTitle.includes('helmet') || lowerTitle.includes('sword') || lowerTitle.includes('guard')) {
    categoryTag = {
      label: 'Spiritual Armor',
      icon: Shield,
      color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    };
  } else if (lowerTitle.includes('prayer') || lowerTitle.includes('vigil') || lowerTitle.includes('petition') || lowerTitle.includes('intercession')) {
    categoryTag = {
      label: 'Prayer & Vigil',
      icon: Flame,
      color: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    };
  } else if (lowerTitle.includes('scripture') || lowerTitle.includes('psalm') || lowerTitle.includes('verse') || lowerTitle.includes('read') || lowerTitle.includes('study')) {
    categoryTag = {
      label: 'Sacred Word',
      icon: BookOpen,
      color: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    };
  } else if (lowerTitle.includes('grace') || lowerTitle.includes('forgive') || lowerTitle.includes('mercy') || lowerTitle.includes('bless')) {
    categoryTag = {
      label: 'Grace & Deeds',
      icon: HeartHandshake,
      color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    };
  }

  const handleToggle = async () => {
    if (isUpdating) return;

    if (!isCompleted) {
      // Trigger festive spiritual celebration & chime!
      spiritualAudio.playCompletionChime();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#60A5FA', '#34D399', '#A78BFA'],
      });
    }

    await onToggleStatus(task);
  };

  const formatDueDate = (dueStr?: string) => {
    if (!dueStr) return null;
    const date = new Date(dueStr);
    if (isNaN(date.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return taskDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const CategoryIcon = categoryTag.icon;
  const formattedDue = formatDueDate(task.due);

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-200 ${
        isCompleted
          ? 'bg-neutral-900/40 border-neutral-800/60 opacity-75'
          : 'bg-neutral-900/80 hover:bg-neutral-900 border-neutral-800 hover:border-amber-500/40 shadow-lg shadow-black/20'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button
          onClick={handleToggle}
          disabled={isUpdating}
          className="mt-0.5 text-neutral-400 hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-full cursor-pointer disabled:opacity-50"
          title={isCompleted ? 'Mark uncompleted' : 'Mark completed in Google Tasks'}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/10" />
          ) : (
            <Circle className="w-5 h-5 text-neutral-500 group-hover:text-amber-400 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryTag.color}`}
            >
              <CategoryIcon className="w-3 h-3" />
              {categoryTag.label}
            </span>

            {formattedDue && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                formattedDue === 'Today' || formattedDue === 'Yesterday'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}>
                <Calendar className="w-3 h-3" />
                {formattedDue}
              </span>
            )}
          </div>

          <h4
            className={`text-sm md:text-base font-medium leading-snug transition-all ${
              isCompleted ? 'line-through text-neutral-500' : 'text-neutral-100'
            }`}
          >
            {task.title}
          </h4>

          {task.notes && (
            <div className="mt-1.5">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <span>{showNotes ? 'Hide devotion notes' : 'View devotion notes'}</span>
                {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showNotes && (
                <div className="mt-2 text-xs md:text-sm text-neutral-300 bg-neutral-950/70 p-3 rounded-lg border border-neutral-800/80 whitespace-pre-wrap leading-relaxed">
                  {task.notes}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            disabled={isUpdating}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Edit task in Google Tasks"
            aria-label="Edit task"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteRequest(task)}
            disabled={isUpdating}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete task from Google Tasks"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
