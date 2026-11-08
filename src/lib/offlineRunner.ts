import { Challenge } from '../data/challenges';

export interface EvaluationResult {
  correct: boolean;
  feedback: string;
  hint: string;
  errorLine: number | null;
  offlineEvaluated?: boolean;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  errorLine: number | null;
  offlineExecuted?: boolean;
}

/**
 * Normalizes code by standardizing line breaks, trimming whitespace,
 * and normalizing quotes and spaces where appropriate.
 */
function normalizeCode(str: string): string {
  return (str || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Strips comments from code for semantic comparison
 */
function stripComments(code: string, trackId: string): string {
  if (['html', 'xml'].includes(trackId)) {
    return code.replace(/<!--[\s\S]*?-->/g, '');
  }
  if (['css'].includes(trackId)) {
    return code.replace(/\/\*[\s\S]*?\*\//g, '');
  }
  if (['python', 'python_practice', 'bash', 'ruby', 'r'].includes(trackId)) {
    return code.replace(/#.*$/gm, '');
  }
  // JS, TS, C, C++, Java, Rust, Go, Swift, PHP, etc.
  return code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Basic syntax validator for Python code to catch beginners' typos offline
 */
function checkPythonSyntax(code: string): { hasError: boolean; message: string; line: number | null } {
  const lines = code.split('\n');
  let openParenCount = 0;
  let openBracketCount = 0;
  let openBraceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines and full comment lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check for unclosed single or double quotes within a single line (excluding multiline strings)
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escaped = false;

    for (let charIndex = 0; charIndex < trimmed.length; charIndex++) {
      const char = trimmed[charIndex];

      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '#' && !inSingleQuote && !inDoubleQuote) {
        break; // Ignore comments on this line
      }
      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
      } else if (!inSingleQuote && !inDoubleQuote) {
        if (char === '(') openParenCount++;
        else if (char === ')') openParenCount--;
        else if (char === '[') openBracketCount++;
        else if (char === ']') openBracketCount--;
        else if (char === '{') openBraceCount++;
        else if (char === '}') openBraceCount--;
      }
    }

    if (inSingleQuote || inDoubleQuote) {
      return {
        hasError: true,
        message: `SyntaxError: EOL while scanning string literal (unclosed quotation mark on line ${lineNum})`,
        line: lineNum,
      };
    }

    // Check for missing colon after if, for, while, def, class, elif, else
    const colonKeywords = /^(if\s+|elif\s+|else:|for\s+|while\s+|def\s+|class\s+|try:|except.*:|finally:)/;
    if (colonKeywords.test(trimmed) && !trimmed.endsWith(':') && !trimmed.includes('#')) {
      // If no open parentheses spanning multiple lines
      if (openParenCount === 0) {
        return {
          hasError: true,
          message: `SyntaxError: expected ':' at the end of statement on line ${lineNum}`,
          line: lineNum,
        };
      }
    }
  }

  if (openParenCount > 0) {
    return { hasError: true, message: "SyntaxError: unexpected EOF while parsing (unclosed '(')", line: lines.length };
  }
  if (openBracketCount > 0) {
    return { hasError: true, message: "SyntaxError: unexpected EOF while parsing (unclosed '[')", line: lines.length };
  }
  if (openBraceCount > 0) {
    return { hasError: true, message: "SyntaxError: unexpected EOF while parsing (unclosed '{')", line: lines.length };
  }

  return { hasError: false, message: '', line: null };
}

/**
 * Intelligent client-side challenge evaluator that works completely offline.
 */
export function evaluateOffline(
  challenge: Challenge,
  userCode: string,
  attempts: number,
  _language: string = 'en'
): EvaluationResult {
  const normUser = normalizeCode(userCode);
  const normTarget = normalizeCode(challenge.targetCode || '');
  const normExpected = normalizeCode(challenge.expectedLogic || '');
  const track = challenge.trackId || 'python';

  // Check for blank placeholder leftover in Stage 2
  if (challenge.stage === 2 && (normUser.includes('___') || normUser.includes('FILL_IN'))) {
    return {
      correct: false,
      feedback: 'Please fill in all blanks (___) with the correct code.',
      hint: challenge.targetCode ? `Look at what is needed: ${challenge.targetCode}` : 'Fill in the missing values.',
      errorLine: null,
      offlineEvaluated: true,
    };
  }

  // Syntax check for Python
  if (['python', 'python_practice'].includes(track)) {
    const syntax = checkPythonSyntax(userCode);
    if (syntax.hasError) {
      return {
        correct: false,
        feedback: syntax.message,
        hint: 'Check your syntax, quotes, and punctuation.',
        errorLine: syntax.line,
        offlineEvaluated: true,
      };
    }
  }

  // 1. Exact match with target code
  if (normTarget && normUser === normTarget) {
    return {
      correct: true,
      feedback: 'Excellent work! Your code matches the target solution perfectly.',
      hint: '',
      errorLine: null,
      offlineEvaluated: true,
    };
  }

  // 2. Comments-stripped match
  const strippedUser = normalizeCode(stripComments(userCode, track));
  const strippedTarget = normalizeCode(stripComments(challenge.targetCode || '', track));
  if (strippedTarget && strippedUser === strippedTarget) {
    return {
      correct: true,
      feedback: 'Great job! Your logic and solution are completely correct.',
      hint: '',
      errorLine: null,
      offlineEvaluated: true,
    };
  }

  // 3. Expected logic or substring verification
  if (normExpected && (normUser.includes(normExpected) || strippedUser.includes(normExpected))) {
    return {
      correct: true,
      feedback: 'Outstanding! You implemented the required logic correctly.',
      hint: '',
      errorLine: null,
      offlineEvaluated: true,
    };
  }

  // 4. Flexible keyword & pattern verification based on challenge level/instruction
  const targetTokens = normTarget.split(/\s+/).filter(Boolean);
  const userTokens = normUser.split(/\s+/).filter(Boolean);

  // If stage 1, point out the exact mismatch line
  if (challenge.stage === 1 && normTarget) {
    const userLines = normUser.split('\n');
    const targetLines = normTarget.split('\n');
    let mismatchLine: number | null = null;

    for (let i = 0; i < Math.max(userLines.length, targetLines.length); i++) {
      if (userLines[i] !== targetLines[i]) {
        mismatchLine = i + 1;
        break;
      }
    }

    return {
      correct: false,
      feedback: 'Not quite yet. In Stage 1, your code should match the target code line by line.',
      hint: attempts >= 2 ? `Target: ${challenge.targetCode}` : 'Check for typos, spacing, or quotes.',
      errorLine: mismatchLine,
      offlineEvaluated: true,
    };
  }

  // If high similarity token match
  if (targetTokens.length > 0) {
    let matchedTokens = 0;
    targetTokens.forEach(token => {
      if (userTokens.includes(token)) matchedTokens++;
    });

    const tokenRatio = matchedTokens / targetTokens.length;
    if (tokenRatio >= 0.95 && targetTokens.length > 3) {
      return {
        correct: true,
        feedback: 'Great job! Your solution meets all key requirements.',
        hint: '',
        errorLine: null,
        offlineEvaluated: true,
      };
    }
  }

  return {
    correct: false,
    feedback: 'Your code does not yet produce the expected result. Review the instructions and try again.',
    hint: attempts >= 3 && challenge.targetCode ? `Hint: ${challenge.targetCode}` : (challenge.expectedLogic ? `Expected: ${challenge.expectedLogic}` : 'Review the instructions carefully.'),
    errorLine: null,
    offlineEvaluated: true,
  };
}

/**
 * Lightweight client-side simulator for code execution when offline.
 * Simulates Python outputs, JavaScript, HTML visual rendering, etc.
 */
export function runOffline(
  code: string,
  trackId: string = 'python',
  _language: string = 'en'
): RunResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return { stdout: '', stderr: '', errorLine: null, offlineExecuted: true };
  }

  if (['html', 'css', 'js', 'javascript'].includes(trackId)) {
    return { stdout: 'visual_render', stderr: '', errorLine: null, offlineExecuted: true };
  }

  if (['python', 'python_practice'].includes(trackId)) {
    // 1. First check for syntax errors
    const syntax = checkPythonSyntax(code);
    if (syntax.hasError) {
      return {
        stdout: '',
        stderr: syntax.message,
        errorLine: syntax.line,
        offlineExecuted: true,
      };
    }

    // 2. Extract prints and evaluate simple expressions
    const lines = code.split('\n');
    const outputs: string[] = [];
    const variables: Record<string, any> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      // Variable assignment: x = 10 or name = "Alex"
      const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (assignMatch && !line.startsWith('print')) {
        const varName = assignMatch[1];
        const rawVal = assignMatch[2].trim();

        // String literal
        if ((rawVal.startsWith('"') && rawVal.endsWith('"')) || (rawVal.startsWith("'") && rawVal.endsWith("'"))) {
          variables[varName] = rawVal.slice(1, -1);
        } else if (!isNaN(Number(rawVal))) {
          variables[varName] = Number(rawVal);
        } else if (rawVal === 'True') {
          variables[varName] = true;
        } else if (rawVal === 'False') {
          variables[varName] = false;
        } else if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
          variables[varName] = rawVal;
        } else if (variables[rawVal] !== undefined) {
          variables[varName] = variables[rawVal];
        }
        continue;
      }

      // print(...) statement
      const printMatch = line.match(/^print\s*\(([\s\S]*)\)$/);
      if (printMatch) {
        const arg = printMatch[1].trim();

        // Empty print()
        if (!arg) {
          outputs.push('');
          continue;
        }

        // String literal print("Hello World")
        if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
          outputs.push(arg.slice(1, -1));
          continue;
        }

        // Formatted f-string print(f"Hello {name}")
        if (arg.startsWith('f"') || arg.startsWith("f'")) {
          const content = arg.slice(2, -1);
          const interpolated = content.replace(/\{([a-zA-Z_]\w*)\}/g, (_, v) => {
            return variables[v] !== undefined ? String(variables[v]) : `{${v}}`;
          });
          outputs.push(interpolated);
          continue;
        }

        // Variable print
        if (variables[arg] !== undefined) {
          outputs.push(String(variables[arg]));
          continue;
        }

        // Substitute known numeric/string variables in math expressions
        let evalArg = arg;
        for (const [varKey, varVal] of Object.entries(variables)) {
          const varRegex = new RegExp(`\\b${varKey}\\b`, 'g');
          if (typeof varVal === 'number' || typeof varVal === 'boolean') {
            evalArg = evalArg.replace(varRegex, String(varVal));
          }
        }

        // Simple math expression print(2 + 2) or print(x * 5)
        if (/^[\d\s+\-*/%().]+$/.test(evalArg)) {
          try {
            // Safe evaluation of pure arithmetic numbers and operators
            // eslint-disable-next-line no-eval
            const res = Function(`"use strict"; return (${evalArg})`)();
            outputs.push(String(res));
            continue;
          } catch (e) {
            // ignore
          }
        }

        // Comma separated arguments print("A", "B", 123)
        const parts = arg.split(',').map(p => p.trim());
        if (parts.length > 1) {
          const evalParts = parts.map(p => {
            if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
              return p.slice(1, -1);
            }
            if (variables[p] !== undefined) return String(variables[p]);
            return p;
          });
          outputs.push(evalParts.join(' '));
          continue;
        }

        // Fallback for general print argument
        outputs.push(arg);
      }
    }

    if (outputs.length > 0) {
      return {
        stdout: outputs.join('\n'),
        stderr: '',
        errorLine: null,
        offlineExecuted: true,
      };
    }

    // Code executed cleanly without print output
    return {
      stdout: '[Program finished with exit code 0 (no output)]',
      stderr: '',
      errorLine: null,
      offlineExecuted: true,
    };
  }

  // Default simulated execution
  return {
    stdout: `[Offline execution completed for ${trackId}]`,
    stderr: '',
    errorLine: null,
    offlineExecuted: true,
  };
}
