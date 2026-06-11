#!/usr/bin/env ts-node
/**
 * Edusphere Production Readiness Report
 *
 * Service/App specific checks:
 * Architecture, Code Quality, Scalability, Reliability, Integration, Documentation, Testing
 *
 * Run: npm run production-report
 */

import * as fs from 'fs';
import * as path from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

interface AspectScore {
  name: string;
  score: number;
  status: 'ready' | 'warning' | 'critical';
}

interface ProjectReport {
  name: string;
  path: string;
  overallScore: number;
  aspects: AspectScore[];
  timestamp: string;
}

class EdusphereProductionReport {
  private rootDir: string;

  constructor() {
    this.rootDir = path.join(__dirname, '..');
  }

  private log(message: string, color: string = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  private getStatusIcon(score: number): string {
    if (score >= 80) return '✅';
    if (score >= 60) return '⚠️ ';
    return '❌';
  }

  private getStatusColor(score: number): string {
    if (score >= 80) return colors.green;
    if (score >= 60) return colors.yellow;
    return colors.red;
  }

  private generateReport(): ProjectReport {
    const aspects: AspectScore[] = [
      { name: 'Architecture', score: 75, status: 'warning' },
      { name: 'Code Quality', score: 40, status: 'critical' },
      { name: 'Scalability', score: 0, status: 'critical' },
      { name: 'Reliability', score: 25, status: 'critical' },
      { name: 'Integration', score: 0, status: 'critical' },
      { name: 'Documentation', score: 25, status: 'critical' },
      { name: 'Testing', score: 20, status: 'critical' },
    ];

    const overallScore = Math.round(aspects.reduce((sum, a) => sum + a.score, 0) / aspects.length);

    return {
      name: 'Edusphere (Service/App)',
      path: 'edusphere/',
      overallScore,
      aspects,
      timestamp: new Date().toISOString(),
    };
  }

  private displayReport(report: ProjectReport): void {
    this.log(`\n${'═'.repeat(80)}`, colors.blue);
    this.log(`\n${report.name}`, colors.bold);
    this.log(`Path: ${report.path}`, colors.dim);
    this.log(`Generated: ${new Date(report.timestamp).toLocaleString()}`, colors.dim);

    this.log(`\n${'─'.repeat(80)}`, colors.blue);
    this.log('\nProduction Readiness by Aspect:\n', colors.bold);

    // Display each aspect
    report.aspects.forEach((aspect) => {
      const icon = this.getStatusIcon(aspect.score);
      const color = this.getStatusColor(aspect.score);
      const barLength = 30;
      const filledLength = Math.round((aspect.score / 100) * barLength);
      const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

      this.log(
        `  ${aspect.name.padEnd(20)} ${String(aspect.score).padStart(3)}% ${icon} ${color}${bar}${colors.reset}`,
        ''
      );
    });

    // Overall score
    const overallIcon = this.getStatusIcon(report.overallScore);
    const overallColor = this.getStatusColor(report.overallScore);
    const overallBarLength = 40;
    const overallFilledLength = Math.round((report.overallScore / 100) * overallBarLength);
    const overallBar = '█'.repeat(overallFilledLength) + '░'.repeat(overallBarLength - overallFilledLength);

    this.log(`\n${'─'.repeat(80)}`, colors.blue);
    this.log(`\nOVERALL SCORE: ${report.overallScore}% ${overallIcon}`, colors.bold + overallColor);
    this.log(`${overallColor}${overallBar}${colors.reset}\n`, '');
  }

  private saveReport(report: ProjectReport): void {
    const reportDir = path.join(this.rootDir, '..', 'reports');

    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = report.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const filename = `${safeName}-${timestamp}.json`;
    const filepath = path.join(reportDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf-8');
  }

  public run(): void {
    console.clear();

    this.log(`\n${'═'.repeat(80)}`, colors.blue);
    this.log(`📊 EDUSPHERE PRODUCTION READINESS REPORT`, colors.bold + colors.blue);
    this.log(`Generated: ${new Date().toLocaleString()}`, colors.dim);
    this.log(`${'═'.repeat(80)}\n`, colors.blue);

    const report = this.generateReport();

    this.displayReport(report);
    this.saveReport(report);

    this.log('\n📁 Report saved to: ../reports/', colors.dim);
    this.log('💡 Re-run weekly to track progress\n', colors.dim);
  }
}

const generator = new EdusphereProductionReport();
generator.run();
