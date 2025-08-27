import { startRouter } from "@saharajs/spa";

const app = document.getElementById("app");

if (app) {
  startRouter(app);
} else {
  console.error("Fatal: #app element not found in the DOM.");
}
