import React, { useState, useEffect } from 'react';
import { 
  X, Upload, Link as LinkIcon, Sparkles, Check, 
  Camera, Sliders, Type, Tag, FileText, CheckCircle2, Film, ShieldCheck, Trash2
} from 'lucide-react';
import { VideoItem, VideoCategory, Language } from '../types';
import { SmartImage } from './SmartImage';

export interface VideoUpdatePayload {
  title: string;
  titleBn: string;
  category: VideoCategory;
  thumbnailUrl: string;
  description?: string;
  descriptionBn?: string;
  quality?: '4K Ultra HD' | '1080p IMAX' | '8K Master';
}

interface EditImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem | null;
  onSaveVideo: (videoId: string, updates: VideoUpdatePayload) => void;
  // Keep onSaveImage for backwards compatibility if referenced
  onSaveImage?: (videoId: string, newImageUrl: string) => void;
  onDeleteVideo?: (video: VideoItem) => void;
  language: Language;
}

const PRESET_CINEMATIC_POSTERS = [
  {
    name: 'Noir Alley',
    nameBn: 'নোয়ার অ্যালি',
    url: '/images/hero_cinematic_noir_1792595188501.jpg',
  },
  {
    name: 'Cyberpunk Lab',
    nameBn: 'সাইবারপাঙ্ক ল্যাব',
    url: '/images/video_cyber_heist_1792595188745.jpg',
  },
  {
    name: 'Deep Cosmos',
    nameBn: 'ডিপ কসমস',
    url: '/images/video_space_odyssey_1792595189020.jpg',
  },
  {
    name: 'Dark Mystery',
    nameBn: 'ডার্ক মিস্ট্রি',
    url: '/images/video_dark_room_1792595188682.jpg',
  },
];

const AVAILABLE_CATEGORIES: { value: VideoCategory; labelEn: string; labelBn: string }[] = [
  { value: '1', labelEn: '1', labelBn: '1' },
  { value: '2', labelEn: '2', labelBn: '2' },
  { value: '3', labelEn: '3', labelBn: '3' },
  { value: '4', labelEn: '4', labelBn: '4' },
  { value: '5', labelEn: '5', labelBn: '5' },
  { value: '6', labelEn: '6', labelBn: '6' },
  { value: '7', labelEn: '7', labelBn: '7' },
];

