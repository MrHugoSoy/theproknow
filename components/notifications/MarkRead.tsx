"use client";

import { useEffect } from "react";
import { markAllNotificationsRead } from "@/app/actions/notifications";

/** Marca todo como leído al abrir la página (el contador del navbar se actualiza solo). */
export function MarkRead({ unread }: { unread: number }) {
  useEffect(() => {
    if (unread > 0) void markAllNotificationsRead();
  }, [unread]);
  return null;
}
