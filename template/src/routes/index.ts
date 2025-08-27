import BaseLayout from "./_layout";
import { PageElement, Store } from "@saharajs/spa";

export default class IndexPage extends PageElement {
  static layout = BaseLayout;

  private state = Store.observe<{ count: number }>({ count: 0 });
  //Persistent State
  //private state = Store.observePersistent<{ count: number }>({ count: 0 }, "home-counter");

  connectedCallback() {
    this.renderTemplate();
    this.bindEvents();
    this.state.onChange("count", (newCount) => {
      this.$("#div-counter").textContent = `${newCount}`;
      console.log("👉 count has changed:", newCount);
    });
  }

  private renderTemplate() {
    console.log("→ renderTemplate()");
    this.innerHTML = `
      <div class="home-container">
        <img src="/images/sahara.png" alt="Sahara SPA Logo" class="logo" />
        <div class="counter-container">
          <button id="btn-dec" class="counter-btn">-</button>
          <div id="div-counter" class="counter-display">${this.state.count}</div>
          <button id="btn-inc" class="counter-btn">+</button>
        </div>
      </div>
  `;
  }

  private bindEvents(): void {
    this.on("#btn-inc", "click", () => {
      this.state.count++;
    });
    this.on("#btn-dec", "click", () => {
      this.state.count--;
    });
  }
}