export const EditImageModal: React.FC<EditImageModalProps> = ({
  isOpen,
  onClose,
  video,
  onSaveVideo,
  onSaveImage,
  onDeleteVideo,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'poster'>('info');

  // Form Fields
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [category, setCategory] = useState<VideoCategory>('3');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [description, setDescription] = useState('');
  const [quality, setQuality] = useState<'4K Ultra HD' | '1080p IMAX' | '8K Master'>('4K Ultra HD');

  // Poster Image State
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [customUrl, setCustomUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const isBn = language === 'bn';

  useEffect(() => {
    if (video) {
      setTitle(video.title || '');
      setTitleBn(video.titleBn || '');
      setCategory(video.category || '3');
      setDescription(video.description || '');
      setDescriptionBn(video.descriptionBn || '');
      setQuality(video.quality || '4K Ultra HD');
      setSelectedImage(video.thumbnailUrl || '');
      setCustomUrl('');
      setFileName('');
      setError('');
    }
  }, [video, isOpen]);

  if (!isOpen || !video) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(isBn ? 'অনুগ্রহ করে একটি সঠিক ইমেজ ফাইল (JPG/PNG/WEBP) নির্বাচন করুন।' : 'Please choose a valid image file (JPG/PNG/WEBP).');
      return;
    }

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setSelectedImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) {
      setError(isBn ? 'অনুগ্রহ করে একটি ইমেজ লিংক লিখুন।' : 'Please enter an image URL.');
      return;
    }
    setSelectedImage(customUrl.trim());
    setError('');
  };

  const handleSave = () => {
    if (!title.trim() && !titleBn.trim()) {
      setError(isBn ? 'ভিডিওর একটি টাইটেল দিতে হবে।' : 'Please provide a video title.');
      return;
    }

    if (!selectedImage) {
      setError(isBn ? 'কোনো ইমেজ নির্বাচন করা হয়নি।' : 'No image selected.');
      return;
    }

    const payload: VideoUpdatePayload = {
      title: title.trim() || titleBn.trim(),
      titleBn: titleBn.trim() || title.trim(),
      category,
      thumbnailUrl: selectedImage,
      description: description.trim(),
      descriptionBn: descriptionBn.trim() || description.trim(),
      quality,
    };

    if (onSaveVideo) {
      onSaveVideo(video.id, payload);
    } else if (onSaveImage) {
      onSaveImage(video.id, selectedImage);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-6 overflow-y-auto bg-[#011C40] sm:bg-[#011C40]/90 sm:backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full min-h-[100dvh] sm:min-h-0 sm:max-w-4xl rounded-none sm:rounded-2xl bg-[#011C40] sm:bg-[#023859] border-0 sm:border sm:border-[#26658C] shadow-none sm:shadow-2xl overflow-hidden sm:my-auto flex flex-col max-h-[100dvh] sm:max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#26658C] via-[#54ACBF] to-[#A7EBF2]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-[#8eb0c4] hover:text-white bg-[#011C40]/70 hover:bg-[#011C40] transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-5 sm:p-7 flex-grow flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <Sliders className="h-5 w-5 text-[#54ACBF]" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                {isBn ? 'ভিডিও টাইটেল, ক্যাটাগরি ও ছবি সম্পাদনা' : 'Edit Video Title, Category & Poster'}
              </h2>
            </div>
            <p className="text-xs text-[#8eb0c4] mb-5">
              {isBn
                ? 'মালিক হিসেবে আপনি যেকোনো ভিডিওর শিরোনাম, ক্যাটাগরি এবং পোস্টার ছবি এখান থেকে পরিবর্তন করতে পারেন।'
                : 'As owner, customize the video title, category genre, and poster thumbnail.'}
            </p>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#26658C]/60 mb-5 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'info'
                    ? 'border-[#54ACBF] text-[#A7EBF2]'
                    : 'border-transparent text-[#8eb0c4] hover:text-white'
                }`}
              >
                <Type className="h-4 w-4" />
                <span>{isBn ? '১. টাইটেল ও ক্যাটাগরি' : '1. Title & Category'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('poster')}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'poster'
                    ? 'border-[#54ACBF] text-[#A7EBF2]'
                    : 'border-transparent text-[#8eb0c4] hover:text-white'
                }`}
              >
                <Camera className="h-4 w-4" />
                <span>{isBn ? '২. পোস্টার ছবি পরিবর্তন' : '2. Poster Image'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Form Controls */}
              <div className="md:col-span-7 space-y-4">
                
                {/* TAB 1: Title & Category */}
                {activeTab === 'info' && (
                  <div className="space-y-4">
                    {/* Bangla Title */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#cfeef5] mb-1.5">
                        <Type className="h-3.5 w-3.5 text-[#54ACBF]" />
                        <span>{isBn ? 'বাংলা টাইটেল (Title in Bengali):' : 'Bangla Title:'}</span>
                      </label>
                      <input
                        type="text"
                        value={titleBn}
                        onChange={(e) => setTitleBn(e.target.value)}
                        placeholder="যেমন: নোয়ার প্যালেস: ডার্ক ইনভেস্টিগেশন"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#01142E] border border-[#26658C] rounded-lg text-white placeholder-[#5d839c] focus:outline-none focus:border-[#54ACBF] transition-colors"
                      />
                    </div>

                    {/* English Title */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#cfeef5] mb-1.5">
                        <Film className="h-3.5 w-3.5 text-[#54ACBF]" />
                        <span>{isBn ? 'ইংরেজি টাইটেল (Title in English):' : 'English Title:'}</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Noir Palace: Dark Investigation"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#01142E] border border-[#26658C] rounded-lg text-white placeholder-[#5d839c] focus:outline-none focus:border-[#54ACBF] transition-colors"
                      />
                    </div>

                    {/* Category Selector */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#cfeef5] mb-1.5">
                        <Tag className="h-3.5 w-3.5 text-[#54ACBF]" />
                        <span>{isBn ? 'ক্যাটাগরি নির্বাচন করুন (Category):' : 'Select Category:'}</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as VideoCategory)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm bg-[#01142E] border border-[#26658C] rounded-lg text-white focus:outline-none focus:border-[#54ACBF] transition-colors cursor-pointer"
                      >
                        {AVAILABLE_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value} className="bg-[#011C40] text-white">
                            {isBn ? cat.labelBn : cat.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quality Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-[#cfeef5] mb-1.5">
                        {isBn ? 'ভিডিও কোয়ালিটি ব্যাজ (Resolution Badge):' : 'Resolution Quality Badge:'}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['4K Ultra HD', '1080p IMAX', '8K Master'] as const).map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setQuality(q)}
                            className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                              quality === q
                                ? 'bg-[#54ACBF] text-[#011C40] border-[#54ACBF] font-bold shadow-md shadow-[#54ACBF]/20'
                                : 'bg-[#01142E] border-[#26658C]/70 text-[#8eb0c4] hover:text-white'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bengali Description */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#cfeef5] mb-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#54ACBF]" />
                        <span>{isBn ? 'সংক্ষিপ্ত বিবরণ (বাংলা):' : 'Short Description (Bangla):'}</span>
                      </label>
                      <textarea
                        rows={2}
                        value={descriptionBn}
                        onChange={(e) => setDescriptionBn(e.target.value)}
                        placeholder="ভিডিও সম্পর্কে ছোট এক বা দুই লাইনের বিবরণ লিখুন..."
                        className="w-full px-3 py-2 text-xs bg-[#01142E] border border-[#26658C] rounded-lg text-white placeholder-[#5d839c] focus:outline-none focus:border-[#54ACBF] resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: Poster Image Options */}
                {activeTab === 'poster' && (
                  <div className="space-y-4">
                    {/* Method selector */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setUploadMode('upload')}
                        className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          uploadMode === 'upload'
                            ? 'bg-[#54ACBF] text-[#011C40] border-[#54ACBF] shadow-md shadow-[#54ACBF]/20'
                            : 'bg-[#011C40] border-[#26658C]/60 text-[#8eb0c4] hover:text-white'
                        }`}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>{isBn ? 'মোবাইল/পিসি ফাইল' : 'Upload File'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          uploadMode === 'url'
                            ? 'bg-[#54ACBF] text-[#011C40] border-[#54ACBF] shadow-md shadow-[#54ACBF]/20'
                            : 'bg-[#011C40] border-[#26658C]/60 text-[#8eb0c4] hover:text-white'
                        }`}
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        <span>{isBn ? 'ছবির লিংক (URL)' : 'Image URL'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUploadMode('preset')}
                        className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          uploadMode === 'preset'
                            ? 'bg-[#54ACBF] text-[#011C40] border-[#54ACBF] shadow-md shadow-[#54ACBF]/20'
                            : 'bg-[#011C40] border-[#26658C]/60 text-[#8eb0c4] hover:text-white'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{isBn ? 'সিনেমা প্রিসেট' : 'Presets'}</span>
                      </button>
                    </div>

                    {/* Upload Mode 1: Device File */}
                    {uploadMode === 'upload' && (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#26658C] hover:border-[#54ACBF] rounded-xl p-6 bg-[#01142E] cursor-pointer transition-colors text-center group">
                        <Upload className="h-8 w-8 text-[#54ACBF] group-hover:text-[#A7EBF2] transition-colors mb-2" />
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {fileName || (isBn ? 'ফোন বা কম্পিউটার থেকে ছবি সিলেক্ট করুন' : 'Tap to select photo from gallery or device')}
                        </span>
                        <span className="text-[11px] text-[#8eb0c4] mt-1">
                          {isBn ? 'JPG, PNG, WEBP (১৬:৯ রেশিও সবচেয়ে সুন্দর দেখাবে)' : 'Supports JPG, PNG, WEBP (16:9 recommended)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}

                    {/* Upload Mode 2: Web URL */}
                    {uploadMode === 'url' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-[#cfeef5]">
                          {isBn ? 'সরাসরি যেকোনো ছবির লিংক পেস্ট করুন:' : 'Paste direct image URL:'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs bg-[#01142E] border border-[#26658C] rounded-lg text-white placeholder-[#5d839c] focus:outline-none focus:border-[#54ACBF]"
                          />
                          <button
                            type="button"
                            onClick={handleApplyUrl}
                            className="px-3 py-2 text-xs font-bold bg-[#54ACBF] text-[#011C40] rounded-lg hover:bg-[#A7EBF2] transition-colors cursor-pointer"
                          >
                            {isBn ? 'প্রিভিউ' : 'Preview'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upload Mode 3: Curated Cinematic Presets */}
                    {uploadMode === 'preset' && (
                      <div className="space-y-2">
                        <span className="text-xs text-[#8eb0c4] block">
                          {isBn ? 'পছন্দের সিনেমাটিক থিম সিলেক্ট করুন:' : 'Choose a cinematic theme:'}
                        </span>
                        <div className="grid grid-cols-2 gap-2.5">
                          {PRESET_CINEMATIC_POSTERS.map((preset) => {
                            const isChosen = selectedImage === preset.url;
                            return (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => setSelectedImage(preset.url)}
                                className={`group relative aspect-video rounded-xl overflow-hidden border text-left transition-all cursor-pointer ${
                                  isChosen
                                    ? 'border-[#54ACBF] ring-2 ring-[#54ACBF]'
                                    : 'border-[#26658C]/60 hover:border-[#54ACBF]'
                                }`}
                              >
                                <SmartImage
                                  src={preset.url}
                                  alt={preset.name}
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#011C40]/90 to-transparent flex items-end p-2">
                                  <span className="text-[11px] font-medium text-white truncate">
                                    {isBn ? preset.nameBn : preset.name}
                                  </span>
                                </div>
                                {isChosen && (
                                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#54ACBF] text-[#011C40] flex items-center justify-center shadow">
                                    <Check className="h-3 w-3 stroke-[3]" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
              </div>

              {/* Right Column: Live Poster Card Preview */}
              <div className="md:col-span-5 flex flex-col justify-start">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#8eb0c4] uppercase tracking-wider">
                    {isBn ? 'সরাসরি প্রিভিউ (Live Card Preview)' : 'Live Card Preview'}
                  </label>
                  <span className="text-[10px] text-[#54ACBF] font-mono flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    {isBn ? 'লাইভ আপডেট হচ্ছে' : 'Real-time'}
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden bg-[#011C40] border border-[#26658C] shadow-xl">
                  <div className="relative aspect-video w-full bg-[#01142E] overflow-hidden">
                    <SmartImage
                      src={selectedImage}
                      alt="New preview"
                      fallbackTitle="PREVIEW"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#011C40]/90 via-[#011C40]/30 to-[#011C40]/20 pointer-events-none" />
                    
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#011C40]/80 text-[#cfeef5] font-mono text-[10px] pointer-events-none">
                      {quality}
                    </div>

                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-[#011C40]/90 text-[#A7EBF2] border border-[#54ACBF]/50 text-[10px] font-semibold pointer-events-none">
                      🔒 ৳১০০ VIP
                    </div>
                  </div>

                  <div className="p-3">
                    <h4 className="font-display text-xs sm:text-sm font-bold text-white truncate">
                      {isBn ? (titleBn || title || video.titleBn) : (title || titleBn || video.title)}
                    </h4>
                    <p className="text-[11px] text-[#8eb0c4] mt-0.5 flex items-center gap-1.5 truncate">
                      <span className="text-[#A7EBF2] font-semibold">{category}</span>
                      <span>·</span>
                      <span>{video.duration}</span>
                      <span>·</span>
                      <span>★ {video.rating}</span>
                    </p>
                    {(descriptionBn || description) && (
                      <p className="text-[10px] text-[#8eb0c4] mt-1.5 line-clamp-1 italic">
                        {isBn ? (descriptionBn || description) : (description || descriptionBn)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-[#01142E] border border-[#26658C]/50 space-y-1">
                  <p className="text-[11px] text-[#A7EBF2] font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#54ACBF] shrink-0" />
                    <span>{isBn ? 'মালিক ছাড়া কেউ পরিবর্তন করতে পারবে না।' : 'Only Owner can save updates.'}</span>
                  </p>
                  <p className="text-[10px] text-[#8eb0c4]">
                    {isBn 
                      ? 'টাইটেল ও ক্যাটাগরি সেভ করলে তা স্বয়ংক্রিয়ভাবে হোমপেজ ও ফিল্টারে সাথে সাথে প্রতিফলিত হবে।' 
                      : 'Updated details are instantly saved to browser catalog.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 pt-4 border-t border-[#26658C]/40 flex flex-wrap items-center justify-between gap-3">
            {onDeleteVideo ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteVideo(video);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 transition-colors cursor-pointer min-h-[38px]"
                title={isBn ? 'এই ইমেজ/ভিডিওটি পার্মানেন্টলি ডিলিট করুন' : 'Permanently delete this video and poster'}
              >
                <Trash2 className="h-4 w-4 text-rose-400" />
                <span>{isBn ? 'ভিডিওটি ডিলিট করুন' : 'Delete Video'}</span>
              </button>
            ) : (
              <span className="text-[11px] text-[#8eb0c4] hidden sm:inline">
                {isBn ? 'পাসওয়ার্ড দিয়ে লগইন থাকায় আপনি এডিটের অনুমতি পেয়েছেন।' : 'Owner authenticated'}
              </span>
            )}

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8eb0c4] hover:text-white bg-[#011C40] hover:bg-[#011C40]/80 border border-[#26658C]/50 transition-colors cursor-pointer min-h-[38px]"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#011C40] bg-gradient-to-r from-[#54ACBF] via-[#7ae0ee] to-[#A7EBF2] hover:from-[#A7EBF2] hover:to-[#54ACBF] transition-all shadow-md shadow-[#54ACBF]/20 cursor-pointer text-center min-h-[38px]"
              >
                {isBn ? 'সব পরিবর্তন সেভ করুন' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
