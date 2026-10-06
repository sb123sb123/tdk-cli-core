import { PassThrough } from "node:stream";
import { render } from "ink";
import { expect, it, vi } from "vitest";
import { TUIApp } from "../ui.js";

const { discoverResourcesMock, loadTiltEventsMock } = vi.hoisted(() => ({
  discoverResourcesMock: vi.fn(() => [{ name: "api", path: "/tmp/test/api", stack: "stack-00" }]),
  loadTiltEventsMock: vi.fn(),
}));
vi.mock("../../utils/tilt-events.js", () => ({ loadTiltEvents: loadTiltEventsMock }));

const ANSI_SGR = new RegExp([String.fromCharCode(0x1b), "\\[[0-?]*[ -/]*[@-~]"].join(""), "g");

vi.mock("../../utils/services.js", () => ({
  clearMetadataCache: vi.fn(),
  discoverStacks: () =>
    Array.from({ length: 30 }, (_, i) => ({
      name: `stack-${String(i).padStart(2, "0")}`,
      resources: [],
      resourceCount: 0,
    })),
  discoverResources: discoverResourcesMock,
  getResourceMetadata: vi.fn(),
  getStackMetadata: vi.fn(),
}));
vi.mock("../../utils/paths.js", () => ({
  findProjectRoot: () => "/tmp/test",
  getPackageVersion: () => "1.1.0",
}));

function streams() {
  const stdin = new PassThrough() as unknown as NodeJS.ReadStream;
  Object.assign(stdin, {
    isTTY: true,
    isRaw: false,
    setRawMode: () => {},
    ref: () => {},
    unref: () => {},
  });
  const stdout = new PassThrough() as unknown as NodeJS.WriteStream;
  Object.assign(stdout, { isTTY: true, columns: 100, rows: 24 });
  const stderr = new PassThrough() as unknown as NodeJS.WriteStream;
  Object.assign(stderr, { isTTY: true, columns: 100, rows: 24 });
  let output = "";
  stdout.on("data", (data) => {
    output += String(data);
  });
  return { stdin, stdout, stderr, output: () => output };
}

it("navigates with vim keys and terminal page/home/end sequences while search receives text", async () => {
  const io = streams();
  const app = render(<TUIApp animated={false} />, {
    stdin: io.stdin,
    stdout: io.stdout,
    stderr: io.stderr,
    interactive: true,
    exitOnCtrlC: false,
    patchConsole: false,
  });
  const send = async (key: string) => {
    io.stdin.write(key);
    await new Promise((resolve) => setTimeout(resolve, 30));
    await app.waitUntilRenderFlush();
  };
  const selected = () =>
    io
      .output()
      .replace(ANSI_SGR, "")
      .match(/▓▒░ stack-\d+/g)
      ?.at(-1);
  try {
    await new Promise((resolve) => setTimeout(resolve, 30));
    await app.waitUntilRenderFlush();
    expect(selected(), io.output()).toBe("▓▒░ stack-00");
    await send("j");
    expect(selected()).toBe("▓▒░ stack-01");
    await send("k");
    expect(selected()).toBe("▓▒░ stack-00");
    await send("G");
    expect(selected()).toBe("▓▒░ stack-29");
    await send("g");
    expect(selected()).toBe("▓▒░ stack-00");
    await send("\x1b[6~");
    expect(selected()).toBe("▓▒░ stack-10");
    await send("\x1b[5~");
    expect(selected()).toBe("▓▒░ stack-00");
    await send("\x1b[F");
    expect(selected()).toBe("▓▒░ stack-29");
    await send("\x1b[H");
    expect(selected()).toBe("▓▒░ stack-00");
    await send("\x0b");
    expect(selected()).toBe("▓▒░ stack-00");
    await send("\x1bk");
    expect(selected()).toBe("▓▒░ stack-00");
    io.stdout.rows = 30;
    io.stdout.emit("resize");
    await new Promise((resolve) => setTimeout(resolve, 30));
    await send("\x1b[6~");
    expect(selected()).toBe("▓▒░ stack-16");
    await send("g");
    await send("/");
    await send("j");
    await send("k");
    await send("g");
    expect(io.output()).toContain("Search: jkg_");
    await send("\x1b");
    await send("G");
    await send("\r");
    expect(io.output()).toContain("Selected stack: stack-29");
  } finally {
    app.unmount();
    io.stdin.destroy();
    io.stdout.destroy();
    io.stderr.destroy();
  }
});

