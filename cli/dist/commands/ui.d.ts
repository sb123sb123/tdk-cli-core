import { Command } from "commander";
import type React from "react";
import type { LoadingScreenProps } from "../types/index.js";
export declare const LoadingScreen: React.FC<LoadingScreenProps>;
type TUIHeaderProps = {
    projectRoot: string;
    serviceCount: number;
    terminalWidth: number;
    compact: boolean;
};
/** Render the TUI banner and width-aware separator. */
export declare const TUIHeader: React.FC<TUIHeaderProps>;
export declare const uiCommand: Command;
export {};
//# sourceMappingURL=ui.d.ts.map