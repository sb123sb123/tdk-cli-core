import { describe, expect, it } from "vitest";
import { parseTiltUiResourceList } from "../../utils/tilt-events.js";

describe("Tilt UIResource event timeline", () => {
  it("maps build history, the current build, and resource status into newest-first events", () => {
    const result = parseTiltUiResourceList({
      items: [
        {
          metadata: { name: "api" },
          status: {
            runtimeStatus: "OK",
            updateStatus: "OK",
            hasPendingChanges: true,
            lastDeployTime: "2026-10-07T11:55:00Z",
            currentBuild: { startTime: "2026-10-07T12:04:00Z" },
            buildHistory: [
              {
                spanID: "complete",
                finishTime: "2026-10-07T12:00:00Z",
                warnings: ["using cached layer"],
              },
              {
                spanID: "failed",
                finishTime: "2026-10-07T12:02:00Z",
                error: "image build failed",
              },
            ],
            conditions: [
              {
                type: "Ready",
                status: "False",
                lastTransitionTime: "2026-10-07T12:03:00Z",
                reason: "Unhealthy",
                message: "readiness probe failed",
              },
            ],
          },
        },
      ],
    });

    expect(result.resources).toEqual([
      {
        name: "api",
        runtimeStatus: "OK",
        updateStatus: "OK",
        hasPendingChanges: true,
      },
    ]);
    expect(result.events.map((event) => event.title)).toEqual([
      "Build in progress",
      "Condition Ready: False",
      "Build failed",
      "Build completed with warnings",
      "Last deployed",
    ]);
    expect(result.events[2].details).toBe("image build failed");
    expect(result.events[3].details).toBe("using cached layer");
  });

  it("returns an empty timeline when Tilt has no resources", () => {
    expect(parseTiltUiResourceList({ items: [] })).toEqual({ resources: [], events: [] });
  });

  it("rejects malformed UIResource responses", () => {
    expect(() => parseTiltUiResourceList({ items: {} })).toThrow("invalid UIResource list");
  });
});
