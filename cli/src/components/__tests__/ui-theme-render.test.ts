import { renderToString } from "ink";
import { createElement, Fragment } from "react";
import { describe, expect, it } from "vitest";
import { LoadingScreen } from "../../commands/ui.js";
import { FileTree } from "../FileTree.js";
import { TabBar } from "../TabBar.js";
import { createTUITheme, TUIThemeContext } from "../ui-theme.js";

describe("plain terminal theme", () => {
  it("renders ASCII banners, tab markers, and dividers without color", () => {
    const theme = createTUITheme(false, { TERM: "dumb" });
    const output = renderToString(
      createElement(
        TUIThemeContext.Provider,
        { value: theme },
        createElement(
          Fragment,
          null,
          createElement(LoadingScreen, { animated: false }),
          createElement(TabBar, {
            activeTab: "overview",
            onTabChange: () => {},
          }),
          createElement(FileTree, {
            nodes: [
              {
                name: "Dockerfile",
                path: "Dockerfile",
                type: "file",
                fileType: "docker",
              },
            ],
            selectedPath: "Dockerfile",
            onSelect: () => {},
          }),
        ),
      ),
    );

    expect(output).toContain(">>> TDK NEON EDITION <<<");
    expect(output).toContain("OVERVIEW");
    expect(output).toContain("[D] Dockerfile");
    expect(output).not.toContain(String.fromCodePoint(0x1f433));
    expect(output).not.toContain("\u2593\u2592\u2591");
    expect(output).not.toContain("\u2500");
    expect(output).not.toContain(String.fromCharCode(27));
  });
});
