#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const red = (str: string) => `\x1b[31m${str}\x1b[0m`;
const green = (str: string) => `\x1b[32m${str}\x1b[0m`;
const blue = (str: string) => `\x1b[34m${str}\x1b[0m`;

function main() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const frameworkPkgPath = path.resolve(__dirname, "..", "..", "package.json");
  const frameworkPkg = JSON.parse(fs.readFileSync(frameworkPkgPath, "utf-8"));
  const args = process.argv.slice(2);
  const command = args[0];
  const projectName = args[1];
  if (command !== "create" || !projectName) {
    console.error(`Usage: ${red("npx @saharajs/spa create <project-name>")}`);
    process.exit(1);
  }
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
  const templateDir = path.resolve(__dirname, "../../template");
  if (fs.existsSync(projectDir) && fs.readdirSync(projectDir).length > 0) {
    console.error(
      red(`Error: Directory "${projectName}" already exists and is not empty.`)
    );
    process.exit(1);
  }
  try {
    console.log(`\nCreating a new Sahara SPA app in ${blue(projectDir)}...`);
    fs.cpSync(templateDir, projectDir, { recursive: true });
    const gitignorePath = path.join(projectDir, "gitignore");
    if (fs.existsSync(gitignorePath)) {
      fs.renameSync(gitignorePath, path.join(projectDir, ".gitignore"));
    }
    const packageJsonPath = path.join(projectDir, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    packageJson.name = projectName;
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
