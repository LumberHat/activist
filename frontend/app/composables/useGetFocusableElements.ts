const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "details:not([disabled])",
  "summary:not(:disabled)",
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contenteditable="true"]',
].join(", ");

export function useGetFocusableElements(rootElement?: HTMLElement) {
  const getFocusableElements = (): HTMLElement[] => {
    if (typeof document === "undefined") {
      return [];
    }

    const root = rootElement ?? document.body;
    const elements = Array.from(
      root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    );

    return elements.filter((element) =>
      element.checkVisibility({ visibilityProperty: true })
    );
  };

  return {
    getFocusableElements,
  };
}
