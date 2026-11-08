import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, CheckCircle, Lightbulb, RotateCcw, X, Undo2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../lib/sounds';

interface TapToBuildExerciseProps {
  trackId?: string;
  targetCode: string;
  requireTyping?: boolean;
  onSuccess: () => void;
  t: (key: string) => string;
}


const DISTRACTORS_MAP: Record<string, string[]> = {
  python: ['input', 'if', 'while', 'def', 'for', 'else', 'elif', 'True', 'False', '==', '!=', 'and', 'or', '[]', '{}'],
  html: ['<div>', '</span>', 'class=', 'href=', '<p>', '<img>', 'style=', '<head>', '<body>', '<footer>', '<h1>', 'alt='],
  css: ['color', 'background', 'margin', 'padding', 'display', 'flex', 'grid', 'border', '10px', '#fff', 'absolute', 'relative', 'auto'],
  js: ['function', 'const', 'let', 'var', '=>', 'console.log', 'document', 'window', 'return', 'if', 'for', '===', 'Array'],
  sql: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'ON', 'GROUP', 'ORDER', 'ASC', 'DESC', 'LIMIT'],
  git: ['git', 'commit', 'push', 'pull', 'add', 'status', 'log', 'branch', 'checkout', 'merge', '-m', 'origin', 'main'],
  c: ['#include', 'int', 'char', 'float', 'printf', 'scanf', 'return', 'main', 'if', 'for', 'while', '==', '!=', '&'],
  cpp: ['#include', 'int', 'std::', 'cout', 'cin', 'endl', 'return', 'main', 'class', 'public', 'private', 'vector', '<<', '>>'],
  java: ['public', 'class', 'static', 'void', 'main', 'String', 'int', 'System.out.println', 'new', 'return', 'if', 'for', 'while'],
  dart: ['void', 'main()', 'print', 'var', 'final', 'const', 'String', 'int', 'List', 'Map', 'if', 'for', 'async', 'await'],
  flutter: ['Widget', 'build', 'BuildContext', 'Scaffold', 'AppBar', 'Text', 'Center', 'Column', 'Row', 'Container', 'child', 'children'],
  firebase: ['initializeApp', 'getFirestore', 'collection', 'doc', 'getDoc', 'getDocs', 'setDoc', 'addDoc', 'auth', 'signIn'],
  rest: ['fetch', 'async', 'await', 'then', 'catch', 'GET', 'POST', 'headers', 'body', 'JSON.stringify', 'response.json()', 'status'],
  gemini: ['GoogleGenAI', 'generateContent', 'prompt', 'model', 'response', 'text', 'apiKey', 'async', 'await', 'systemInstruction'],
  fullstack: ['express', 'app.get', 'app.post', 'req', 'res', 'res.json', 'cors', 'mongoose', 'connect', 'Schema', 'model'],
};


function tokenizeCode(code: string) {
  const regex = /('.*?'|".*?"|\w+|[^\w\s])/g;
  const tokens = [];
  let match;
  while ((match = regex.exec(code)) !== null) {
    tokens.push(match[0]);
  }
  return tokens;
}

interface BlockItem {
  id: string;
  text: string;
  isDistractor: boolean;
}

function generateExerciseData(targetCode: string, requireTyping?: boolean, trackId?: string) {
  let tokens = tokenizeCode(targetCode || "");
  let chosenMissingWord: string | null = null;
  let chosenIndex: number | null = null;

  if (tokens.length === 0) {
    tokens = ['//', 'Code', 'Not', 'Available'];
  }

  if (requireTyping && tokens.length > 0) {
    const possibleIndices = tokens.map((t, i) => /^[a-zA-Z0-9_]+$/.test(t) ? i : -1).filter(i => i !== -1);
    const indexToRemove = possibleIndices.length > 0 
      ? possibleIndices[Math.floor(Math.random() * possibleIndices.length)] 
      : Math.floor(Math.random() * tokens.length);
    
    chosenMissingWord = tokens[indexToRemove];
    chosenIndex = indexToRemove;
    tokens[indexToRemove] = '___';
  }

  const correctBlocks = tokens.map((text, i) => ({
    id: `correct-${i}-${text}`,
    text,
    isDistractor: false
  }));

  const selectedDistractors = DISTRACTORS_MAP[trackId || 'python'] || DISTRACTORS_MAP['python'];
  const shuffledDistractors = [...selectedDistractors].sort(() => 0.5 - Math.random()).slice(0, 3);
  const distractorBlocks = shuffledDistractors.map((text, i) => ({
    id: `distractor-${i}-${text}`,
    text,
    isDistractor: true
  }));

  const allBlocks = [...correctBlocks, ...distractorBlocks].sort(() => 0.5 - Math.random());
  return {
    tokens,
    allBlocks,
    chosenMissingWord,
    chosenIndex
  };
}

