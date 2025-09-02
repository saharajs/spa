type BoundListener = {
  element: Element;
  eventType: string;
  handler: EventListener;
};

/**
 * PageElement: Base class providing shorthand DOM querying and event binding.
 *
 * Usage in subclasses:
 *   this.$<HTMLButtonElement>('#btn-inc').textContent = '...';
 *   this.on('#btn-inc', 'click', () => { ... });
 */
export abstract class PageElement extends HTMLElement {
  private _boundListeners: BoundListener[] = [];
  /**
   * Shorthand for querySelector, throws if not found.
   * @returns the element cast to type T (defaults to HTMLElement)
   */
  protected $<T extends Element = HTMLElement>(selector: string): T {
    const el = this.querySelector(selector);
    if (!el) {
      throw new Error(`Element not found: ${selector}`);
    }
    return el as T;
  }

  /**
   * Shorthand for addEventListener on a selected element.
   * Listeners are automatically removed when the element is disconnected.
   * @returns this for chaining
   */
  protected on<
    K extends keyof HTMLElementEventMap,
    T extends Element = HTMLElement
  >(
    selector: string,
    eventType: K,
    handler: (event: HTMLElementEventMap[K]) => void
  ): this {
    const element = this.$<T>(selector);
    const listener = handler as EventListener;

    element.addEventListener(eventType, listener);
    this._boundListeners.push({ element, eventType, handler: listener });

    return this;
  }

  /**
   * Automatically cleans up all event listeners when the element is removed from the DOM.
   */
  disconnectedCallback() {
    for (const { element, eventType, handler } of this._boundListeners) {
      element.removeEventListener(eventType, handler);
    }
    this._boundListeners = [];
  }

  /**
   * Retrieves data from a form as a key-value object.
   * It correctly handles multiple checkboxes with the same name.
   * @param formSelector The CSS selector for the <form> element.
   * @returns An object containing the form data.
   */
  protected getFormData(formSelector: string): Record<string, any> {
    const form = this.$<HTMLFormElement>(formSelector);
    const formData = new FormData(form);
    const data: Record<string, any> = {};
    const processedKeys = new Set<string>();

    formData.forEach((_, key) => {
      // On ne traite chaque clé qu'une seule fois pour être efficace
      if (processedKeys.has(key)) {
        return;
      }

      const values = formData.getAll(key);
      data[key] = values.length > 1 ? values : values[0];
      processedKeys.add(key);
    });

    return data;
  }
}
