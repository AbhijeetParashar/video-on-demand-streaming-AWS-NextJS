"use client";

import { useEffect, useState } from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  selectedVideo: any;
}

const Player: React.FC<VideoPlayerProps> = ({ selectedVideo }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Set to true when the component is mounted to avoid hydration issues
    setIsClient(true);
  }, []);

  return (
    <div>
      {isClient && selectedVideo && (
        <div className="video-player">
          <h2>Playing: {selectedVideo.title}</h2>
          <ReactPlayer
            url={selectedVideo.mainM3U8}
            controls
            playing
            width="100%"
            height="100%"
          />
        </div>
      )}
    </div>
  );
};

export default Player;
