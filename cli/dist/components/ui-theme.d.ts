import type { FileType } from "../types/index.js";
type TUIColor = string | undefined;
export interface TUITheme {
    accent: TUIColor;
    border: TUIColor;
    muted: TUIColor;
    foreground: TUIColor;
    success: TUIColor;
    warning: TUIColor;
    error: TUIColor;
    info: TUIColor;
    secondary: TUIColor;
    selectedBackground: TUIColor;
    selectedForeground: TUIColor;
    selectionBackground: TUIColor;
    selectionForeground: TUIColor;
    dimMuted: boolean;
    highContrast: boolean;
    ascii: boolean;
    bannerStart: string;
    bannerEnd: string;
    selectionMarker: string;
    fileColors: Record<FileType, TUIColor>;
}
type TUIEnvironment = {
    NO_COLOR?: string;
    TERM?: string;
};
export declare function createTUITheme(highContrast: boolean, environment?: TUIEnvironment): TUITheme;
export declare function getTUIStatusColor(theme: TUITheme, color: string | undefined): TUIColor;
export declare function getTUIStatusIcon(theme: TUITheme, icon: string, color: string | undefined): string;
export declare const TUIThemeContext: import("react").Context<TUITheme>;
export declare function useTUITheme(): TUITheme;
export {};
//# sourceMappingURL=ui-theme.d.ts.map