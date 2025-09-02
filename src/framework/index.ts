export { PageElement } from "./PageElement";
export { Store } from "./Store";

const DEBUG = true;

/**
 * Initializes the single-page application router.
 * @param app The root HTML element to mount the pages into.
 */
export function startRouter(app: HTMLElement) {
  // --- Helper Functions ---
  const nextFrame = () => new Promise(requestAnimationFrame);

  const tagName = (klassName: string, suffix: "Page" | "Layout"): string => {
    return (
      klassName
        .replace(new RegExp(suffix + "$"), "")
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase() + `-${suffix.toLowerCase()}`
    );
  };

  const routeToFile = (route: string): string => {
    const path = route.startsWith("/") ? route : `/${route}`;
    if (path === "/") return "/routes/index.ts";
    const isDir = route.endsWith("/");
    const clean = path.replace(/^\/|\/$/g, "");
    const parts = clean.split("/");
    const file = (isDir ? "index" : parts.pop()!) + ".ts";
    const subPath = parts.length > 0 ? `${parts.join("/")}/` : "";
    return `/routes/${subPath}${file}`;
  };

  const renderErrorPage = (code: number, message: string, error?: Error) => {
    app.innerHTML = `
      <div style="text-align: center; padding: 4rem; color: #c00;">
        <h1>Error ${code}</h1>
        <p>${message}</p>
      </div>`;
    if (error && DEBUG) {
      console.error(`Rendered ${code} error page.`, error);
    }
  };

  const modules = import.meta.glob("/routes/**/*.ts");

  // --- Core Logic ---
  const loadPage = async () => {
    if (DEBUG) console.log("→ Loading", window.location.pathname);
    app.innerHTML = "";

    try {
      const file = routeToFile(window.location.pathname);
      const moduleLoader = modules[file];
      if (!moduleLoader) {
        renderErrorPage(404, `Page not found for path: ${file}`);
        return;
      }
      const mod = (await moduleLoader()) as {
        default: CustomElementConstructor;
      };
      const PageClass = mod.default;

      const layouts: CustomElementConstructor[] = [];
      let LayoutCtor = (PageClass as any).layout;
      while (LayoutCtor) {
        layouts.unshift(LayoutCtor);
        LayoutCtor = (LayoutCtor as any).layout;
      }

      for (const ctor of [...layouts, PageClass]) {
        const suffix = layouts.includes(ctor) ? "Layout" : "Page";
        const tag = tagName(ctor.name, suffix as "Layout" | "Page");
        if (!customElements.get(tag)) {
          customElements.define(tag, ctor);
        }
      }

      let container: Element = app;
      for (const LayoutClass of layouts) {
        const tag = tagName(LayoutClass.name, "Layout");
        const layoutEl = document.createElement(tag);
        container.appendChild(layoutEl);
        await nextFrame();
        const nextContainer = layoutEl.querySelector("#slot");
        if (!nextContainer) {
          throw new Error(
            `Layout "${LayoutClass.name}" is missing a #slot element.`
          );
        }
        container = nextContainer;
      }

      const pageTag = tagName(PageClass.name, "Page");
      const pageEl = document.createElement(pageTag);
      container.replaceWith(pageEl);
      await nextFrame();
    } catch (err) {
      if (DEBUG) console.error("❌ loadPage error:", err);
      if (
        err instanceof Error &&
        err.message.includes("Failed to fetch dynamically imported module")
      ) {
        renderErrorPage(404, "Page not found");
      } else {
        renderErrorPage(
          500,
          "Could not load page",
          err instanceof Error ? err : undefined
        );
      }
    }
  };

  const onLinkClick = (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;

    const a = (e.target as HTMLElement).closest(
      'a[href^="/"]'
    ) as HTMLAnchorElement | null;

    if (
      a &&
      a.target !== "_blank" &&
      a.getAttribute("rel") !== "external" &&
      !a.hasAttribute("download")
    ) {
      e.preventDefault();
      if (a.href !== window.location.href) {
        history.pushState({}, "", a.href);
        loadPage();
      }
    }
  };

  // --- Initialization ---
  window.addEventListener("popstate", loadPage);
  document.addEventListener("click", onLinkClick);
  loadPage();
}

/**
 * Programmatically navigates to a new path.
 * @param path The path to navigate to (e.g., '/about').
 */
export function navigateTo(path: string) {
  if (window.location.pathname !== path) {
    history.pushState({}, "", path);
    // We dispatch a popstate event to trigger the router's loadPage listener.
    // This is a clean way to trigger navigation from outside the router's scope.
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}
