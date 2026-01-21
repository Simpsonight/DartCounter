/**
 * Generates CHANGELOG.md from utils/changelog.ts
 *
 * Run: npm run changelog
 * Or:  npx tsx scripts/generate-changelog.ts
 */
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CHANGELOG } from '../utils/changelog';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type ChangeType = 'added' | 'changed' | 'fixed' | 'removed' | 'security';

const generateMarkdown = (): string => {
  let md = '# Changelog\n\n';
  md +=
    'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\n';
  md +=
    'and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n';

  for (const entry of CHANGELOG) {
    md += `## [${entry.version}] - ${entry.date}\n\n`;
    md += `### ${entry.title}\n\n`;

    // Group changes by type
    const grouped: Record<ChangeType, string[]> = {
      added: [],
      changed: [],
      fixed: [],
      removed: [],
      security: [],
    };

    for (const change of entry.changes) {
      grouped[change.type].push(change.description);
    }

    // Output in Keep a Changelog order
    const typeLabels: Record<ChangeType, string> = {
      added: 'Added',
      changed: 'Changed',
      fixed: 'Fixed',
      removed: 'Removed',
      security: 'Security',
    };

    for (const [type, label] of Object.entries(typeLabels)) {
      const items = grouped[type as ChangeType];
      if (items.length > 0) {
        md += `#### ${label}\n\n`;
        for (const item of items) {
          md += `- ${item}\n`;
        }
        md += '\n';
      }
    }
  }

  return md;
};

const outputPath = resolve(__dirname, '../CHANGELOG.md');
writeFileSync(outputPath, generateMarkdown());
console.log('✅ CHANGELOG.md generated successfully');
