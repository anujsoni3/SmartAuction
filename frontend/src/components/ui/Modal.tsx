import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className={`theme-surface theme-border theme-transition relative w-full ${sizeClasses[size]} max-h-[calc(100vh-2rem)] overflow-hidden rounded-3xl border shadow-soft`}>
          <div className="theme-border flex items-center justify-between border-b px-5 py-4 sm:px-6">
            <h3 className="theme-text text-lg font-semibold tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="theme-transition rounded-full p-2 theme-muted hover:bg-[var(--app-panel)] hover:text-[var(--app-text)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-5 py-5 sm:px-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};