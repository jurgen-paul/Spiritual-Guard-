import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Check, 
  ExternalLink,
  BookOpen,
  ArrowRight,
  Flame,
  Plus
} from 'lucide-react';
import { ArmorPiece } from '../types/spiritual';
import { spiritualAudio } from '../utils/audioChime';

interface SpiritualArmorSectionProps {
  onAddArmorTask: (task: { title: string; notes: string; due?: string }) => Promise<void>;
  onEquipFullArmor: () => Promise<void>;
  isEquippingAll?: boolean;
}

export const ARMOR_PIECES: ArmorPiece[] = [
  {
    id: 'belt-of-truth',
    name: 'Belt of Truth',
    biblicalName: 'Girdle of Truth',
    icon: '🎗️',
    meaning: 'Honesty, inner integrity, discernment between truth and illusion.',
    affirmation: 'I stand anchored in divine truth. Deception has no hold upon my heart or mind.',
    scripture: 'Stand firm then, with the belt of truth buckled around your waist. (Ephesians 6:14)',
    defaultTaskTitle: '🛡️ Armor: Gird with the Belt of Truth',
    defaultNotes: 'Practice radical honesty in thought and speech. Discard any false narratives or self-deceptions.',
  },
  {
    id: 'breastplate-righteousness',
    name: 'Breastplate of Righteousness',
    biblicalName: 'Thorax of Righteousness',
    icon: '🛡️',
    meaning: 'Guarding the vital heart and emotions; moral purity and aligned conscience.',
    affirmation: 'My heart is guarded by divine righteousness and purity of intention.',
    scripture: '...with the breastplate of righteousness in place. (Ephesians 6:14)',
    defaultTaskTitle: '🛡️ Armor: Fasten the Breastplate of Righteousness',
    defaultNotes: 'Forgive any resentment or malice. Keep your inner sanctuary pure and untainted by offense.',
  },
  {
    id: 'shoes-of-peace',
    name: 'Shoes of Peace',
    biblicalName: 'Sandals of the Gospel of Peace',
    icon: '👟',
    meaning: 'Firm footing, serenity, readiness to bring reconciliation wherever you walk.',
    affirmation: 'Every step I take today brings peace, grounding, and quiet confidence.',
    scripture: '...and with your feet fitted with the readiness that comes from the gospel of peace. (Ephesians 6:15)',
    defaultTaskTitle: '🛡️ Armor: Shod Feet with the Preparation of Peace',
    defaultNotes: 'Walk gently. Refuse to be hurried or agitated. Be a peacemaker in tense conversations.',
  },
  {
    id: 'shield-of-faith',
    name: 'Shield of Faith',
    biblicalName: 'Scutum of Faith',
    icon: '✨',
    meaning: 'Active trust that extinguishes the flaming darts of anxiety, shame, and despair.',
    affirmation: 'My shield of faith extinguishes every fiery arrow of doubt, accusation, and anxiety.',
    scripture: 'In addition to all this, take up the shield of faith, with which you can extinguish all the flaming arrows of the evil one. (Ephesians 6:16)',
    defaultTaskTitle: '🛡️ Armor: Raise the Shield of Faith',
    defaultNotes: 'Whenever anxious or fearful thoughts strike today, actively declare divine trust and refuge.',
  },
  {
    id: 'helmet-of-salvation',
    name: 'Helmet of Salvation',
    biblicalName: 'Galea of Salvation',
    icon: '👑',
    meaning: 'Guarding the mind, memories, imagination, and cognitive discernment.',
    affirmation: 'My mind is protected and renewed. I hold the peace that surpasses human understanding.',
    scripture: 'Take the helmet of salvation... (Ephesians 6:17)',
    defaultTaskTitle: '🛡️ Armor: Don the Helmet of Salvation',
    defaultNotes: 'Guard the gates of your eyes and thoughts. Reject spirals of negative rumination.',
  },
  {
    id: 'sword-of-spirit',
    name: 'Sword of the Spirit',
    biblicalName: 'Machaira of the Spirit',
    icon: '⚔️',
    meaning: 'The living, spoken Word of God; truth proclaimed against darkness.',
    affirmation: 'The sacred Word is alive in my mouth and sharper than any adversity.',
    scripture: '...and the sword of the Spirit, which is the word of God. (Ephesians 6:17)',
    defaultTaskTitle: '🛡️ Armor: Wield the Sword of the Spirit',
    defaultNotes: 'Proclaim scriptures of divine promise aloud over your life, home, and community.',
  },
];

