import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Terminal,
  Cpu,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Code2,
  FileCode,
  Zap,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  UserCheck
} from 'lucide-react';
import { TRACKS, challenges, Challenge } from '../data/challenges';
import { playSound, triggerHaptic } from '../lib/sounds';

interface AIAgentGateProps {
  onSwitchToHuman: () => void;
  completedIds: string[];
  onCompleteLesson: (challengeId: string) => void;
  onOpenSourceCode?: () => void;
}

interface CommandLog {
  id: string;
  timestamp: string;
  command: string;
  type: 'input' | 'output' | 'error' | 'system';
  payload?: any;
}

export default function AIAgentGate({ onSwitchToHuman, completedIds, onCompleteLesson, onOpenSourceCode }: AIAgentGateProps) {
  const [activeSubTab, setActiveSubTab] = useState<'console' | 'endpoints' | 'chatgpt' | 'autosolver'>('console');
  const [inputCommand, setInputCommand] = useState('list_tracks');
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'system',
      command: 'system_ready',
      payload: {
        gateway: 'CodeQuest AI Agent Headless Gate (ChatGPT & Automation Protocol)',
        status: 'ONLINE',
        mode: 'NON_CLICK_PROGRAMMATIC_ACCESS',
        totalTracks: TRACKS.length,
        totalChallenges: challenges.length,
        message: 'AI agents and ChatGPT can read challenges, execute code, and submit answers without clicking.'
      }
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Auto solver state
  const [isAutoSolving, setIsAutoSolving] = useState(false);
  const [autoSolverLogs, setAutoSolverLogs] = useState<string[]>([]);
  const autoSolverStopRef = useRef(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playSound('coin');
    triggerHaptic('light');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const executeAgentCommand = async (cmdString: string) => {
    const raw = cmdString.trim();
    if (!raw) return;

    playSound('click');
    triggerHaptic('light');
    setLoading(true);

    const time = new Date().toLocaleTimeString();
    const newLogId = 'cmd-' + Date.now();

    // Append user input
    setLogs((prev) => [
      ...prev,
      {
        id: newLogId,
        timestamp: time,
        command: raw,
        type: 'input'
      }
    ]);

    try {
      const parts = raw.split(' ');
      const action = parts[0].toLowerCase();
      let responsePayload: any = null;

      if (action === 'tracks' || action === 'list_tracks') {
        responsePayload = {
          count: TRACKS.length,
          tracks: TRACKS.map((t) => ({ id: t.id, name: t.name, offset: t.offset }))
        };
      } else if (action === 'challenges') {
        const trackId = parts[1] || 'python';
        const trackChallenges = challenges.filter((c) => c.trackId === trackId).slice(0, 10);
        responsePayload = {
          track: trackId,
          total: trackChallenges.length,
          preview: trackChallenges.map((c) => ({
            id: c.id,
            stage: c.stage,
            level: c.level,
            concept: c.concept,
            title: c.title
          }))
        };
      } else if (action === 'challenge') {
        const id = parts[1] || 'l1';
        const found = challenges.find((c) => c.id === id);
        if (found) {
          responsePayload = {
            id: found.id,
            trackId: found.trackId,
            stage: found.stage,
            level: found.level,
            concept: found.concept,
            title: found.title,
            instruction: found.instruction,
            initialCode: found.initialCode,
            expectedLogic: found.expectedLogic,
            targetCode: found.targetCode
          };
        } else {
          throw new Error(`Challenge with ID '${id}' not found.`);
        }
      } else if (action === 'submit') {
        const id = parts[1];
        const code = parts.slice(2).join(' ');
        if (!id || !code) {
          throw new Error('Usage: submit <challengeId> <codeToSubmit>');
        }
        const challenge = challenges.find((c) => c.id === id);
        if (!challenge) {
          throw new Error(`Challenge '${id}' not found.`);
        }

        // Send to server submit endpoint or evaluate locally
        const res = await fetch('/api/agent/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId: id, code })
        });
        responsePayload = await res.json();

        if (responsePayload.correct) {
          onCompleteLesson(id);
          playSound('success');
        }
      } else if (action === 'run') {
        const lang = parts[1] || 'python';
        const code = parts.slice(2).join(' ');
        const res = await fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, programmingLanguage: lang })
        });
        responsePayload = await res.json();
      } else if (action === 'help') {
        responsePayload = {
          availableCommands: {
            list_tracks: 'Returns all 16 coding tracks',
            'challenges <trackId>': 'Lists the first 10 challenges of a track (e.g. challenges python)',
            'challenge <id>': 'Inspects a challenge prompt and starter code (e.g. challenge l1)',
            'submit <id> <code>': 'Submits code solution programmatically without clicking',
            'run <lang> <code>': 'Executes code through the interpreter',
            clear: 'Clears the console log',
            help: 'Shows this guide'
          }
        };
      } else if (action === 'clear') {
        setLogs([]);
        setLoading(false);
        return;
      } else {
        // Fallback to /api/agent/command
        const res = await fetch('/api/agent/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: raw, args: {} })
        });
        responsePayload = await res.json();
      }

      setLogs((prev) => [
        ...prev,
        {
          id: 'out-' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          command: raw,
          type: 'output',
          payload: responsePayload
        }
      ]);
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          command: raw,
          type: 'error',
          payload: { error: err.message || String(err) }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Run autonomous solver simulation (demonstrating how an AI operates without clicking)
  const startAutonomousSolver = async () => {
    if (isAutoSolving) {
      autoSolverStopRef.current = true;
      setIsAutoSolving(false);
      return;
    }

    setIsAutoSolving(true);
    autoSolverStopRef.current = false;
    setAutoSolverLogs([]);

    const logMsg = (msg: string) => {
      setAutoSolverLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    logMsg('🤖 Starting Autonomous AI Agent loop...');
    logMsg('1. Reading track metadata for "python" without mouse clicks...');

    const pythonChallenges = challenges.filter((c) => c.trackId === 'python').slice(0, 5);

    for (let i = 0; i < pythonChallenges.length; i++) {
      if (autoSolverStopRef.current) {
        logMsg('🛑 Autonomous AI Agent paused by operator.');
        break;
      }

      const ch = pythonChallenges[i];
      logMsg(`🔍 Inspecting Challenge [${ch.id}] - "${ch.title}" (Stage ${ch.stage}, Level ${ch.level})`);
      logMsg(`📖 Prompt: "${ch.instruction}"`);

      await new Promise((r) => setTimeout(r, 1200));

      const codeSolution = ch.targetCode || ch.expectedLogic || `print('Hello')`;
      logMsg(`💡 AI Agent synthesized solution:\n   ${codeSolution.replace(/\n/g, ' ')}`);

      logMsg(`🚀 Dispatching headless POST /api/agent/submit for ${ch.id}...`);
      try {
        const res = await fetch('/api/agent/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ challengeId: ch.id, code: codeSolution })
        });
        const evalRes = await res.json();
        if (evalRes.correct) {
          logMsg(`✅ Verification Passed! ${evalRes.feedback} (+50 XP earned)`);
          onCompleteLesson(ch.id);
          playSound('coin');
          triggerHaptic('light');
        } else {
          logMsg(`❌ Verification Failed: ${evalRes.feedback}`);
        }
      } catch (e: any) {
        logMsg(`⚠️ Error submitting: ${e.message}`);
      }

      await new Promise((r) => setTimeout(r, 1500));
    }

    if (!autoSolverStopRef.current) {
      logMsg('🎉 AI Agent Autonomous cycle completed successfully!');
    }
    setIsAutoSolving(false);
  };

  const chatGptSystemPrompt = `You are an AI Autonomous Agent connected to CodeQuest via the AI Agent Gate.
Because you cannot click with a mouse like a human, use the headless programmatic interface:

API Base URL: ${typeof window !== 'undefined' ? window.location.origin : 'https://codequest.app'}

Available Headless Endpoints:
- GET /api/agent/tracks : Lists all 16 tracks (Python, JS, HTML, CSS, SQL, etc.)
- GET /api/agent/challenges?track=python : Fetches challenges for a track
- GET /api/agent/challenge/{id} : Fetches single challenge with expected logic & starter code
- POST /api/agent/submit : Body: {"challengeId": "l1", "code": "..."} to verify solution
- POST /api/agent/run : Body: {"code": "...", "language": "python"} to execute code
- POST /api/agent/command : Unified command runner

If you are running in a browser session, you can also execute directly via:
- window.AI_GATE.getTracks()
- window.AI_GATE.getChallenge(id)
- window.AI_GATE.submitCode(id, code)
`;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-mono selection:bg-brand-500/40">
      {/* Top Gate Bar */}
      <header className="sticky top-0 z-50 bg-[#0c1220]/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                Gate 2: AI Agent & ChatGPT
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Headless Online
              </span>
            </div>
            <h1 className="text-sm font-bold text-slate-200 mt-0.5">
              CodeQuest Headless Non-Click Protocol
            </h1>
          </div>
        </div>

        {/* Gate Switcher to Human & Source Code */}
        <div className="flex items-center gap-2">
          {onOpenSourceCode && (
            <button
              onClick={() => {
                playSound('click');
                triggerHaptic('light');
                onOpenSourceCode();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all active:scale-95"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Source Code & Backups 💻</span>
            </button>
          )}

          <button
            onClick={() => {
              playSound('click');
              triggerHaptic('medium');
              onSwitchToHuman();
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-brand-500/20 transition-all active:scale-95"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to Human Gate 👤</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Banner Explaining Human vs AI Gate */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Non-Click Access for Autonomous AI & ChatGPT
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">
                Humans use clicks and drag-and-drop. AI agents cannot click with a mouse, so this
                gate exposes structured REST APIs, JSON command runners, and <code className="text-cyan-300 font-mono">window.AI_GATE</code> for
                headless autonomous execution.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400">Total Solved</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">{completedIds.length} / {challenges.length}</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400">Total Tracks</div>
              <div className="text-sm font-bold text-cyan-400 font-mono">{TRACKS.length}</div>
            </div>
          </div>
        </div>

        {/* Sub Navigation Bar for AI Gate */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('console')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
              activeSubTab === 'console'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Interactive AI Console</span>
          </button>

          <button
            onClick={() => setActiveSubTab('chatgpt')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
              activeSubTab === 'chatgpt'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>ChatGPT Custom Actions & Prompts</span>
          </button>

          <button
            onClick={() => setActiveSubTab('endpoints')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
              activeSubTab === 'endpoints'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>REST API Spec & llms.txt</span>
          </button>

          <button
            onClick={() => setActiveSubTab('autosolver')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
              activeSubTab === 'autosolver'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Autonomous AI Solver Demo</span>
          </button>
        </div>

        {/* Tab 1: Interactive AI Console */}
        {activeSubTab === 'console' && (
          <div className="flex flex-col gap-4">
            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Quick Prompts:</span>
              {[
                'list_tracks',
                'challenges python',
                'challenge l1',
                'submit l1 print("Hello World")',
                'run python print(2**10)',
                'help',
                'clear'
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => {
                    setInputCommand(cmd);
                    executeAgentCommand(cmd);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Terminal Window */}
            <div className="bg-[#050811] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
              {/* Terminal Title Bar */}
              <div className="bg-[#0b101c] px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 ml-2 font-mono">
                    ai-agent-terminal@codequest:~$
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLogs([])}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    Clear Screen
                  </button>
                </div>
              </div>

              {/* Logs Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
                {logs.map((log) => (
                  <div key={log.id} className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>[{log.timestamp}]</span>
                      {log.type === 'input' && (
                        <span className="text-cyan-400 font-bold">❯ {log.command}</span>
                      )}
                      {log.type === 'system' && (
                        <span className="text-emerald-400 font-bold">SYSTEM EVENT</span>
                      )}
                      {log.type === 'output' && (
                        <span className="text-indigo-400 font-bold">JSON OUTPUT:</span>
                      )}
                      {log.type === 'error' && (
                        <span className="text-rose-400 font-bold">ERROR:</span>
                      )}
                    </div>

                    {log.payload && (
                      <pre className="p-3 rounded-xl bg-[#0a0e19] border border-slate-800/80 text-slate-200 overflow-x-auto text-[11px] leading-relaxed">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>

              {/* Input Command Line */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeAgentCommand(inputCommand);
                }}
                className="p-3 bg-[#0b101c] border-t border-slate-800 flex items-center gap-2"
              >
                <span className="text-cyan-400 font-bold pl-1">❯</span>
                <input
                  type="text"
                  value={inputCommand}
                  onChange={(e) => setInputCommand(e.target.value)}
                  placeholder="Type an AI command (e.g. list_tracks, challenge l1, submit l1 print('...'), run python ...)"
                  className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 outline-none text-xs font-mono"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Execute</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 2: ChatGPT Custom Actions & Prompts */}
        {activeSubTab === 'chatgpt' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Prompt for ChatGPT */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">ChatGPT Instruction Prompt</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(chatGptSystemPrompt, 'chatgpt-prompt')}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors"
                  >
                    {copiedKey === 'chatgpt-prompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'chatgpt-prompt' ? 'Copied!' : 'Copy Prompt'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-sans mb-3">
                  Copy and paste this instruction into ChatGPT or any Custom GPT. ChatGPT will understand how to browse tracks, get challenges, and submit solutions without clicking.
                </p>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72">
                  {chatGptSystemPrompt}
                </pre>
              </div>
            </div>

            {/* In-Browser Headless Window API */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-bold text-sm text-white">In-Browser window.AI_GATE</h3>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `await window.AI_GATE.submitCode('l1', 'print("Hello World")');`,
                        'window-api'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold transition-colors"
                  >
                    {copiedKey === 'window-api' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'window-api' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 font-sans mb-3">
                  For browser automation agents (Puppeteer, Playwright, Chrome DevTools Protocol, ChatGPT Operator):
                </p>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`// 1. Get all tracks
const tracks = window.AI_GATE.getTracks();

// 2. Fetch challenges for a track
const pythonLessons = window.AI_GATE.getChallenges('python');

// 3. Inspect a specific challenge
const ch = window.AI_GATE.getChallenge('l1');

// 4. Submit code programmatically (No mouse click!)
const result = await window.AI_GATE.submitCode('l1', 'print("Hello World")');

// 5. Run code through interpreter
const output = await window.AI_GATE.runCode('print(42)', 'python');`}
                </pre>
              </div>

              <button
                onClick={() => {
                  executeAgentCommand('challenge l1');
                  setActiveSubTab('console');
                }}
                className="mt-4 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <span>Test in AI Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Endpoints & llms.txt */}
        {activeSubTab === 'endpoints' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Live Machine-Readable Endpoints
              </h3>
              <p className="text-xs text-slate-400 font-sans mb-4">
                These endpoints are directly accessible by cURL, Python requests, ChatGPT Actions, and autonomous agents:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { method: 'GET', path: '/llms.txt', desc: 'Standard standardized documentation for all LLMs' },
                  { method: 'GET', path: '/.well-known/ai-plugin.json', desc: 'ChatGPT plugin manifest file' },
                  { method: 'GET', path: '/api/agent/info', desc: 'API schema and total challenge counts' },
                  { method: 'GET', path: '/api/agent/tracks', desc: 'All 16 coding tracks with metadata' },
                  { method: 'GET', path: '/api/agent/challenges?track=python', desc: 'Challenge list for any track' },
                  { method: 'GET', path: '/api/agent/challenge/:id', desc: 'Single challenge prompt & target code' },
                  { method: 'POST', path: '/api/agent/submit', desc: 'Verify solution (body: { challengeId, code })' },
                  { method: 'POST', path: '/api/agent/run', desc: 'Code interpreter (body: { code, language })' },
                  { method: 'POST', path: '/api/agent/command', desc: 'Universal command gateway for agents' }
                ].map((ep) => (
                  <div
                    key={ep.path}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            ep.method === 'GET'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <code className="text-slate-200 text-xs font-mono">{ep.path}</code>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-sans">{ep.desc}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(ep.path, ep.path)}
                      className="text-slate-500 hover:text-slate-300 p-1"
                      title="Copy endpoint"
                    >
                      {copiedKey === ep.path ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Autonomous Solver Demo */}
        {activeSubTab === 'autosolver' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                  Autonomous AI Agent Simulation (Zero Clicks)
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Watch the AI agent autonomously cycle through Python challenges, read instructions, generate code, and submit verification via the headless gate without any human clicks!
                </p>
              </div>

              <button
                onClick={startAutonomousSolver}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                  isAutoSolving
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                }`}
              >
                {isAutoSolving ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Stop AI Solver</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Autonomous AI Solver</span>
                  </>
                )}
              </button>
            </div>

            {/* Live autonomous execution log */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[300px] max-h-[450px] overflow-y-auto space-y-2 text-xs font-mono">
              {autoSolverLogs.length === 0 ? (
                <div className="text-slate-500 italic text-center py-16">
                  Click "Run Autonomous AI Solver" to watch the AI agent operate without human clicks.
                </div>
              ) : (
                autoSolverLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`leading-relaxed ${
                      log.includes('✅')
                        ? 'text-emerald-400'
                        : log.includes('❌')
                        ? 'text-rose-400'
                        : log.includes('💡')
                        ? 'text-amber-300'
                        : log.includes('🚀')
                        ? 'text-cyan-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
