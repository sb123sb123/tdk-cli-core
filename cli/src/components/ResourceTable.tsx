import { Box, Text } from "ink";
import type React from "react";
import type { ResourceTableProps } from "../types/index.js";
import { formatShortDate, getStatusColor, getStatusIcon, truncate } from "../utils/formatting.js";
import { getTUIStatusColor, getTUIStatusIcon, useTUITheme } from "./ui-theme.js";

export const ResourceTable: React.FC<ResourceTableProps> = ({ resources, maxWidth = 100 }) => {
  const theme = useTUITheme();
  if (resources.length === 0) {
    return (
      <Box paddingY={1}>
        <Text color={theme.muted}>No resources found</Text>
      </Box>
    );
  }

  const narrowMode = maxWidth < 80;

  return (
    <Box flexDirection="column">
      <Box
        flexDirection="row"
        borderStyle={theme.ascii ? undefined : "single"}
        borderColor={theme.border}
        paddingX={1}
      >
        <Box width={narrowMode ? 20 : 25}>
          <Text bold color={theme.foreground}>
            Logical ID
          </Text>
        </Box>
        {!narrowMode && (
          <Box width={20}>
            <Text bold color={theme.foreground}>
              Physical ID
            </Text>
          </Box>
        )}
        <Box width={12}>
          <Text bold color={theme.foreground}>
            Type
          </Text>
        </Box>
        <Box width={15}>
          <Text bold color={theme.foreground}>
            Status
          </Text>
        </Box>
        {!narrowMode && (
          <Box width={20}>
            <Text bold color={theme.foreground}>
              Created
            </Text>
          </Box>
        )}
      </Box>

      {resources.map((resource) => {
        const statusColor = getTUIStatusColor(theme, getStatusColor(resource.status));
        const statusIcon = getTUIStatusIcon(
          theme,
          getStatusIcon(resource.status),
          getStatusColor(resource.status),
        );

        return (
          <Box key={resource.name} flexDirection="row" paddingX={1}>
            <Box width={narrowMode ? 20 : 25}>
              <Text color={theme.foreground}>{truncate(resource.name, narrowMode ? 18 : 23)}</Text>
            </Box>
            {!narrowMode && (
              <Box width={20}>
                <Text color={theme.muted}>
                  {resource.stack && resource.stack !== "unknown"
                    ? truncate(`${resource.stack}/${resource.name}`, 18)
                    : truncate(resource.name, 18)}
                </Text>
              </Box>
            )}
            <Box width={12}>
              <Text color={theme.accent} bold={theme.highContrast}>
                {resource.type}
              </Text>
            </Box>
            <Box width={15}>
              <Text color={statusColor} bold={theme.highContrast}>
                {statusIcon} {resource.status}
              </Text>
            </Box>
            {!narrowMode && (
              <Box width={20}>
                <Text color={theme.muted}>{formatShortDate(resource.createdAt)}</Text>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
