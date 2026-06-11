#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

const log = (msg: string, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`);

const readPackageJson = () => {
  try {
    return JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  } catch {
    return {};
  }
};

const getFilesRecursive = (dir: string): string[] => {
  let files: string[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getFilesRecursive(fullPath));
      } else {
        files.push(fullPath);
      }
    }
  } catch {}
  return files;
};

const checkSecurity = (): number => {
  let score = 0;
  const pkg = readPackageJson();

  if (pkg.dependencies?.['next-auth']) score += 15;
  if (pkg.dependencies?.zod || pkg.dependencies?.yup) score += 15;
  if (fs.existsSync(path.join(rootDir, '.env.example'))) score += 10;
  if (pkg.dependencies?.dompurify) score += 12;
  if (pkg.dependencies?.['jose']) score += 12;

  const appDir = path.join(rootDir, 'app');
  if (fs.existsSync(appDir)) {
    const files = getFilesRecursive(appDir).filter(f => f.endsWith('.ts'));
    let hasSecrets = false;
    for (const file of files.slice(0, 20)) {
      if (fs.readFileSync(file, 'utf-8').match(/password\s*=\s*['"]/)) {
        hasSecrets = true;
        break;
      }
    }
    if (!hasSecrets) score += 14;
  }

  return Math.min(score, 100);
};

const checkCodeQuality = (): number => {
  let score = 0;
  const tsconfig = path.join(rootDir, 'tsconfig.json');

  if (fs.existsSync(tsconfig)) {
    const cfg = JSON.parse(fs.readFileSync(tsconfig, 'utf-8'));
    if (cfg.compilerOptions?.strict) score += 15;
  }

  if (fs.existsSync(path.join(rootDir, '.eslintrc.js')) ||
      fs.existsSync(path.join(rootDir, 'eslint.config.mjs'))) score += 12;
  if (fs.existsSync(path.join(rootDir, '.prettierrc'))) score += 12;

  const componentsDir = path.join(rootDir, 'components');
  if (fs.existsSync(componentsDir)) {
    const componentCount = getFilesRecursive(componentsDir).filter(f => f.endsWith('.tsx')).length;
    if (componentCount > 10) score += 20;
    else if (componentCount > 5) score += 10;
  }

  const appDir = path.join(rootDir, 'app');
  if (fs.existsSync(appDir)) {
    const files = getFilesRecursive(appDir).filter(f => f.endsWith('.tsx'));
    let noAny = 0;
    for (const file of files.slice(0, 20)) {
      if (!fs.readFileSync(file, 'utf-8').includes(': any')) {
        noAny++;
      }
    }
    score += (noAny / Math.min(20, files.length)) * 15;
  }

  return Math.min(score, 100);
};

const checkTesting = (): number => {
  let score = 0;
  const pkg = readPackageJson();

  if (pkg.devDependencies?.jest || pkg.devDependencies?.vitest) score += 20;
  if (pkg.devDependencies?.['@testing-library/react']) score += 15;

  const appDir = path.join(rootDir, 'app');
  if (fs.existsSync(appDir)) {
    const testCount = getFilesRecursive(appDir).filter(f => f.endsWith('.test.tsx') || f.endsWith('.test.ts')).length;
    if (testCount > 10) score += 30;
    else if (testCount > 5) score += 20;
    else if (testCount > 0) score += 10;
  }

  if (fs.existsSync(path.join(rootDir, 'jest.config.js'))) score += 15;

  return Math.min(score, 100);
};

const checkPerformance = (): number => {
  let score = 0;
  const pkg = readPackageJson();

  if (pkg.dependencies?.sharp) score += 15;

  const appDir = path.join(rootDir, 'app');
  if (fs.existsSync(appDir)) {
    const files = getFilesRecursive(appDir).filter(f => f.endsWith('.tsx'));
    let hasImageOpt = 0;
    let hasDynamic = 0;

    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('Image')) hasImageOpt++;
      if (content.includes('dynamic(')) hasDynamic++;
    }

    score += (hasImageOpt / Math.min(15, files.length)) * 20;
    score += (hasDynamic / Math.min(15, files.length)) * 15;
  }

  if (pkg.dependencies?.tailwindcss) score += 10;

  return Math.min(score, 100);
};

const checkStateManagement = (): number => {
  let score = 0;
  const pkg = readPackageJson();

  if (pkg.dependencies?.zustand) score += 25;
  else if (pkg.dependencies?.['@tanstack/react-query']) score += 25;
  else if (pkg.dependencies?.swr) score += 20;

  const appDir = path.join(rootDir, 'app');
  if (fs.existsSync(appDir)) {
    const files = getFilesRecursive(appDir).filter(f => f.endsWith('.tsx'));
    let contextCount = 0;
    for (const file of files.slice(0, 10)) {
      if (fs.readFileSync(file, 'utf-8').includes('useContext')) {
        contextCount++;
      }
    }
    score += (contextCount / Math.min(10, files.length)) * 20;
  }

  const hooksDir = path.join(rootDir, 'hooks');
  if (fs.existsSync(hooksDir)) score += 15;

  return Math.min(score, 100);
};

const checkErrorHandling = (): number => {
  let score = 0;
  const appDir = path.join(rootDir, 'app');

  if (fs.existsSync(appDir)) {
    if (fs.existsSync(path.join(appDir, 'error.tsx'))) score += 25;
    if (fs.existsSync(path.join(appDir, 'not-found.tsx'))) score += 15;
    if (fs.existsSync(path.join(appDir, 'global-error.tsx'))) score += 15;

    const files = getFilesRecursive(appDir).filter(f => f.endsWith('.tsx'));
    let tryCatch = 0;
    for (const file of files.slice(0, 15)) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('try') && content.includes('catch')) {
        tryCatch++;
      }
    }
    score += (tryCatch / Math.min(15, files.length)) * 20;
  }

  const pkg = readPackageJson();
  if (pkg.dependencies?.['@sentry/react']) score += 10;

  return Math.min(score, 100);
};

const checkLogging = (): number => {
  let score = 0;
  const pkg = readPackageJson();

  if (pkg.dependencies?.winston || pkg.dependencies?.pino) score += 30;
  if (pkg.dependencies?.['@sentry/react'] || pkg.dependencies?.['@sentry/nextjs']) score += 20;

  const appDir = path.join(rootDir, 'app');
  if (fs.existsSync(appDir)) {
    const files = getFilesRecursive(appDir).filter(f => f.endsWith('.tsx'));
    let hasLogger = 0;
    for (const file of files.slice(0, 10)) {
      if (fs.readFileSync(file, 'utf-8').includes('logger')) {
        hasLogger++;
      }
    }
    score += (hasLogger / Math.min(10, files.length)) * 20;
  }

  const libDir = path.join(rootDir, 'lib');
  if (fs.existsSync(libDir)) {
    if (getFilesRecursive(libDir).some(f => f.includes('logger'))) score += 15;
  }

  return Math.min(score, 100);
};

const run = () => {
  console.clear();
  log(`\n${'═'.repeat(80)}`, colors.blue);
  log(`📊 EDUSPHERE PRODUCTION READINESS REPORT`, colors.bold + colors.blue);
  log(`Generated: ${new Date().toLocaleString()}`, colors.dim);
  log(`${'═'.repeat(80)}\n`, colors.blue);

  const scores = [
    { name: 'Security', score: checkSecurity() },
    { name: 'Code Quality', score: checkCodeQuality() },
    { name: 'Testing', score: checkTesting() },
    { name: 'Performance', score: checkPerformance() },
    { name: 'State Management', score: checkStateManagement() },
    { name: 'Error Handling', score: checkErrorHandling() },
    { name: 'Logging', score: checkLogging() }
  ];

  const overall = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);

  log('\nProduction Readiness by Aspect:\n', colors.bold);
  scores.forEach(s => {
    const icon = s.score >= 80 ? '✅' : s.score >= 60 ? '⚠️ ' : '❌';
    const color = s.score >= 80 ? colors.green : s.score >= 60 ? colors.yellow : colors.red;
    const barLen = 30;
    const filled = Math.round((s.score / 100) * barLen);
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);
    log(`  ${s.name.padEnd(20)} ${String(s.score).padStart(3)}% ${icon} ${color}${bar}${colors.reset}`, '');
  });

  const overallIcon = overall >= 80 ? '✅' : overall >= 60 ? '⚠️ ' : '❌';
  const overallColor = overall >= 80 ? colors.green : overall >= 60 ? colors.yellow : colors.red;
  const overallBar = '█'.repeat(Math.round((overall / 100) * 40)) + '░'.repeat(40 - Math.round((overall / 100) * 40));

  log(`\n${'─'.repeat(80)}`, colors.blue);
  log(`\nOVERALL SCORE: ${overall}% ${overallIcon}`, colors.bold + overallColor);
  log(`${overallColor}${overallBar}${colors.reset}\n`, '');
};

run();
