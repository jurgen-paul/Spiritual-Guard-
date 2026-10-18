export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
  position?: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string; // RFC 3339 format, e.g. "2026-10-18T00:00:00.000Z"
  completed?: string;
  deleted?: boolean;
  hidden?: boolean;
}

export type SpiritualCategory = 
  | 'armor'
  | 'prayer'
  | 'scripture'
  | 'discernment'
  | 'fasting'
  | 'grace';

export interface ArmorPiece {
  id: string;
  name: string;
  biblicalName: string;
  icon: string;
  meaning: string;
  affirmation: string;
  scripture: string;
  defaultTaskTitle: string;
  defaultNotes: string;
}

export interface AiDiscernmentResult {
  content: string;
  spiritualStateAssessment?: string;
  armorPiece?: string;
  suggestedTasks?: Array<{
    title: string;
    notes: string;
    dueOffsetHours?: number;
  }>;
}

export interface ConfirmationDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void> | void;
}
