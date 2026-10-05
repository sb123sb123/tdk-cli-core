import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const ui = readFileSync(join(repoRoot, "cli", "src", "commands", "ui.tsx"), "utf-8");
const tabBar = readFileSync(join(repoRoot, "cli", "src", "components", "TabBar.tsx"), "utf-8");
const types = readFileSync(join(repoRoot, "cli", "src", "types", "index.ts"), "utf-8");
describe("tdk ui Events tab", () => {
  it("hides the unfinished timeline from the tab bar and content", () => {
    expect(tabBar).not.toContain('{ id: "events"');
    expect(ui).not.toContain('activeTab === "events"');
    expect(ui).not.toContain('"3": "events"');
    expect(ui).not.toContain("Events tab not yet implemented");
    expect(ui).not.toContain("Event timeline");
  });
  it("keeps the visible tabs directly reachable with consecutive shortcuts", () => {
    expect(tabBar).toContain('{ id: "files", label: "FILES", shortcut: "3" }');
    expect(tabBar).toContain('{ id: "config", label: "CONFIG", shortcut: "4" }');
    expect(ui).toContain('const tabs: TabId[] = ["overview", "resources", "files", "config"]');
    expect(ui).toContain('"3": "files"');
    expect(ui).toContain('"4": "config"');
    expect(ui).toContain("1-4 Direct tab access");
    expect(ui).toContain("[1-4] Tabs");
    expect(types).toContain('export type TabId = "overview" | "resources" | "files" | "config";');
  });
});
