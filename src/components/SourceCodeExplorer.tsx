import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code,
  FolderTree,
  Archive,
  Download,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  FileText,
  Search,
  X,
  RefreshCw,
  ExternalLink,
  Layers,
  Terminal,
  Cpu,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { playSound, triggerHaptic } from '../lib/sounds';

interface SourceCodeExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectFile {
  path: string;
  name: string;
  dir: string;
  size: number;
  updatedAt: string;
  ext: string;
}

interface BackupItem {
  filename: string;
  size: number;
  createdAt: string;
  isDirectory: boolean;
}

export default function SourceCodeExplorer({ isOpen, onClose }: SourceCodeExplorerProps) {
  const [activeTab, setActiveTab] = useState<'files' | 'backups' | 'architecture'>('files');
  const [fileList, setFileList] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('src/App.tsx');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Backups state
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [backupLoading, setBackupLoading] = useState<boolean>(false);
  const [snapshotLabel, setSnapshotLabel] = useState<string>('');
  const [creatingSnapshot, setCreatingSnapshot] = useState<boolean>(false);
  const [rollbackTarget, setRollbackTarget] = useState<string | null>(null);
  const [rollbackStatus, setRollbackStatus] = useState<string | null>(null);

  // Load file list on open
  useEffect(() => {
    if (!isOpen) return;

    fetchFiles();
    fetchBackups();
  }, [isOpen]);

  // Load selected file content
  useEffect(() => {
    if (!selectedFile || !isOpen) return;

    loadFileContent(selectedFile);
  }, [selectedFile, isOpen]);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/dev/files');
      const data = await res.json();
      if (data.files) {
        setFileList(data.files);
        // Default to src/App.tsx if exists
        const hasApp = data.files.some((f: ProjectFile) => f.path === 'src/App.tsx');
        if (hasApp) setSelectedFile('src/App.tsx');
        else if (data.files.length > 0) setSelectedFile(data.files[0].path);
      }
    } catch (e) {
      console.error('Failed to load project files:', e);
    }
  };

  const fetchBackups = async () => {
    try {
      setBackupLoading(true);
      const res = await fetch('/api/dev/backups');
      const data = await res.json();
      if (data.backups) {
        setBackups(data.backups);
      }
    } catch (e) {
      console.error('Failed to load backups:', e);
    } finally {
      setBackupLoading(false);
    }
  };

  const loadFileContent = async (filePath: string) => {
    setFileLoading(true);
    try {
      const res = await fetch(`/api/dev/file?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (data.content !== undefined) {
        setFileContent(data.content);
      } else {
        setFileContent(`// Error loading file: ${data.error || 'Unknown error'}`);
      }
    } catch (e: any) {
      setFileContent(`// Network error loading file: ${e.message}`);
    } finally {
      setFileLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!fileContent) return;
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    playSound('coin');
    triggerHaptic('light');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!fileContent) return;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.split('/').pop() || 'file.txt';
    link.click();
    URL.revokeObjectURL(url);
    playSound('click');
    triggerHaptic('light');
  };

  const handleCreateSnapshot = async () => {
    setCreatingSnapshot(true);
    try {
      const label = snapshotLabel.trim() || 'manual_checkpoint';
      const res = await fetch('/api/dev/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label })
      });
      const data = await res.json();
      if (data.success) {
        playSound('success');
        triggerHaptic('medium');
        setSnapshotLabel('');
        fetchBackups();
      }
    } catch (e) {
      console.error('Snapshot failed:', e);
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const handleExecuteRollback = async (filename: string) => {
    try {
      setRollbackStatus('Restoring snapshot and creating emergency backup...');
      const res = await fetch('/api/dev/backup/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      const data = await res.json();
      if (data.success) {
        playSound('success');
        triggerHaptic('heavy');
        setRollbackStatus(`Rollback completed: ${data.message}. Reloading...`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setRollbackStatus(`Rollback failed: ${data.error}`);
      }
    } catch (e: any) {
      setRollbackStatus(`Rollback error: ${e.message}`);
    }
  };

  if (!isOpen) return null;

  // Filtered files
  const filteredFiles = fileList.filter((f) =>
    f.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group files into logical categories
  const categories: Record<string, ProjectFile[]> = {
    'UI Components': filteredFiles.filter((f) => f.path.startsWith('src/components/')),
    'State & Contexts': filteredFiles.filter((f) => f.path.startsWith('src/contexts/')),
    'Data & Challenges': filteredFiles.filter((f) => f.path.startsWith('src/data/')),
    'Libraries & Utilities': filteredFiles.filter((f) => f.path.startsWith('src/lib/')),
    'Core Application': filteredFiles.filter(
      (f) =>
        f.path === 'src/App.tsx' ||
        f.path === 'src/main.tsx' ||
        f.path === 'src/index.css' ||
        f.path === 'index.html' ||
        f.path === 'server.ts'
    ),
    'Project Configs': filteredFiles.filter(
      (f) =>
        !f.path.startsWith('src/') &&
        f.path !== 'index.html' &&
        f.path !== 'server.ts'
    )
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex flex-col p-2 sm:p-6 overflow-hidden">
        {/* Main Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-7xl h-full mx-auto bg-[#0a0f1d] border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 bg-[#0d1427] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-md">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Developer Vault & Source Code Explorer
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Backups Active
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Inspect complete project source code, copy file-by-file, and manage rollbacks with zero data loss.
                </p>
              </div>
            </div>

            {/* Navigation Tabs & Close */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('files')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'files'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>Files ({fileList.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('backups')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'backups'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Backup & Rollback Vault</span>
                </button>

                <button
                  onClick={() => setActiveTab('architecture')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'architecture'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Architecture</span>
                </button>
              </div>

              {/* Export Full Project Button */}
              <a
                href="/api/dev/export"
                download
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors"
                title="Download full project archive .tar.gz"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Full Project</span>
              </a>

              {/* Close Button */}
              <button
                onClick={() => {
                  playSound('click');
                  triggerHaptic('light');
                  onClose();
                }}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Tab Selector */}
          <div className="sm:hidden flex items-center justify-around border-b border-slate-800 bg-[#0d1427] p-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1 rounded-lg ${activeTab === 'files' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab('backups')}
              className={`px-3 py-1 rounded-lg ${activeTab === 'backups' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Backups & Rollback
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1 rounded-lg ${activeTab === 'architecture' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Architecture
            </button>
          </div>

          {/* TAB 1: FILE EXPLORER */}
          {activeTab === 'files' && (
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              {/* Left Pane: File Tree */}
              <div className="w-full md:w-80 border-r border-slate-800 bg-[#070b16] flex flex-col shrink-0">
                {/* Search Bar */}
                <div className="p-3 border-b border-slate-800">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search project files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Categorized File List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-4 font-mono text-xs">
                  {Object.entries(categories).map(([catTitle, files]) => {
                    if (files.length === 0) return null;
                    return (
                      <div key={catTitle}>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center justify-between">
                          <span>{catTitle}</span>
                          <span className="text-[10px] text-slate-500 font-normal">({files.length})</span>
                        </div>
                        <div className="space-y-0.5">
                          {files.map((file) => {
                            const isSelected = selectedFile === file.path;
                            return (
                              <button
                                key={file.path}
                                onClick={() => {
                                  setSelectedFile(file.path);
                                  playSound('click');
                                  triggerHaptic('light');
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                                  isSelected
                                    ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/40'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                                  <span className="truncate">{file.name}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-sans shrink-0">
                                  {(file.size / 1024).toFixed(1)}k
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Pane: Code Viewer */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#050811] overflow-hidden">
                {/* Code Viewer Toolbar */}
                <div className="px-4 py-2.5 bg-[#090e1c] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs font-mono font-bold text-slate-200 truncate">
                      {selectedFile}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {fileContent.split('\n').length} lines
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied Code!' : 'Copy File'}</span>
                    </button>

                    <button
                      onClick={handleDownloadFile}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                      title="Download file directly"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  </div>
                </div>

                {/* Code Content */}
                <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-slate-200">
                  {fileLoading ? (
                    <div className="flex items-center justify-center h-full text-slate-500 gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Loading file source...</span>
                    </div>
                  ) : (
                    <pre className="whitespace-pre overflow-x-auto">
                      <code>{fileContent}</code>
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKUPS & ROLLBACK VAULT */}
          {activeTab === 'backups' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Snapshot Creator Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Create New Verified Checkpoint Snapshot
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl">
                    Saves an immutable compressed archive of all source files, configurations, and progress structures.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Checkpoint label (e.g. before_update)"
                    value={snapshotLabel}
                    onChange={(e) => setSnapshotLabel(e.target.value)}
                    className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none w-full sm:w-60 font-mono"
                  />
                  <button
                    onClick={handleCreateSnapshot}
                    disabled={creatingSnapshot}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-all active:scale-95 shadow-md shadow-emerald-600/20"
                  >
                    {creatingSnapshot ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>Save Snapshot</span>
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {rollbackStatus && (
                <div className="p-4 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-xs text-indigo-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{rollbackStatus}</span>
                </div>
              )}

              {/* Backup List */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Verified Snapshot Backups ({backups.length})
                    </h4>
                  </div>
                  <button
                    onClick={fetchBackups}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {backups.map((b) => (
                    <div
                      key={b.filename}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-850/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-mono font-bold text-slate-200">
                            {b.filename}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                            <span>{(b.size / 1024).toFixed(1)} KB</span>
                            <span>•</span>
                            <span>{new Date(b.createdAt).toLocaleString()}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-semibold">Integrity Verified</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rollbackTarget === b.filename ? (
                          <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-500/50 p-1.5 rounded-xl">
                            <span className="text-[11px] text-rose-300 font-bold px-2">
                              Confirm Rollback?
                            </span>
                            <button
                              onClick={() => handleExecuteRollback(b.filename)}
                              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors"
                            >
                              Yes, Restore
                            </button>
                            <button
                              onClick={() => setRollbackTarget(null)}
                              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRollbackTarget(b.filename)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Rollback to this</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Frontend Architecture (React 19 + Vite 6 + Tailwind 4)
                  </h3>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    Single Page Application with motion spring transitions, liquid glass design system, and multi-track progression.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                    <li>src/App.tsx: Dual-Gate switcher, router, global mascot & streak listener</li>
                    <li>src/components/BottomNav.tsx: Flagship mobile phone navigation dock</li>
                    <li>src/components/ChallengeView.tsx: Interactive code and tap-to-build engine</li>
                    <li>src/contexts/ProgressContext.tsx: LocalStorage & Firebase progress sync</li>
                  </ul>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Backend Server (Express + Node + Gemini 2.5/3.5)
                  </h3>
                  <p className="text-slate-300 leading-relaxed font-sans">
                    Full-stack server with Vite middleware in development and bundled CJS in production.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                    <li>server.ts: AI evaluation, code interpreter, and agent endpoints</li>
                    <li>/api/agent/*: Headless non-click protocol for ChatGPT & autonomous bots</li>
                    <li>/api/dev/*: Live file inspection, complete project exports, and backup vault</li>
                    <li>/llms.txt: Standardized instructions for LLM crawlers</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-sm text-indigo-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Dual-Gate System (Human 👤 vs AI Agent 🤖)
                </h3>
                <p className="text-slate-300 font-sans leading-relaxed">
                  Allows real humans to interact via standard buttons, clicks, and editor, while simultaneously granting ChatGPT and autonomous bots direct programmatic access to inspect lessons and submit code via REST, window.AI_GATE, and JSON commands with zero mouse clicking.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
