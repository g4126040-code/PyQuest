import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ArrowRight, Lightbulb, CheckCircle, XCircle, Code2, Terminal, Bot } from 'lucide-react';
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
import 'prismjs/components/prism-bash';

import 'prismjs/themes/prism-tomorrow.css';
import { Challenge } from '../data/challenges';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { useLanguage } from '../contexts/LanguageContext';
import { useMascot } from '../contexts/MascotContext';
import TapToBuildExercise from './TapToBuildExercise';
import CodeViewerModal from './CodeViewerModal';
import PreviewModal from './PreviewModal';
import { playSound, triggerHaptic } from '../lib/sounds';
import { evaluateOffline, runOffline } from '../lib/offlineRunner';

interface ChallengeViewProps {
  challenge: Challenge;
  onComplete: () => void;
}


function getFileExtension(trackId: string) {
  const map: Record<string, string> = {
    python: 'py', html: 'html', css: 'css', js: 'js', sql: 'sql', c: 'c', cpp: 'cpp', java: 'java', dart: 'dart', flutter: 'dart', git: 'sh', firebase: 'js', rest: 'js', gemini: 'js', fullstack: 'js'
  };
  return map[trackId] || 'py';
}

export default function ChallengeView({ challenge, onComplete }: ChallengeViewProps) {

  const trackToPrism: Record<string, string> = {
    python: 'python', html: 'markup', css: 'css', js: 'javascript',
    sql: 'sql', c: 'c', cpp: 'cpp', java: 'java', dart: 'dart', flutter: 'dart', git: 'bash', firebase: 'javascript', rest: 'javascript', gemini: 'javascript', fullstack: 'javascript'
  };

  const { t, language } = useLanguage();
  const { triggerMascot } = useMascot();
  
  const [showCodeViewer, setShowCodeViewer] = useState(false);

  const isFoundationPhase = challenge.activityType === 'tap_build';
  const [exerciseMode, setExerciseMode] = useState<'tap' | 'editor'>(() => {
    return isFoundationPhase ? 'tap' : 'editor';
  });

  useEffect(() => {
    setExerciseMode(challenge.activityType === 'tap_build' ? 'tap' : 'editor');
    const saved = localStorage.getItem(`codequest_code_${challenge.id}`);
    setCode(saved !== null ? saved : challenge.initialCode);
    setFeedback(null);
    setOutput(null);
  }, [challenge.id, challenge.activityType, challenge.initialCode]);

  const [showPreview, setShowPreview] = useState(false);
  
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(`codequest_code_${challenge.id}`);
    return saved !== null ? saved : challenge.initialCode;
  });

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    localStorage.setItem(`codequest_code_${challenge.id}`, newCode);
  };
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string; hint?: string; errorLine?: number | null } | null>(null);
  const [output, setOutput] = useState<{ stdout: string; stderr: string; errorLine: number | null } | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleRun = async () => {
    playSound('click'); triggerHaptic('light');
    setIsRunning(true);
    setOutput(null);
    setFeedback(null);
    
    if (['html', 'css', 'js'].includes(challenge.trackId)) {
      setTimeout(() => {
        setOutput({ stdout: 'visual_render', stderr: '', errorLine: null });
        setIsRunning(false);
      }, 300);
      return;
    }

    // If device is offline, execute instantly via client-side offline runner
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const offlineResult = runOffline(code, challenge.trackId, language);
      setOutput(offlineResult);
      setIsRunning(false);
      return;
    }

    try {
      // 5-second timeout for poor/slow connection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, programmingLanguage: challenge.trackId }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      const result = await response.json();
      setOutput(result);
    } catch (error) {
      console.warn("Run code server error, using offline runner fallback:", error);
      const offlineResult = runOffline(code, challenge.trackId, language);
      setOutput(offlineResult);
    } finally {
      setIsRunning(false);
    }
  };

  const handleEvaluate = async () => {
    playSound('click'); triggerHaptic('light');
    setIsEvaluating(true);
    
    // Custom evaluation for Python Practice Chapters 21-30
    if (challenge.trackId === 'python_practice') {
      try {
        let result: any = null;
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          result = runOffline(code, challenge.trackId, language);
        } else {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch('/api/run', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, language, programmingLanguage: challenge.trackId }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            result = await response.json();
          } catch (e) {
            result = runOffline(code, challenge.trackId, language);
          }
        }
        setOutput(result);
        
        if (result.stderr || (result.errorLine !== null && result.errorLine !== undefined)) {
           setAttempts(a => a + 1);
           setFeedback({
             correct: false,
             text: t("Your code has an error. Check your syntax and try again."),
             errorLine: result.errorLine,
             hint: ""
           });
           triggerMascot('idle', t("Hmm, there's an error. Try fixing it."));
           playSound('error'); triggerHaptic('error');
        } else {
           setFeedback({
             correct: true,
             text: t("Great job! You successfully wrote the code independently."),
             hint: "",
             errorLine: null
           });
           playSound('success'); triggerHaptic('success');
           confetti({
             particleCount: 150,
             spread: 80,
             origin: { y: 0.6 },
             colors: ['#34d399', '#6366f1', '#f43f5e', '#fbbf24']
           });
           triggerMascot('success', t("Incredible! You wrote that all by yourself."));
        }
      } catch (e) {
         const offlineResult = evaluateOffline(challenge, code, attempts, language);
         setFeedback({
           correct: offlineResult.correct,
           text: offlineResult.feedback,
           hint: offlineResult.hint,
           errorLine: offlineResult.errorLine,
         });
      } finally {
        setIsEvaluating(false);
      }
      return;
    }

    // If completely offline, evaluate immediately using client-side offline evaluation engine
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const offlineResult = evaluateOffline(challenge, code, attempts, language);
      setFeedback({
        correct: offlineResult.correct,
        text: offlineResult.feedback,
        hint: offlineResult.hint,
        errorLine: offlineResult.errorLine,
      });

      if (offlineResult.correct) {
        playSound('success'); triggerHaptic('success');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#34d399', '#6366f1', '#f43f5e', '#fbbf24']
        });
      } else {
        playSound('error'); triggerHaptic('error');
        setAttempts(a => a + 1);
        triggerMascot('encourage', 'Keep trying! You will get it.');
      }
      setIsEvaluating(false);
      return;
    }

    try {
      // 5-second timeout for slow or poor connection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, challenge, attempts, language }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      const result = await response.json();
      setFeedback({
        correct: result.correct,
        text: result.feedback,
        hint: result.hint,
        errorLine: result.errorLine,
      });
      
      if (result.correct) {
        playSound('success'); triggerHaptic('success');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#34d399', '#6366f1', '#f43f5e', '#fbbf24']
        });
      } else {
        playSound('error'); triggerHaptic('error');
        setAttempts(a => a + 1);
        triggerMascot('encourage', 'Keep trying! You will get it.');
      }
    } catch (error) {
      console.warn("Evaluate code network error, falling back to offline evaluator:", error);
      const offlineResult = evaluateOffline(challenge, code, attempts, language);
      setFeedback({
        correct: offlineResult.correct,
        text: offlineResult.feedback,
        hint: offlineResult.hint,
        errorLine: offlineResult.errorLine,
      });
      if (offlineResult.correct) {
        playSound('success'); triggerHaptic('success');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#34d399', '#6366f1', '#f43f5e', '#fbbf24']
        });
      } else {
        playSound('error'); triggerHaptic('error');
        setAttempts(a => a + 1);
        triggerMascot('encourage', 'Keep trying! You will get it.');
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  

  
  const rawTargetCode = challenge.targetCode || challenge.expectedLogic;
  const puzzleTargetCode = isFoundationPhase 
    ? rawTargetCode.replace(/^\s*(\/\/|#|<!--|\/\*).*$/gm, '').trim() || rawTargetCode
    : rawTargetCode;

  return (
    <div className="flex flex-col lg:flex-row w-full flex-grow liquid-glass overflow-y-auto lg:overflow-hidden rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl">
      {/* Left Panel: Instructions & Feedback */}
      <div className="w-full lg:w-5/12 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto lg:h-[calc(100vh-64px)] pb-8 lg:pb-6">
        <div className="p-6 md:p-10 flex flex-col">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-extrabold mb-6 text-content-primary leading-tight tracking-tight"
          >
            {challenge.title}
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-content-secondary text-lg leading-relaxed mb-6 prose dark:prose-invert max-w-none prose-p:my-2 prose-pre:bg-surface-main prose-pre:border prose-pre:border-outline prose-pre:shadow-sm transform-gpu"
          >
            <ReactMarkdown
              components={{
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="bg-[#1e1e2e] p-5 rounded-2xl my-5 text-sm shadow-soft overflow-x-auto text-white">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </div>
                  ) : (
                    <code className="bg-surface-main text-brand-500 dark:text-brand-400 px-2 py-1 rounded-md text-sm font-mono border border-outline" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {challenge.instruction}
            </ReactMarkdown>
          </motion.div>
          
          <AnimatePresence mode="popLayout">
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className={`p-6 rounded-[2rem] shadow-soft mt-4 backdrop-blur-xl transform-gpu ${feedback.correct ? 'bg-emerald-50/80 dark:bg-emerald-900/30 border-2 border-emerald-400 dark:border-emerald-500/50' : 'bg-brand-50/80 dark:bg-brand-900/30 border-2 border-brand-400 dark:border-brand-500/50'}`}
              >
                <div className="flex items-center gap-4 mb-4 font-extrabold text-lg">
                  <div className={`p-3 rounded-2xl shadow-sm ${feedback.correct ? 'bg-emerald-500 text-white' : 'bg-brand-500 text-white'}`}>
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className={feedback.correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-brand-700 dark:text-brand-400'}>
                    AI Mentor
                  </span>
                  {feedback.correct ? (
                    <CheckCircle className="text-emerald-500 dark:text-emerald-400 w-6 h-6 ml-auto" />
                  ) : (
                    <XCircle className="text-brand-500 dark:text-brand-400 w-6 h-6 ml-auto" />
                  )}
                </div>
                <div className={`mb-2 text-[1.1rem] leading-relaxed font-medium ${feedback.correct ? 'text-emerald-800 dark:text-emerald-100' : 'text-brand-900 dark:text-brand-100'}`}>
                  <ReactMarkdown
                    components={{
                      code: ({ node, inline, className, children, ...props }: any) => {
                        return (
                          <code className="bg-black/10 dark:bg-black/30 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {feedback.text}
                  </ReactMarkdown>
                </div>
                {feedback.correct && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
                    className="mt-6 flex gap-3 transform-gpu"
                  >
                    <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.4 }} className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800 shadow-sm">
                      <span>+50 XP</span>
                    </motion.div>
                    <motion.div initial={{ scale: 0, rotate: 10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.5 }} className="flex items-center gap-2 bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 px-4 py-2 rounded-xl font-bold border border-sky-200 dark:border-sky-800 shadow-sm">
                      <span>+20 Coins 🪙</span>
                    </motion.div>
                  </motion.div>
                )}
                {!feedback.correct && feedback.hint && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-3 mt-5 pt-5 border-t border-brand-500/20 text-amber-800 dark:text-amber-200/90 text-sm bg-amber-100 dark:bg-amber-950/30 p-4 rounded-2xl"
                  >
                    <Lightbulb className="w-6 h-6 mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" />
                    <p className="font-semibold">{feedback.hint}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel: Editor & Output */}
      <div className="w-full lg:w-7/12 flex flex-col p-4 md:p-6 pb-32 sm:pb-36 lg:pb-6 gap-4 md:gap-6 overflow-y-auto lg:h-[calc(100vh-64px)]">
        {/* Top Control Bar with Mode Switcher & Tools */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181825] p-3 rounded-2xl border border-[#313244] shadow-sm">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#11111b] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                playSound('click');
                triggerHaptic('light');
                setExerciseMode('tap');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                exerciseMode === 'tap'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-[#bac2de] hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🧩 {t('Tap to Build')}</span>
            </button>
            <button
              onClick={() => {
                playSound('click');
                triggerHaptic('light');
                setExerciseMode('editor');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                exerciseMode === 'editor'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-[#bac2de] hover:text-white hover:bg-white/5'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{t('Pro Editor')}</span>
            </button>
          </div>

          {/* Reference & Preview Modals */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                playSound('click');
                triggerHaptic('light');
                setShowCodeViewer(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#313244] hover:bg-[#45475a] text-[#89dceb] rounded-xl transition-colors shadow-sm"
              title="Inspect Full Code"
            >
              <Code2 className="w-4 h-4" /> <span>Code</span>
            </button>
            <button 
              onClick={() => {
                playSound('click');
                triggerHaptic('light');
                setShowPreview(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#313244] hover:bg-[#45475a] text-[#f5c2e7] rounded-xl transition-colors shadow-sm"
              title="Open Live Preview"
            >
              <Play className="w-4 h-4" /> <span>Preview</span>
            </button>
          </div>
        </div>

        {exerciseMode === 'tap' ? (
          <div className="flex-grow flex flex-col relative min-h-[400px]">
            <TapToBuildExercise 
              targetCode={puzzleTargetCode}
              trackId={challenge.trackId}
              requireTyping={false}
              onSuccess={() => {
                setFeedback({
                  correct: true,
                  text: t("Great job! You've mastered this block of code."),
                  errorLine: null
                });
                playSound('success');
                triggerHaptic('success');
              }}
              t={t}
            />
            {feedback?.correct && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="mt-6 transform-gpu"
              >
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={onComplete}
                  className="w-full flex justify-center items-center gap-3 py-5 bg-brand-500/90 hover:bg-brand-400 text-white font-black rounded-2xl transition-all text-lg btn-game shadow-xl"
                >
                  {t('Next Lesson')} <ArrowRight className="w-7 h-7" />
                </motion.button>
              </motion.div>
            )}
          </div>
        ) : (
          <>
            {/* Editor Container */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex flex-col flex-grow rounded-[2rem] overflow-hidden border border-outline shadow-soft bg-[#1e1e2e] transform-gpu min-h-[280px]"
            >
              {/* Editor Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#181825] border-b border-[#313244]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#f38ba8] shadow-sm"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#f9e2af] shadow-sm"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#a6e3a1] shadow-sm"></div>
                  <span className="text-sm font-mono text-[#bac2de] ml-4 flex items-center gap-2 font-semibold">
                    <Code2 className="w-4 h-4" /> main.{getFileExtension(challenge.trackId)}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-grow relative overflow-hidden bg-[#1e1e2e]">
                {/* Line Numbers */}
                <div 
                  className="flex flex-col text-right py-[20px] px-4 font-mono text-[#6c7086] select-none border-r border-[#313244] bg-[#181825] min-w-[3rem]"
                  style={{ fontSize: 16, lineHeight: 1.6 }}
                >
                  {code.split('\n').map((_, i) => (
                    <div key={i} className={(output?.errorLine === i + 1 || feedback?.errorLine === i + 1) ? 'text-[#f38ba8] font-bold' : ''}>
                      {i + 1}
                    </div>
                  ))}
                </div>
                
                {/* Editor Area */}
                <div className="flex-grow relative overflow-auto text-[#cdd6f4]">
                  <Editor
                    value={code}
                    onValueChange={handleCodeChange}
                    highlight={code => {
                      const prismLang = trackToPrism[challenge.trackId] || 'python';
                      const grammar = Prism.languages[prismLang] || Prism.languages.python;
                      const highlighted = Prism.highlight(code, grammar, prismLang);

                      const errorLineToHighlight = output?.errorLine || feedback?.errorLine;
                      if (!errorLineToHighlight) return highlighted;
                      
                      const lines = highlighted.split('\n');
                      if (lines[errorLineToHighlight - 1] !== undefined) {
                        lines[errorLineToHighlight - 1] = `<span class="bg-[#f38ba8]/20 block w-full rounded px-1 -mx-1 border-l-4 border-[#f38ba8]">${lines[errorLineToHighlight - 1]}</span>`;
                      }
                      return lines.join('\n');
                    }}
                    padding={20}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 16,
                      minHeight: '100%',
                      lineHeight: 1.6,
                      outline: 'none',
                      whiteSpace: 'pre',
                    }}
                    textareaClassName="focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* Console Output Section */}
            <AnimatePresence>
              {(output?.stdout || output?.stderr || isRunning) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex flex-col rounded-[2rem] overflow-hidden border border-outline shadow-soft bg-[#11111b] max-h-[30%] transform-gpu"
                >
                  <div className="flex items-center px-6 py-3 bg-[#181825] text-[#bac2de] text-xs font-bold uppercase tracking-widest gap-2 border-b border-[#313244]">
                    <Terminal className="w-4 h-4" /> {['html', 'css', 'js'].includes(challenge.trackId) ? t('Live Preview') : t('Console Output')}
                  </div>
                  <div className="p-5 overflow-y-auto font-mono text-sm flex-grow">
                    {isRunning ? (
                      <div className="flex items-center gap-3 text-brand-400 font-semibold animate-pulse">
                        <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                        Executing...
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {['html', 'css', 'js'].includes(challenge.trackId) && output?.stdout === 'visual_render' ? (
                          <iframe
                            title="preview"
                            className="w-full h-32 bg-white rounded-md"
                            srcDoc={
                              challenge.trackId === 'html' ? code : 
                              challenge.trackId === 'css' ? `<html><head><style>${code}</style></head><body><div class="card container btn text">Preview Area</div><p>Structure</p></body></html>` :
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button
                onClick={handleRun}
                disabled={isRunning || !code.trim()}
                className="flex-1 flex justify-center items-center gap-3 py-5 bg-surface-card hover:bg-surface-elevated text-content-primary font-extrabold rounded-2xl transition-all disabled:opacity-50 border-2 border-outline shadow-sm text-lg btn-game"
              >
                {isRunning ? (
                  <div className="w-6 h-6 border-4 border-content-secondary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-6 h-6 fill-current" />
                )}
                {t('Run Code')}
              </button>

              {!feedback?.correct ? (
                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating || !code.trim()}
                  className="flex-1 flex justify-center items-center gap-3 py-5 bg-emerald-500/90 hover:bg-emerald-400 text-white font-black rounded-2xl transition-all disabled:opacity-50 text-lg btn-game"
                >
                  {isEvaluating ? (
                    <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle className="w-7 h-7" />
                  )}
                  {isEvaluating ? t('Checking...') : t('Check Answer')}
                </button>
              ) : (
                <motion.button
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={onComplete}
                  className="flex-1 flex justify-center items-center gap-3 py-5 bg-brand-500/90 hover:bg-brand-400 text-white font-black rounded-2xl transition-all text-lg btn-game"
                >
                  {t('Next Lesson')} <ArrowRight className="w-7 h-7" />
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>
      <CodeViewerModal isOpen={showCodeViewer} onClose={() => setShowCodeViewer(false)} code={code} language={trackToPrism[challenge.trackId] || "python"} />
      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} code={code} language={challenge.trackId} />
    </div>
  );
}
