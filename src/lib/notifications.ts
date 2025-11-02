// lib/notifications.ts
import { type NotificationData, notifications } from "@mantine/notifications";

type NotificationOptions = Omit<NotificationData, "message"> & {
  message: string;
};

const defaultConfig = {
  position: "bottom-right" as const,
  autoClose: 5000,
};

export const notify = {
  success: (options: NotificationOptions | string) => {
    const config = typeof options === "string" ? { message: options } : options;

    notifications.show({
      ...defaultConfig,
      title: "Success",
      color: "green",
      ...config,
    });
  },

  error: (options: NotificationOptions | string) => {
    const config = typeof options === "string" ? { message: options } : options;

    notifications.show({
      ...defaultConfig,
      title: "Error",
      color: "red",
      autoClose: 7000,
      ...config,
    });
  },

  warning: (options: NotificationOptions | string) => {
    const config = typeof options === "string" ? { message: options } : options;

    notifications.show({
      ...defaultConfig,
      title: "Warning",
      color: "yellow",
      ...config,
    });
  },

  info: (options: NotificationOptions | string) => {
    const config = typeof options === "string" ? { message: options } : options;

    notifications.show({
      ...defaultConfig,
      title: "Info",
      color: "blue",
      ...config,
    });
  },
};
