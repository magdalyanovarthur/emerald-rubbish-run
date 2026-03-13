import React from 'react';
import { X } from 'lucide-react';

interface LegalDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

const LegalDocumentDialog: React.FC<LegalDocumentDialogProps> = ({ open, onClose, title, content }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-lg max-h-[85vh] mx-4 bg-background rounded-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-sm text-foreground leading-relaxed whitespace-pre-line">
          {content}
        </div>
      </div>
    </div>
  );
};

export default LegalDocumentDialog;