export default function TapToBuildExercise({ targetCode, requireTyping, onSuccess, t, trackId }: TapToBuildExerciseProps) {
  const [initialData] = useState(() => generateExerciseData(targetCode, requireTyping, trackId));
  const [expectedTokens, setExpectedTokens] = useState<string[]>(() => initialData.tokens);
  const [poolItems, setPoolItems] = useState<BlockItem[]>(() => initialData.allBlocks);
  const [answerItems, setAnswerItems] = useState<BlockItem[]>([]);
  
  const [errorId, setErrorId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [missingWord, setMissingWord] = useState<string | null>(() => initialData.chosenMissingWord);
  const [missingWordIndex, setMissingWordIndex] = useState<number | null>(() => initialData.chosenIndex);
  const [typedWord, setTypedWord] = useState('');

  useEffect(() => {
    const data = generateExerciseData(targetCode, requireTyping, trackId);
    setExpectedTokens(data.tokens);
    setPoolItems(data.allBlocks);
    setAnswerItems([]);
    setErrorId(null);
    setHint(null);
    setIsSuccess(false);
    setMissingWord(data.chosenMissingWord);
    setMissingWordIndex(data.chosenIndex);
    setTypedWord('');
  }, [targetCode, requireTyping, trackId]);

  const handleTapPoolBlock = (block: BlockItem) => {
    if (answerItems.length >= expectedTokens.length) return;
    
    // Immediate validation
    if (block.text === expectedTokens[answerItems.length]) {
      playSound('click');
      setPoolItems(prev => prev.filter(b => b.id !== block.id));
      setAnswerItems(prev => [...prev, block]);
      setErrorId(null);
      setHint(null);
    } else {
      playSound('error');
      setErrorId(block.id);
      setHint("That block doesn't go next. Try another one!");
      // clear error after a short delay so they can try again
      setTimeout(() => {
        setErrorId(null);
      }, 800);
    }
  };

  const handleTapAnswerBlock = (block: BlockItem) => {
    playSound('click');
    setAnswerItems(prev => prev.filter(b => b.id !== block.id));
    setPoolItems(prev => [...prev, block]);
    setErrorId(null);
    setHint(null);
  };

  const handleUndo = () => {
    playSound('click');
    if (answerItems.length === 0) return;
    const lastBlock = answerItems[answerItems.length - 1];
    handleTapAnswerBlock(lastBlock);
  };

  const handleClear = () => {
    playSound('click');
    setPoolItems(prev => [...prev, ...answerItems]);
    setAnswerItems([]);
    setErrorId(null);
    setHint(null);
  };

  const checkAnswer = () => {
    playSound('click');
    if (answerItems.length < expectedTokens.length) {
      playSound('error');
      setHint("You're missing some blocks. Keep building!");
      return;
    }
    
    if (missingWord) {
      if (typedWord.trim() !== missingWord) {
        playSound('error');
        setHint("The blocks are correct, but the missing word is wrong! Try again.");
        return;
      }
    }

    playSound('success');
    setIsSuccess(true);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#34d399', '#6366f1', '#f43f5e', '#fbbf24']
    });
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-full liquid-glass rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-y-auto">
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-surface-elevated/80 backdrop-blur-sm rounded-3xl transform-gpu"
          >
            <div className="bg-emerald-500 text-white px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center">
              <CheckCircle className="w-16 h-16 mb-4" />
              <h2 className="text-3xl font-black mb-2">Awesome!</h2>
              <p className="text-emerald-100 font-bold">You nailed it.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 sm:mb-6 flex items-center gap-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 p-3 sm:p-4 rounded-2xl border border-brand-500/20">
        <Lightbulb className="w-5 sm:w-6 h-5 sm:h-6 flex-shrink-0" />
        <p className="font-bold text-sm sm:text-base">Tap the blocks in the correct order to build your code.</p>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 flex-grow">
        
        {/* Answer Area */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-content-secondary uppercase tracking-wider text-xs sm:text-sm">Your Code</h3>
            <div className="flex gap-2">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleUndo} 
                disabled={answerItems.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold liquid-glass hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors text-content-secondary shadow-sm"
              >
                <Undo2 className="w-3.5 h-3.5" /> Undo
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={handleClear} 
                disabled={answerItems.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold liquid-glass hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors text-content-secondary shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </motion.button>
            </div>
          </div>
          
          <div className="min-h-[100px] sm:min-h-[130px] w-full bg-surface-main/30 border-2 border-dashed border-white/20 rounded-3xl p-4 sm:p-6 flex flex-wrap gap-y-2 sm:gap-y-3 items-start content-start shadow-inner">
            {expectedTokens.map((_, index) => {
              const item = answerItems[index];
              let hasSpaceAfter = true;
              if (index < expectedTokens.length - 1) {
                const current = expectedTokens[index];
                const next = expectedTokens[index + 1];
                if (/^[.,:;\]})]$/.test(next)) hasSpaceAfter = false;
                if (/^[\[{(.]$/.test(current)) hasSpaceAfter = false;
                if (/^[a-zA-Z0-9_]+$/.test(current) && next === '(' && !['if', 'while', 'for', 'switch'].includes(current)) hasSpaceAfter = false;
              }
              return (
                <div key={`slot-${index}`} className={`flex items-center ${hasSpaceAfter ? 'mr-3' : 'mr-1'}`}>
                  {!item && (
                    <div className="px-4 py-2 h-11 md:h-12 rounded-xl border-2 border-dashed border-content-muted/30 text-content-muted/50 font-mono font-bold text-sm md:text-base flex items-center justify-center min-w-[3rem]">
                      ____
                    </div>
                  )}
                  <AnimatePresence>
                    {item && (
                      <motion.button
                        layoutId={`block-${item.id}`}
                        onClick={() => handleTapAnswerBlock(item)}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1,
                          x: item.id === errorId ? [0, -5, 5, -5, 5, 0] : 0 
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ 
                          type: "spring", stiffness: 400, damping: 25,
                          x: { duration: 0.4 }
                        }}
                        className={`px-4 py-2 h-11 md:h-12 rounded-xl font-mono text-sm md:text-base font-bold shadow-sm border-2 whitespace-nowrap z-10 flex items-center justify-center ${
                          item.id === errorId
                            ? 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-500 dark:text-red-300'
                            : 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-900/20 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors'
                        }`}
                      >
                        {item.text}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
          
          <AnimatePresence>
            {hint && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 dark:text-red-400 font-bold text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-xl border border-red-200 dark:border-red-900/50 mt-2 flex items-center gap-2"
              >
                <X className="w-4 h-4 shrink-0" />
                {hint}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pool Area */}
        <div className="flex flex-col gap-2 mt-auto">
          <h3 className="font-bold text-content-secondary uppercase tracking-wider text-xs sm:text-sm">Available Blocks</h3>
          <div className="min-h-[100px] sm:min-h-[130px] w-full liquid-glass rounded-3xl p-4 sm:p-6 flex flex-wrap gap-2 sm:gap-3 items-start content-start shadow-xl">
            <AnimatePresence>
              {poolItems.map(item => (
                <motion.button
                  key={item.id}
                  layoutId={`block-${item.id}`}
                  onClick={() => handleTapPoolBlock(item)}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1, 
                    x: item.id === errorId ? [0, -5, 5, -5, 5, 0] : 0 
                  }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: item.id === errorId ? 1 : 1.05 }}
                  whileTap={{ scale: item.id === errorId ? 1 : 0.95 }}
                  transition={{ 
                    type: "spring", stiffness: 400, damping: 25,
                    x: { duration: 0.4 }
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl font-mono text-sm md:text-base font-bold shadow-sm border-2 transition-colors ${
                    item.id === errorId
                      ? 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-500 dark:text-red-300'
                      : 'bg-surface-card border-outline text-content-primary hover:border-brand-400 hover:text-brand-500 dark:hover:text-brand-400'
                  }`}
                >
                  {item.text}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
        
        {missingWord && (
          <div className="flex flex-col gap-2 mt-4 bg-surface-main/30 p-4 rounded-2xl border-2 border-dashed border-brand-500/30">
            <h3 className="font-bold text-brand-500 dark:text-brand-400 uppercase tracking-wider text-xs sm:text-sm">
              Fill in the blank
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="font-mono font-bold text-content-secondary text-xs sm:text-sm">One block is missing (represented by <span className="text-brand-500">___</span>). Type it below:</span>
              <input
                type="text"
                value={typedWord}
                onChange={(e) => setTypedWord(e.target.value)}
                placeholder="Type missing word..."
                className="flex-1 bg-surface-elevated border-2 border-outline rounded-xl px-4 py-2 font-mono font-bold focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mt-8 flex justify-end">
        <button
          onClick={checkAnswer}
          disabled={answerItems.length === 0 || isSuccess}
          className="w-full sm:w-auto flex justify-center items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-brand-500/30"
        >
          <Play className="w-5 h-5 fill-current" />
          {t('Check Answer')}
        </button>
      </div>
    </div>
  );
}
