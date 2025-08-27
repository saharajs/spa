import { defineConfig } from "vite";
import { resolve } from "path";

/**
 * This is the Vite configuration for YOUR DEVELOPMENT ENVIRONMENT.
 * It's used when you run `npm run dev` at the root of the project.
 * Its main purpose is to run the `template` application while using
 * the local, live-reloading source code of your framework from `src/framework`.
 */
export default defineConfig({
  // We point to the `template`'s source code as the root of our dev server.
  root: "./template/src",

  build: {
    // We want the output directory to be at the root of the project, not inside the template.
    // The path is relative to the `root` option, so `../../` goes up two levels.
    outDir: "../../dist-dev",
    emptyOutDir: true,
  },

  css: {
    // Explicitly configure PostCSS to prevent it from searching for a config file.
    // This resolves the "Failed to load PostCSS config" error during `npm run build`.
    postcss: {},
  },

  resolve: {
    // This alias is the magic that makes the dev environment work.
    // It intercepts imports to "@saharajs/spa" and points them to your local source code.
    alias: {
      "@saharajs/spa": resolve(__dirname, "./src/framework"),
    },
  },
});
