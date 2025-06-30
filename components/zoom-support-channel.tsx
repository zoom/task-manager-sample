"use client"

import { FC, useState } from 'react';
import Image from 'next/image';

interface ZoomChannelSetupProps {
  /**
   * Called when the user skips the setup. Optional: if provided, overrides internal state.
   */
  onSkip?: () => void;
  /**
   * Called when the user clicks create. Optional.
   */
  onCreate?: () => void;
  /**
   * Control visibility externally. If omitted, component manages its own state.
   */
  visible?: boolean;
}

const ZoomChannelSetup: FC<ZoomChannelSetupProps> = ({ onSkip, onCreate, visible }) => {
  const [internalVisible, setInternalVisible] = useState(true);
  const isControlled = typeof visible === 'boolean';
  const isVisible = isControlled ? visible : internalVisible;

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      setInternalVisible(false);
    }
  };

  const handleCreate = () => {
    if (onCreate) {
      onCreate();
    } else {
      // default behavior: navigate or open modal
      console.log('Create Zoom channel clicked');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-md mx-auto max-w-auto">
      <div className="flex items-center space-x-4">
        <Image
          src="https://images2.welcomesoftware.com/assets/meetings.svg/Zz05OTIwYjYzYWVkY2QxMWVkOTQwZmFlNjAyZTg4NjZiZA==?t=20240908074924"
          alt="Zoom logo"
          width={62}
          height={62}
          className="rounded "
        />
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Set up your shared Zoom channel
          </h3>
          <p className="text-xs text-gray-500">
            Get personalized integration support directly from our engineers.
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleSkip}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Create Zoom Team Chat support channel
        </button>
      </div>
    </div>
  );
};

export default ZoomChannelSetup;
