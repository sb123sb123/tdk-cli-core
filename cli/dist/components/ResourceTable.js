import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from "ink";
import { formatShortDate, getStatusColor, getStatusIcon, truncate } from "../utils/formatting.js";
import { getTUIStatusColor, getTUIStatusIcon, useTUITheme } from "./ui-theme.js";
export const ResourceTable = ({ resources, maxWidth = 100 }) => {
    const theme = useTUITheme();
    if (resources.length === 0) {
        return (_jsx(Box, { paddingY: 1, children: _jsx(Text, { color: theme.muted, children: "No resources found" }) }));
    }
    const narrowMode = maxWidth < 80;
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "row", borderStyle: theme.ascii ? undefined : "single", borderColor: theme.border, paddingX: 1, children: [_jsx(Box, { width: narrowMode ? 20 : 25, children: _jsx(Text, { bold: true, color: theme.foreground, children: "Logical ID" }) }), !narrowMode && (_jsx(Box, { width: 20, children: _jsx(Text, { bold: true, color: theme.foreground, children: "Physical ID" }) })), _jsx(Box, { width: 12, children: _jsx(Text, { bold: true, color: theme.foreground, children: "Type" }) }), _jsx(Box, { width: 15, children: _jsx(Text, { bold: true, color: theme.foreground, children: "Status" }) }), !narrowMode && (_jsx(Box, { width: 20, children: _jsx(Text, { bold: true, color: theme.foreground, children: "Created" }) }))] }), resources.map((resource) => {
                const statusColor = getTUIStatusColor(theme, getStatusColor(resource.status));
                const statusIcon = getTUIStatusIcon(theme, getStatusIcon(resource.status), getStatusColor(resource.status));
                return (_jsxs(Box, { flexDirection: "row", paddingX: 1, children: [_jsx(Box, { width: narrowMode ? 20 : 25, children: _jsx(Text, { color: theme.foreground, children: truncate(resource.name, narrowMode ? 18 : 23) }) }), !narrowMode && (_jsx(Box, { width: 20, children: _jsx(Text, { color: theme.muted, children: resource.stack && resource.stack !== "unknown"
                                    ? truncate(`${resource.stack}/${resource.name}`, 18)
                                    : truncate(resource.name, 18) }) })), _jsx(Box, { width: 12, children: _jsx(Text, { color: theme.accent, bold: theme.highContrast, children: resource.type }) }), _jsx(Box, { width: 15, children: _jsxs(Text, { color: statusColor, bold: theme.highContrast, children: [statusIcon, " ", resource.status] }) }), !narrowMode && (_jsx(Box, { width: 20, children: _jsx(Text, { color: theme.muted, children: formatShortDate(resource.createdAt) }) }))] }, resource.name));
            })] }));
};
//# sourceMappingURL=ResourceTable.js.map