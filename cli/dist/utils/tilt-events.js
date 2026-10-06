import { STANDARD_PORTS } from "./constants.js";
import { runTilt } from "./tilt.js";
function asRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value)
        ? value
        : null;
}
function readString(value) {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
function readStringArray(value) {
    return Array.isArray(value)
        ? value.filter((item) => typeof item === "string" && Boolean(item.trim()))
        : [];
}
export function parseTiltUiResourceList(value) {
    const list = asRecord(value);
    if (!list || !Array.isArray(list.items)) {
        throw new Error("Tilt returned an invalid UIResource list");
    }
    const resources = [];
    const events = [];
    for (const value of list.items) {
        const item = asRecord(value);
        const metadata = asRecord(item?.metadata);
        const resourceName = readString(metadata?.name);
        if (!item || !resourceName)
            continue;
        const status = asRecord(item.status);
        resources.push({
            name: resourceName,
            runtimeStatus: readString(status?.runtimeStatus),
            updateStatus: readString(status?.updateStatus),
            hasPendingChanges: typeof status?.hasPendingChanges === "boolean" ? status.hasPendingChanges : undefined,
        });
        const history = Array.isArray(status?.buildHistory) ? status.buildHistory : [];
        for (const [buildIndex, value] of history.entries()) {
            const build = asRecord(value);
            if (!build)
                continue;
            const error = readString(build.error);
            const warnings = readStringArray(build.warnings);
            const details = [error, ...warnings].filter((entry) => Boolean(entry));
            const spanId = readString(build.spanID);
            events.push({
                id: `${resourceName}:build:${spanId ?? String(buildIndex)}`,
                resourceName,
                kind: error ? "failed" : warnings.length ? "warning" : "success",
                title: error
                    ? "Build failed"
                    : warnings.length
                        ? "Build completed with warnings"
                        : "Build completed",
                occurredAt: readString(build.finishTime) ?? readString(build.startTime),
                details: details.length ? details.join("; ") : undefined,
            });
        }
        const currentBuild = asRecord(status?.currentBuild);
        if (currentBuild) {
            events.push({
                id: `${resourceName}:current-build`,
                resourceName,
                kind: "running",
                title: "Build in progress",
                occurredAt: readString(currentBuild.startTime),
            });
        }
        const lastDeployTime = readString(status?.lastDeployTime);
        if (lastDeployTime) {
            events.push({
                id: `${resourceName}:last-deploy`,
                resourceName,
                kind: "success",
                title: "Last deployed",
                occurredAt: lastDeployTime,
            });
        }
        const conditions = Array.isArray(status?.conditions) ? status.conditions : [];
        for (const [conditionIndex, value] of conditions.entries()) {
            const condition = asRecord(value);
            if (!condition)
                continue;
            const type = readString(condition.type);
            const state = readString(condition.status);
            const reason = readString(condition.reason);
            const message = readString(condition.message);
            if ((!type && !reason && !message) || (state === "True" && !reason && !message))
                continue;
            const detail = [reason, message]
                .filter((entry) => Boolean(entry))
                .join(": ");
            events.push({
                id: `${resourceName}:condition:${type ?? String(conditionIndex)}`,
                resourceName,
                kind: state === "False" ? "warning" : "status",
                title: `Condition ${type ?? "status"}${state ? `: ${state}` : ""}`,
                occurredAt: readString(condition.lastTransitionTime),
                details: detail || undefined,
            });
        }
    }
    events.sort((left, right) => {
        const leftTime = left.occurredAt ? Date.parse(left.occurredAt) : Number.NaN;
        const rightTime = right.occurredAt ? Date.parse(right.occurredAt) : Number.NaN;
        if (Number.isNaN(leftTime)) {
            return Number.isNaN(rightTime) ? left.resourceName.localeCompare(right.resourceName) : -1;
        }
        if (Number.isNaN(rightTime))
            return 1;
        return rightTime - leftTime;
    });
    return { resources, events };
}
export async function loadTiltEvents() {
    const port = process.env.TILT_PORT ?? String(STANDARD_PORTS.tiltUi);
    const result = await runTilt("get", ["uiresources", "-o", "json", "--port", port], {
        inheritStdio: false,
        timeoutMs: 10_000,
    });
    if (result.exitCode !== 0)
        throw new Error(result.stderr.trim() || "Tilt UI is unreachable");
    return parseTiltUiResourceList(JSON.parse(result.stdout));
}
//# sourceMappingURL=tilt-events.js.map