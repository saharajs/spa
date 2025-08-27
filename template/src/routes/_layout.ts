import { PageElement } from "@saharajs/spa";

export default class BaseLayout extends PageElement {
  connectedCallback() {
    this.innerHTML = this.render();
  }

  protected renderHeader(): string {
    return `
      <header class="baselayout-header">
        <nav>
          <ul class="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/about/">About</a></li>
          </ul>
        </nav>
      </header>
    `;
  }

  protected renderFooter(): string {
    return `
      <footer class="baselayout-footer">
        <p>Sahara Framework &copy; 2024</p>
      </footer>
    `;
  }

  protected render(): string {
    return `
      <div class="baselayout-main">
        ${this.renderHeader()}
        <main id="slot"></main>
        ${this.renderFooter()}
      </div>
    `;
  }
}
