import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from "ink";
import { useTUITheme } from "./ui-theme.js";
const TABS = [
    { id: "overview", label: "OVERVIEW", shortcut: "1" },
    { id: "resources", label: "RESOURCES", shortcut: "2" },
    { id: "events", label: "EVENTS", shortcut: "3" },
    { id: "files", label: "FILES", shortcut: "4" },
    { id: "config", label: "CONFIG", shortcut: "5" },
];
// biome-ignore lint/correctness/noUnusedFunctionParameters: reserved callback prop kept in the component API
export const TabBar = ({ activeTab, onTabChange, compact = false }) => {
    const theme = useTUITheme();
    const divider = (theme.ascii ? "-" : "\u2500").repeat(compact ? 60 : 80);
    return (_jsxs(Box, { flexDirection: "column", paddingX: 1, children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: theme.muted, dimColor: theme.dimMuted, children: divider }) }), _jsx(Box, { flexDirection: "row", justifyContent: "space-between", paddingX: 1, children: TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (_jsx(Box, { children: isActive ? (_jsx(Box, { borderStyle: theme.ascii ? undefined : "single", borderColor: theme.accent, paddingX: 1, backgroundColor: theme.selectedBackground, children: _jsxs(Text, { children: [_jsx(Text, { color: theme.selectedForeground, children: theme.selectionMarker }), _jsxs(Text, { color: theme.selectedForeground, bold: true, children: [" ", "[", tab.shortcut, "] ", tab.label, " "] }), _jsx(Text, { color: theme.selectedForeground, children: theme.bannerEnd })] }) })) : (_jsx(Box, { paddingX: 1, children: _jsxs(Text, { color: theme.muted, dimColor: theme.dimMuted, bold: theme.highContrast, children: ["[", tab.shortcut, "] ", compact ? tab.label.slice(0, 4) : tab.label] }) })) }, tab.id));
                }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: theme.muted, dimColor: theme.dimMuted, children: divider }) })] }));
};
//# sourceMappingURL=TabBar.js.map