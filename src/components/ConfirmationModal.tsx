import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ConfirmationDialogState } from '../types/spiritual';

interface ConfirmationModalProps {
  dialog: ConfirmationDialogState | null;
  onClose: () => void;
  isProcessing?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  dialog,
  onClose,
  isProcessing = false,
}) => {
  if (!dialog || !dialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md rounded-2xl bg-neutral-900 border border-amber-500/30 p-6 shadow-2xl shadow-amber-950/40 text-neutral-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${dialog.isDestructive ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="confirmation-modal-title" className="text-lg font-semibold text-neutral-100">
              {dialog.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-neutral-300 leading-relaxed mb-6">
          {dialog.message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium rounded-xl text-neutral-300 hover:bg-neutral-800 transition-colors border border-neutral-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              await dialog.onConfirm();
              onClose();
            }}
            disabled={isProcessing}
            className={`px-4 py-2 text-sm font-medium rounded-xl text-white transition-all shadow-md flex items-center gap-2 ${
              dialog.isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30'
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30'
            } disabled:opacity-50`}
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              dialog.confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
