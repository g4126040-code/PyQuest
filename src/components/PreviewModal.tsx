import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Terminal, Trash2 } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
}

export default function PreviewModal({ isOpen, onClose, code, language }: PreviewModalProps) {
  const [output, setOutput] = useState<{ stdout: string; stderr: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen) {
      runPreview();
    }
  }, [isOpen, code, language]);

  const runPreview = async () => {
    setOutput(null);
    if (language === 'html' || language === 'css' || language === 'javascript') {
      // Handled by iframe
      return;
    }
    
    if (language !== 'python') {
       setOutput({ stdout: "", stderr: "Preview not supported for this language." });
       return;
    }

    setIsRunning(true);
    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'python',
          version: '3.10.0',
          files: [{ content: code }]
        })
      });
      const data = await response.json();
      if (data.run) {
        setOutput({ stdout: data.run.stdout || "", stderr: data.run.stderr || "" });
      }
    } catch (error) {
       console.warn(error);
       setOutput({ stdout: "", stderr: "Failed to connect to the server." });
    } finally {
      setIsRunning(false);
    }
  };
  
  const getHtmlContent = () => {
      let finalCode = code;
      if (language === 'javascript') {
        finalCode = `<script>${code}</script>`;
      } else if (language === 'css') {
        finalCode = `<style>${code}</style>`;
      }
      return `
        <html>
          <body>
            <script>
              const _log = console.log;
              const _error = console.error;
              window.onerror = function(msg, url, line) {
                window.parent.postMessage({ type: 'error', message: msg + ' at line ' + line }, '*');
                return true;
              };
              console.log = function(...args) {
                window.parent.postMessage({ type: 'log', message: args.join(' ') }, '*');
                _log.apply(console, args);
              };
              console.error = function(...args) {
                window.parent.postMessage({ type: 'error', message: args.join(' ') }, '*');
                _error.apply(console, args);
              };
              try {
                ${language === 'javascript' ? code : ''}
              } catch (e) {
                console.error(e.message);
              }
            </script>
            ${language !== 'javascript' ? finalCode : ''}
          </body>
        </html>
      `;
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
            className="liquid-glass w-full max-w-4xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[85vh]"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#313244] bg-[#181825]">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-[#f5c2e7]" />
                <h3 className="font-bold text-white">Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                 {(language === 'html' || language === 'css' || language === 'javascript') ? null : (
                     <button 
                      onClick={runPreview}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#313244] hover:bg-[#45475a] text-[#a6e3a1] rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isRunning ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                      Run Again
                    </button>
                 )}
                <button 
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-grow flex flex-col overflow-hidden">
               {(language === 'html' || language === 'css' || language === 'javascript') ? (
                  <iframe
                    title="preview"
                    ref={iframeRef}
                    className="w-full h-full bg-white"
                    sandbox="allow-scripts"
                    srcDoc={getHtmlContent()}
                  />
               ) : (
                 <div className="flex-grow bg-[#11111b] p-4 overflow-auto font-mono text-sm">
                   {isRunning ? (
                      <div className="text-gray-400 animate-pulse flex items-center gap-2">
                        <Terminal className="w-4 h-4" /> Running code...
                      </div>
                   ) : output ? (
                      <div className="flex flex-col gap-2">
                        {output.stdout && <div className="text-[#a6e3a1] whitespace-pre-wrap">{output.stdout}</div>}
                        {output.stderr && <div className="text-[#f38ba8] whitespace-pre-wrap">{output.stderr}</div>}
                      </div>
                   ) : (
                      <div className="text-gray-500">Ready</div>
                   )}
                 </div>
               )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
