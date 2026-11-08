import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, Play, Terminal, Trash2, RotateCcw, Save, FolderOpen, Copy, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Editor from 'react-simple-code-editor';
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
import { playSound, triggerHaptic } from '../lib/sounds';
import CodeViewerModal from './CodeViewerModal';
import PreviewModal from './PreviewModal';
import { runOffline } from '../lib/offlineRunner';

const trackToPrism: Record<string, string> = {
  python: 'python',
  html: 'html',
  css: 'css',
  javascript: 'javascript',
  sql: 'sql',
  c: 'c',
  cpp: 'cpp',
  java: 'java',
  dart: 'dart',
  flutter: 'dart',
  firebase: 'javascript',
  rest: 'javascript',
  gemini: 'javascript',
};

const defaultCode: Record<string, string> = {
  python: 'print("Hello, Playground!")',
  html: '<h1>Hello World</h1>',
  css: 'body { color: white; }',
  javascript: 'console.log("Hello!");',
};

export default function PlaygroundScreen() {
  const { t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState('python');
  const [code, setCode] = useState(defaultCode['python'] || '');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<{ stdout: string; stderr: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const savedCode = localStorage.getItem(`codequest_playground_${selectedLang}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(defaultCode[selectedLang] || '');
    }
  }, [selectedLang]);

  const handleRun = async () => {
    playSound('click'); triggerHaptic('medium');
    setIsRunning(true);
    setOutput(null);

    if (['html', 'css', 'javascript'].includes(selectedLang)) {
      setTimeout(() => {
        setOutput({ stdout: 'visual_render', stderr: '' });
        setIsRunning(false);
      }, 500);
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const offlineResult = runOffline(code, selectedLang);
      setOutput({ stdout: offlineResult.stdout, stderr: offlineResult.stderr });
      setIsRunning(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLang,
          version: '*',
          files: [{ content: code }]
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.run) {
        setOutput({ stdout: data.run.stdout, stderr: data.run.stderr });
      } else {
        setOutput({ stdout: '', stderr: data.message || 'Execution error' });
      }
    } catch (e) {
      console.warn("Piston runner error, falling back to offline execution:", e);
      const offlineResult = runOffline(code, selectedLang);
      setOutput({ stdout: offlineResult.stdout, stderr: offlineResult.stderr });
    }
    setIsRunning(false);
  };

  const clearCode = () => {
    setCode('');
    setOutput(null);
  };

  const resetCode = () => {
    setCode(defaultCode[selectedLang] || '');
    setOutput(null);
  };

  const saveCode = () => {
    localStorage.setItem(`codequest_playground_saved_${selectedLang}`, code);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const loadCode = () => {
    const s = localStorage.getItem(`codequest_playground_saved_${selectedLang}`);
    if (s) setCode(s);
    setLoaded(true);
    setTimeout(() => setLoaded(false), 2000);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const pasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(text);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 flex flex-col gap-6 min-h-[calc(100vh-80px)] pb-32 sm:pb-36">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Code2 className="text-brand-500" />
          {t('Playground')}
        </h1>
        
        <select 
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="liquid-glass border border-white/20 rounded-xl px-3 py-2 font-bold text-sm outline-none shadow-lg focus:border-brand-500"
        >
          {Object.keys(trackToPrism).map(lang => (
            <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col flex-grow rounded-[2rem] overflow-hidden border border-outline shadow-soft bg-[#1e1e2e] transform-gpu">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#181825] border-b border-[#313244] overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button onClick={resetCode} className="p-2 bg-[#313244] text-[#cdd6f4] rounded-lg hover:bg-[#45475a] transition-colors" title={t("Reset Code")}>
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={clearCode} className="p-2 bg-[#313244] text-[#f38ba8] rounded-lg hover:bg-[#45475a] transition-colors" title={t("Clear Code")}>
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-[#313244] mx-1"></div>
            <button onClick={saveCode} className="p-2 bg-[#313244] text-[#f9e2af] rounded-lg hover:bg-[#45475a] transition-colors flex items-center gap-1 text-xs font-bold" title={t("Save Code")}>
              {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />} <span className="hidden sm:inline">Save</span>
            </button>
            <button onClick={loadCode} className="p-2 bg-[#313244] text-[#89b4fa] rounded-lg hover:bg-[#45475a] transition-colors flex items-center gap-1 text-xs font-bold" title={t("Load Code")}>
              {loaded ? <CheckCircle className="w-4 h-4" /> : <FolderOpen className="w-4 h-4" />} <span className="hidden sm:inline">Load</span>
            </button>
            <div className="w-px h-4 bg-[#313244] mx-1"></div>
            <button 
              onClick={() => setShowCodeViewer(true)}
              className="p-2 bg-[#313244] text-[#89dceb] rounded-lg hover:bg-[#45475a] transition-colors flex items-center gap-1 text-xs font-bold" 
              title={t("Code")}
            >
              <Code2 className="w-4 h-4" /> <span className="hidden sm:inline">Code</span>
            </button>
            <button 
              onClick={() => setShowPreview(true)}
              className="p-2 bg-[#313244] text-[#f5c2e7] rounded-lg hover:bg-[#45475a] transition-colors flex items-center gap-1 text-xs font-bold" 
              title={t("Preview")}
            >
              <Play className="w-4 h-4" /> <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button onClick={pasteCode} className="p-2 bg-[#313244] text-[#cdd6f4] rounded-lg hover:bg-[#45475a] transition-colors flex items-center gap-1 text-xs font-bold" title={t("Paste Code")}>
              <FolderOpen className="w-4 h-4" /> <span className="hidden sm:inline">Paste</span>
            </button>
            <button onClick={copyCode} className="p-2 bg-[#313244] text-[#a6e3a1] rounded-lg hover:bg-[#45475a] transition-colors flex items-center gap-1 text-xs font-bold" title={t("Copy Code")}>
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />} <span className="hidden sm:inline">Copy</span>
            </button>
          </div>
        </div>
        
        {/* Editor Area */}
        <div className="flex-grow relative overflow-auto text-[#cdd6f4] bg-[#1e1e2e]">
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={code => {
              const lang = trackToPrism[selectedLang] || 'python';
              if (Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang);
              }
              return code;
            }}
            padding={20}
            style={{
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontSize: 16,
              minHeight: '100%',
            }}
            textareaClassName="focus:outline-none"
          />
        </div>
      </div>

      {/* Output Console */}
      <AnimatePresence>
        {(output?.stdout || output?.stderr || isRunning) && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex flex-col rounded-[2rem] overflow-hidden border border-outline shadow-soft bg-[#11111b] max-h-[30%] transform-gpu"
          >
            <div className="flex items-center px-6 py-3 bg-[#181825] text-[#bac2de] text-xs font-bold uppercase tracking-widest gap-2 border-b border-[#313244]">
              <Terminal className="w-4 h-4" /> {['html', 'css', 'javascript'].includes(selectedLang) ? t('Live Preview') : t('Console Output')}
            </div>
            <div className="p-5 overflow-y-auto font-mono text-sm flex-grow">
              {isRunning ? (
                <div className="flex items-center gap-3 text-brand-400 font-semibold animate-pulse">
                  <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  Executing...
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {['html', 'css', 'javascript'].includes(selectedLang) && output?.stdout === 'visual_render' ? (
                    <iframe
                      title="preview"
                      className="w-full h-32 bg-white rounded-md"
                      srcDoc={
                        selectedLang === 'html' ? code : 
                        selectedLang === 'css' ? `<html><head><style>${code}</style></head><body><div class="card container btn text">Preview Area</div><p>Structure</p></body></html>` :
                        `<html><body><script>${code}</script></body></html>`
                      }
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : output?.stdout ? (
                    <pre className="text-[#a6e3a1] whitespace-pre-wrap font-medium">{output.stdout}</pre>
                  ) : null}
                  {output?.stderr && (
                    <div className="flex items-start gap-2 text-[#f38ba8] bg-[#f38ba8]/10 p-4 rounded-xl border border-[#f38ba8]/20 font-medium">
                      <pre className="whitespace-pre-wrap">{output.stderr}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={handleRun}
        disabled={isRunning || !code.trim()}
        className="w-full flex justify-center items-center gap-2 py-4 liquid-glass text-content-primary font-bold rounded-2xl transition-all disabled:opacity-50 shadow-xl text-lg hover:bg-white/5 mt-auto shrink-0"
      >
        <Play className="w-5 h-5 fill-current" />
        {isRunning ? t("Executing...") : t("Run Code")}
      </motion.button>
      
      <CodeViewerModal isOpen={showCodeViewer} onClose={() => setShowCodeViewer(false)} code={code} language={trackToPrism[selectedLang] || 'python'} />
      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} code={code} language={selectedLang} />
    </div>
  );
}
