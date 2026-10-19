"use client";

import React, { useEffect, useRef, useState } from "react";
import shaka from "shaka-player";

export default function ShakaPlayerComponent({ manifestUrl, jobId }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Install built-in polyfills
    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
      setTimeout(() => setError("Browser not supported for video streaming."), 0);
      return;
    }

    const initPlayer = async () => {
      const video = videoRef.current;
      const player = new shaka.Player(video);
      playerRef.current = player;

      // Configure DRM ClearKey License Server
      if (jobId) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        player.configure({
          drm: {
            servers: {
              'org.w3.clearkey': `${baseUrl}/streaming/license/${jobId}`
            }
          }
        });
      }

      // Listen for error events.
      player.addEventListener("error", (event) => {
        console.error("Error code", event.detail.code, "object", event.detail);
        setError(`Shaka Player Error: ${event.detail.code}`);
      });

      try {
        await player.load(manifestUrl);
        console.log("The video has now been loaded!");
      } catch (e) {
        console.error("Error loading video", e);
        setError(`Failed to load video: ${e.message}`);
      }
    };

    if (manifestUrl && videoRef.current) {
      initPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [manifestUrl]);

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black rounded-lg overflow-hidden relative">
      {error && (
        <div className="absolute top-0 left-0 w-full p-4 bg-red-900 text-white text-center z-10">
          {error}
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full max-h-[800px] object-contain"
        controls
        autoPlay
        poster="/placeholder-video-thumbnail.jpg" // You can replace this later
      />
    </div>
  );
}
