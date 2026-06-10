import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '..', 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('package.json not found!');
  process.exit(1);
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  license?: string;
  licenses?: { type: string }[];
}

const packageJson: PackageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, 'utf8')
);

function getLicense(packageName: string): string {
  const pkgPath = path.join(
    __dirname,
    '..',
    'node_modules',
    packageName,
    'package.json'
  );

  if (!fs.existsSync(pkgPath)) {
    return 'Not installed';
  }

  const pkg: PackageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  if (pkg.license) {
    return pkg.license;
  }

  if (pkg.licenses?.length) {
    return pkg.licenses.map((l) => l.type).join(' OR ');
  }

  return 'Unknown';
}

function groupByLicense(
  deps: Record<string, string>
): { license: string; packages: string[] }[] {
  const grouped = new Map<string, string[]>();

  for (const pkg of Object.keys(deps)) {
    const license = getLicense(pkg);

    if (!grouped.has(license)) {
      grouped.set(license, []);
    }

    grouped.get(license)!.push(pkg);
  }

  return [...grouped.entries()]
    .map(([license, packages]) => ({
      license,
      packages: packages.sort(),
    }))
    .sort((a, b) => a.license.localeCompare(b.license));
}

const outputPath = path.join(__dirname, '..', 'src', 'data', 'licenses.json');

const result = {
  productionDeps: groupByLicense(packageJson.dependencies || {}),
  devDeps: groupByLicense(packageJson.devDependencies || {}),
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');

// eslint-disable-next-line no-console
console.log(`Generated: ${outputPath}`);
