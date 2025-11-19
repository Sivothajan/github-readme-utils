import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- ES module __dirname equivalent ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Paths ---
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const outputPath = path.join(__dirname, '..', 'THIRD-PARTY-LICENSE');

// --- Check package.json existence ---
if (!fs.existsSync(packageJsonPath)) {
  console.error(
    // \x1b[1;31m => bold red text for errors
    // \x1b[0m => reset color
    '\x1b[1;31mpackage.json not found!\x1b[0m'
  );
  process.exit(1);
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  license?: string;
  licenses?: { type: string }[];
  version?: string;
}

// --- Read package.json ---
const packageJson: PackageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, 'utf-8')
);

// --- Helper to get license and version ---
function getLicenseAndVersion(pkgName: string): {
  license: string;
  version: string;
} {
  const packagePath = path.join(
    __dirname,
    '..',
    'node_modules',
    pkgName,
    'package.json'
  );
  if (!fs.existsSync(packagePath))
    return { license: 'Not installed', version: 'N/A' };

  const pkg: PackageJson & { version?: string } = JSON.parse(
    fs.readFileSync(packagePath, 'utf-8')
  );

  const license = pkg.license
    ? pkg.license
    : pkg.licenses
      ? pkg.licenses.map((l) => l.type).join(', ')
      : 'Unknown';

  return { license, version: pkg.version || 'Unknown' };
}

// --- Initialize usage groups ---
type LicenseMap = Record<string, string[]>;
type UsageMap = Record<string, LicenseMap>;
const usageGroups: UsageMap = {
  Production: {},
  Development: {},
};

// --- Add dependencies to usage groups ---
function addDeps(deps: Record<string, string> | undefined, usage: string) {
  if (!deps) return;
  Object.keys(deps).forEach((dep) => {
    const { license, version } = getLicenseAndVersion(dep);
    if (!usageGroups[usage][license]) usageGroups[usage][license] = [];
    usageGroups[usage][license].push(`${dep}@${version}`);
  });
}

addDeps(packageJson.dependencies, 'Production');
addDeps(packageJson.devDependencies, 'Development');

// --- Generate Markdown ---
let md = `# Third-Party Software Notice

> ⚠️ **Auto-generated file** – Do not modify manually.  
> This file lists third-party software components used in this project, along with their licenses.  
> Viewable as Markdown or automatically rendered to HTML.

This project includes third-party software components licensed under
open-source licenses. These components remain subject to their respective
licenses as described below. No ownership of these components is claimed
by **Sivothayan Sivasiva — [https://sivothajan.dev](https://sivothajan.dev)**.

---
`;

// --- Add grouped dependencies ---
for (const [usageType, licenseMap] of Object.entries(usageGroups)) {
  // \x1b[1;34m => bold blue section header
  md += `\n## ${usageType} Dependencies\n`;

  for (const [license, pkgs] of Object.entries(licenseMap)) {
    // \x1b[36m => cyan for license heading in console logs
    md += `\n### ${license} Licensed Components (${usageType})\n\n`;
    pkgs.forEach((pkg) => {
      md += `- \`${pkg}\`\n`;
    });
  }
}

// --- Add notes section ---
md += `\n---\n\n## Notes\n\n`;
md += `- All listed third-party licenses **permit inclusion in proprietary software**.\n`;
md += `- Full license texts for each component can be found in \`node_modules/\`.\n`;
md += `- No modifications were made to third-party components beyond normal build, compilation, or bundling processes.\n`;

md = md.trimEnd() + '\n';

// --- Write file ---
fs.writeFileSync(outputPath, md, 'utf-8');
console.log(
  // \x1b[1;32m => bold green for success message
  `\x1b[1;32m✅ THIRD-PARTY-LICENSE.md generated successfully at ${outputPath}\x1b[0m\n`
);
