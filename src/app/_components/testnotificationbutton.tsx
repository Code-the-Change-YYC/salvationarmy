"use client";

import { notify } from "@/lib/notifications";
import { Button } from "@mantine/core";

export function TestNotificationButton() {
  return (
    <div>
      <Button onClick={() => notify.success("this is a success message")}>
        Success notification
      </Button>
      <Button onClick={() => notify.warning("this is a warning message")}>
        Warning notification
      </Button>
      <Button onClick={() => notify.error("this is an error message")}>Error notification</Button>
      <Button onClick={() => notify.info("this is an info message")}>Info notification</Button>
    </div>
  );
}
