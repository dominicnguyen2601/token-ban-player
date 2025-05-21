"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban, Volume2, VolumeX, Pause, Play } from "lucide-react";
import { checkToken, TokenCheckResult } from "@/lib/actions";

interface VideoPlayerProps {
    token: string;
    username: string;
}

const DEFAULT_VIETNAM_IP = "203.113.131.5";

export function VideoPlayer({ token, username }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [apiResponseMessage, setApiResponseMessage] = useState<string | null>(
    null
  );
  const [userMode, setUserMode] = useState<"Legitimate" | "Pirate">(
    "Legitimate"
  );
  const [currentIp, setCurrentIp] = useState<string>(DEFAULT_VIETNAM_IP);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

    useEffect(() => {
        setUserMode(username ? "Legitimate" : "Pirate");
    }, [username]);

  // Effect to initialize IP from URL or set default and update URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const ipFromQuery = params.get("ip");

    let ipToSet = DEFAULT_VIETNAM_IP;
    let shouldUpdateUrl = false;

    if (ipFromQuery) {
      ipToSet = ipFromQuery;
    } else {
      shouldUpdateUrl = true; // IP not in URL, will add default
    }

    if (currentIp !== ipToSet) {
      setCurrentIp(ipToSet);
    }

    if (shouldUpdateUrl) {
      params.set("ip", DEFAULT_VIETNAM_IP);

      if (token) params.set("token", token);
      else params.delete("token");
      if (username) params.set("username", username);
      else params.delete("username");

      if (pathname) {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      } else {
        console.warn(
          "VideoPlayer: Pathname not available for URL update with IP."
        );
      }
    }
  }, [searchParams, token, username, router, pathname]);

  // Set up video source with token
  useEffect(() => {
    if (videoRef.current && token) {
      videoRef.current.src = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?token=${token}`;
    } else if (videoRef.current) {
      videoRef.current.src = "";
    }
  }, [token]);

  // Token validation effect
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      setApiResponseMessage("No token provided.");
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      return;
    }

    // Ensure currentIp is initialized before running token check
    if (!currentIp) {
      // This should ideally not happen if the IP initialization effect runs correctly
      console.warn("VideoPlayer: currentIp not set, delaying token check.");
      return;
    }

    let isActive = true;
    const checkTokenValidity = async () => {
      const videoPath = "/gtv-videos-bucket/sample/BigBuckBunny.mp4";

      const payloadForApi = {
        token: token,
        token_claim: "access-video",
        request_useragent: navigator.userAgent,
        request_ip: currentIp, // Use the currentIp from state
        request_hostname: window.location.hostname,
        request_path: videoPath,
      };

      try {
        const result: TokenCheckResult = await checkToken(payloadForApi);
        if (!isActive) return;

                setIsTokenValid(result.isValid);
                setApiResponseMessage(result.message);

        if (!result.isValid) {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      } catch (error) {
        if (!isActive) return;
        console.error(
          "useEffect - Error calling checkToken or processing result:",
          error
        );
        setIsTokenValid(false);
        setApiResponseMessage("Client-side error during token validation.");
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    checkTokenValidity();
    const intervalId = setInterval(checkTokenValidity, 2000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, [token, currentIp]); // Re-run if token or currentIp (from URL) changes

  const handlePlay = async () => {
    if (videoRef.current && isTokenValid) {
      try {
        if (videoRef.current.paused) {
          await videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      } catch (error) {
        console.error("Error toggling video playback:", error);
        setIsPlaying(videoRef.current?.paused ? false : true);
      }
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

    const handleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Informational message displaying the IP being used */}
      <div
        className={`p-3 mb-2 rounded-md text-sm flex items-center ${
          isTokenValid
            ? "bg-blue-900/30 text-blue-300"
            : "bg-yellow-900/30 text-yellow-300"
        }`}
      >
        <span>Validating with IP: {currentIp || "Loading IP..."}</span>
      </div>

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current && isTokenValid) {
            const newTime = Number.parseFloat(e.target.value);
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

            {!isTokenValid && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
                <div className="w-[80%] max-w-md bg-red-800/60 p-6 flex flex-col items-center justify-center rounded-lg text-center shadow-xl">
                  <Ban className="w-16 h-16 text-red-500 mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Access Denied
                  </h2>
                  <p className="text-gray-300">
                    {apiResponseMessage ||
                      "Your access to this video is restricted."}
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    Please ensure you have a valid session or contact support.
                  </p>
                </div>
            )}

            <div className="absolute top-4 left-4 bg-gray-800/80 px-3 py-1 rounded-md text-sm z-[5]">
              <span
                className={
                  userMode === "Legitimate" ? "text-green-400" : "text-red-400"
                }
              >
                {userMode} Mode
              </span>
              {username && (
                <span className="ml-2 text-gray-300">| User: {username}</span>
              )}
            </div>

            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                !isTokenValid ? "opacity-50 pointer-events-none" : "opacity-100"
              }`}
            >
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ef4444 ${
                    (currentTime / (duration || 1)) * 100
                  }%, #374151 ${(currentTime / (duration || 1)) * 100}%)`,
                }}
                disabled={!isTokenValid}
              />

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handlePlay}
                    disabled={!isTokenValid}
                    className="text-white hover:bg-gray-800/50"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleMute}
                    className="text-white hover:bg-gray-800/50"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  <span className="text-sm text-gray-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
