"use client";

import React, { useEffect, useRef, useState } from "react";
import shaka from "shaka-player";

export default function ShakaPlayer({ manifestUrl, jobId, poster }) {
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
        if (event.detail?.code === 7000 || event.detail?.message?.includes('7000')) return;
        console.error("Error code", event.detail.code, "object", event.detail);
        setError(`Shaka Player Error: ${event.detail.code}`);
      });

      try {
        await player.load(manifestUrl);
        console.log("The video has now been loaded!");
      } catch (e) {
        if (e.code === 7000 || (e.message && e.message.includes('7000'))) return;
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
  }, [manifestUrl, jobId]);

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black rounded-lg overflow-hidden relative">
      {error && (
        <div className="absolute top-0 left-0 w-full p-4 bg-red-900 text-white text-center z-10">
          {error}
        </div>
      )}
      <style>{`
        @keyframes popAndFade {
          0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
          30% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.8); }
        }
      `}</style>
      <video
        ref={videoRef}
        className="w-full h-full max-h-[800px] object-contain"
        style={{ transform: 'scale(1.05)' }}
        controls
        autoPlay
        onPlay={(e) => {
          const container = e.target.parentElement;
          const overlay = container.querySelector('.thumbnail-overlay');
          if (overlay) {
            overlay.style.transition = 'opacity 0.5s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
              overlay.style.display = 'none';
            }, 500);
          }

          const actionIcon = container.querySelector('.action-icon');
          if (actionIcon) {
            actionIcon.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="white" style="margin-left:4px;"><path d="M8 5v14l11-7z"/></svg>';
            actionIcon.style.animation = 'none';
            void actionIcon.offsetWidth;
            actionIcon.style.animation = 'popAndFade 0.8s ease-out forwards';
          }
        }}
        onPause={(e) => {
          const container = e.target.parentElement;
          const actionIcon = container.querySelector('.action-icon');
          if (actionIcon) {
            actionIcon.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
            actionIcon.style.animation = 'none';
            void actionIcon.offsetWidth;
            actionIcon.style.animation = 'popAndFade 0.8s ease-out forwards';
          }
        }}
      />

      {/* Center Action Icon for Play/Pause */}
      <div
        className="action-icon absolute top-1/2 left-1/2 flex items-center justify-center rounded-full bg-black/60 pointer-events-none z-[5] opacity-0"
        style={{ width: '72px', height: '72px', transform: 'translate(-50%, -50%)' }}
      ></div>

      {poster && (
        <div
          className="thumbnail-overlay group"
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: `url('${poster}')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, cursor: 'pointer', backgroundColor: '#000'
          }}
          onClick={(e) => {
            if (videoRef.current) videoRef.current.play();
          }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: 'var(--theme-blue)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
