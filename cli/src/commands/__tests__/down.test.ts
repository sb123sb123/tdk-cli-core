import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const { runTiltMock } = vi.hoisted(() => ({ runTiltMock: vi.fn() }));
const originalCwd = process.cwd();

vi.mock("../../utils/errors.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../utils/errors.js")>();
  return {
    ...actual,
    handleTiltFailure: vi.fn(),
    withTiltCheck: (action: () => Promise<void>) => actual.runCommand(action),
  };
});

vi.mock("../../utils/tilt.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../utils/tilt.js")>();
  return {
    ...actual,
    buildTiltDownArgs: vi.fn(actual.buildTiltDownArgs),
    runTilt: runTiltMock,
  };
});

import { buildTiltDownArgs } from "../../utils/tilt.js";
import { downCommand } from "../down.js";

describe("tdk down", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    runTiltMock.mockReset();
    for (const option of ["dryRun", "json", "verbose", "force", "pruneNetworks"]) {
      downCommand.setOptionValue(option, false);
    }
  });

  it("prints the shared project-root error and suggestions outside a project", async () => {
    const tempDir = mkdtempSync(join(tmpdir(), "tdk-down-test-"));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exit:1");
    }) as never);
    process.chdir(tempDir);

    try {
      await expect(downCommand.parseAsync(["node", "tdk"], { from: "node" })).rejects.toThrow(
        "exit:1",
      );

      const output = error.mock.calls.flat().join("\n");
      expect(output).toContain("Could not find project root (no .tdk/project.json found)");
      expect(output).toContain("Run this from within a TDK project");
      expect(output).toContain("Run `tdk project --yes` to initialize a new project");
      expect(runTiltMock).not.toHaveBeenCalled();
    } finally {
      process.chdir(originalCwd);
      rmSync(tempDir, { recursive: true, force: true });
      exit.mockRestore();
      error.mockRestore();
    }
  });

  it("prints the dry-run plan without building arguments or invoking Tilt", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    try {
      await downCommand.parseAsync(["node", "tdk", "--dry-run"], { from: "node" });

      const output = log.mock.calls.map((call) => call.join(" ")).join("\n");
      expect(output).toContain("Dry run - not stopping resources");
      expect(output).toContain("Would run: tilt down");
      expect(buildTiltDownArgs).not.toHaveBeenCalled();
      expect(runTiltMock).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
