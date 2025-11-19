import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- ES module __dirname equivalent ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust if script is in a subfolder
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// --- Check if package.json exists ---
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
}

// --- Read package.json ---
const packageJson: PackageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, 'utf-8')
);

// --- Helper to get license info ---
function getLicense(packageName: string): string {
  const packagePath = path.join(
    __dirname,
    '..',
    'node_modules',
    packageName,
    'package.json'
  );
  if (fs.existsSync(packagePath)) {
    const pkg: PackageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    if (pkg.license) return pkg.license;
    if (pkg.licenses) return pkg.licenses.map((l) => l.type).join(', ');
    return 'Unknown';
  }
  return 'Not installed';
}

// --- Group dependencies by usage ---
const usageGroups: Record<string, Record<string, string>> = {
  Production: packageJson.dependencies || {},
  Development: packageJson.devDependencies || {},
};

// --- Print grouped licenses ---
for (const [usageType, deps] of Object.entries(usageGroups)) {
  console.log(
    // \x1b[1;34m => bold blue text for section headers
    // \x1b[0m => reset color
    `\n\x1b[1;34m=== ${usageType} Dependencies ===\x1b[0m`
  );
  console.log(
    // \x1b[36m => cyan text for column header
    `\x1b[36mPackage Name - License\x1b[0m`
  );
  console.log('----------------------');

  Object.keys(deps).forEach((dep) => {
    console.log(
      // \x1b[33m => yellow text for each dependency
      // \x1b[0m => reset color
      `\x1b[33m${dep}\x1b[0m - ${getLicense(dep)}`
    );
  });
}

// --- Done ---
console.log(
  // \x1b[1;32m => bold green for success message
  '\n\x1b[1;32m✅ License check completed successfully!\x1b[0m\n'
);
