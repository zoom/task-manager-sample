"use client";

import { useEffect, useState } from "react";
import zoomSdk from "@zoom/appssdk";
import ZoomApiDemo from "@/components/zoomapp-sdk/zoom-app-demo-apis";
import { usePathname } from "next/navigation";
import { useParams } from "next/navigation";

export default function ZoomContextPage() {
  const [contextData, setContextData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const location = usePathname();
  const params = useParams();

  useEffect(() => {
    const isZoomApp = typeof navigator !== "undefined" && navigator.userAgent.includes("ZoomApps");

  
    async function fetchZoomContext() {
      try {
        await zoomSdk.config({
          version: "0.16.0",
          capabilities: [
            "getSupportedJsApis",
            "getRunningContext",
            "getMeetingContext",
            "getUserContext",
            "getMeetingUUID",
            "getAppContext",
          ],
        });
      } catch (configError) {
        console.error("Zoom SDK config failed:", configError);
        setError(configError);
        return;
      }
    
      const result: any = {};
    
      try {
        result.supportedApis = await zoomSdk.getSupportedJsApis();
      } catch (e) {
        console.error("Error calling getSupportedJsApis:", e);
        result.supportedApis = `Error: ${e}`;
      }
    
      try {
        result.runningContext = await zoomSdk.getRunningContext();
      } catch (e) {
        console.error("Error calling getRunningContext:", e);
        result.runningContext = `Error: ${e}`;
      }
    
      try {
        result.appContext = await zoomSdk.getAppContext();
      } catch (e) {
        console.error("Error calling getAppContext:", e);
        result.appContext = `Error: ${e}`;
      }
    
      // Conditional logic: only call meeting-related APIs when in a meeting
      if (result.runningContext === "inMeeting") {
        try {
          result.userContext = await zoomSdk.getUserContext();
        } catch (e) {
          console.error("Error calling getUserContext:", e);
          result.userContext = `Error: ${e}`;
        }
    
        try {
          result.meetingContext = await zoomSdk.getMeetingContext();
        } catch (e) {
          console.warn("Error calling getMeetingContext:", e);
          result.meetingContext = `Error: ${e}`;
        }
    
        try {
          result.meetingUUID = await zoomSdk.getMeetingUUID();
        } catch (e) {
          console.warn("Error calling getMeetingUUID:", e);
          result.meetingUUID = `Error: ${e}`;
        }
      } else {
        result.userContext = "Skipped: Only available in meeting";
        result.meetingContext = "Skipped: Only available in meeting";
        result.meetingUUID = "Skipped: Only available in meeting";
      }
    
      setContextData(result);
    }
    
    

    if (isZoomApp) {
      fetchZoomContext();
    } else {
      setError("Not running inside Zoom App. This page must be accessed from the Zoom client.");
    }
  }, []);

  return (
    <div className="p-6 ">
      <p className="mb-4">
        Pathname is: <strong>{location}</strong>
        <br />
        Params are: <strong>{JSON.stringify(params)}</strong>
      </p>
      <h1 className="text-2xl font-bold mb-4">Zoom Context Viewer</h1>
      
      <p className="mb-4">
   
        Use the buttons below to interact with the Zoom Apps SDK and view the current Zoom App context.
        API responses will be shown in alerts and logged to the console.
      </p>
      

      {error && (
        <div className="text-red-600 mb-4">
          <h2 className="font-semibold">Error:</h2>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      

        {/* Scrollable API demo section */}
      <ZoomApiDemo />

      <p className="mb-4">  This section provides a live view of the Zoom App context with using the Zoom Apps SDK.</p>

      {contextData ? (
        <div className="space-y-6">
          <ContextBlock title="Supported JS APIs" data={contextData.supportedApis} />
          <ContextBlock title="Running Context" data={contextData.runningContext} />
          <ContextBlock title="App Context" data={contextData.appContext} />
          <ContextBlock title="User Context" data={contextData.userContext} />
          <ContextBlock title="Meeting Context" data={contextData.meetingContext} />
          <ContextBlock title="Meeting UUID" data={contextData.meetingUUID} />
        </div>
      ) : (
        !error && <p className="text-gray-500">Loading Zoom context...</p>
      )}
    </div>
  );
}

function ContextBlock({ title, data }: { title: string; data: any }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <pre className="bg-gray-100 text-xs p-4 rounded border border-gray-200 overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
