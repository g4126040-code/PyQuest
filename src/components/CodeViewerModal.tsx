import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, CheckCircle, Code2 } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-dart';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
}

export default function CodeViewerModal({ isOpen, onClose, code, language }: CodeViewerModalProps) {
  const [copied, setCopied] = React.useState(false);
  const codeRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (isOpen && codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [isOpen, code, language]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-main/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="liquid-glass w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#313244] bg-[#181825]">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-[#89dceb]" />
                <h3 className="font-bold text-white">Code Viewer</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 bg-[#181825] flex justify-end">
               <button 
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#313244] hover:bg-[#45475a] text-white rounded-lg transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
            </div>
            
            <div className="flex-grow overflow-auto p-4 bg-[#1e1e2e]">
              <pre className="!m-0 !p-0 !bg-transparent text-sm">
                <code ref={codeRef} className={`language-${language}`}>
                  {code}
                </code>
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
