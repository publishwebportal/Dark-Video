import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Crown, Eye, Star } from 'lucide-react';
import { VideoItem, Language } from '../types';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem | null;
  language: Language;
  onSelectRelated?: (v: VideoItem) => void;
  allVideos: VideoItem[];
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  video,
  language,
  onSelectRelated,
  allVideos,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setCurrentTime(0);
    }
  }, [isOpen, video]);

  if (!isOpen || !video) return null;

  const isBn = language === 'bn';

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  const relatedVideos = allVideos
    .filter((v) => v.id !== video.id)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-6 overflow-y-auto bg-black sm:bg-[#011C40]/95 sm:backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        ref={playerContainerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full min-h-[100dvh] sm:min-h-0 sm:max-w-5xl rounded-none sm:rounded-2xl bg-[#011C40] border-0 sm:border sm:border-[#26658C] shadow-none sm:shadow-2xl overflow-hidden sm:my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Bar */}
        <div className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-[#011C40]/90 via-[#011C40]/40 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#023859] text-[#A7EBF2] border border-[#54ACBF]/40 text-xs font-semibold">
              <Crown className="h-3.5 w-3.5 fill-[#54ACBF] text-[#54ACBF]" />
              <span>VIP STREAM · 4K HDR</span>
            </span>
            <span className="text-xs text-[#cfeef5] truncate max-w-xs font-medium">
              {isBn ? video.titleBn : video.title}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#011C40]/70 hover:bg-[#023859] text-[#8eb0c4] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Canvas / Player Area */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            autoPlay
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="h-full w-full object-contain cursor-pointer"
          />

          {/* Large Center Play Overlay when Paused */}
          {!isPlaying && (
            <div 
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#54ACBF] text-[#011C40] shadow-2xl shadow-[#54ACBF]/50 transform hover:scale-110 transition-transform">
                <Play className="h-9 w-9 ml-1 fill-current" />
              </div>
            </div>
          )}

          {/* Bottom Player Controls Scrim */}
          <div className={`absolute bottom-0 inset-x-0 z-20 p-2.5 sm:p-4 bg-gradient-to-t from-[#011C40]/95 via-[#011C40]/70 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Scrubber Progress Bar */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-[#023859] rounded-lg appearance-none cursor-pointer accent-[#54ACBF]"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={togglePlay}
                  className="p-2 sm:p-1.5 text-white hover:text-[#A7EBF2] transition-colors cursor-pointer"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 sm:p-1.5 text-[#cfeef5] hover:text-white transition-colors cursor-pointer"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5 text-rose-400" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="hidden sm:block w-16 h-1 bg-[#023859] rounded-lg appearance-none cursor-pointer accent-[#54ACBF]"
                  />
                </div>

                <div className="text-[11px] sm:text-xs font-mono text-[#8eb0c4] whitespace-nowrap">
                  <span className="text-white">{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{duration ? formatTime(duration) : video.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3">
                <span className="hidden sm:inline-block text-[11px] font-mono font-medium text-[#A7EBF2] px-2 py-0.5 rounded bg-[#011C40] border border-[#26658C]">
                  {video.quality}
                </span>

                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      videoRef.current.play();
                      setIsPlaying(true);
                    }
                  }}
                  title="Replay"
                  className="p-2 sm:p-1.5 text-[#cfeef5] hover:text-white transition-colors cursor-pointer"
                  aria-label="Replay"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  onClick={toggleFullscreen}
                  title="Fullscreen"
                  className="p-2 sm:p-1.5 text-[#cfeef5] hover:text-white transition-colors cursor-pointer"
                  aria-label="Toggle Fullscreen"
                >
                  <Maximize className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Information & Related Reel */}
        <div className="p-6 bg-[#011C40] border-t border-[#26658C]/40">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-[#8eb0c4] mb-2">
                <span className="text-[#A7EBF2] font-semibold">{video.category}</span>
                <span aria-hidden="true">·</span>
                <span>{video.year}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-[#54ACBF]" />
                  {video.views} views
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-0.5 text-[#A7EBF2] font-medium">
                  <Star className="h-3 w-3 fill-[#54ACBF] text-[#54ACBF]" />
                  {video.rating}
                </span>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                {isBn ? video.titleBn : video.title}
              </h2>

              <p className="text-sm text-[#cfeef5] leading-relaxed max-w-3xl">
                {isBn ? video.descriptionBn : video.description}
              </p>

              {video.director && (
                <p className="mt-3 text-xs text-[#5d839c]">
                  Director: <span className="text-[#8eb0c4]">{video.director}</span>
                </p>
              )}
            </div>

            {/* Quick Related Videos */}
            {relatedVideos.length > 0 && onSelectRelated && (
              <div className="w-full lg:w-72 shrink-0 pt-4 lg:pt-0 lg:border-l lg:border-[#26658C]/40 lg:pl-6">
                <h4 className="text-xs font-bold text-[#8eb0c4] uppercase tracking-wider mb-3">
                  {isBn ? 'অন্যান্য প্রিমিয়াম ভিডিও' : 'More VIP Videos'}
                </h4>
                <div className="space-y-2.5">
                  {relatedVideos.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectRelated(item)}
                      className="group/rel flex items-center gap-2.5 p-2 rounded-lg bg-[#023859]/60 hover:bg-[#023859] border border-[#26658C]/50 cursor-pointer transition-colors"
                    >
                      <div className="relative h-12 w-20 shrink-0 rounded overflow-hidden bg-black">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover group-hover/rel:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-[#011C40]/40 flex items-center justify-center">
                          <Play className="h-3 w-3 text-[#54ACBF] fill-[#54ACBF]" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white group-hover/rel:text-[#A7EBF2] truncate">
                          {isBn ? item.titleBn : item.title}
                        </p>
                        <p className="text-[11px] text-[#8eb0c4] font-mono">
                          {item.duration} · {item.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
