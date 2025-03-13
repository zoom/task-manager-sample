'use client';

import { useState } from 'react';

const ZoomComponent = () => {
  const [loading, setLoading] = useState(false);
  const [meeting, setMeeting] = useState<any>(null);

  const handleCreateMeeting = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/zoom/meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'Test Add A Meeting App',
          type: 2, // 1: Instant, 2: Scheduled
          start_time: new Date().toISOString(),
          duration: 30,
          timezone: 'America/New_York',
        }),
      });

      const data = await response.json();
      setMeeting(data);
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 w-full">
      <button 
        className="px-4 py-2 bg-blue-500 dark:bg-black text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-800 transition disabled:bg-gray-400"
        onClick={handleCreateMeeting} 
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Zoom Meeting'}
      </button>
      {meeting && (
        <div className="bg-gray-100 dark:bg-black p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Meeting Created</h3>
          <p className="text-gray-700  dark:text-white">
            Join URL: <a href={meeting.join_url} target="_blank" rel="noreferrer" className="text-blue-500 underline">{meeting.join_url}</a>
          </p>
          <p className="text-gray-700 dark:text-white ">Meeting ID: {meeting.id}</p>
        </div>
      )}
    </div>
  );
};

export default ZoomComponent;
