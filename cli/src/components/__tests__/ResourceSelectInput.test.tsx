import { PassThrough } from "node:stream";
import { Box, render, Text } from "ink";
import { describe, expect, it } from "vitest";
import { getListRowFromMouseY } from "../../utils/terminal-layout.js";
import { ResourceSelectInput } from "../ResourceSelectInput.js";

function createStreams(columns: number) {
  const stdin = new PassThrough() as unknown as NodeJS.ReadStream;
  Object.assign(stdin, {
    isTTY: true,
    isRaw: false,
    setRawMode: () => {},
  });

  const stdout = new PassThrough() as unknown as NodeJS.WriteStream;
  Object.assign(stdout, { isTTY: true, columns, rows: 24 });

  const stderr = new PassThrough() as unknown as NodeJS.WriteStream;
  Object.assign(stderr, { isTTY: true, columns, rows: 24 });

  return { stdin, stdout, stderr };
}

describe("ResourceSelectInput layout measurement", () => {
  it("reports its measured top row for mouse-to-list row mapping", async () => {
    const streams = createStreams(80);
    const measuredTops: number[] = [];
    const app = render(
      <Box flexDirection="column">
        <Text>heading</Text>
        <Text>tabs</Text>
        <Text>separator</Text>
        <ResourceSelectInput
          items={[{ value: "api", label: "shop-api" }]}
          onSelect={() => {}}
          highlightedIndex={0}
          onLayout={(top) => measuredTops.push(top)}
        />
      </Box>,
      {
        ...streams,
        alternateScreen: true,
        exitOnCtrlC: false,
        patchConsole: false,
      },
    );

    try {
      await app.waitUntilRenderFlush();
      expect(measuredTops.at(-1)).toBe(3);
      const listTop = measuredTops.at(-1) ?? Number.NaN;
      expect(getListRowFromMouseY(listTop + 1, listTop)).toBe(0);
    } finally {
      app.unmount();
      streams.stdin.destroy();
      streams.stdout.destroy();
      streams.stderr.destroy();
    }
  });
});
