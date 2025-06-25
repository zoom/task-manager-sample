// components/ZoomApiDemo.tsx
"use client";

import zoomSdk from "@zoom/appssdk";

const apis = [
    {
        name: "setVirtualBackground",
        options: {
          fileUrl:
            "https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?auto=format&fit=crop&w=983&q=80",
        },
      },
      { name: "removeVirtualBackground" },
      { name: "openUrl", options: { url: "https://www.google.com/" } },
      {
        name: "showNotification",
        options: {
          type: "info",
          title: "Hello Zoom Apps",
          message: "Testing notification",
        },
      },
      { name: "sendAppInvitationToAllParticipants" },
      { name: "sendAppInvitationToMeetingOwner" },
      { name: "showAppInvitationDialog" },
      { name: "getMeetingParticipants" },
      { name: "getMeetingUUID" },
      { name: "getMeetingJoinUrl" },
      { name: "listCameras" },
      { name: "expandApp" },
      { name: "allowParticipantToRecord" },
      { name: "getRecordingContext" },
      {
        name: "cloudRecording",
        buttonName: "cloudRecording (start)",
        options: { action: "start" },
      },
      {
        name: "shareApp-start",
        buttonName: "shareApp (start)",
        options: { action: "start" },
      },
      {
        name: "shareApp-stop",
        buttonName: "shareApp (stop)",
        options: { action: "stop" },
      },
].sort((a, b) => a.name.localeCompare(b.name));

type ZoomApiOption = {
    name: string;
    buttonName?: string;
    options?: any;
  };

export const invokeZoomAppsSdk = (api: ZoomApiOption) => async () => {
    const { name, buttonName = '', options = null } = api;
    try {
      const result = await (zoomSdk as any)[name](options);
      console.log(`${buttonName || name} success:`, result);
    } catch (error) {
      console.error(`${buttonName || name} error:`, error);
    }
  };

export default function ZoomApiDemo() {
  return (
    <div className="border rounded-lg p-4 mb-6 overflow-y-auto max-h-[500px]">
      <h2 className="text-xl font-semibold mb-4">Zoom Apps SDK API Demo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {apis.map((api) => (
          <button
            key={api.name}
            onClick={invokeZoomAppsSdk(api)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded shadow"
          >
            {api.name}
          </button>
        ))}
      </div>
    </div>
  );
}
