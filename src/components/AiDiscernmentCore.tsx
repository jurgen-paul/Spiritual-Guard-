import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Shield, 
  Compass, 
  Plus, 
  Check, 
  HelpCircle, 
  RefreshCw,
  Lightbulb,
  Heart,
  ChevronRight
} from 'lucide-react';
import { AiDiscernmentResult } from '../types/spiritual';

interface AiDiscernmentCoreProps {
  onAddTask: (task: { title: string; notes: string; due?: string }) => Promise<void>;
}

const DISCERNMENT_PROMPTS = [
  {
    label: 'Shield Against Anxiety',
    prompt: 'I feel a wave of anxiety, overwhelm, and mental fatigue today. Help me discern what is real versus what is fear, and give me a spiritual guard routine to restore divine peace.',
    icon: Shield,
  },
  {
    label: 'Decision Discernment',
    prompt: 'I am facing an important life decision and want to discern between worldly ambition/pressure versus peaceful divine wisdom. How can I test my motives and walk in wisdom?',
    icon: Compass,
  },
  {
    label: 'Guarding Emotional Boundaries',
    prompt: 'I am dealing with toxic communication and conflict in my circle. How do I put on the spiritual guard of righteousness and peace without harboring bitterness?',
    icon: Heart,
  },
  {
    label: 'Morning Vigil & Focus',
    prompt: 'Help me craft a 4-step spiritual vigilance routine for today to keep my heart guarded and my focus aligned with truth.',
    icon: Lightbulb,
  },
];

export const AiDiscernmentCore: React.FC<AiDiscernmentCoreProps> = ({ onAddTask }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiDiscernmentResult | null>(null);
  const [addedTasks, setAddedTasks] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (queryText?: string) => {
    const activeText = queryText || prompt;
    if (!activeText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setAddedTasks({});

    try {
      const res = await fetch('/api/ai/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activeText,
          context: {
            app: 'Spiritual Guard AI Core',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: AiDiscernmentResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Error fetching AI guidance:', err);
      setError('Unable to reach the Spiritual Guard discernment engine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTaskItem = async (task: { title: string; notes: string; dueOffsetHours?: number }, index: number) => {
    const due = new Date();
    if (task.dueOffsetHours) {
      due.setHours(due.getHours() + task.dueOffsetHours);
    }
    
    await onAddTask({
      title: task.title,
      notes: task.notes,
      due: due.toISOString(),
    });

    setAddedTasks((prev) => ({ ...prev, [index]: true }));
  };

  const handleAddAllTasks = async () => {
    if (!result?.suggestedTasks) return;
    for (let i = 0; i < result.suggestedTasks.length; i++) {
      if (!addedTasks[i]) {
        await handleAddTaskItem(result.suggestedTasks[i], i);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-neutral-100 font-serif">
              Spiritual Guard AI Discernment Core
            </h2>
            <p className="text-xs text-neutral-400">
              Seek wisdom, test spiritual atmospheres, and convert spiritual clarity into actionable Google Tasks.
            </p>
          </div>
        </div>

        {/* Prompt Suggestions */}
        <div className="mt-5">
          <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2.5">
            Discernment Focus Areas
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {DISCERNMENT_PROMPTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(item.prompt);
                    handleGenerate(item.prompt);
                  }}
                  disabled={isLoading}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-950/70 hover:bg-neutral-800/80 border border-neutral-800 hover:border-amber-500/40 text-left transition-all group cursor-pointer disabled:opacity-50"
                >
                  <Icon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-neutral-200">
                      {item.label}
                    </span>
                    <span className="block text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                      {item.prompt}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Query Input */}
        <div className="mt-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="flex flex-col sm:flex-row items-stretch gap-2.5"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask for spiritual discernment, prayer protection, or scriptural armor..."
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors pr-10"
              />
              {prompt && (
                <button
                  type="button"
                  onClick={() => setPrompt('')}
                  className="absolute right-3 top-3.5 text-neutral-500 hover:text-neutral-300 text-xs"
                >
                  clear
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Discerning...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Discern
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}
      </div>

      {/* AI Results Output */}
      {result && (
        <div className="rounded-2xl bg-neutral-900 border border-amber-500/30 p-6 shadow-2xl relative">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <h3 className="text-lg font-bold text-neutral-100 font-serif">
                Spiritual Discernment & Guidance
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {result.spiritualStateAssessment && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  State: {result.spiritualStateAssessment}
                </span>
              )}
              {result.armorPiece && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {result.armorPiece}
                </span>
              )}
            </div>
          </div>

          {/* Markdown / text content */}
          <div className="prose prose-invert max-w-none text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-neutral-950/60 p-5 rounded-xl border border-neutral-800 mb-6">
            {result.content}
          </div>

          {/* Suggested Tasks */}
          {result.suggestedTasks && result.suggestedTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Recommended Spiritual Guard Tasks
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Commit these guard actions directly to your Google Tasks list
                  </p>
                </div>

                <button
                  onClick={handleAddAllTasks}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add All to Google Tasks
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {result.suggestedTasks.map((t, idx) => {
                  const isAdded = !!addedTasks[idx];
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start justify-between gap-3 group hover:border-neutral-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <span className="block text-sm font-medium text-neutral-200">
                          {t.title}
                        </span>
                        {t.notes && (
                          <span className="block text-xs text-neutral-400 mt-1 line-clamp-2">
                            {t.notes}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddTaskItem(t, idx)}
                        disabled={isAdded}
                        className={`shrink-0 p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold'
                        }`}
                        title={isAdded ? 'Added to Google Tasks' : 'Add to Google Tasks'}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
