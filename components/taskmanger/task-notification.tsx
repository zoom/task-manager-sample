"use client";

import { useState } from "react";

interface TaskNotificationProps {
  location?: string;        // e.g. "Zoom App"
  issueId: string;         // e.g. "ZSEE-162774"
  deeplink: string;        // The Zoom App deep link
  onDismiss?: () => void;  // Optional callback if parent needs to know when it's dismissed
}

export default function TaskNotification({
  location,
  issueId,
  deeplink,
  onDismiss,
}: TaskNotificationProps) {
  const [visible, setVisible] = useState(true);

  const chatbotDeeplink = process.env.NEXT_PUBLIC_ZOOM_CHATBOT_DEEPLINK;

  // If user closes or after a timeout, hide the notification
  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-10 z-50 w-72 bg-white dark:bg-gray-800 shadow-lg rounded-md p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
          You’ve created “
          <a
            href={location + "/" + issueId}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 hover:text-blue-800"
          >
            {"ZDP-"+issueId}
          </a>
          ” Task
        </span>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>
      <div className="flex items-center gap-3">
        {/* “View issue” deep link */}
        <a
          href={deeplink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
        >
          Open Zoom App
        </a>
        <a
          href={chatbotDeeplink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
        >
          View Chatbot Activity
        </a>
        {/* “Copy link” button */}
        <button
          onClick={() => navigator.clipboard.writeText(deeplink)}
          className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
        >
          Copy link
        </button>
      </div>
    </div>
  );
}
