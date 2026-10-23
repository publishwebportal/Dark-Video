import React, { useState } from 'react';
import { Crown, Film, Globe, ShieldCheck, Lock, Plus, Menu, X } from 'lucide-react';
import { Language, SubscriptionStatus } from '../types';

interface NavbarProps {
  subscription: SubscriptionStatus;
  language: Language;
  onToggleLanguage: () => void;
  onOpenPaywall: () => void;
  onOpenAddVideo?: () => void;
  onOpenSubscriptionManager: () => void;
  activeFilter: string;
  onSelectNav: (nav: string) => void;
  isAdmin?: boolean;
  onOpenAdminModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  subscription,
  language,
  onToggleLanguage,
  onOpenPaywall,
  onOpenAddVideo,
  onOpenSubscriptionManager,
  activeFilter,
  onSelectNav,
  isAdmin = false,
  onOpenAdminModal,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isBn = language === 'bn';

  const handleNavClick = (nav: string) => {
    onSelectNav(nav);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#26658C]/40 bg-[#011C40]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">
        
        {/* Brand wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('featured');
          }}
          className="group flex items-center gap-2 whitespace-nowrap text-lg sm:text-xl font-extrabold tracking-wider text-white shrink-0"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-[#023859] border border-[#26658C] shadow-inner group-hover:border-[#54ACBF] transition-colors">
            <Film className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#54ACBF] group-hover:text-[#A7EBF2] transition-colors" />
          </div>
          <span className="font-display">
            DARK<span className="text-[#54ACBF] group-hover:text-[#A7EBF2] transition-colors">VIDEOS</span>
          </span>
        </a>

        {/* Desktop & Tablet Nav links (768px+) */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-6 text-xs lg:text-sm font-medium text-[#8eb0c4]">
          <button
            onClick={() => handleNavClick('featured')}
            className={`whitespace-nowrap transition-colors hover:text-[#A7EBF2] cursor-pointer py-1 ${
              activeFilter === 'featured' ? 'text-[#A7EBF2] font-bold border-b-2 border-[#54ACBF]' : ''
            }`}
          >
            {isBn ? 'ফিচার্ড' : 'Featured'}
          </button>
          <button
            onClick={() => handleNavClick('catalog')}
            className={`whitespace-nowrap transition-colors hover:text-[#A7EBF2] cursor-pointer py-1 ${
              activeFilter === 'catalog' ? 'text-[#A7EBF2] font-bold border-b-2 border-[#54ACBF]' : ''
            }`}
          >
            {isBn ? 'ভিআইপি ক্যাটালগ' : 'VIP Catalog'}
          </button>
          <button
            onClick={onOpenPaywall}
            className="hidden lg:flex whitespace-nowrap transition-colors hover:text-[#A7EBF2] cursor-pointer items-center gap-1.5 text-[#cfeef5]"
          >
            <span>{isBn ? '৳১০০ সাবস্ক্রিপশন' : 'Pricing (৳100)'}</span>
            <span className="text-[10px] uppercase tracking-wider text-[#A7EBF2] bg-[#023859] px-1.5 py-0.5 rounded border border-[#54ACBF]/50">
              VIP
            </span>
          </button>
        </nav>

        {/* Desktop & Tablet actions (768px+) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleLanguage}
            title={isBn ? 'Switch to English' : 'বাংলায় দেখুন'}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#8eb0c4] hover:text-[#A7EBF2] px-2.5 py-2 rounded-lg border border-[#26658C]/50 bg-[#023859]/60 hover:bg-[#023859] transition-colors cursor-pointer min-h-[38px]"
          >
            <Globe className="h-3.5 w-3.5 text-[#54ACBF]" />
            <span className="uppercase">{language}</span>
          </button>

          {/* Owner Admin Mode Badge / Access */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              {onOpenAddVideo && (
                <button
                  onClick={onOpenAddVideo}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#011C40] bg-[#54ACBF] hover:bg-[#A7EBF2] rounded-lg transition-colors cursor-pointer shadow-sm min-h-[38px]"
                  title={isBn ? 'নতুন ভিডিও ও ইমেজ যুক্ত করুন' : 'Add New Video & Image'}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isBn ? 'ভিডিও যুক্ত' : 'Add'}</span>
                </button>
              )}
              <button
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#54ACBF]/20 border border-[#54ACBF] text-xs font-bold text-[#A7EBF2] hover:bg-[#54ACBF]/30 transition-all shadow-sm cursor-pointer min-h-[38px]"
                title={isBn ? 'মালিক প্যানেল (লগইন করা)' : 'Owner Panel (Unlocked)'}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#54ACBF]" />
                <span>{isBn ? 'মালিক' : 'Owner'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="flex items-center gap-1.5 text-xs font-medium text-[#8eb0c4] hover:text-[#A7EBF2] px-2.5 py-2 rounded-lg border border-[#26658C]/40 bg-[#023859]/40 hover:bg-[#023859] transition-colors cursor-pointer min-h-[38px]"
              title={isBn ? 'মালিক পাসওয়ার্ড এক্সেস' : 'Owner Password Access'}
            >
              <Lock className="h-3.5 w-3.5 text-[#54ACBF]" />
              <span>{isBn ? 'মালিক' : 'Owner'}</span>
            </button>
          )}

          {subscription.isVip ? (
            <button
              onClick={onOpenSubscriptionManager}
              className="group flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#A7EBF2] bg-[#023859] border border-[#54ACBF]/60 rounded-lg hover:bg-[#023859]/80 hover:border-[#A7EBF2] transition-all cursor-pointer whitespace-nowrap shadow-sm min-h-[38px]"
            >
              <Crown className="h-3.5 w-3.5 text-[#54ACBF] fill-[#54ACBF]" />
              <span>{isBn ? 'ভিআইপি মেম্বার' : 'VIP Active'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenPaywall}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#011C40] bg-gradient-to-r from-[#54ACBF] via-[#66bccd] to-[#A7EBF2] hover:from-[#A7EBF2] hover:to-[#54ACBF] rounded-lg transition-all shadow-[0_0_15px_rgba(84,172,191,0.35)] cursor-pointer whitespace-nowrap min-h-[38px]"
            >
              <Crown className="h-3.5 w-3.5 fill-current" />
              <span>{isBn ? '৳১০০ সাবস্ক্রাইব' : 'Get VIP ৳100'}</span>
            </button>
          )}
        </div>

        {/* Mobile & Small Tablet controls (<768px): VIP Button + Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {subscription.isVip ? (
            <button
              onClick={onOpenSubscriptionManager}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-[#A7EBF2] bg-[#023859] border border-[#54ACBF]/60 rounded-lg min-h-[36px]"
            >
              <Crown className="h-3 w-3 fill-[#54ACBF] text-[#54ACBF]" />
              <span>VIP</span>
            </button>
          ) : (
            <button
              onClick={onOpenPaywall}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-[#011C40] bg-gradient-to-r from-[#54ACBF] to-[#A7EBF2] rounded-lg shadow-sm min-h-[36px]"
            >
              <Crown className="h-3.5 w-3.5 fill-current" />
              <span>{isBn ? '৳১০০ VIP' : '৳100 VIP'}</span>
            </button>
          )}

          {/* Hamburger Menu Toggle Button (<768px) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg bg-[#023859] border border-[#26658C] text-[#cfeef5] hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation Menu (<768px) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#26658C]/50 bg-[#011C40] px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          <div className="flex flex-col gap-2">
            {/* Nav links */}
            <button
              onClick={() => handleNavClick('featured')}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left ${
                activeFilter === 'featured' ? 'bg-[#54ACBF]/20 text-[#A7EBF2] border border-[#54ACBF]/40' : 'text-[#cfeef5] hover:bg-[#023859]'
              }`}
            >
              <span>{isBn ? 'ফিচার্ড' : 'Featured'}</span>
              <Film className="h-4 w-4 text-[#54ACBF]" />
            </button>

            <button
              onClick={() => handleNavClick('catalog')}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left ${
                activeFilter === 'catalog' ? 'bg-[#54ACBF]/20 text-[#A7EBF2] border border-[#54ACBF]/40' : 'text-[#cfeef5] hover:bg-[#023859]'
              }`}
            >
              <span>{isBn ? 'ভিআইপি ভিডিও ক্যাটালগ' : 'VIP Video Catalog'}</span>
              <Film className="h-4 w-4 text-[#54ACBF]" />
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenPaywall();
              }}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[#A7EBF2] bg-[#023859] border border-[#26658C] hover:bg-[#023859]/80 transition-colors text-left"
            >
              <span>{isBn ? '৳১০০ সাবস্ক্রিপশন প্ল্যান' : 'Pricing & Pass (৳100)'}</span>
              <Crown className="h-4 w-4 text-[#54ACBF]" />
            </button>

            {/* Admin Add Video in Mobile Menu */}
            {isAdmin && onOpenAddVideo && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAddVideo();
                }}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-bold text-[#011C40] bg-[#54ACBF] hover:bg-[#A7EBF2] transition-colors text-left mt-1"
              >
                <span>{isBn ? 'ভিডিও ও ইমেজ আপলোড করুন' : 'Upload Video & Poster'}</span>
                <Plus className="h-4 w-4" />
              </button>
            )}

            {/* Owner Login / Status */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAdminModal();
              }}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-[#8eb0c4] hover:text-[#A7EBF2] bg-[#023859]/50 border border-[#26658C]/40 text-left"
            >
              <span>{isAdmin ? (isBn ? 'মালিক প্যানেল (লগইন করা)' : 'Owner Panel (Active)') : (isBn ? 'মালিক পাসওয়ার্ড লগইন' : 'Owner Admin Login')}</span>
              {isAdmin ? <ShieldCheck className="h-4 w-4 text-[#54ACBF]" /> : <Lock className="h-4 w-4 text-[#54ACBF]" />}
            </button>

            {/* Language Toggle in Mobile Menu */}
            <div className="flex items-center justify-between pt-2 border-t border-[#26658C]/40 mt-1">
              <span className="text-xs text-[#8eb0c4]">{isBn ? 'ভাষা পরিবর্তন:' : 'Change Language:'}</span>
              <button
                onClick={onToggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#023859] border border-[#26658C] text-xs font-bold text-[#A7EBF2]"
              >
                <Globe className="h-3.5 w-3.5 text-[#54ACBF]" />
                <span>{isBn ? 'English-এ সুইচ করুন' : 'বাংলায় দেখুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
