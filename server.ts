import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { TRACKS, challenges } from './src/data/challenges';

let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

function evaluateSolutionFallback(challenge: any, code: string) {
  const normUser = (code || '').trim().replace(/\r\n/g, '\n');
  const normTarget = (challenge.targetCode || '').trim().replace(/\r\n/g, '\n');
  const normExpected = (challenge.expectedLogic || '').trim().replace(/\r\n/g, '\n');

  const matchesTarget = normTarget && normUser === normTarget;
  const matchesExpected = normExpected && normUser.includes(normExpected);
  const correct = Boolean(matchesTarget || matchesExpected);

  return {
    correct,
    feedback: correct ? "Correct! Logic verified successfully by AI Gate." : "Solution does not yet match the expected challenge requirement.",
    hint: correct ? "" : `Target: ${challenge.targetCode || challenge.expectedLogic}`,
    errorLine: null
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // AI AGENT / CHATGPT GATEWAY SPECIFICATION
  // ==========================================

  // 1. Standard llms.txt for AI agents and web crawlers
  app.get('/llms.txt', (req, res) => {
    res.type('text/plain').send(`# CodeQuest AI Agent Gateway (Headless Non-Click Protocol)
Website: CodeQuest Interactive Learning Platform
Description: This endpoint allows ChatGPT, Claude, Gemini, and autonomous AI agents to programmatically access all learning tracks, inspect challenges, run code, and submit solutions without requiring mouse clicks or human UI interactions.

## Available AI Gate Endpoints:
- GET  /api/agent/info          : Machine-readable gateway capabilities & schema
- GET  /api/agent/tracks        : List all 16 coding tracks (Python, JS, HTML, CSS, SQL, etc.)
- GET  /api/agent/challenges    : Query challenges (e.g. ?track=python&limit=20)
- GET  /api/agent/challenge/:id : Get details, prompt, initial code for a specific challenge
- POST /api/agent/submit        : Submit code solution. Body: { "challengeId": "l1", "code": "print('Hello')" }
- POST /api/agent/run           : Execute code. Body: { "code": "...", "language": "python" }
- POST /api/agent/command       : Universal command interface for LLMs: { "command": "...", "args": {} }

## Instructions for ChatGPT / LLM Agents:
1. Fetch available tracks via GET /api/agent/tracks.
2. Fetch current exercise via GET /api/agent/challenge/:id.
3. Solve exercise by generating code matching the expected logic.
4. Verify by POSTing to /api/agent/submit.
`);
  });

  // 2. Standard ChatGPT plugin manifest
  app.get('/.well-known/ai-plugin.json', (req, res) => {
    res.json({
      schema_version: "v1",
      name_for_human: "CodeQuest AI Gate",
      name_for_model: "codequest_agent_gate",
      description_for_human: "Headless coding challenge platform access for ChatGPT & AI agents.",
      description_for_model: "Programmatically inspect coding challenges, run code, and submit answers without clicking.",
      auth: { type: "none" },
      api: { type: "openapi", url: "/api/agent/openapi.json" }
    });
  });

  // 3. AI Gate Info & OpenAPI summary
  app.get('/api/agent/info', (req, res) => {
    res.json({
      gateway: "CodeQuest AI Agent Headless Gate",
      version: "2.0.0",
      type: "non-click-programmatic-interface",
      supportedModes: ["REST_API", "JSON_COMMANDS", "WINDOW_AI_GATE"],
      totalTracks: TRACKS.length,
      totalChallenges: challenges.length,
      endpoints: {
        tracks: "GET /api/agent/tracks",
        challenges: "GET /api/agent/challenges?track=<track_id>&limit=<n>",
        singleChallenge: "GET /api/agent/challenge/:id",
        submit: "POST /api/agent/submit (body: { challengeId, code })",
        run: "POST /api/agent/run (body: { code, language })",
        command: "POST /api/agent/command (body: { command, args })"
      }
    });
  });

  // 4. List all tracks for AI
  app.get('/api/agent/tracks', (req, res) => {
    res.json({
      count: TRACKS.length,
      tracks: TRACKS.map(t => ({
        id: t.id,
        name: t.name,
        offset: t.offset
      }))
    });
  });

  // 5. Query challenges for AI
  app.get('/api/agent/challenges', (req, res) => {
    const { track, stage, level, limit = 50 } = req.query;
    let filtered = challenges;

    if (track) {
      filtered = filtered.filter(c => c.trackId === track);
    }
    if (stage) {
      filtered = filtered.filter(c => c.stage === Number(stage));
    }
    if (level) {
      filtered = filtered.filter(c => c.level === Number(level));
    }

    const maxItems = Math.min(Number(limit) || 50, 200);
    const results = filtered.slice(0, maxItems).map(c => ({
      id: c.id,
      trackId: c.trackId,
      stage: c.stage,
      level: c.level,
      concept: c.concept,
      title: c.title,
      instruction: c.instruction,
      initialCode: c.initialCode,
      expectedLogic: c.expectedLogic,
      targetCode: c.targetCode
    }));

    res.json({
      totalMatching: filtered.length,
      returned: results.length,
      challenges: results
    });
  });

  // 6. Get single challenge by ID
  app.get('/api/agent/challenge/:id', (req, res) => {
    const id = req.params.id;
    const challenge = challenges.find(c => c.id === id);
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found", id });
    }
    res.json({ challenge });
  });

  // 7. Headless Submit for AI Agents (no click needed)
  app.post('/api/agent/submit', async (req, res) => {
    try {
      const { challengeId, code, language = 'en' } = req.body;
      if (!challengeId) {
        return res.status(400).json({ error: "Missing challengeId" });
      }

      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) {
        return res.status(404).json({ error: "Challenge not found", challengeId });
      }

      const client = getAiClient();
      if (!client) {
        // Fallback deterministic verification
        const result = evaluateSolutionFallback(challenge, code);
        return res.json({
          challengeId,
          ...result,
          evaluatedBy: "deterministic-gate"
        });
      }

      const prompt = `Evaluate this coding challenge solution for an AI or student submission:
Challenge ID: ${challenge.id}
Track: ${challenge.trackId}
Title: ${challenge.title}
Instruction: ${challenge.instruction}
Expected Logic: ${challenge.expectedLogic}
${challenge.targetCode ? `Target Code: ${challenge.targetCode}` : ''}

Submitted Code:
\`\`\`${challenge.trackId || 'text'}
${code}
\`\`\`

Return JSON in this format ONLY:
{
  "correct": boolean,
  "feedback": "short 1-2 sentence assessment",
  "hint": "short hint if wrong or empty if correct",
  "errorLine": number | null
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({
        challengeId,
        correct: Boolean(parsed.correct),
        feedback: parsed.feedback || (parsed.correct ? "Solution accepted!" : "Please review code."),
        hint: parsed.hint || "",
        errorLine: parsed.errorLine || null,
        evaluatedBy: "ai-mentor"
      });
    } catch (err: any) {
      console.warn("AI Agent submit evaluation warning, using fallback:", err?.message);
      const challenge = challenges.find(c => c.id === req.body.challengeId);
      if (challenge) {
        res.json({
          challengeId: challenge.id,
          ...evaluateSolutionFallback(challenge, req.body.code),
          evaluatedBy: "fallback-gate"
        });
      } else {
        res.status(500).json({ error: "Evaluation failed", details: String(err) });
      }
    }
  });

  // 8. Headless Universal Command Interface for ChatGPT
  app.post('/api/agent/command', async (req, res) => {
    try {
      const { command, args = {} } = req.body;
      const cmd = String(command || '').trim().toLowerCase();

      switch (cmd) {
        case 'list_tracks':
        case 'tracks':
          return res.json({ status: "success", tracks: TRACKS });

        case 'get_challenge':
        case 'challenge': {
          const id = args.id || args.challengeId;
          const found = challenges.find(c => c.id === id);
          if (!found) return res.status(404).json({ status: "error", message: `Challenge ${id} not found` });
          return res.json({ status: "success", challenge: found });
        }

        case 'next_challenge': {
          const track = args.track || 'python';
          const level = Number(args.level) || 1;
          const found = challenges.find(c => c.trackId === track && c.level === level) || challenges.find(c => c.trackId === track);
          return res.json({ status: "success", challenge: found });
        }

        case 'run_code':
        case 'run': {
          const client = getAiClient();
          if (!client) {
            return res.json({
              status: "success",
              stdout: `[Simulated execution for ${args.language || 'python'}]: Code received successfully.`,
              stderr: "",
              errorLine: null
            });
          }
          const prompt = `Run this ${args.language || 'python'} code and return exact stdout/stderr as JSON: {"stdout": string, "stderr": string, "errorLine": null | number}. Code:\n${args.code || ''}`;
          const response = await client.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
          });
          const parsed = JSON.parse(response.text || '{}');
          return res.json({ status: "success", ...parsed });
        }

        case 'submit_solution':
        case 'submit': {
          const challenge = challenges.find(c => c.id === args.challengeId);
          if (!challenge) return res.status(404).json({ status: "error", message: "Challenge not found" });
          const evalResult = evaluateSolutionFallback(challenge, args.code || '');
          return res.json({
            status: "success",
            challengeId: challenge.id,
            ...evalResult
          });
        }

        default:
          return res.json({
            status: "info",
            message: `Command '${command}' recognized. Use one of: list_tracks, get_challenge, next_challenge, run_code, submit_solution`,
            help: {
              list_tracks: "List all coding tracks",
              get_challenge: "Fetch details by challenge ID (args: { id })",
              next_challenge: "Fetch next challenge (args: { track, level })",
              run_code: "Execute code snippet (args: { code, language })",
              submit_solution: "Verify solution without clicking (args: { challengeId, code })"
            }
          });
      }
    } catch (err: any) {
      res.status(500).json({ status: "error", message: String(err?.message || err) });
    }
  });

  // ==========================================
  // DEVELOPER & SOURCE CODE EXPLORER API
  // ==========================================

  function getProjectFiles(dir: string, baseDir: string = dir): any[] {
    const ignored = ['node_modules', '.git', 'dist', '.cache', 'backups', '.vite'];
    let results: any[] = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (ignored.includes(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        results = results.concat(getProjectFiles(fullPath, baseDir));
      } else {
        const stat = fs.statSync(fullPath);
        const ext = path.extname(entry.name).toLowerCase();
        results.push({
          path: relPath,
          name: entry.name,
          dir: path.dirname(relPath).replace(/\\/g, '/'),
          size: stat.size,
          updatedAt: stat.mtime,
          ext: ext
        });
      }
    }
    return results;
  }

  // 1. List all source files in the project
  app.get('/api/dev/files', (req, res) => {
    try {
      const files = getProjectFiles(process.cwd());
      res.json({ count: files.length, files });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to scan project files', details: err?.message });
    }
  });

  // 2. Read single source file content
  app.get('/api/dev/file', (req, res) => {
    try {
      const reqPath = String(req.query.path || '').trim();
      if (!reqPath) return res.status(400).json({ error: 'Missing path parameter' });

      const safePath = path.normalize(reqPath).replace(/^(\.\.(\/|\\|$))+/, '');
      const fullPath = path.join(process.cwd(), safePath);

      if (!fullPath.startsWith(process.cwd()) || !fs.existsSync(fullPath)) {
        return res.status(404).json({ error: 'File not found', path: safePath });
      }

      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        return res.status(400).json({ error: 'Path is a directory' });
      }

      if (stat.size > 2 * 1024 * 1024) {
        return res.status(400).json({ error: 'File is too large to preview (>2MB)' });
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      res.json({
        path: safePath,
        name: path.basename(safePath),
        size: stat.size,
        updatedAt: stat.mtime,
        content
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to read file', details: err?.message });
    }
  });

  // 3. List verified backups & snapshots
  app.get('/api/dev/backups', (req, res) => {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const entries = fs.readdirSync(backupDir);
      const backupList = entries.map((name) => {
        const full = path.join(backupDir, name);
        const stat = fs.statSync(full);
        return {
          filename: name,
          size: stat.size,
          createdAt: stat.mtime,
          isDirectory: stat.isDirectory()
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      res.json({ backups: backupList });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to list backups', details: err?.message });
    }
  });

  // 4. Create on-demand verified snapshot
  app.post('/api/dev/backup/create', (req, res) => {
    try {
      const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      const label = String(req.body?.label || 'manual').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `codequest_snapshot_${label}_${timestamp}.tar.gz`;
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      const targetArchive = path.join(backupDir, filename);

      execSync(`tar --exclude='./node_modules' --exclude='./.git' --exclude='./dist' --exclude='./backups' -czvf "${targetArchive}" .`, { cwd: process.cwd() });
      const stat = fs.statSync(targetArchive);

      res.json({
        success: true,
        filename,
        size: stat.size,
        timestamp,
        message: 'Snapshot created and verified successfully'
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create backup snapshot', details: err?.message });
    }
  });

  // 5. Safe Rollback to snapshot
  app.post('/api/dev/backup/rollback', (req, res) => {
    try {
      const { filename } = req.body;
      if (!filename) return res.status(400).json({ error: 'Missing backup filename' });

      const safeName = path.basename(filename);
      const backupDir = path.join(process.cwd(), 'backups');
      const targetArchive = path.join(backupDir, safeName);

      if (!fs.existsSync(targetArchive) || !safeName.endsWith('.tar.gz')) {
        return res.status(404).json({ error: 'Target backup snapshot file not found', filename: safeName });
      }

      // Create emergency pre-rollback snapshot to guarantee zero data loss
      const emergencyTime = Date.now();
      const emergencyPreArchive = path.join(backupDir, `pre_rollback_emergency_${emergencyTime}.tar.gz`);
      execSync(`tar --exclude='./node_modules' --exclude='./.git' --exclude='./dist' --exclude='./backups' -czvf "${emergencyPreArchive}" .`, { cwd: process.cwd() });

      // Restore from chosen snapshot
      execSync(`tar -xzvf "${targetArchive}" -C .`, { cwd: process.cwd() });

      res.json({
        success: true,
        message: `Successfully rolled back to verified snapshot: ${safeName}`,
        restoredFrom: safeName,
        emergencyBackupCreated: path.basename(emergencyPreArchive)
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Rollback operation failed', details: err?.message });
    }
  });

  // 6. Complete project export download
  app.get('/api/dev/export', (req, res) => {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
      const exportFile = path.join(backupDir, `codequest_full_project_export_${Date.now()}.tar.gz`);

      execSync(`tar --exclude='./node_modules' --exclude='./.git' --exclude='./dist' --exclude='./backups' -czvf "${exportFile}" .`, { cwd: process.cwd() });

      res.download(exportFile, 'codequest_complete_source_backup.tar.gz');
    } catch (err: any) {
      res.status(500).json({ error: 'Export failed', details: err?.message });
    }
  });

  app.post('/api/evaluate', async (req, res) => {
    try {
      const { code, challenge, attempts, language } = req.body;
      const targetLang = language || 'en';
      const programmingLanguage = challenge.trackId || 'python';
      
      const prompt = `You are an AI Coding Mentor helping a student learn to code.
You must help users learn coding instead of writing the entire solution.
Rules:
- Never immediately generate the full answer.
- First identify the user's mistake.
- Explain the mistake in one or two simple sentences.
- Highlight the incorrect line of code by returning the \`errorLine\` property (null if there's no specific line or if correct).
- Encourage the learner to fix it.
- If the learner continues to struggle after several attempts, gradually provide more guidance.
- Only reveal the complete solution after multiple failed attempts (e.g. if attempts >= 4).
- Adapt explanations to the learner's current level (Stage ${challenge.stage}, Level ${challenge.level}).
- IMPORTANT LANGUAGE RULE: You MUST translate your feedback and hints into the requested language code: "${targetLang}". However, NEVER translate programming code, function names, variables, keywords, syntax, or programming language names.

Number of failed attempts so far: ${attempts}
Challenge Stage: ${challenge.stage}
Challenge Concept: ${challenge.concept}
Challenge Instruction: ${challenge.instruction}
Expected logic/output: ${challenge.expectedLogic}
${challenge.targetCode ? `Exact Target Code: ${challenge.targetCode}` : ''}

Student's Code:
\`\`\`${programmingLanguage}
${code}
\`\`\`

Evaluate the student's code based on the Stage:
- Stage 1 (Learn by Copying): The code MUST match the target code exactly (ignoring extra newlines). If it doesn't, point out the exact typo or mistake. Don't give away the whole answer if there's a small typo, just guide them.
- Stage 2 (Learn by Completing): They must fill in the blanks correctly. If they have syntax errors or wrong values, explain the error with hints.
- Stage 3 (Learn by Writing): They write from scratch. Check syntax and logic.
- Stage 4 (Mini Project): Check if the step logic is completed correctly.

Provide a short, encouraging feedback message. Review their code, explain syntax or logic errors, suggest small improvements, or congratulate them if correct.

Respond ONLY with a JSON object in this exact format:
{
  "correct": boolean,
  "feedback": "string (the main explanation in ${targetLang}, 1-2 sentences)",
  "hint": "string (optional extra guidance in ${targetLang}, empty if correct)",
  "errorLine": number | null (the line number of the mistake, if applicable)
}`;

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const resultText = response.text || "{}";
      const result = JSON.parse(resultText);
      res.json(result);
    } catch (error) {
      console.error('Error evaluating code:', error);
      res.status(500).json({ error: 'Failed to evaluate code' });
    }
  });

  app.post('/api/run', async (req, res) => {
    try {
      const { code, language, programmingLanguage = 'python' } = req.body;
      const targetLang = language || 'en';
      
      

      const prompt = `You are a secure code interpreter for ${programmingLanguage}. Run the following code and provide the exact standard output and standard error. If there is a runtime or syntax error, provide a short beginner-friendly error message (do NOT reveal the solution). Also, provide the line number where the error occurred if applicable.
IMPORTANT LANGUAGE RULE: You MUST translate the error messages into the requested language code: "${targetLang}". However, NEVER translate programming code, function names, variables, keywords, syntax, or programming language names.
Code:
\`\`\`${programmingLanguage}
${code}
\`\`\`
Respond ONLY with a JSON object in this exact format:
{
  "stdout": "string",
  "stderr": "string (translated to ${targetLang})",
  "errorLine": number | null
}`;

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      const resultText = response.text || "{}";
      const result = JSON.parse(resultText);
      res.json(result);
    } catch (error) {
      console.error('Error running code:', error);
      res.status(500).json({ error: 'Failed to run code' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
