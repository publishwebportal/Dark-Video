import React, { useState, useEffect } from 'react';
import { X, Upload, Film, Play, Lock, Sparkles, Check, Link } from 'lucide-react';
import { VideoItem, VideoCategory, Language } from '../types';
import { SmartImage } from './SmartImage';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVideo: (video: VideoItem) => void;
  language: Language;
  defaultCategory?: VideoCategory;
}

const PRESET_CINEMATIC_POSTERS = [
  {
    name: 'Noir Alley',
    url: '/images/hero_cinematic_noir_1792595188501.jpg',
  },
  {
    name: 'Cyberpunk Lab',
    url: '/images/video_cyber_heist_1792595188745.jpg',
  },
  {
    name: 'Deep Cosmos',
    url: '/images/video_space_odyssey_1792595189020.jpg',
  },
  {
    name: 'Dark Mystery',
    url: '/images/video_dark_room_1792595188682.jpg',
  },
];

export const AddVideoModal: React.FC<AddVideoModalProps> = ({
  isOpen,
  onClose,
  onAddVideo,
  language,
  defaultCategory,
}) => {
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [imageUrl, setImageUrl] = useState('/images/hero_cinematic_noir_1792595188501.jpg');
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
  const [duration, setDuration] = useState('15:45');
  const [category, setCategory] = useState<VideoCategory>(defaultCategory && defaultCategory !== 'All' ? defaultCategory : '1');
  const [quality, setQuality] = useState<'4K Ultra HD' | '1080p IMAX' | '8K Master'>('4K Ultra HD');

  useEffect(() => {
    if (isOpen) {
      if (defaultCategory && defaultCategory !== 'All') {
        setCategory(defaultCategory);
      }
    }
  }, [isOpen, defaultCategory]);
  const [description, setDescription] = useState('');
  const [isVipOnly, setIsVipOnly] = useState(true);
  const [priceTaka, setPriceTaka] = useState(100);
  const [uploadMode, setUploadMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isBn = language === 'bn';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(isBn ? 'অনুগ্রহ করে একটি সঠিক ইমেজ ফাইল নির্বাচন করুন।' : 'Please choose a valid image file.');
      return;
    }

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError(isBn ? 'অনুগ্রহ করে ভিডিওর একটি শিরোনাম দিন।' : 'Please enter a video title.');
      return;
    }
    if (!imageUrl) {
      setError(isBn ? 'অনুগ্রহ করে একটি ইমেজ যোগ করুন।' : 'Please upload or specify an image.');
      return;
    }

    const newVideo: VideoItem = {
      id: 'dv-custom-' + Date.now(),
      title: title.trim(),
      titleBn: titleBn.trim() || title.trim(),
      thumbnailUrl: imageUrl,
      videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      duration: duration || '12:00',
      category: category,
      views: '1.2K',
      rating: '9.7',
      quality: quality,
      isVipOnly: isVipOnly,
      priceTaka: priceTaka,
      description: description.trim() || (isBn ? 'ডার্ক ভিডিও প্ল্যাটফর্মে নতুন সংযোজিত এক্সক্লুসিভ কনটেন্ট।' : 'Newly uploaded exclusive cinematic content on Dark Video.'),
      descriptionBn: description.trim() || 'ডার্ক ভিডিও প্ল্যাটফর্মে নতুন সংযোজিত এক্সক্লুসিভ কনটেন্ট।',
      year: new Date().getFullYear().toString(),
      dateAdded: Date.now(),
      isUserAdded: true,
    };

    onAddVideo(newVideo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-6 overflow-y-auto bg-[#011C40] sm:bg-[#011C40]/90 sm:backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full min-h-[100dvh] sm:min-h-0 sm:max-w-4xl rounded-none sm:rounded-2xl bg-[#011C40] sm:bg-[#023859] border-0 sm:border sm:border-[#26658C] shadow-none sm:shadow-2xl overflow-hidden sm:my-auto flex flex-col max-h-[100dvh] sm:max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent in Luna gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#26658C] via-[#54ACBF] to-[#A7EBF2]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 rounded-full text-[#8eb0c4] hover:text-white bg-[#011C40]/80 hover:bg-[#011C40] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-4 sm:p-8 overflow-y-auto flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Film className="h-5 w-5 text-[#54ACBF]" />
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              {isBn ? 'ইমেজ আপলোড করে ভিডিও তৈরি করুন' : 'Add Image in Video Form (With Paywall)'}
            </h2>
          </div>
          <p className="text-xs text-[#8eb0c4] mb-6">
            {isBn
              ? 'যেকোনো ছবি আপলোড করুন; এটি স্বয়ংক্রিয়ভাবে ভিডিও থাম্বনেইল, প্লে বাটন ও ১০০ টাকা ভিআইপি পেওয়াল সহ ডিসপ্লে হবে।'
              : 'Upload any image; it transforms automatically into a video card with play controls, duration badge, and the ৳100 VIP Paywall!'}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Fields */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
              {/* Image Source Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#8eb0c4] uppercase tracking-wider mb-2">
                  {isBn ? '১. ইমেজ নির্বাচন করুন' : '1. Choose Video Thumbnail Image'}
                </label>
                
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setUploadMode('upload')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                      uploadMode === 'upload'
                        ? 'bg-[#54ACBF]/20 border-[#54ACBF] text-[#A7EBF2]'
                        : 'bg-[#011C40] border-[#26658C]/60 text-[#8eb0c4] hover:text-white'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isBn ? 'ফাইল আপলোড' : 'Upload File'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                      uploadMode === 'url'
                        ? 'bg-[#54ACBF]/20 border-[#54ACBF] text-[#A7EBF2]'
                        : 'bg-[#011C40] border-[#26658C]/60 text-[#8eb0c4] hover:text-white'
                    }`}
                  >
                    <Link className="h-3.5 w-3.5" />
                    <span>{isBn ? 'ইমেজ লিঙ্ক (URL)' : 'Image URL'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadMode('preset')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                      uploadMode === 'preset'
                        ? 'bg-[#54ACBF]/20 border-[#54ACBF] text-[#A7EBF2]'
                        : 'bg-[#011C40] border-[#26658C]/60 text-[#8eb0c4] hover:text-white'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{isBn ? 'সিনেমা প্রিসেট' : 'Presets'}</span>
                  </button>
                </div>

                {uploadMode === 'upload' && (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#26658C] hover:border-[#54ACBF] rounded-xl p-4 bg-[#011C40]/60 cursor-pointer transition-colors text-center group">
                    <Upload className="h-6 w-6 text-[#54ACBF] group-hover:text-[#A7EBF2] transition-colors mb-2" />
                    <span className="text-xs font-medium text-[#cfeef5]">
                      {fileName || (isBn ? 'কম্পিউটার বা মোবাইল থেকে ছবি সিলেক্ট করুন' : 'Click or drag an image here')}
                    </span>
                    <span className="text-[11px] text-[#8eb0c4] mt-1">PNG, JPG, WEBP (16:9 recommended)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {uploadMode === 'url' && (
                  <input
                    type="url"
                    placeholder="https://example.com/movie-poster.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#01142E] border border-[#26658C] rounded-lg text-white placeholder-[#5d839c] focus:outline-none focus:border-[#54ACBF]"
                  />
                )}

                {uploadMode === 'preset' && (
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_CINEMATIC_POSTERS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`group relative aspect-video rounded-lg overflow-hidden border transition-all ${
                          imageUrl === preset.url
                            ? 'border-[#54ACBF] ring-2 ring-[#54ACBF]/40'
                            : 'border-[#26658C]/50 hover:border-[#54ACBF]'
                        }`}
                      >
                        <SmartImage
                          src={preset.url}
                          alt={preset.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[#011C40]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Check className="h-4 w-4 text-[#A7EBF2]" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#8eb0c4] mb-1">
                    {isBn ? 'ভিডিও টাইটেল (Title)' : 'Video Title'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dark Protocol: The Escape"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-[#01142E] border border-[#26658C] rounded-lg text-white placeholder-[#5d839c] focus:outline-none focus:border-[#54ACBF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8eb0c4] mb-1">
                    {isBn ? 'সময়কাল (Duration)' : 'Duration'}
                  </label>
                  <input
                    type="text"
                    placeholder="18:45"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#01142E] border border-[#26658C] rounded-lg text-white font-mono placeholder-[#5d839c] focus:outline-none focus:border-[#54ACBF]"
                  />
                </div>
              </div>

              {/* Category & Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8eb0c4] mb-1">
                    {isBn ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VideoCategory)}
                    className="w-full px-3 py-2 text-xs bg-[#01142E] border border-[#26658C] rounded-lg text-white focus:outline-none focus:border-[#54ACBF]"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8eb0c4] mb-1">
                    {isBn ? 'কোয়ালিটি স্ট্যাম্প' : 'Quality Badge'}
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#01142E] border border-[#26658C] rounded-lg text-white focus:outline-none focus:border-[#54ACBF]"
                  >
                    <option value="4K Ultra HD">4K Ultra HD</option>
                    <option value="8K Master">8K Master</option>
                    <option value="1080p IMAX">1080p IMAX</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#8eb0c4] mb-1">
                  {isBn ? 'সংক্ষিপ্ত বিবরণ (Description)' : 'Short Teaser Description'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isBn ? 'ভিডিও সম্পর্কে কিছু লিখুন...' : 'Write a dramatic synopsis...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#01142E] border border-[#26658C] rounded-lg text-white placeholder-[#5d839c] focus:outline-none focus:border-[#54ACBF]"
                />
              </div>

              {/* Paywall Setting */}
              <div className="p-3 rounded-xl bg-[#011C40] border border-[#54ACBF]/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#54ACBF]" />
                  <div>
                    <p className="text-xs font-bold text-[#A7EBF2]">
                      {isBn ? '১০০ টাকা পেইড পেওয়াল লক অন' : '🔒 ৳100 Paid Paywall Active'}
                    </p>
                    <p className="text-[11px] text-[#8eb0c4]">
                      {isBn ? 'ক্লিক করলেই ১০০ টাকা মাসিক সাবস্ক্রিপশন ডায়ালগ আসবে' : 'Clicking will require ৳100 monthly VIP subscription'}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-[#A7EBF2] px-2 py-1 rounded bg-[#023859] border border-[#54ACBF]/40">
                  ৳১০০ / মাস
                </span>
              </div>

              {error && <p className="text-xs text-rose-400">{error}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-[#011C40] bg-gradient-to-r from-[#54ACBF] via-[#7ae0ee] to-[#A7EBF2] hover:from-[#A7EBF2] hover:to-[#54ACBF] transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                {isBn ? 'ভিডিও ফরম্যাটে পাবলিশ করুন' : 'Publish as Video (With ৳100 Paywall)'}
              </button>
            </form>

            {/* Right Column: Real-time Live Preview */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              <label className="block text-xs font-semibold text-[#8eb0c4] uppercase tracking-wider mb-2">
                {isBn ? 'লাইভ প্রিভিউ (ওয়েবসাইটে যেভাবে দেখাবে)' : 'Live Preview (How it appears in feed)'}
              </label>

              <div className="rounded-xl overflow-hidden bg-[#023859] border border-[#26658C] shadow-xl pointer-events-none">
                <div className="relative aspect-video w-full bg-[#011C40] overflow-hidden">
                  <SmartImage
                    src={imageUrl}
                    alt="Preview"
                    fallbackTitle="NEW VIDEO"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#011C40]/90 via-[#011C40]/30 to-[#011C40]/20" />

                  {/* Top badges */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-[#011C40]/80 text-[#cfeef5] font-mono text-[10px]">
                      {quality}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#011C40]/90 text-[#A7EBF2] border border-[#54ACBF]/50 text-[10px] font-semibold">
                      <Lock className="h-2.5 w-2.5 text-[#54ACBF]" />
                      <span>{isBn ? '🔒 ১০০ টাকা / VIP' : '🔒 ৳100 VIP'}</span>
                    </span>
                  </div>

                  {/* Center Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#54ACBF] text-[#011C40] shadow-lg">
                      <Play className="h-5 w-5 ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded bg-[#011C40]/90 text-[10px] font-mono text-[#cfeef5]">
                    {duration || '15:45'}
                  </div>
                </div>

                <div className="p-3.5">
                  <h4 className="font-display text-sm font-bold text-white truncate">
                    {title || (isBn ? 'আপনার ভিডিওর টাইটেল' : 'Your Video Title Here')}
                  </h4>
                  <p className="mt-1 text-xs text-[#8eb0c4] line-clamp-1">
                    {description || (isBn ? 'সংক্ষিপ্ত বিবরণ...' : 'Short description preview...')}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-[#26658C]/40 flex items-center justify-between text-[11px] text-[#8eb0c4]">
                    <span>{category} · Just now</span>
                    <span className="text-[#54ACBF] font-medium">{isBn ? '🔒 ১০০ টাকা সাবস্ক্রিপশন' : '🔒 ৳100 VIP Pass'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-[#011C40]/60 border border-[#26658C]/50 text-xs text-[#8eb0c4] leading-relaxed">
                <p>
                  💡 <strong className="text-white">{isBn ? 'টিপস:' : 'Tip:'}</strong> {isBn 
                    ? 'যেকোনো ভিজিটর এই কার্ডে ক্লিক করলে সরাসরি ১০০ টাকার পেমেন্ট সাবস্ক্রিপশন ডায়ালগ দেখতে পাবে।'
                    : 'Any visitor clicking this card will see the ৳100 monthly subscription paywall before playback.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