export const SpiritualArmorSection: React.FC<SpiritualArmorSectionProps> = ({
  onAddArmorTask,
  onEquipFullArmor,
  isEquippingAll = false,
}) => {
  const [selectedPiece, setSelectedPiece] = useState<ArmorPiece>(ARMOR_PIECES[0]);
  const [equippedPieces, setEquippedPieces] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('spiritual_equipped_armor');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Meditation timer state
  const [timerDuration, setTimerDuration] = useState<number>(180); // 3 minutes default
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      spiritualAudio.playMeditationChime();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const toggleEquip = (id: string) => {
    const updated = { ...equippedPieces, [id]: !equippedPieces[id] };
    setEquippedPieces(updated);
    try {
      localStorage.setItem('spiritual_equipped_armor', JSON.stringify(updated));
    } catch {}
    if (!equippedPieces[id]) {
      spiritualAudio.playCompletionChime();
    }
  };

  const handleStartTimer = (seconds: number) => {
    setTimerDuration(seconds);
    setTimeLeft(seconds);
    setIsTimerRunning(true);
    spiritualAudio.playMeditationChime();
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const equippedCount = Object.values(equippedPieces).filter(Boolean).length;
  const progressPercent = Math.round((equippedCount / ARMOR_PIECES.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-indigo-950/40 border border-amber-500/30 p-6 shadow-xl backdrop-blur-md overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-3">
              <Shield className="w-3.5 h-3.5" />
              Ephesians 6:10-18 Sacred Armor
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-100 font-serif">
              The Armor of Light & Divine Guard
            </h2>
            <p className="text-sm text-neutral-300 max-w-2xl mt-1 leading-relaxed">
              Equip yourself daily against spiritual fatigue, confusion, and fear. Anchor your soul in truth, peace, and discernment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onEquipFullArmor}
              disabled={isEquippingAll}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {isEquippingAll ? (
                <>
                  <span className="w-4 h-4 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                  Syncing to Google Tasks...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Equip 6 Pieces to Google Tasks
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-neutral-800/80">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Daily Armor Equipping Status</span>
            <span className="font-semibold text-amber-300">{equippedCount} of 6 Pieces Active ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-neutral-950 border border-neutral-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-500 rounded-full shadow-sm shadow-amber-400"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Armor Pieces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ARMOR_PIECES.map((piece) => {
          const isEquipped = !!equippedPieces[piece.id];
          const isSelected = selectedPiece.id === piece.id;

          return (
            <div
              key={piece.id}
              onClick={() => setSelectedPiece(piece)}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? 'bg-neutral-900 border-amber-400 shadow-xl shadow-amber-950/30 ring-1 ring-amber-400/50'
                  : 'bg-neutral-900/70 hover:bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl p-2 rounded-xl bg-neutral-950 border border-neutral-800">
                  {piece.icon}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEquip(piece.id);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isEquipped
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                  }`}
                >
                  {isEquipped ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Equipped
                    </>
                  ) : (
                    'Equip Piece'
                  )}
                </button>
              </div>

              <h3 className="text-base font-bold text-neutral-100 font-serif">
                {piece.name}
              </h3>
              <p className="text-xs text-amber-400/90 font-medium mb-2">
                {piece.biblicalName}
              </p>
              <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                {piece.meaning}
              </p>

              <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 italic">
                  Tap to view contemplation
                </span>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await onAddArmorTask({
                      title: piece.defaultTaskTitle,
                      notes: `${piece.scripture}\n\nAffirmation: ${piece.affirmation}\n\nNotes: ${piece.defaultNotes}`,
                    });
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                  title="Add this piece as a Google Task"
                >
                  <Plus className="w-3 h-3" />
                  Tasks
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Piece Deep Contemplation & Vigil Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{selectedPiece.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-neutral-100 font-serif">
                {selectedPiece.name} Meditation & Discernment
              </h3>
              <p className="text-xs text-amber-400">{selectedPiece.biblicalName}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-neutral-200">
              <span className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                Scriptural Foundation
              </span>
              <p className="text-sm font-serif italic text-amber-100/90">
                "{selectedPiece.scripture}"
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="block text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
                Spiritual Proclamation & Armor Affirmation
              </span>
              <p className="text-sm text-neutral-200 leading-relaxed font-medium">
                "{selectedPiece.affirmation}"
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80">
              <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                Guard Guidance & Practical Application
              </span>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {selectedPiece.defaultNotes}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  onAddArmorTask({
                    title: selectedPiece.defaultTaskTitle,
                    notes: `${selectedPiece.scripture}\n\nAffirmation: ${selectedPiece.affirmation}\n\nDevotional guidance: ${selectedPiece.defaultNotes}`,
                  })
                }
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add to Google Tasks
              </button>

              <button
                type="button"
                onClick={() => toggleEquip(selectedPiece.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  equippedPieces[selectedPiece.id]
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                }`}
              >
                <Check className="w-4 h-4" />
                {equippedPieces[selectedPiece.id] ? 'Equipped for Today' : 'Mark as Equipped'}
              </button>
            </div>
          </div>
        </div>

        {/* Sacred Vigil Contemplation Timer */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h4 className="text-base font-semibold text-neutral-100">
                  Sacred Vigil Timer
                </h4>
              </div>
              <button
                onClick={() => spiritualAudio.playMeditationChime()}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Test singing bowl chime"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Quiet your mind before God. Extinguish daily noise and center your soul on the {selectedPiece.name}.
            </p>

            {/* Timer Visual Ring */}
            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="stroke-neutral-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    className="stroke-amber-400 transition-all duration-1000 ease-linear"
                    strokeWidth="8"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * (timerDuration - timeLeft)) / timerDuration}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold font-mono text-neutral-100">
                    {formatTimer(timeLeft)}
                  </span>
                  <span className="text-[11px] text-amber-400 font-medium tracking-wide">
                    {isTimerRunning ? 'STILLNESS' : 'VIGIL READY'}
                  </span>
                </div>
              </div>
            </div>

            {/* Duration presets */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[60, 180, 300, 600].map((secs) => (
                <button
                  key={secs}
                  onClick={() => handleStartTimer(secs)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    timerDuration === secs
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  {secs / 60}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-4 h-4" /> Pause Vigil
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Begin Contemplation
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimeLeft(timerDuration);
              }}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
