export async function triggerZoomAuth(userId: string, email: string) {
    try {
      const response = await fetch("/api/zoom/deeplink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });
  
      const result = await response.json();
  
      if (result.error) {
        console.error("Zoom Deep Link Error:", result.error);
        return;
      }
  
      console.log("Zoom Deep Link Success:", result.deeplink);
      return result.deeplink;

    } catch (error) {
      console.error("Failed to trigger Zoom deep link:", error);
    }
  }
  