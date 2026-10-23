/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Film, Search, Lock } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { VideoCard } from './components/VideoCard';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PaywallModal } from './components/PaywallModal';
import { AddVideoModal } from './components/AddVideoModal';
import { EditImageModal, VideoUpdatePayload } from './components/EditImageModal';
import { AdminLoginModal, MASTER_OWNER_PASSWORD } from './components/AdminLoginModal';
import { SubscriptionManagerModal } from './components/SubscriptionManagerModal';
import { VideoItem, Language, SubscriptionStatus, VideoCategory } from './types';
import { INITIAL_VIDEOS } from './data/initialVideos';

const LOCAL_STORAGE_VIDEOS_KEY = 'dark_videos_catalog_v2';
const LOCAL_STORAGE_SUB_KEY = 'dark_video_user_subscription';
const LOCAL_STORAGE_ADMIN_KEY = 'dark_video_is_admin';
const LOCAL_STORAGE_PIN_KEY = 'dark_video_admin_pin';

export default function App() {
  const [language, setLanguage] = useState<Language>('bn');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeNav, setActiveNav] = useState<'featured' | 'catalog'>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Videos State with local storage and INITIAL_VIDEOS fallback
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read cached catalog from localStorage', e);
    }
    return INITIAL_VIDEOS;
  });

  // Subscription State
  const [subscription, setSubscription] = useState<SubscriptionStatus>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SUB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.expiryDate && new Date(parsed.expiryDate).getTime() < Date.now()) {
          return { isVip: false, status: 'none' };
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Could not load subscription from localStorage', e);
    }
    return { isVip: false, status: 'none' };
  });

  // Admin Auth State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_ADMIN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_PIN_KEY) || MASTER_OWNER_PASSWORD;
    } catch {
      return MASTER_OWNER_PASSWORD;
    }
  });

  // Modals state
  const [selectedVideoForPlay, setSelectedVideoForPlay] = useState<VideoItem | null>(null);
  const [selectedVideoForPaywall, setSelectedVideoForPaywall] = useState<VideoItem | null>(null);
  const [selectedCategoryForPaywall, setSelectedCategoryForPaywall] = useState<string | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [isEditImageOpen, setIsEditImageOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<VideoItem | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isSubscriptionManagerOpen, setIsSubscriptionManagerOpen] = useState(false);

  // Non-subscribed viewers can only view 'All' ("সকল ভিডিও"). Lock categories 1 to 7.
  useEffect(() => {
    if (!subscription.isVip && !isAdmin && activeCategory !== 'All') {
      setActiveCategory('All');
    }
  }, [subscription.isVip, isAdmin, activeCategory]);

  // Category Click Handler: Only Owner/Admin or VIP Subscribers can open Categories 1 to 7
  const handleCategoryClick = (cat: string) => {
    if (cat === 'All') {
      setActiveCategory('All');
      return;
    }

    // Owner or Subscribed VIP can view any category
    if (subscription.isVip || isAdmin) {
      setActiveCategory(cat);
      return;
    }

    // Unsubscribed viewer: Lock category, show subscription modal
    setSelectedVideoForPaywall(null);
    setSelectedCategoryForPaywall(language === 'bn' ? `ক্যাটাগরি ${cat}` : `Category ${cat}`);
    setIsPaywallOpen(true);
  };

  // When Paywall is closed, reset unsubscribed viewer back to "সকল ভিডিও"
  const handleClosePaywall = () => {
    setIsPaywallOpen(false);
    setSelectedVideoForPaywall(null);
    setSelectedCategoryForPaywall(null);
    if (!subscription.isVip && !isAdmin) {
      setActiveCategory('All');
    }
  };

  // Scroll listener to update Navbar active highlight as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const catalogEl = document.getElementById('video-catalog');
      if (catalogEl) {
        const rect = catalogEl.getBoundingClientRect();
        if (rect.top <= 200) {
          setActiveNav('catalog');
        } else {
          setActiveNav('featured');
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Navbar 'Featured' and 'VIP Catalog' navigation clicks
  const handleSelectNav = (nav: string) => {
    if (nav === 'featured') {
      setActiveNav('featured');
      const el = document.getElementById('featured-section') || document.body;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (nav === 'catalog') {
      setActiveNav('catalog');
      setActiveCategory('All');
      const el = document.getElementById('video-catalog');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Sync with API backend if available (dev / full-stack), otherwise keep state solid
  useEffect(() => {
    let isMounted = true;
    async function syncBackendVideos() {
      try {
        const res = await fetch('/api/videos');
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (data?.success && Array.isArray(data?.videos) && data.videos.length > 0 && isMounted) {
              setVideos(data.videos);
              localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(data.videos));
            }
          }
        }
      } catch {
        // Static Vercel hosting or offline - keep solid local state
      }
    }
    syncBackendVideos();
    return () => {
      isMounted = false;
    };
  }, []);

  // Background check for approved subscription status for registered phone
  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const phone = localStorage.getItem('dark_video_registered_phone');
        if (!phone) return;
        const res = await fetch(`/api/subscriptions/status?phone=${encodeURIComponent(phone)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.isVip && data?.status === 'approved') {
            setSubscription((prev) => {
              if (prev.isVip && prev.status === 'approved') return prev;
              const updated: SubscriptionStatus = {
                ...prev,
                isVip: true,
                status: 'approved',
                phone: data.phone || phone,
                expiryDate: data.expiresAt || prev.expiryDate,
                planType: 'monthly',
              };
              try {
                localStorage.setItem(LOCAL_STORAGE_SUB_KEY, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        }
      } catch {
        // silent fail
      }
    };

    checkApprovalStatus();
    const interval = setInterval(checkApprovalStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Save videos to localStorage whenever updated
  const saveCatalog = (updatedList: VideoItem[]) => {
    setVideos(updatedList);
    try {
      localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  };

  // Video Actions
  const handlePlayVideo = (video: VideoItem) => {
    if (subscription.isVip || isAdmin) {
      setSelectedVideoForPlay(video);
    } else {
      setSelectedCategoryForPaywall(null);
      setSelectedVideoForPaywall(video);
      setIsPaywallOpen(true);
    }
  };

  const handleLockedClick = (video: VideoItem) => {
    setSelectedCategoryForPaywall(null);
    setSelectedVideoForPaywall(video);
    setIsPaywallOpen(true);
  };

  const handleOpenEditImage = (video: VideoItem) => {
    setVideoToEdit(video);
    setIsEditImageOpen(true);
  };

  const handleSaveVideoEdits = async (videoId: string, updates: VideoUpdatePayload) => {
    const updated = videos.map((v) => {
      if (v.id === videoId) {
        return {
          ...v,
          title: updates.title,
          titleBn: updates.titleBn,
          category: updates.category,
          thumbnailUrl: updates.thumbnailUrl,
          description: updates.description ?? v.description,
          descriptionBn: updates.descriptionBn ?? v.descriptionBn,
          quality: updates.quality ?? v.quality,
        };
      }
      return v;
    });

    saveCatalog(updated);
    setIsEditImageOpen(false);
    setVideoToEdit(null);

    // Also attempt backend update if server is present
    try {
      await fetch(`/api/videos/${videoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {
      // Offline or static Vercel
    }
  };

  const handleDeleteVideo = async (video: VideoItem) => {
    const isBn = language === 'bn';
    const confirmMsg = isBn 
      ? `আপনি কি নিশ্চিতভাবে "${video.titleBn || video.title}" ভিডিও ও ছবিটি ডিলিট করতে চান?`
      : `Are you sure you want to delete "${video.title}"?`;
    
    if (window.confirm(confirmMsg)) {
      const filtered = videos.filter((v) => v.id !== video.id);
      saveCatalog(filtered);

      try {
        await fetch(`/api/videos/${video.id}`, { method: 'DELETE' });
      } catch {
        // Offline or static
      }
    }
  };

  const handleAddVideo = async (newVideo: VideoItem) => {
    const updated = [newVideo, ...videos];
    saveCatalog(updated);
    setIsAddVideoOpen(false);

    try {
      await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo),
      });
    } catch {
      // Offline or static
    }
  };

  // Subscription Actions
  const handleSubscribeSuccess = (
    method: 'bkash' | 'nagad' | 'rocket' | 'card' | 'telegram',
    trxId: string,
    phone: string
  ) => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const newSub: SubscriptionStatus = {
      isVip: true,
      status: 'approved',
      phone,
      transactionId: trxId,
      paymentMethod: method,
      planType: 'monthly',
      memberSince: now.toISOString(),
      expiryDate: expiry.toISOString(),
    };

    setSubscription(newSub);
    try {
      localStorage.setItem(LOCAL_STORAGE_SUB_KEY, JSON.stringify(newSub));
      if (phone) {
        localStorage.setItem('dark_video_registered_phone', phone);
      }
    } catch {}
    setIsPaywallOpen(false);
  };

  const handleResetSubscription = () => {
    const resetSub: SubscriptionStatus = { isVip: false, status: 'none' };
    setSubscription(resetSub);
    localStorage.removeItem(LOCAL_STORAGE_SUB_KEY);
    setIsSubscriptionManagerOpen(false);
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem(LOCAL_STORAGE_ADMIN_KEY, 'true');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem(LOCAL_STORAGE_ADMIN_KEY);
    setIsAdminLoginOpen(false);
  };

  const handleUpdatePin = (newPin: string) => {
    setAdminPin(newPin);
    localStorage.setItem(LOCAL_STORAGE_PIN_KEY, newPin);
  };

  // Filtered Videos
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      // Category match
      const matchesCategory = activeCategory === 'All' || String(video.category) === String(activeCategory);

      // Search match
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch = 
        video.title.toLowerCase().includes(query) ||
        (video.titleBn && video.titleBn.toLowerCase().includes(query)) ||
        (video.description && video.description.toLowerCase().includes(query)) ||
        (video.descriptionBn && video.descriptionBn.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [videos, activeCategory, searchQuery]);

  const featuredVideo = videos[0] || INITIAL_VIDEOS[0];
  const isBn = language === 'bn';

  return (
    <div className="min-h-screen bg-[#01142E] text-white flex flex-col font-sans selection:bg-[#54ACBF] selection:text-[#011C40]">
      {/* Top Navbar */}
      <Navbar
        subscription={subscription}
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'))}
        onOpenPaywall={() => {
          setSelectedVideoForPaywall(null);
          setIsPaywallOpen(true);
        }}
        onOpenAddVideo={() => setIsAddVideoOpen(true)}
        onOpenSubscriptionManager={() => setIsSubscriptionManagerOpen(true)}
        activeFilter={activeNav}
        onSelectNav={handleSelectNav}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminLoginOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Spotlight Hero Section */}
        {featuredVideo && (
          <HeroSection
            featuredVideo={featuredVideo}
            isVip={subscription.isVip || isAdmin}
            language={language}
            onPlayFeatured={() => handlePlayVideo(featuredVideo)}
            onOpenPaywall={() => {
              setSelectedVideoForPaywall(featuredVideo);
              setIsPaywallOpen(true);
            }}
            onEditImage={handleOpenEditImage}
            onDeleteVideo={handleDeleteVideo}
            isAdmin={isAdmin}
          />
        )}

        {/* Video Grid & Filter Section */}
        <section id="video-catalog" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 scroll-mt-16">
          {/* Section Header with Category Tabs & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#26658C]/40">
            <div>
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-[#54ACBF]" />
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                  {isBn ? 'এক্সক্লুসিভ ভিডিও কালেকশন' : 'Exclusive Video Vault'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#023859] border border-[#26658C] text-xs font-mono text-[#A7EBF2]">
                  {filteredVideos.length}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#8eb0c4]">
                {isBn 
                  ? 'এক্সক্লুসিভ ডার্ক ভিডিও কালেকশন' 
                  : 'Exclusive dark video collection'}
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8eb0c4]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'ভিডিও খুঁজুন...' : 'Search thrillers...'}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#011C40] border border-[#26658C] rounded-xl text-white placeholder-[#8eb0c4] focus:outline-none focus:border-[#54ACBF] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8eb0c4] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills (Locked for unsubscribed viewers) */}
          <div className="flex items-center gap-2 overflow-x-auto py-3.5 scrollbar-none touch-pan-x overscroll-x-contain">
            {['All', '1', '2', '3', '4', '5', '6', '7'].map((cat) => {
              const isSelected = activeCategory === cat;
              const isLocked = cat !== 'All' && !subscription.isVip && !isAdmin;

              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#54ACBF] text-[#011C40] shadow-md shadow-[#54ACBF]/20 scale-105'
                      : isLocked
                      ? 'bg-[#011C40]/80 text-[#8eb0c4] hover:text-[#A7EBF2] border border-[#26658C]/50 hover:border-[#54ACBF]/60'
                      : 'bg-[#011C40] text-[#8eb0c4] hover:text-white border border-[#26658C]/60 hover:border-[#54ACBF]'
                  }`}
                  title={isLocked ? (isBn ? 'এই ক্যাটাগরি দেখতে ১০০ টাকা সাবস্ক্রিপশন প্রয়োজন' : 'Subscribe for ৳100 to unlock this category') : undefined}
                >
                  {isLocked && <Lock className="h-3 w-3 text-[#54ACBF]" />}
                  <span>
                    {cat === 'All' ? (isBn ? 'সকল ভিডিও' : 'All Videos') : `${isBn ? 'ক্যাটাগরি' : 'Category'} ${cat}`}
                  </span>
                  {isLocked && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#023859] text-[#A7EBF2] border border-[#54ACBF]/40 uppercase font-mono">
                      VIP
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Videos Grid */}
          {filteredVideos.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isVip={subscription.isVip || isAdmin}
                  language={language}
                  onPlay={handlePlayVideo}
                  onLockedClick={handleLockedClick}
                  onEditImage={handleOpenEditImage}
                  onDeleteVideo={handleDeleteVideo}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center py-16 px-4 rounded-2xl bg-[#011C40]/50 border border-[#26658C]/40 max-w-md mx-auto">
              <Film className="h-12 w-12 text-[#26658C] mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">
                {isBn ? 'কোনো ভিডিও পাওয়া যায়নি' : 'No Videos Found'}
              </h3>
              <p className="mt-1 text-xs text-[#8eb0c4]">
                {isBn 
                  ? 'আপনার সার্চ বা ক্যাটাগরি ফিল্টারে কোনো ভিডিও পাওয়া যায়নি।' 
                  : 'Try selecting a different category or clearing your search query.'}
              </p>
              <button
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-[#023859] border border-[#54ACBF]/40 text-xs text-[#A7EBF2] font-semibold hover:bg-[#54ACBF] hover:text-[#011C40] transition-colors cursor-pointer"
              >
                {isBn ? 'সব ভিডিও দেখুন' : 'View All Videos'}
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#26658C]/40 bg-[#011C40]/90 backdrop-blur-md py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-center text-xs text-[#8eb0c4]">
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-center">
            <div className="h-6 w-6 rounded bg-[#023859] border border-[#26658C] flex items-center justify-center text-[#54ACBF] shrink-0">
              <Film className="h-3 w-3" />
            </div>
            <span className="font-extrabold tracking-wider text-white">
              DARK<span className="text-[#54ACBF]">VIDEOS</span>
            </span>
            <span className="text-[#26658C]">·</span>
            <span>© 2026 DarkVideos Archive. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VideoPlayerModal
        isOpen={!!selectedVideoForPlay}
        onClose={() => setSelectedVideoForPlay(null)}
        video={selectedVideoForPlay}
        language={language}
        allVideos={videos}
        onSelectRelated={(v) => setSelectedVideoForPlay(v)}
      />

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={handleClosePaywall}
        video={selectedVideoForPaywall}
        categoryName={selectedCategoryForPaywall}
        language={language}
        onSubscribeSuccess={handleSubscribeSuccess}
        onPendingStatusUpdate={(phone) => {
          try {
            localStorage.setItem('dark_video_registered_phone', phone);
          } catch {}
        }}
      />

      <AddVideoModal
        isOpen={isAddVideoOpen}
        onClose={() => setIsAddVideoOpen(false)}
        onAddVideo={handleAddVideo}
        language={language}
      />

      <EditImageModal
        isOpen={isEditImageOpen}
        onClose={() => {
          setIsEditImageOpen(false);
          setVideoToEdit(null);
        }}
        video={videoToEdit}
        onSaveVideo={handleSaveVideoEdits}
        onDeleteVideo={handleDeleteVideo}
        language={language}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        isAdmin={isAdmin}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        currentPin={adminPin}
        onUpdatePin={handleUpdatePin}
        language={language}
      />

      <SubscriptionManagerModal
        isOpen={isSubscriptionManagerOpen}
        onClose={() => setIsSubscriptionManagerOpen(false)}
        subscription={subscription}
        language={language}
        onResetSubscription={handleResetSubscription}
        onRenewSubscription={() => {
          setIsSubscriptionManagerOpen(false);
          setIsPaywallOpen(true);
        }}
      />
    </div>
  );
}
