#!/usr/bin/env node

import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the framework's version to inject it into the new project's package.json
const frameworkPkgPath = path.resolve(__dirname, "..", "..", "package.json");
const frameworkPkg = JSON.parse(await fs.readFile(frameworkPkgPath, "utf-8"));

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const projectName = args[1];

  if (command !== "create" || !projectName) {
    console.error("Usage: npx @saharajs/spa create <project-name>");
    process.exit(1);
  }

  const projectDir = path.resolve(process.cwd(), projectName);
  // Go up two levels from /dist/bin to the package root
  const templateDir = path.resolve(__dirname, "..", "..", "template");

  try {
    // Check if directory already exists
    await fs.access(projectDir);
    console.error(`❌ Directory '${projectName}' already exists.`);
    process.exit(1);
  } catch (e) {
    // Directory does not exist, which is what we want.
  }

  console.log(`\nCreating a new Sahara SPA app in ${projectDir}\n`);

  // Copy template files
  await fs.cp(templateDir, projectDir, { recursive: true });

  // Update package.json with the new project name
  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
  packageJson.name = projectName;
  // Set the correct framework version in the new project's dependencies
  if (
    packageJson.devDependencies &&
    packageJson.devDependencies["@saharajs/spa"]
  ) {
    packageJson.devDependencies["@saharajs/spa"] = `^${frameworkPkg.version}`;
  } else if (
    packageJson.dependencies &&
    packageJson.dependencies["@saharajs/spa"]
  ) {
    packageJson.dependencies["@saharajs/spa"] = `^${frameworkPkg.version}`;
  }
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Create tsconfig.json programmatically to avoid IDE confusion in the monorepo.
  const tsconfigContent = `{
  "include": ["src/**/*.ts", "vite.config.ts"],
  "exclude": ["node_modules"],
  "compilerOptions": {
    "outDir": "dist",
    "module": "ESNext",
    "target": "ESNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}
`;
  const tsconfigPath = path.join(projectDir, "tsconfig.json");
  await fs.writeFile(tsconfigPath, tsconfigContent);

  console.log("✅ Project created successfully!");
  console.log("\nNext steps:");
  console.log(`  cd ${projectName}`);
  console.log("  npm install");
  console.log("  npm run dev\n");
}

main().catch((err) => {
  console.error("An unexpected error occurred:", err);
  process.exit(1);
});
