import React, { useState } from 'react';
import { BookOpen, Shield, Plus, RefreshCw, Quote, Heart } from 'lucide-react';

interface DailyVersesProps {
  onAddVerseTask: (task: { title: string; notes: string; due?: string }) => Promise<void>;
}

const SACRED_VERSES = [
  {
    reference: 'Psalm 91:1-2',
    text: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, "He is my refuge and my fortress, my God, in whom I trust."',
    reflection: 'Divine protection is not a physical barrier, but an inner abiding peace. When thoughts race, retreat into the secret place of silence.',
    taskTitle: '📖 Scripture Meditation: Psalm 91 Refuge',
  },
  {
    reference: 'Isaiah 54:17',
    text: '"No weapon forged against you will prevail, and you will refute every tongue that accuses you. This is the heritage of the servants of the Lord."',
    reflection: 'False accusations, self-doubt, and spiritual intimidation lose all leverage against a heart washed in integrity and divine grace.',
    taskTitle: '📖 Scripture Meditation: Isaiah 54 Victory & Heritage',
  },
  {
    reference: '2 Thessalonians 3:3',
    text: 'But the Lord is faithful, and he will strengthen you and protect you from the evil one.',
    reflection: 'Strength does not originate from human willpower, but from resting in divine faithfulness. You do not stand alone.',
    taskTitle: '📖 Scripture Meditation: 2 Thessalonians 3 Faithfulness',
  },
  {
    reference: 'Philippians 4:6-7',
    text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
    reflection: 'Thanksgiving is the ultimate shield. When gratitude replaces anxiety, the supernatural peace of God stands sentinel over your thoughts.',
    taskTitle: '📖 Scripture Meditation: Philippians 4 Guarded Peace',
  },
  {
    reference: 'Proverbs 4:23',
    text: 'Above all else, guard your heart, for everything you do flows from it.',
    reflection: 'Your heart is the fountainhead of your life. Filter what enters your eyes, ears, and conversations with sacred discernment.',
    taskTitle: '📖 Scripture Meditation: Proverbs 4 Guarding the Heart',
  },
  {
    reference: 'Romans 12:2',
    text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God’s will is—his good, pleasing and perfect will.',
    reflection: 'A renewed mind perceives what worldly panic cannot. Stand detached from ambient panic and tune your spirit to the divine rhythm.',
    taskTitle: '📖 Scripture Meditation: Romans 12 Mind Renewal',
  },
];

export const DailyVerses: React.FC<DailyVersesProps> = ({ onAddVerseTask }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  const activeVerse = SACRED_VERSES[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SACRED_VERSES.length);
  };

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await onAddVerseTask({
        title: activeVerse.taskTitle,
        notes: `"${activeVerse.text}" (${activeVerse.reference})\n\nContemplation:\n${activeVerse.reflection}`,
        due: new Date().toISOString(),
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-100 font-serif">
              Sacred Guard Scripture of the Day
            </h3>
            <p className="text-xs text-neutral-400">
              Timeless divine promises for spiritual resilience
            </p>
          </div>
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
          title="Next scripture verse"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Next Verse
        </button>
      </div>

      <div className="p-5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 relative">
        <Quote className="w-8 h-8 text-amber-500/20 absolute top-4 right-4 pointer-events-none" />
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
          {activeVerse.reference}
        </span>
        <blockquote className="text-base md:text-lg font-serif italic text-neutral-100 leading-relaxed mb-3">
          "{activeVerse.text}"
        </blockquote>
        <p className="text-xs md:text-sm text-neutral-400 leading-relaxed pt-2 border-t border-neutral-800/60">
          <strong className="text-amber-400/90 font-medium font-sans">Discernment Note: </strong>
          {activeVerse.reflection}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          Verse {currentIndex + 1} of {SACRED_VERSES.length}
        </span>
        <button
          onClick={handleAdd}
          disabled={isAdding}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAdding ? 'Adding to Google Tasks...' : 'Add to Google Tasks'}
        </button>
      </div>
    </div>
  );
};
