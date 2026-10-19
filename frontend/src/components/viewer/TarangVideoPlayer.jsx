"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import shaka from "shaka-player";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, RotateCcw, Check } from "lucide-react";
import { Box, Slider, IconButton, CircularProgress, Typography } from "@mui/material";
import { GlassPopover } from "../common/GlassPopover";
import EmptyMediaState from "../common/EmptyMediaState";

export default function TarangVideoPlayer({ url, jobId, poster, isPreview = false }) {
  const effectivePoster = poster || (url && url.includes('tarang-media-processed') ? url.replace(/\/[^\/]+$/, '/poster.jpg') : '');

  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLoadingManifest, setIsLoadingManifest] = useState(false);
  const isLoadedRef = useRef(false);
  const loadPromiseRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isThumbOverlayVisible, setIsThumbOverlayVisible] = useState(true);
  const [centerAction, setCenterAction] = useState(null);
  const [isEnded, setIsEnded] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const isSettingsOpen = Boolean(settingsAnchorEl);
  const isSettingsOpenRef = useRef(false);
  useEffect(() => {
    isSettingsOpenRef.current = isSettingsOpen;
  }, [isSettingsOpen]);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [videoQualities, setVideoQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const currentQualityRef = useRef('auto');
  useEffect(() => {
    currentQualityRef.current = currentQuality;
  }, [currentQuality]);

  const [activeQuality, setActiveQuality] = useState(null);

  const applyQuality = (targetQuality, clearBuffer = true) => {
    const player = playerRef.current;
    if (!player) return;

    try {
      if (targetQuality === 'auto') {
        player.configure({
          abr: {
            enabled: true,
            restrictToElementSize: false,
            restrictToScreenSize: false,
            restrictions: { minHeight: 0, maxHeight: Infinity }
          }
        });
        const tracks = player.getVariantTracks();
        const active = tracks.find(t => t.active);
        const currentH = videoRef.current?.videoHeight || active?.height;
        if (currentH) setActiveQuality(currentH);
      } else {
        const height = Number(targetQuality);
        player.configure({
          abr: {
            enabled: false,
            restrictToElementSize: false,
            restrictToScreenSize: false,
            restrictions: { minHeight: height, maxHeight: height }
          }
        });
        const tracks = player.getVariantTracks();
        const matching = tracks.filter(t => t.height === height);
        matching.sort((a, b) => (b.bandwidth || 0) - (a.bandwidth || 0));
        if (matching.length > 0) {
          // Only switch track if it is not already active or if explicitly clearing buffer
          if (!matching[0].active || clearBuffer) {
            player.selectVariantTrack(matching[0], clearBuffer, 0.5);
          }
          if (clearBuffer) {
            setActiveQuality(height);
          }
        }
      }
    } catch (err) {
      console.warn("Could not apply quality:", err);
    }
  };

  // Sync rendered resolution on tab focus / visibility change (without interrupting video buffer)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (videoRef.current?.videoHeight) {
          setActiveQuality(videoRef.current.videoHeight);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const [containerWidth, setContainerWidth] = useState(0);
  const [isVolHovered, setIsVolHovered] = useState(false);
  const [isDraggingVol, setIsDraggingVol] = useState(false);
  const showVolSlider = isVolHovered || isDraggingVol;

  const controlsTimeout = useRef(null);
  const [retryKey, setRetryKey] = useState(0);

  // Responsive breakpoints
  const isMini = isFullscreen
    ? (containerWidth > 0 && containerWidth < 360)
    : (isPreview || (containerWidth > 0 && containerWidth < 360));
  const isCompact = !isMini && containerWidth > 0 && containerWidth < 560;
  const isSmallScreen = isMini || isCompact;

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();

    let rAFId = null;
    const resizeObserver = new ResizeObserver((entries) => {
      if (rAFId) cancelAnimationFrame(rAFId);
      rAFId = requestAnimationFrame(() => {
        for (const entry of entries) {
          if (entry.contentRect) {
            setContainerWidth(entry.contentRect.width);
          }
        }
      });
    });
    resizeObserver.observe(containerRef.current);
    return () => {
      if (rAFId) cancelAnimationFrame(rAFId);
      resizeObserver.disconnect();
    };
  }, []);

  // Sync state during render when URL prop changes (per React 19 guidelines)
  const [prevUrl, setPrevUrl] = useState(url);
  if (prevUrl !== url) {
    setPrevUrl(url);
    setIsThumbOverlayVisible(true);
    setError(null);
  }

  // If in PROCESSING state, auto-retry periodically to check if the background transcode completed
  useEffect(() => {
    if (error !== 'PROCESSING') return;
    const timer = setTimeout(() => {
      setRetryKey(k => k + 1);
    }, 4000);
    return () => clearTimeout(timer);
  }, [error, retryKey]);

  // Initialize Shaka Player if streaming URL, else use native
  useEffect(() => {
    let isCancelled = false;

    let effectiveJobId = jobId;
    if (!effectiveJobId && url) {
      const match = url.match(/tarang-media-processed\/([^\/]+)\//);
      if (match) {
        effectiveJobId = match[1];
      }
    }

    const isStreaming = effectiveJobId || url?.includes('.mpd') || url?.includes('.m3u8') || url?.includes('/streaming/');

    if (isStreaming) {
      shaka.polyfill.installAll();
      if (!shaka.Player.isBrowserSupported()) {
        setTimeout(() => {
          if (!isCancelled) setError("Browser not supported for video streaming.");
        }, 0);
        return;
      }
      const initPlayer = () => {
        isLoadedRef.current = false;
        setIsLoadingManifest(true);

        const loadPromise = (async () => {
          const video = videoRef.current;
          if (!video) return;

          // Destroy previous player before initializing new one
          if (playerRef.current) {
            try {
              await playerRef.current.destroy();
            } catch (e) {
              // Ignore destruction errors
            }
          }
          if (isCancelled) return;

          const player = new shaka.Player();
          playerRef.current = player;

          // Register response filter to intercept DASH manifests and strip any empty AdaptationSets (prevents Shaka Error 4003)
          try {
            player.getNetworkingEngine().registerResponseFilter((type, response) => {
              if (type === shaka.net.NetworkingEngine.RequestType.MANIFEST && response.data) {
                try {
                  let text = typeof response.data === "string"
                    ? response.data
                    : shaka.util.StringUtils.fromUTF8(response.data);
                  const cleaned = text.replace(/<AdaptationSet[^>]*>\s*<\/AdaptationSet>/gi, "");
                  if (cleaned !== text) {
                    response.data = typeof response.data === "string"
                      ? cleaned
                      : shaka.util.StringUtils.toUTF8(cleaned);
                  }
                } catch (parseErr) {
                  console.warn("Could not parse/clean manifest response:", parseErr);
                }
              }
            });
          } catch (netErr) {
            console.warn("Could not register response filter:", netErr);
          }

          try {
            await player.attach(video);
          } catch (e) {
            if (isCancelled) return;
            setError(`Attach failed: ${e.message}`);
            setIsLoadingManifest(false);
            return;
          }

          if (isCancelled) return;

          // Configure high default bandwidth so playback starts in crisp HD
          player.configure({
            abr: {
              enabled: currentQualityRef.current === 'auto',
              defaultBandwidthEstimate: 10000000,
              restrictToElementSize: false,
              restrictToScreenSize: false,
              bandwidthDowngradeTarget: 0.9,
              restrictions: currentQualityRef.current === 'auto' ? {
                minHeight: 0,
                maxHeight: Infinity
              } : {
                minHeight: Number(currentQualityRef.current),
                maxHeight: Number(currentQualityRef.current)
              }
            },
            streaming: {
              bufferingGoal: 15,
              rebufferingGoal: 2,
              bufferBehind: 15,
            }
          });

          if (effectiveJobId) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
            player.configure({
              drm: { servers: { 'org.w3.clearkey': `${baseUrl}/streaming/license/${effectiveJobId}` } }
            });
          }
          player.addEventListener("error", (event) => {
            if (isCancelled) return;
            const err = event.detail;
            if (!err) return;
            // Shaka Error 7000 is LOAD_INTERRUPTED - normal cancellation, ignore it
            if (err.code === 7000 || (err.message && err.message.includes('7000'))) {
              return;
            }
            if (err.code === 1002 || err.code === 1001 || (err.message && (err.message.includes('1002') || err.message.includes('1001')))) {
              setError('PROCESSING');
              return;
            }
            setError(`Failed to load video: ${err.message || err.code}`);
          });

          try {
            await player.load(url);
            if (isCancelled) return;
            setError(null);
            isLoadedRef.current = true;
            setIsLoadingManifest(false);

            if (videoRef.current && videoRef.current.currentTime === 0) {
              videoRef.current.currentTime = 0.001;
            }
            const updateTracks = () => {
              if (isCancelled || !playerRef.current) return;
              const tracks = playerRef.current.getVariantTracks();
              const uniqueHeights = [...new Set(tracks.map(t => t.height))].filter(h => h).sort((a, b) => b - a);
              if (uniqueHeights.length > 0) setVideoQualities(uniqueHeights);
              const active = tracks.find(t => t.active);
              const currentH = videoRef.current?.videoHeight || active?.height;
              if (currentH) setActiveQuality(currentH);
            };
            updateTracks();
            player.addEventListener('trackschanged', updateTracks);
            player.addEventListener('adaptation', updateTracks);
            player.addEventListener('variantchanged', updateTracks);
            player.addEventListener('buffering', (e) => {
              if (!isCancelled) setIsBuffering(e.buffering);
            });

            if (currentQualityRef.current !== 'auto') {
              applyQuality(currentQualityRef.current, false);
            }
          } catch (e) {
            if (isCancelled) return;
            setIsLoadingManifest(false);
            // Ignore LOAD_INTERRUPTED (7000)
            if (e.code === 7000 || (e.message && e.message.includes('7000'))) {
              return;
            }
            if (e.code === 1002 || e.code === 1001 || (e.message && (e.message.includes('1002') || e.message.includes('1001')))) {
              setError('PROCESSING');
            } else {
              setError(`Failed to load video: ${e.message || e.code}`);
            }
          }
        })();

        loadPromiseRef.current = loadPromise;
        return loadPromise;
      };
      if (url && videoRef.current) initPlayer();
    } else {
      // Native MP4
      if (videoRef.current) {
        videoRef.current.src = url;
      }
      // Add dummy qualities so the UI is visible during development with static MP4s
      setTimeout(() => {
        if (!isCancelled) setVideoQualities([2160, 1440, 1080, 720, 480, 360, 240, 144]);
      }, 0);
    }

    return () => {
      isCancelled = true;
      isLoadedRef.current = false;
      loadPromiseRef.current = null;
      if (playerRef.current) {
        playerRef.current.destroy().catch(() => { });
        playerRef.current = null;
      }
    };
  }, [url, jobId, retryKey]);

  // Controls Fade Logic
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (!isSettingsOpenRef.current) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (!isSettingsOpenRef.current) {
      setShowControls(false);
    }
  };

  // Video Event Listeners
  const togglePlay = async () => {
    if (isSettingsOpen) {
      setSettingsAnchorEl(null);
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    if (isEnded) {
      setIsThumbOverlayVisible(false);
      setIsEnded(false);
      video.currentTime = 0;
      video.play().catch(e => console.warn("Replay failed:", e));
      return;
    }

    if (video.paused) {
      // If Shaka player is still attaching/loading manifest, await it so we don't cause LOAD_INTERRUPTED!
      if (loadPromiseRef.current && !isLoadedRef.current) {
        setIsLoadingManifest(true);
        try {
          await loadPromiseRef.current;
        } catch (e) {
          console.warn("Player loading failed before play:", e);
          setIsLoadingManifest(false);
          return;
        }
        setIsLoadingManifest(false);
      }

      applyQuality(currentQualityRef.current, false);
      try {
        await video.play();
      } catch (err) {
        console.warn("video.play() failed:", err);
        // If play failed or was interrupted, restore thumbnail overlay
        if (!video.currentTime || video.currentTime < 0.1) {
          setIsThumbOverlayVisible(true);
          setIsPlaying(false);
          setIsBuffering(false);
        }
      }
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    if (volume === 0 && !isMuted) {
      setVolume(1);
      videoRef.current.volume = 1;
    }
  };

  const handleVolumeChange = (e, newValue) => {
    const val = newValue !== undefined ? newValue : parseFloat(e.target.value);
    if (!isNaN(val)) {
      setVolume(val);
      if (videoRef.current) {
        videoRef.current.volume = val;
        videoRef.current.muted = val === 0;
      }
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = useCallback((e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (!containerRef.current) return;

    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      isFullscreen
    );

    if (!isCurrentlyFullscreen) {
      const el = containerRef.current;
      const req = el.requestFullscreen ||
                  el.webkitRequestFullscreen ||
                  el.webkitRequestFullScreen ||
                  el.mozRequestFullScreen ||
                  el.msRequestFullscreen;
      if (req) {
        try {
          const res = req.call(el);
          if (res && typeof res.catch === 'function') {
            res.catch(err => console.warn("Error attempting to enable fullscreen:", err));
          }
        } catch (err) {
          console.warn("Error attempting to enable fullscreen:", err);
        }
      }
    } else {
      const exit = document.exitFullscreen ||
                   document.webkitExitFullscreen ||
                   document.webkitCancelFullScreen ||
                   document.mozCancelFullScreen ||
                   document.msExitFullscreen;
      if (exit) {
        try {
          const res = exit.call(document);
          if (res && typeof res.catch === 'function') {
            res.catch(err => console.warn("Error attempting to exit fullscreen:", err));
          }
        } catch (err) {
          console.warn("Error attempting to exit fullscreen:", err);
        }
      } else {
        setIsFullscreen(false);
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(active);
      setShowControls(true);
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    const events = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange"
    ];
    events.forEach(ev => document.addEventListener(ev, handleFullscreenChange));
    return () => {
      events.forEach(ev => document.removeEventListener(ev, handleFullscreenChange));
    };
  }, []);

  // Keyboard shortcut listener during fullscreen (Escape capture to prevent modal close, and F key)
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        toggleFullscreen(e);
      } else if (e.key === 'f' || e.key === 'F') {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          e.stopPropagation();
          toggleFullscreen(e);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isFullscreen, toggleFullscreen]);

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleProgressScrub = (e, newValue) => {
    // MUI Slider passes the value as the second argument.
    // Fallback to e.target.value just in case it's called from a native input somehow.
    const time = newValue !== undefined ? newValue : parseFloat(e.target.value);

    if (!isNaN(time)) {
      setCurrentTime(time);
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
      setIsEnded(false);
      if (time === 0) {
        applyQuality(currentQualityRef.current, false);
      }
    }
  };

  const triggerCenterAction = (action) => {
    setCenterAction(null);
    setTimeout(() => setCenterAction(action), 10);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#000',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`
        :fullscreen, :-webkit-full-screen, :-moz-full-screen, :-ms-fullscreen {
          background-color: #000 !important;
        }
        ::backdrop, ::-webkit-backdrop {
          background-color: #000 !important;
        }
        @keyframes customPopFade {
          0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
          30% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.8); }
        }
        .vol-slider-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>

      {error === 'PROCESSING' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(30, 79, 163, 0.05) 0%, rgba(13, 27, 42, 0.1) 100%)', backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: isMini ? '8px' : '24px' }}>
          <div style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--card-border)',
            padding: isMini ? '12px 18px' : '32px 48px',
            borderRadius: isMini ? 'var(--radius-md)' : 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <CircularProgress sx={{ color: 'var(--color-primary)', mb: isMini ? 1 : 3 }} size={isMini ? 24 : 48} thickness={4} />
            <Typography variant={isMini ? 'body2' : 'h6'} sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: isMini ? 0 : 1 }}>
              Processing Video
            </Typography>
            {!isMini && (
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '250px' }}>
                Optimizing your video for the best streaming experience. Check back soon.
              </Typography>
            )}
          </div>
        </div>
      )}

      {error && error !== 'PROCESSING' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.9)', backdropFilter: 'blur(4px)', color: 'white', textAlign: 'center', zIndex: 50, fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Video Element Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          zIndex: 0
        }}
      >
        <video
          ref={videoRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            backgroundColor: '#000',
            display: 'block',
            transform: 'scale(1.01)',
            transformOrigin: 'center center'
          }}
          onClick={togglePlay}
          onDoubleClick={(e) => {
            e.stopPropagation();
            toggleFullscreen(e);
          }}
          onPlay={() => {
            setIsPlaying(true);
            setIsEnded(false);
            setIsThumbOverlayVisible(false);
            triggerCenterAction('play');
          }}
          onPlaying={() => {
            setIsPlaying(true);
            setIsBuffering(false);
            setIsThumbOverlayVisible(false);
          }}
          onWaiting={() => {
            setIsBuffering(true);
          }}
          onPause={() => {
            setIsPlaying(false);
            setIsBuffering(false);
            if (!isEnded && videoRef.current?.currentTime < videoRef.current?.duration) {
              triggerCenterAction('pause');
            }
          }}
          onTimeUpdate={() => {
            const cur = videoRef.current?.currentTime || 0;
            setCurrentTime(cur);
            if (cur > 0.1 && isThumbOverlayVisible) {
              setIsThumbOverlayVisible(false);
            }
          }}
          onLoadedMetadata={() => {
            setDuration(videoRef.current?.duration || 0);
            if (videoRef.current?.videoHeight) {
              setActiveQuality(videoRef.current.videoHeight);
            }
            if (videoRef.current && videoRef.current.currentTime === 0) {
              videoRef.current.currentTime = 0.001;
            }
          }}
          onResize={() => {
            if (videoRef.current?.videoHeight) {
              setActiveQuality(videoRef.current.videoHeight);
            }
          }}
          onEnded={() => {
            setIsEnded(true);
            setIsPlaying(false);
            triggerCenterAction('replay');
          }}
        />
      </div>

      {/* Center Play/Pause Animation */}
      {centerAction && (
        <div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%', backgroundColor: 'rgba(40, 167, 69, 0.6)', /* Theme Green */
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none', zIndex: 20,
            width: isMini ? '48px' : (isCompact ? '64px' : '96px'),
            height: isMini ? '48px' : (isCompact ? '64px' : '96px'),
            transform: 'translate(-50%, -50%)',
            animation: 'customPopFade 0.8s ease-out forwards'
          }}
        >
          {centerAction === 'play' ? (
            <Play fill="white" color="white" size={isMini ? 20 : (isCompact ? 26 : 36)} style={{ marginLeft: isMini ? '2px' : '4px' }} />
          ) : centerAction === 'pause' ? (
            <Pause fill="white" color="white" size={isMini ? 20 : (isCompact ? 26 : 36)} />
          ) : (
            <RotateCcw color="white" size={isMini ? 20 : (isCompact ? 26 : 36)} />
          )}
        </div>
      )}

      {/* Initial Thumbnail Overlay */}
      {isThumbOverlayVisible && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000'
          }}
          onClick={togglePlay}
          onDoubleClick={(e) => {
            e.stopPropagation();
            toggleFullscreen(e);
          }}
        >
          {effectivePoster && (
            <img
              src={effectivePoster}
              alt="Video Thumbnail"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center',
                backgroundColor: '#000',
                display: 'block',
                pointerEvents: 'none',
                transform: 'scale(1.01)',
                transformOrigin: 'center center'
              }}
            />
          )}
          <div style={{
            position: 'relative',
            zIndex: 2,
            width: isMini ? '44px' : (isCompact ? '60px' : '96px'),
            height: isMini ? '44px' : (isCompact ? '60px' : '96px'),
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(40, 167, 69, 0.75)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s, transform 0.2s',
            opacity: 1,
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
          }}>
            {(isLoadingManifest || isBuffering || isPlaying) ? (
              <CircularProgress size={isMini ? 18 : (isCompact ? 22 : 32)} sx={{ color: 'white' }} />
            ) : (
              <Play fill="white" color="white" size={isMini ? 20 : (isCompact ? 24 : 36)} style={{ marginLeft: isMini ? '2px' : '4px' }} />
            )}
          </div>
        </div>
      )}

      {/* Top Left: Complete Volume Module (Small Screens: Mute toggle + Slider) */}
      {isSmallScreen && (
        <div
          className="vol-slider-container-top"
          onMouseEnter={() => setIsVolHovered(true)}
          onMouseLeave={() => setIsVolHovered(false)}
          style={{
            position: 'absolute',
            top: isMini ? '8px' : '10px',
            left: isMini ? '8px' : '10px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(40, 167, 69, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-md)',
            padding: showVolSlider ? (isMini ? '0 8px 0 3px' : '0 10px 0 4px') : 0,
            width: showVolSlider ? 'auto' : (isMini ? '30px' : '34px'),
            height: isMini ? '30px' : '34px',
            zIndex: 40,
            pointerEvents: showControls ? 'auto' : 'none',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s, width 0.2s ease, padding 0.2s ease',
            overflow: 'hidden'
          }}
        >
          <IconButton
            onClick={toggleMute}
            sx={{
              color: 'white',
              width: isMini ? '24px' : '28px',
              height: isMini ? '24px' : '28px',
              p: 0,
              flexShrink: 0,
              '&:hover': { backgroundColor: 'transparent' }
            }}
          >
            {isMuted || volume === 0 ? <VolumeX size={isMini ? 14 : 16} /> : <Volume2 size={isMini ? 14 : 16} />}
          </IconButton>
          {showVolSlider && (
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              onChangeCommitted={() => setIsDraggingVol(false)}
              onMouseDown={() => setIsDraggingVol(true)}
              onTouchStart={() => setIsDraggingVol(true)}
              onTouchEnd={() => setIsDraggingVol(false)}
              sx={{
                width: isMini ? '46px' : '56px',
                opacity: 1,
                marginLeft: '4px',
                marginRight: '2px',
                padding: '10px 0',
                color: 'white',
                flexShrink: 0,
                '& .MuiSlider-thumb': {
                  width: isMini ? 10 : 12,
                  height: isMini ? 10 : 12,
                  transition: '0.2s cubic-bezier(.47,1.64,.41,.8)',
                  '&:hover, &.Mui-focusVisible': { boxShadow: 'none' },
                  '&.Mui-active': { boxShadow: 'none' },
                },
                '& .MuiSlider-rail': { opacity: 0.3 },
                '& .MuiSlider-track': { transition: 'background-color 0.2s' }
              }}
            />
          )}
        </div>
      )}

      {/* Top Right: Settings & Fullscreen Controls Layer (Small Screens) */}
      {isSmallScreen && !isFullscreen && (
        <div
          style={{
            position: 'absolute',
            top: isMini ? '8px' : '10px',
            right: isPreview ? '46px' : (isMini ? '8px' : '10px'),
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: isMini ? '4px' : '6px',
            backgroundColor: 'rgba(40, 167, 69, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-md)',
            padding: isMini ? '0 4px' : '0 6px',
            height: isMini ? '30px' : '34px',
            zIndex: 40,
            pointerEvents: showControls ? 'auto' : 'none',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s'
          }}
        >
          {/* Settings button */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setSettingsAnchorEl(settingsAnchorEl ? null : e.currentTarget);
            }}
            sx={{
              color: 'white',
              width: isMini ? '24px' : '28px',
              height: isMini ? '24px' : '28px',
              p: 0,
              '&:hover': { backgroundColor: 'transparent' }
            }}
          >
            <Settings size={isMini ? 14 : 16} />
          </IconButton>

          {/* Fullscreen button */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen(e);
            }}
            title="Fullscreen"
            sx={{
              color: 'white',
              width: isMini ? '24px' : '28px',
              height: isMini ? '24px' : '28px',
              p: 0,
              '&:hover': { backgroundColor: 'transparent' }
            }}
          >
            <Maximize size={isMini ? 14 : 16} />
          </IconButton>
        </div>
      )}



      {/* Custom Controls Bottom UI Layer */}
      <div
        style={{
          position: 'absolute',
          bottom: isMini ? '10px' : '16px',
          left: isMini ? '10px' : '16px',
          right: isMini ? '10px' : '16px',
          boxSizing: 'border-box',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: isMini ? '6px' : (isCompact ? '8px' : '12px'),
          zIndex: 40,
          pointerEvents: 'none'
        }}
      >
        {/* Play Button Pill */}
        <IconButton
          onClick={togglePlay}
          sx={{
            pointerEvents: showControls ? 'auto' : 'none',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s',
            backgroundColor: 'rgba(40, 167, 69, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            width: isMini ? '32px' : (isCompact ? '36px' : '40px'),
            height: isMini ? '32px' : (isCompact ? '36px' : '40px'),
            flexShrink: 0,
            justifyContent: 'center',
            '&:hover': { backgroundColor: 'rgba(40, 167, 69, 0.75)' }
          }}
        >
          {isEnded ? (
            <RotateCcw size={isMini ? 15 : (isCompact ? 18 : 20)} />
          ) : isPlaying ? (
            <Pause fill="currentColor" size={isMini ? 15 : (isCompact ? 18 : 20)} />
          ) : (
            <Play fill="currentColor" size={isMini ? 15 : (isCompact ? 18 : 20)} />
          )}
        </IconButton>

        {/* Volume Pill (Desktop only — on small screens it lives in top-left pill) */}
        {!isSmallScreen && (
          <div
            className="vol-slider-container"
            onMouseEnter={() => setIsVolHovered(true)}
            onMouseLeave={() => setIsVolHovered(false)}
            style={{
              pointerEvents: showControls ? 'auto' : 'none',
              opacity: showControls ? 1 : 0,
              transition: 'opacity 0.3s, width 0.25s ease, padding 0.25s ease',
              backgroundColor: 'rgba(40, 167, 69, 0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-md)',
              padding: showVolSlider ? '0 12px 0 6px' : 0,
              width: showVolSlider ? 'auto' : '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
              flexShrink: 0,
              overflow: 'hidden'
            }}
          >
            <IconButton
              onClick={toggleMute}
              sx={{
                color: 'white',
                width: '32px',
                height: '32px',
                p: 0,
                flexShrink: 0,
                '&:hover': { backgroundColor: 'transparent' }
              }}
            >
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </IconButton>
            {showVolSlider && (
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                onChangeCommitted={() => setIsDraggingVol(false)}
                onMouseDown={() => setIsDraggingVol(true)}
                onTouchStart={() => setIsDraggingVol(true)}
                onTouchEnd={() => setIsDraggingVol(false)}
                sx={{
                  width: '64px',
                  opacity: 1,
                  marginLeft: '6px',
                  marginRight: '2px',
                  padding: '16px 0',
                  color: 'white',
                  flexShrink: 0,
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                    transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                    '&:hover, &.Mui-focusVisible': { boxShadow: 'none' },
                    '&.Mui-active': { boxShadow: 'none' },
                  },
                  '& .MuiSlider-rail': { opacity: 0.3 },
                  '& .MuiSlider-track': { transition: 'background-color 0.2s' }
                }}
              />
            )}
          </div>
        )}

        {/* Progress Bar Container (Stretches across!) */}
        <div
          className="progress-container"
          style={{
            pointerEvents: showControls ? 'auto' : 'none',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s',
            flexGrow: 1,
            backgroundColor: 'rgba(40, 167, 69, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-md)',
            padding: isMini ? '0 10px' : (isCompact ? '0 12px' : '0 16px'),
            height: isMini ? '32px' : (isCompact ? '36px' : '40px'),
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            boxSizing: 'border-box'
          }}
        >
          <Slider
            min={0}
            max={duration || 100}
            step={0.01}
            value={currentTime}
            onChange={handleProgressScrub}
            sx={{
              color: 'white',
              padding: '16px 0',
              margin: 0,
              width: '100%',
              '& .MuiSlider-thumb': {
                width: isMini ? 10 : 12,
                height: isMini ? 10 : 12,
                opacity: 0,
                transition: 'opacity 0.2s, background-color 0.2s, transform 0.2s',
                '&:hover, &.Mui-focusVisible': { boxShadow: 'none' },
                '&.Mui-active': { boxShadow: 'none' },
              },
              '& .MuiSlider-rail': { opacity: 0.3 },
              '& .MuiSlider-track': { transition: 'background-color 0.2s' },
              '.progress-container:hover & .MuiSlider-thumb': {
                opacity: 1,
              },
              '.progress-container:hover & .MuiSlider-thumb:hover': {
                transform: 'translate(-50%, -50%) scale(1.3)',
              }
            }}
          />
        </div>

        {/* Time Pill */}
        <div
          style={{
            pointerEvents: showControls ? 'auto' : 'none',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s',
            backgroundColor: 'rgba(40, 167, 69, 0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-md)',
            padding: isMini ? '0 8px' : (isCompact ? '0 10px' : '0 16px'),
            height: isMini ? '32px' : (isCompact ? '36px' : '40px'),
            color: 'white',
            fontSize: isMini ? '11px' : (isCompact ? '12px' : '14px'),
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          {formatTime(currentTime)} <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 4px' }}>/</span> {formatTime(duration)}
        </div>

        {/* Desktop Right Controls Pill (Settings & Fullscreen) — only when NOT small screen */}
        {!isSmallScreen && (
          <div
            style={{
              position: 'relative',
              pointerEvents: showControls ? 'auto' : 'none',
              opacity: showControls ? 1 : 0,
              transition: 'opacity 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(40, 167, 69, 0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-md)',
              padding: '0 12px',
              height: '40px',
              flexShrink: 0
            }}
          >
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setSettingsAnchorEl(settingsAnchorEl ? null : e.currentTarget);
              }}
              sx={{
                color: 'white',
                width: '32px',
                height: '32px',
                p: 0,
                '&:hover': { backgroundColor: 'transparent' }
              }}
            >
              <Settings size={18} />
            </IconButton>

            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen(e);
              }}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              sx={{
                color: 'white',
                width: '32px',
                height: '32px',
                p: 0,
                '&:hover': { backgroundColor: 'transparent' }
              }}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </IconButton>
          </div>
        )}
      </div>

      {/* Global GlassPopover for Settings (Speed, Quality, Volume Slider) */}
      <GlassPopover
        open={isSettingsOpen}
        anchorEl={settingsAnchorEl}
        onClose={() => {
          setSettingsAnchorEl(null);
          setShowControls(false);
        }}
        anchorOrigin={isSmallScreen ? { vertical: 'bottom', horizontal: 'right' } : { vertical: 'top', horizontal: 'right' }}
        transformOrigin={isSmallScreen ? { vertical: 'top', horizontal: 'right' } : { vertical: 'bottom', horizontal: 'right' }}
        sx={{
          mb: isSmallScreen ? 0 : 1,
          mt: isSmallScreen ? 1 : 0,
          p: 0,
          maxHeight: '420px',
          overflowY: 'auto',
          color: 'var(--text-primary, #111827)',
          minWidth: isMini ? '220px' : '260px'
        }}
      >
        {/* Columns for Speed & Quality */}
        <div style={{ display: 'flex', flexDirection: 'row', padding: '6px' }}>
          {/* Playback Speed Column */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: isMini ? '100px' : '130px', flex: 1 }}>
            <div style={{ padding: '6px 12px', fontSize: '11px', color: 'inherit', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Speed
            </div>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
              <div
                key={rate}
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.playbackRate = rate;
                  }
                  setPlaybackRate(rate);
                  setSettingsAnchorEl(null);
                  setShowControls(false);
                }}
                style={{
                  padding: '6px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: playbackRate === rate ? 'rgba(40, 167, 69, 0.15)' : 'transparent',
                  transition: 'background-color 0.2s',
                  borderRadius: '4px',
                  color: 'inherit',
                  fontSize: '13px'
                }}
                onMouseEnter={(e) => {
                  if (playbackRate !== rate) e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                }}
                onMouseLeave={(e) => {
                  if (playbackRate !== rate) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontWeight: playbackRate === rate ? 600 : 400 }}>
                  {rate === 1 ? 'Normal' : `${rate}x`}
                </span>
                {playbackRate === rate && <Check size={14} color="var(--theme-green, #28a745)" />}
              </div>
            ))}
          </div>

          {/* Quality Column */}
          {videoQualities.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: isMini ? '100px' : '130px', flex: 1, borderLeft: '1px solid var(--card-border, rgba(0,0,0,0.1))', paddingLeft: '6px' }}>
              <div style={{ padding: '6px 12px', fontSize: '11px', color: 'inherit', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Quality
              </div>
              {['auto', ...videoQualities].map(q => (
                <div
                  key={q}
                  onClick={() => {
                    setCurrentQuality(q);
                    setSettingsAnchorEl(null);
                    setShowControls(false);
                    applyQuality(q, true);
                  }}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    backgroundColor: currentQuality === q ? 'rgba(40, 167, 69, 0.15)' : 'transparent',
                    transition: 'background-color 0.2s',
                    borderRadius: '4px',
                    color: 'inherit',
                    fontSize: '13px'
                  }}
                  onMouseEnter={(e) => {
                    if (currentQuality !== q) e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (currentQuality !== q) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ fontWeight: currentQuality === q ? 600 : 400 }}>
                    {q === 'auto'
                      ? `Auto ${activeQuality ? `(${activeQuality >= 2160 ? '4K' : `${activeQuality}p`})` : ''}`
                      : q >= 2160 ? '4K' : q >= 1440 ? '1440p' : `${q}p`}
                  </span>
                  {currentQuality === q && <Check size={14} color="var(--theme-green, #28a745)" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassPopover>
    </div>
  );
}
