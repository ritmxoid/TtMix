import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, User, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface DirectTextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
  authorText: string;
  onSave: (text: string, author: string) => void;
}

export const DirectTextInputModal: React.FC<DirectTextInputModalProps> = ({
  isOpen,
  onClose,
  rawText,
  authorText,
  onSave,
}) => {
  const { t } = useLanguage();
  const [text, setText] = useState(rawText);
  const [author, setAuthor] = useState(authorText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(rawText);
    setAuthor(authorText);
  }, [rawText, authorText]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const len = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(len, len);
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    onSave(val, author);
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAuthor(val);
    onSave(text, val);
  };

  const handleClearText = () => {
    setText('');
    onSave('', author);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] bg-black/85 backdrop-blur-md flex flex-col p-3 sm:p-5 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full mx-auto flex-1 flex flex-col bg-[#16161D] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Editor Textarea - Takes all available top space directly without top header */}
        <div className="flex-1 p-3.5 flex flex-col space-y-3 overflow-y-auto">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder={t('pasteOrTypeText', 'Вставьте или напечатайте текст сюда...')}
            className="w-full flex-1 min-h-[160px] bg-[#0F0F12] border border-white/15 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 rounded-xl p-3.5 text-base text-zinc-100 placeholder-zinc-500 outline-none leading-relaxed resize-none font-sans"
          />

          {/* Author Field inside modal */}
          <div className="flex items-center gap-2 bg-[#0F0F12] border border-white/10 rounded-xl px-3 py-2">
            <User className="w-4 h-4 text-purple-400 shrink-0" />
            <input
              type="text"
              value={author}
              onChange={handleAuthorChange}
              placeholder={t('authorPlaceholder', 'Автор (необязательно, появится в конце)')}
              className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none"
            />
          </div>
        </div>

        {/* Bottom Actions Bar with Centered Info & Counter */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-white/10 bg-[#1A1A22] flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          {/* Red Delete Button */}
          <button
            type="button"
            onClick={handleClearText}
            className="flex items-center justify-center p-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all cursor-pointer active:scale-95 shadow-md shrink-0"
            title={t('clearText', 'Очистить текст')}
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Center Section Title & Words/Chars Counter */}
          <div className="flex-1 flex flex-col items-center justify-center text-center min-w-0 px-1 select-none">
            <span className="text-[11px] sm:text-xs font-semibold text-zinc-300 truncate max-w-full leading-tight">
              {t('textSectionTitle', 'Текст цитаты или сценария')}
            </span>
            <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium font-mono leading-tight mt-0.5">
              {wordCount} {t('words', 'слов')} • {text.length} {t('chars', 'симв.')}
            </span>
          </div>

          {/* Green Confirm / Done Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 p-3 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 shrink-0"
            title={t('done', 'Готово')}
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden sm:inline">{t('done', 'Готово')}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
