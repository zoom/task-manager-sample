"use client"

import zoomSdk from "@zoom/appssdk";
import { useEffect, useState } from "react";

export default function Zoom() {
    const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const configure = async () => {
      try {
        const cfg = await zoomSdk.config({
          capabilities: ["shareApp"],
        });
        setConfig(cfg);
      } catch (e) {
        console.error(e);
      }
    };
    configure();
  }, []);

  console.log("Zoom App Configuration", config);

  return (
    <div>
      {config ? (
        <p>Zoom App is configured.</p>
      ) : (
        <p>Loading Zoom App configuration...</p>
      )}
    </div>
  );
}
