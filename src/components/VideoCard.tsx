import React, { useState } from 'react';
import { Play, Lock, CheckCircle2, Eye, Star, Sliders, Trash2 } from 'lucide-react';
import { VideoItem, Language } from '../types';
import { SmartImage } from './SmartImage';

interface VideoCardProps {
  video: VideoItem;
  isVip: boolean;
  language: Language;
  onPlay: (video: VideoItem) => void;
  onLockedClick: (video: VideoItem) => void;
  onEditImage?: (video: VideoItem) => void;
  onDeleteVideo?: (video: VideoItem) => void;
  isAdmin?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isVip,
  language,
  onPlay,
  onLockedClick,
  onEditImage,
  onDeleteVideo,
  isAdmin = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isBn = language === 'bn';

  const handleClick = () => {
    if (isVip) {
      onPlay(video);
    } else {
      onLockedClick(video);
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-[#023859] border border-[#26658C]/50 hover:border-[#54ACBF] transition-all duration-300 hover:shadow-2xl hover:shadow-[#54ACBF]/15 cursor-pointer"
    >
      {/* 16:9 Aspect Ratio Video Form Frame */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#011C40]">
        {/* The Image that acts as the Video Poster */}
        <SmartImage
          src={video.thumbnailUrl}
          alt={isBn ? video.titleBn : video.title}
          fallbackTitle={video.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Cinematic Scrim Gradient Overlay in Luna Abyss/Midnight */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#011C40]/95 via-[#011C40]/35 to-[#011C40]/20" />

        {/* Top Badges */}
        <div className="absolute top-2 inset-x-2 sm:top-2.5 sm:inset-x-2.5 flex items-center justify-between text-[10px] sm:text-[11px] font-medium pointer-events-none">
          {/* Quality Tag */}
          <span className="px-1.5 sm:px-2 py-0.5 rounded bg-[#011C40]/80 backdrop-blur-md text-[#cfeef5] border border-[#26658C] uppercase tracking-wider font-mono">
            {video.quality}
          </span>

          {/* Paywall / VIP Lock Badge */}
          {isVip ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#023859]/90 backdrop-blur-md text-[#A7EBF2] border border-[#54ACBF]/50 font-medium">
              <CheckCircle2 className="h-3 w-3 text-[#54ACBF]" />
              <span>{isBn ? 'আনলকড' : 'VIP Access'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded bg-[#011C40]/90 backdrop-blur-md text-[#A7EBF2] border border-[#54ACBF]/50 font-semibold shadow-sm">
              <Lock className="h-3 w-3 text-[#54ACBF]" />
              <span>{isBn ? '🔒 ১০০ টাকা / VIP' : '🔒 ৳100 VIP'}</span>
            </span>
          )}
        </div>

        {/* Center Realistic Video Play Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border transition-all duration-300 shadow-xl ${
              isHovered
                ? 'scale-110 bg-[#54ACBF] border-[#A7EBF2] text-[#011C40] shadow-[#54ACBF]/40'
                : 'bg-[#011C40]/60 backdrop-blur-md border-[#A7EBF2]/30 text-[#A7EBF2]'
            }`}
          >
            <Play className={`h-5 w-5 sm:h-6 sm:w-6 ml-0.5 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} fill="currentColor" />
          </div>
        </div>

        {/* Action Buttons: Edit & Delete */}
        <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 z-20 flex items-center gap-1.5">
          {isAdmin && onEditImage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditImage(video);
              }}
              title={isBn ? 'ভিডিওর টাইটেল, ক্যাটাগরি ও ছবি পরিবর্তন করুন' : 'Edit Title, Category & Poster'}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#011C40]/95 hover:bg-[#023859] active:scale-95 text-[#A7EBF2] hover:text-white border border-[#54ACBF]/60 text-[11px] font-semibold backdrop-blur-md shadow-md transition-all cursor-pointer min-h-[32px]"
            >
              <Sliders className="h-3 w-3 text-[#54ACBF]" />
              <span>{isBn ? 'এডিট' : 'Edit'}</span>
            </button>
          )}

          {isAdmin && onDeleteVideo && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteVideo(video);
              }}
              title={isBn ? 'এই ইমেজ/ভিডিওটি সম্পূর্ণ ডিলিট করুন' : 'Delete this image/video'}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 active:scale-95 text-rose-300 hover:text-white border border-rose-500/60 text-[11px] font-bold backdrop-blur-md shadow-md transition-all cursor-pointer min-h-[32px]"
            >
              <Trash2 className="h-3 w-3 text-rose-400" />
              <span>{isBn ? 'ডিলিট' : 'Delete'}</span>
            </button>
          )}
        </div>

        {/* Bottom Corner Video Duration Badge */}
        <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded bg-[#011C40]/90 backdrop-blur-md text-[11px] font-mono font-medium text-[#cfeef5] border border-[#26658C]/50 pointer-events-none">
          {video.duration}
        </div>

        {/* Simulated Video Player Progress Bar on Hover in Luna Gradient */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-[#011C40]/90 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-[#26658C] via-[#54ACBF] to-[#A7EBF2] transition-all duration-500 ease-out ${
              isHovered ? 'w-2/5' : 'w-0'
            }`}
          />
        </div>
      </div>

      {/* Video Information Metadata Area */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="font-display text-base font-bold text-white group-hover:text-[#A7EBF2] transition-colors line-clamp-1">
            {isBn ? video.titleBn : video.title}
          </h3>

          <p className="mt-1 text-xs text-[#8eb0c4] line-clamp-2 leading-relaxed">
            {isBn ? video.descriptionBn : video.description}
          </p>
        </div>

        {/* Clean Unboxed Metadata with Typographic Separator (Zero Pill Discipline) */}
        <div className="mt-3 pt-3 border-t border-[#26658C]/40 flex items-center justify-between text-xs text-[#8eb0c4]">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-[#cfeef5]">{video.category}</span>
            <span aria-hidden="true" className="text-[#26658C]">·</span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-[#54ACBF]" />
              <span>{video.views}</span>
            </span>
            <span aria-hidden="true" className="text-[#26658C]">·</span>
            <span className="flex items-center gap-0.5 text-[#A7EBF2] font-medium">
              <Star className="h-3 w-3 fill-[#54ACBF] text-[#54ACBF]" />
              <span>{video.rating}</span>
            </span>
          </div>

          <div className="text-[11px] font-medium">
            {isVip ? (
              <span className="text-[#A7EBF2] flex items-center gap-1 font-semibold">
                <Play className="h-2.5 w-2.5 fill-current" />
                {isBn ? 'প্লে করুন' : 'Watch Now'}
              </span>
            ) : (
              <span className="text-[#54ACBF] group-hover:text-[#A7EBF2] transition-colors font-medium">
                {isBn ? '🔒 ১০০ টাকা সাবস্ক্রিপশন' : '🔒 ৳100 Monthly Pass'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
