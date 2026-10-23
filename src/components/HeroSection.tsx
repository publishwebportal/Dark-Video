import React, { useState } from 'react';
import { Play, Crown, Camera, Sliders, Trash2 } from 'lucide-react';
import { VideoItem, Language } from '../types';
import { SmartImage } from './SmartImage';

interface HeroSectionProps {
  featuredVideo: VideoItem;
  isVip: boolean;
  language: Language;
  onPlayFeatured: () => void;
  onOpenPaywall: () => void;
  onEditImage?: (video: VideoItem) => void;
  onDeleteVideo?: (video: VideoItem) => void;
  isAdmin?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredVideo,
  isVip,
  language,
  onPlayFeatured,
  onOpenPaywall,
  onEditImage,
  onDeleteVideo,
  isAdmin = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isBn = language === 'bn';

  return (
    <section id="featured-section" className="relative w-full border-b border-[#26658C]/40 bg-gradient-to-b from-[#011C40] via-[#023859]/30 to-[#011C40] pt-6 pb-12 overflow-hidden">
      {/* Background ambient lighting in Luna cyan and slate */}
      <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-[#54ACBF]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 -z-10 h-80 w-80 rounded-full bg-[#26658C]/20 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Split Screen Hero Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* Left Column: Typographic Hierarchy */}
          <div className="md:col-span-6 flex flex-col justify-center space-y-4 lg:space-y-5">
            {/* Kicker */}
            <div className="inline-flex items-center gap-2 self-start text-xs font-semibold text-[#A7EBF2] bg-[#023859] border border-[#54ACBF]/40 px-3 py-1 rounded-full shadow-sm">
              <Crown className="h-3.5 w-3.5 fill-[#54ACBF] text-[#54ACBF]" />
              <span>{isBn ? 'ডার্ক ভিডিও প্রিমিয়াম নেটওয়ার্ক' : 'DARK VIDEO VIP ARCHIVE'}</span>
            </div>

            {/* Display Headline */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
              {isBn ? (
                <>
                  অন্ধকার জগতের <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A7EBF2] via-[#54ACBF] to-[#26658C]">ডার্ক ভিডিও</span> এক্সক্লুসিভ কালেকশন
                </>
              ) : (
                <>
                  Unfiltered <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A7EBF2] via-[#54ACBF] to-[#26658C]">Dark World</span> & Exclusive Thrillers
                </>
              )}
            </h1>

            {/* Lead copy */}
            <p className="text-sm sm:text-base text-[#cfeef5] leading-relaxed max-w-xl">
              {isBn ? (
                'বিভিন্ন অন্ধকার জগতের রহস্যময় দৃশ্য থেকে শুরু করে আন্ডারগ্রাউন্ড দুনিয়ার এক্সক্লুসিভ কালেকশন—সব ধরনের আকর্ষণীয় ডার্ক ভিডিও, HD কোয়ালিটিতে এখন এক প্ল্যাটফর্মে। মাত্র ১০০ টাকায় মাসিক আনলিমিটেড সাবস্ক্রিপশন নিন।'
              ) : (
                'From mysterious dark worlds to exclusive underground collections — discover a wide range of captivating dark videos in HD quality, all on one platform. Subscribe for only ৳100/month to unlock the entire uncompressed VIP archive.'
              )}
            </p>

            {/* Pricing Callout Badge */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#023859] border border-[#26658C] self-start shadow-md">
              <span className="font-display text-2xl font-black text-[#A7EBF2]">৳১০০</span>
              <div className="text-xs text-[#8eb0c4]">
                <span className="text-white font-semibold">{isBn ? 'মাসিক ভিআইপি সাবস্ক্রিপশন' : 'Monthly All-Access Pass'}</span>
                <p className="text-[11px] text-[#8eb0c4]">{isBn ? 'বিকাশ, নগদ বা রকেটে যেকোনো মুহূর্তে এক্টিভ' : 'Instant bKash, Nagad or Card activation'}</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onPlayFeatured}
                className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl font-extrabold text-sm sm:text-sm text-[#011C40] bg-gradient-to-r from-[#54ACBF] via-[#75d4e4] to-[#A7EBF2] hover:from-[#A7EBF2] hover:to-[#54ACBF] transition-all shadow-lg shadow-[#54ACBF]/25 active:scale-95 cursor-pointer w-full sm:w-auto"
              >
                <Play className="h-4 w-4 fill-[#011C40]" />
                <span>{isBn ? 'ডার্ক ভিডিও দেখুন' : 'Watch Dark Video'}</span>
              </button>

              {!isVip && (
                <button
                  onClick={onOpenPaywall}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-sm text-[#A7EBF2] bg-[#023859] border border-[#54ACBF]/50 hover:bg-[#023859]/80 hover:border-[#A7EBF2] transition-colors cursor-pointer w-full sm:w-auto"
                >
                  <Crown className="h-4 w-4 fill-[#54ACBF] text-[#54ACBF]" />
                  <span>{isBn ? '৳১০০ মেম্বারশিপ নিন' : 'Subscribe for ৳100'}</span>
                </button>
              )}

              {isAdmin && onEditImage && (
                <button
                  type="button"
                  onClick={() => onEditImage(featuredVideo)}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-sm text-[#A7EBF2] bg-[#023859] border border-[#26658C] hover:border-[#54ACBF] hover:bg-[#023859]/80 transition-colors cursor-pointer w-full sm:w-auto"
                  title={isBn ? 'ব্যানার ছবি পরিবর্তন করুন' : 'Change Banner Poster'}
                >
                  <Camera className="h-4 w-4 text-[#54ACBF]" />
                  <span>{isBn ? 'ছবি পরিবর্তন' : 'Change Image'}</span>
                </button>
              )}

              {isAdmin && onDeleteVideo && (
                <button
                  type="button"
                  onClick={() => onDeleteVideo(featuredVideo)}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 sm:py-3 rounded-xl font-bold text-sm sm:text-sm text-rose-300 hover:text-white bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 transition-colors cursor-pointer w-full sm:w-auto"
                  title={isBn ? 'এই ব্যানার ভিডিওটি ডিলিট করুন' : 'Delete Featured Video'}
                >
                  <Trash2 className="h-4 w-4 text-rose-400" />
                  <span>{isBn ? 'ডিলিট' : 'Delete'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Hero Visual Container at Matching Height */}
          <div className="md:col-span-6 flex items-center">
            <div 
              onClick={onPlayFeatured}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative w-full aspect-video rounded-2xl overflow-hidden bg-[#023859] border border-[#26658C] shadow-2xl hover:border-[#54ACBF] transition-all duration-300 cursor-pointer"
            >
              <SmartImage
                src={featuredVideo.thumbnailUrl}
                alt={featuredVideo.title}
                fallbackTitle={featuredVideo.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#011C40]/95 via-[#011C40]/40 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between text-xs z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#011C40]/80 backdrop-blur-md text-[#A7EBF2] font-mono font-semibold border border-[#26658C]">
                    {featuredVideo.quality}
                  </span>
                  {isAdmin && onEditImage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditImage(featuredVideo);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#011C40]/90 hover:bg-[#023859] active:scale-95 backdrop-blur-md text-[#A7EBF2] hover:text-white border border-[#54ACBF]/70 text-xs font-medium shadow-md transition-all cursor-pointer"
                      title={isBn ? 'টাইটেল, ক্যাটাগরি ও ছবি পরিবর্তন' : 'Edit Title, Category & Poster'}
                    >
                      <Sliders className="h-3 w-3 text-[#54ACBF]" />
                      <span>{isBn ? 'এডিট (টাইটেল/ছবি)' : 'Edit Info & Poster'}</span>
                    </button>
                  )}
                  {isAdmin && onDeleteVideo && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteVideo(featuredVideo);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#011C40]/90 hover:bg-rose-950/80 active:scale-95 backdrop-blur-md text-rose-300 hover:text-white border border-rose-500/50 text-xs font-medium shadow-md transition-all cursor-pointer"
                      title={isBn ? 'ভিডিও/ছবি ডিলিট করুন' : 'Delete Video/Poster'}
                    >
                      <Trash2 className="h-3 w-3 text-rose-400" />
                      <span>{isBn ? 'ডিলিট' : 'Delete'}</span>
                    </button>
                  )}
                </div>

                <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#011C40]/85 backdrop-blur-md text-[#cfeef5] border border-[#26658C]/50 font-mono">
                  {featuredVideo.duration}
                </span>
              </div>

              {/* Center Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full transition-all duration-300 shadow-2xl ${
                  isHovered 
                    ? 'scale-110 bg-[#54ACBF] text-[#011C40] shadow-[#54ACBF]/50' 
                    : 'bg-[#011C40]/70 backdrop-blur-md border border-[#A7EBF2]/40 text-[#A7EBF2]'
                }`}>
                  <Play className="h-8 w-8 ml-1 fill-current" />
                </div>
              </div>

              {/* Bottom Scrim Info */}
              <div className="absolute bottom-4 inset-x-4 flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-medium text-[#A7EBF2] uppercase tracking-wider">
                    {isBn ? 'ফিচার্ড ডার্ক ভিডিও' : 'Featured Dark Video'}
                  </span>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-[#A7EBF2] transition-colors">
                    {isBn ? featuredVideo.titleBn : featuredVideo.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#8eb0c4] mt-1">
                    <span>{featuredVideo.category}</span>
                    <span>·</span>
                    <span>{featuredVideo.views} views</span>
                    <span>·</span>
                    <span className="text-[#A7EBF2]">★ {featuredVideo.rating}</span>
                  </div>
                </div>

                {!isVip && (
                  <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#011C40]/85 border border-[#54ACBF]/50 text-[#A7EBF2] text-xs font-semibold">
                    <Crown className="h-3 w-3 text-[#54ACBF]" />
                    <span>{isBn ? '১০০ টাকা দিয়ে দেখুন' : 'Unlock for ৳100'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Full-width proof & trust metrics strip below the split */}
        <div className="mt-12 pt-6 border-t border-[#26658C]/40 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-[#023859]/60 border border-[#26658C]/50 shadow-sm">
            <span className="block font-display text-xl sm:text-2xl font-bold text-white">৳১০০ / মাস</span>
            <span className="text-xs text-[#8eb0c4]">{isBn ? 'আনলিমিটেড ভিআইপি পাস' : 'Flat Monthly Rate'}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#023859]/60 border border-[#26658C]/50 shadow-sm">
            <span className="block font-display text-xl sm:text-2xl font-bold text-[#A7EBF2]">4K & 8K HDR</span>
            <span className="text-xs text-[#8eb0c4]">{isBn ? 'আল্ট্রা হাই ডেফিনিশন' : 'Lossless Cinema Quality'}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#023859]/60 border border-[#26658C]/50 shadow-sm">
            <span className="block font-display text-xl sm:text-2xl font-bold text-[#cfeef5]">100% Ad-Free</span>
            <span className="text-xs text-[#8eb0c4]">{isBn ? 'কোনো বিজ্ঞাপন বা বাধা নেই' : 'Zero Commercials'}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#023859]/60 border border-[#26658C]/50 shadow-sm">
            <span className="block font-display text-xl sm:text-2xl font-bold text-[#54ACBF]">bKash / Nagad</span>
            <span className="text-xs text-[#8eb0c4]">{isBn ? 'ইনস্ট্যান্ট এক্টিভেশন' : 'Instant Mobile Pay'}</span>
          </div>
        </div>

      </div>
    </section>
  );
};
