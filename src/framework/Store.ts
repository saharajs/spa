type Listener<T> = (value: T) => void;

/**
 * A utility to add an `onChange` method to a proxy object.
 * This is an internal helper and not exported.
 */
function addOnChange<T extends object>(proxy: T) {
  const listeners = new Map<keyof T, Set<Listener<any>>>();

  Object.defineProperty(proxy, "onChange", {
    value: (property: keyof T, listener: Listener<any>) => {
      if (!listeners.has(property)) {
        listeners.set(property, new Set());
      }
      listeners.get(property)!.add(listener);
    },
    enumerable: false, // Hide from console.log and for...in loops
  });

  return { proxy, listeners };
}

export class Store {
  /**
   * Creates a reactive object. Changes to its properties will trigger registered listeners.
   */
  public static observe<T extends object>(
    initialData: T
  ): T & { onChange: (prop: keyof T, cb: (val: any) => void) => void } {
    const { proxy, listeners } = addOnChange(initialData);

    return new Proxy(proxy, {
      set: (target, property, value) => {
        (target as any)[property] = value;
        const propListeners = listeners.get(property as keyof T);
        propListeners?.forEach((listener) => listener(value));
        return true;
      },
    }) as any;
  }

  /**
   * Creates a reactive object whose state is persisted to localStorage.
   */
  public static observePersistent<T extends object>(
    initialData: T,
    storageKey: string
  ): T & { onChange: (prop: keyof T, cb: (val: any) => void) => void } {
    const storedData = localStorage.getItem(storageKey);
    const data = storedData ? JSON.parse(storedData) : initialData;
    const reactiveStore = Store.observe(data);

    // Persist to localStorage whenever any property changes
    Object.keys(initialData).forEach((key) => {
      reactiveStore.onChange(key as keyof T, () => {
        localStorage.setItem(storageKey, JSON.stringify(reactiveStore));
      });
    });

    return reactiveStore;
  }
}
