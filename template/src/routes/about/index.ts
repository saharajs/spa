import BaseLayout from "../_layout";
import { PageElement } from "@saharajs/spa";

export default class AboutIndexPage extends PageElement {
  static layout = BaseLayout;

  connectedCallback() {
    this.innerHTML = `
      <div class="container">
        <h1>About</h1>
        <p>Lorem ipsum dolor sit amet...</p>
      </div>
    `;
  }
}
