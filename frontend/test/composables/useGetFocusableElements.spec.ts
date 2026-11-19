// SPDX-License-Identifier: AGPL-3.0-or-later
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGetFocusableElements } from "../../app/composables/useGetFocusableElements";

const ids = (elements: HTMLElement[]) => elements.map((element) => element.id);

describe("useGetFocusableElements", () => {
  let root: HTMLDivElement;

  beforeEach(() => {
    root = document.createElement("div");
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it("returns an empty array when there are no focusable elements", () => {
    root.innerHTML = `<div><p>Text</p><span>More text</span></div>`;
    const { getFocusableElements } = useGetFocusableElements(root);

    expect(getFocusableElements()).toEqual([]);
  });

  it("finds every natively focusable element type", () => {
    root.innerHTML = `
      <a id="link" href="/somewhere">Link</a>
      <button id="button">Button</button>
      <input id="input" />
      <select id="select"><option>One</option></select>
      <textarea id="textarea"></textarea>
      <details id="details"><summary id="summary">Summary</summary></details>
      <div id="tabindex" tabindex="0"></div>
      <div id="editable" contenteditable="true"></div>
    `;
    const { getFocusableElements } = useGetFocusableElements(root);

    expect(ids(getFocusableElements())).toEqual([
      "link",
      "button",
      "input",
      "select",
      "textarea",
      "details",
      "summary",
      "tabindex",
      "editable",
    ]);
  });

  it("excludes elements that cannot receive keyboard focus", () => {
    root.innerHTML = `
      <a id="anchor-no-href">No href</a>
      <button id="disabled-button" disabled>Disabled</button>
      <input id="disabled-input" disabled />
      <input id="hidden-input" type="hidden" />
      <select id="disabled-select" disabled></select>
      <textarea id="disabled-textarea" disabled></textarea>
      <div id="negative-tabindex" tabindex="-1"></div>
      <div id="editable-false" contenteditable="false"></div>
      <button id="enabled">Enabled</button>
    `;
    const { getFocusableElements } = useGetFocusableElements(root);

    expect(ids(getFocusableElements())).toEqual(["enabled"]);
  });

  it("returns elements in document order", () => {
    root.innerHTML = `
      <div tabindex="0" id="first"></div>
      <section>
        <button id="second">Second</button>
        <div><a id="third" href="#">Third</a></div>
      </section>
      <input id="fourth" />
    `;
    const { getFocusableElements } = useGetFocusableElements(root);

    expect(ids(getFocusableElements())).toEqual([
      "first",
      "second",
      "third",
      "fourth",
    ]);
  });

  describe("visibility filtering", () => {
    it("excludes elements with display: none", () => {
      root.innerHTML = `
        <button id="hidden" style="display: none">Hidden</button>
        <button id="visible">Visible</button>
      `;
      const { getFocusableElements } = useGetFocusableElements(root);

      expect(ids(getFocusableElements())).toEqual(["visible"]);
    });

    it("excludes elements inside an ancestor with display: none", () => {
      root.innerHTML = `
        <div style="display: none"><button id="nested">Nested</button></div>
        <button id="visible">Visible</button>
      `;
      const { getFocusableElements } = useGetFocusableElements(root);

      expect(ids(getFocusableElements())).toEqual(["visible"]);
    });

    it("excludes elements with visibility: hidden", () => {
      root.innerHTML = `
        <button id="hidden" style="visibility: hidden">Hidden</button>
        <button id="visible">Visible</button>
      `;
      const { getFocusableElements } = useGetFocusableElements(root);

      expect(ids(getFocusableElements())).toEqual(["visible"]);
    });

    it("excludes elements inside an ancestor with visibility: hidden", () => {
      root.innerHTML = `
        <div style="visibility: hidden"><button id="nested">Nested</button></div>
        <button id="visible">Visible</button>
      `;
      const { getFocusableElements } = useGetFocusableElements(root);

      expect(ids(getFocusableElements())).toEqual(["visible"]);
    });

    it("includes position: fixed elements", () => {
      root.innerHTML = `<button id="fixed" style="position: fixed">Fixed</button>`;
      const { getFocusableElements } = useGetFocusableElements(root);

      expect(ids(getFocusableElements())).toEqual(["fixed"]);
    });
  });

  describe("root element", () => {
    it("only searches within the provided root", () => {
      const outside = document.createElement("button");
      outside.id = "outside";
      document.body.appendChild(outside);
      root.innerHTML = `<button id="inside">Inside</button>`;

      const { getFocusableElements } = useGetFocusableElements(root);

      expect(ids(getFocusableElements())).toEqual(["inside"]);
      outside.remove();
    });

    it("does not include the root element itself", () => {
      root.tabIndex = 0;
      root.innerHTML = `<button id="child">Child</button>`;
      const { getFocusableElements } = useGetFocusableElements(root);

      expect(ids(getFocusableElements())).toEqual(["child"]);
    });

    it("defaults to document.body", () => {
      root.innerHTML = `<button id="in-body">In body</button>`;
      const { getFocusableElements } = useGetFocusableElements();

      expect(getFocusableElements()).toContain(
        document.getElementById("in-body")
      );
    });

    it("returns nothing for a root that is not attached to the document", () => {
      const detached = document.createElement("div");
      detached.innerHTML = `<button>Detached</button>`;
      const { getFocusableElements } = useGetFocusableElements(detached);

      expect(getFocusableElements()).toEqual([]);
    });
  });

  describe("without a document (SSR)", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("can be created and returns an empty array", () => {
      vi.stubGlobal("document", undefined);

      const { getFocusableElements } = useGetFocusableElements();
      expect(getFocusableElements()).toEqual([]);
    });
  });

  it("queries the DOM fresh on every call", () => {
    const { getFocusableElements } = useGetFocusableElements(root);
    expect(getFocusableElements()).toEqual([]);

    root.innerHTML = `<button id="added">Added</button>`;
    expect(ids(getFocusableElements())).toEqual(["added"]);

    (root.firstElementChild as HTMLElement).style.display = "none";
    expect(getFocusableElements()).toEqual([]);
  });
});
