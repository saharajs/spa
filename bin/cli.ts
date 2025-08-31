#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// --- Fonctions utilitaires pour les couleurs (tirées de votre exemple) ---
const red = (str: string) => `\x1b[31m${str}\x1b[0m`;
const green = (str: string) => `\x1b[32m${str}\x1b[0m`;
const blue = (str: string) => `\x1b[34m${str}\x1b[0m`;

function main() {
  // --- Lecture du package.json du framework ---
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const frameworkPkgPath = path.resolve(__dirname, "..", "..", "package.json");
  const frameworkPkg = JSON.parse(fs.readFileSync(frameworkPkgPath, "utf-8"));

  // --- Logique du CLI ---
  const args = process.argv.slice(2);
  const command = args[0];
  const projectName = args[1];

  if (command !== "create" || !projectName) {
    console.error(`Usage: ${red("npx @saharajs/spa create <project-name>")}`);
    process.exit(1);
  }

  // Validation du nom du projet (tirée de votre exemple)
  const validationRegExp =
    /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
  if (!validationRegExp.test(projectName)) {
    console.error(`Error: "${projectName}" is not a valid project name.`);
    console.error(
      "Use lowercase letters, numbers, dashes (-), or underscores (_)."
    );
    process.exit(1);
  }

  const projectDir = path.resolve(process.cwd(), projectName);
  // Go up two levels from /dist/bin to the package root
  const templateDir = path.resolve(__dirname, "../../template");

  // Vérification de l'existence du répertoire (tirée de votre exemple)
  if (fs.existsSync(projectDir) && fs.readdirSync(projectDir).length > 0) {
    console.error(
      red(`Error: Directory "${projectName}" already exists and is not empty.`)
    );
    process.exit(1);
  }

  try {
    console.log(`\nCreating a new Sahara SPA app in ${blue(projectDir)}...`);

    // Copie des fichiers template (synchrone pour plus de fiabilité)
    fs.cpSync(templateDir, projectDir, { recursive: true });

    // --- Tâches post-création ---

    // Renommage de gitignore (bonne pratique)
    const gitignorePath = path.join(projectDir, "gitignore");
    if (fs.existsSync(gitignorePath)) {
      fs.renameSync(gitignorePath, path.join(projectDir, ".gitignore"));
    }

    // Mise à jour du package.json
    const packageJsonPath = path.join(projectDir, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    packageJson.name = projectName;
    // Injection de la bonne version du framework
    if (
      packageJson.devDependencies &&
      packageJson.devDependencies["@saharajs/spa"]
    ) {
      packageJson.devDependencies[
        frameworkPkg.name
      ] = `^${frameworkPkg.version}`;
    } else if (
      packageJson.dependencies &&
      packageJson.dependencies["@saharajs/spa"]
    ) {
      packageJson.dependencies[frameworkPkg.name] = `^${frameworkPkg.version}`;
    }
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Création programmatique du tsconfig.json (votre méthode, qui est excellente)
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
    fs.writeFileSync(tsconfigPath, tsconfigContent);

    // --- Messages de fin ---
    console.log(green("\n✅ Project created successfully!"));
    console.log("\nNext steps:");
    console.log(`  cd ${projectName}`);
    console.log("  npm install");
    console.log("  npm run dev\n");
  } catch (error) {
    console.error(
      red("\nAn unexpected error occurred while creating the project.")
    );
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