it("renders Tilt events and refreshes them with r", async () => {
  const snapshot = {
    resources: [{ name: "api", runtimeStatus: "OK", updateStatus: "OK", hasPendingChanges: false }],
    events: [
      {
        id: "api:build:one",
        resourceName: "api",
        kind: "success" as const,
        title: "Build completed",
        occurredAt: "2026-10-07T12:00:00Z",
      },
    ],
  };
  loadTiltEventsMock.mockReset().mockResolvedValue(snapshot);
  const io = streams();
  const app = render(<TUIApp animated={false} />, {
    stdin: io.stdin,
    stdout: io.stdout,
    stderr: io.stderr,
    interactive: true,
    exitOnCtrlC: false,
    patchConsole: false,
  });
  const send = async (key: string) => {
    io.stdin.write(key);
    await new Promise((resolve) => setTimeout(resolve, 30));
    await app.waitUntilRenderFlush();
  };
  try {
    await send("3");
    const output = io.output().replace(ANSI_SGR, "");
    expect(output).toContain("Event Timeline");
    expect(output).toContain("api: Runtime OK; Update OK");
    expect(output).toContain("Build completed");
    expect(loadTiltEventsMock).toHaveBeenCalledTimes(1);
    await send("r");
    expect(loadTiltEventsMock).toHaveBeenCalledTimes(2);
  } finally {
    app.unmount();
    io.stdin.destroy();
    io.stdout.destroy();
    io.stderr.destroy();
  }
});

it("shows a friendly state when Tilt cannot provide events", async () => {
  discoverResourcesMock
    .mockReset()
    .mockReturnValue([{ name: "api", path: "/tmp/test/api", stack: "stack-00" }]);
  loadTiltEventsMock.mockReset().mockRejectedValue(new Error("Tilt is offline"));
  const io = streams();
  const app = render(<TUIApp animated={false} />, {
    stdin: io.stdin,
    stdout: io.stdout,
    stderr: io.stderr,
    interactive: true,
    exitOnCtrlC: false,
    patchConsole: false,
  });
  const send = async (key: string) => {
    io.stdin.write(key);
    await new Promise((resolve) => setTimeout(resolve, 30));
    await app.waitUntilRenderFlush();
  };
  try {
    await send("3");
    const output = io.output().replace(ANSI_SGR, "");
    expect(output).toContain("Tilt is not running or its UI is unreachable.");
    expect(output).toContain("press [r] to retry.");
    await send("r");
    expect(loadTiltEventsMock).toHaveBeenCalledTimes(2);
  } finally {
    app.unmount();
    io.stdin.destroy();
    io.stdout.destroy();
    io.stderr.destroy();
  }
});

it("keeps the Events tab reachable when no local services are discovered", async () => {
  discoverResourcesMock.mockReset().mockReturnValue([]);
  loadTiltEventsMock.mockReset().mockResolvedValue({ resources: [], events: [] });
  const io = streams();
  const app = render(<TUIApp animated={false} />, {
    stdin: io.stdin,
    stdout: io.stdout,
    stderr: io.stderr,
    interactive: true,
    exitOnCtrlC: false,
    patchConsole: false,
  });
  const send = async (key: string) => {
    io.stdin.write(key);
    await new Promise((resolve) => setTimeout(resolve, 30));
    await app.waitUntilRenderFlush();
  };
  try {
    await new Promise((resolve) => setTimeout(resolve, 30));
    await app.waitUntilRenderFlush();
    expect(io.output().replace(ANSI_SGR, "")).toContain("No service.json files found");
    await send("\x1b");
    expect(io.output().replace(ANSI_SGR, "")).toContain("Press q to quit");
    await send("3");
    const output = io.output().replace(ANSI_SGR, "");
    expect(output).toContain("Event Timeline");
    expect(output).toContain("No recent build events are available from Tilt yet.");
    expect(loadTiltEventsMock).toHaveBeenCalledTimes(1);
  } finally {
    app.unmount();
    io.stdin.destroy();
    io.stdout.destroy();
    io.stderr.destroy();
  }
});
