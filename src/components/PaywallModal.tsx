import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Crown, ShieldCheck, Check, Smartphone, CreditCard, 
  ArrowRight, ArrowLeft, Play, Lock, CheckCircle2, 
  Copy, Send, ExternalLink, MessageCircle, Clock, RefreshCw, AlertCircle
} from 'lucide-react';
import { VideoItem, Language } from '../types';
import { SmartImage } from './SmartImage';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoItem | null;
  categoryName?: string | null;
  language: Language;
  onSubscribeSuccess: (method: 'bkash' | 'nagad' | 'rocket' | 'card' | 'telegram', trxId: string, phone: string) => void;
  onPendingStatusUpdate?: (phone: string) => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  video,
  categoryName,
  language,
  onSubscribeSuccess,
  onPendingStatusUpdate,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'card'>('bkash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [viewStep, setViewStep] = useState<'form' | 'contact_admin' | 'pending_confirmation'>('form');
  const [copiedTelegram, setCopiedTelegram] = useState(false);
  const [showPhoneAlertModal, setShowPhoneAlertModal] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Always reset to a clean, empty phone input box whenever the paywall opens
  useEffect(() => {
    if (isOpen) {
      setPhoneNumber('');
      setTrxId('');
      setErrorMessage('');
      setStatusMessage('');
      setViewStep('form');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isBn = language === 'bn';
  const telegramUsername = '@HII_THEREE00';
  const telegramLink = 'https://t.me/HII_THEREE00';
  const adminQrImage = '/admin-contact-qr.jpg';

  const handleCopyTelegram = async () => {
    try {
      await navigator.clipboard.writeText(telegramUsername);
      setCopiedTelegram(true);
      setTimeout(() => setCopiedTelegram(false), 2500);
    } catch {
      setCopiedTelegram(true);
      setTimeout(() => setCopiedTelegram(false), 2500);
    }
  };

  // Submit subscription request to backend server for owner manual approval
  const submitRequestToServer = async (phoneDigits: string, transactionId: string, method: string) => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/subscriptions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneDigits,
          trxId: transactionId || 'PENDING_VERIFICATION',
          method: method,
        }),
      });

      const data = await res.json();

      if (data?.isVip && data?.status === 'approved') {
        // Already approved by owner
        onSubscribeSuccess(method as any, transactionId || 'PRE_APPROVED', phoneDigits);
        onClose();
        return;
      }

      if (data?.success) {
        try {
          localStorage.setItem('dark_video_registered_phone', phoneDigits);
          localStorage.setItem('dark_video_sub_status', 'pending');
        } catch {}

        if (onPendingStatusUpdate) {
          onPendingStatusUpdate(phoneDigits);
        }

        setViewStep('pending_confirmation');
      } else {
        setErrorMessage(data?.error || (isBn ? 'আবেদন জমা দিতে সমস্যা হয়েছে।' : 'Failed to submit request.'));
      }
    } catch (err) {
      console.error('Request error:', err);
      // Fallback local persistence if server network blip
      try {
        localStorage.setItem('dark_video_registered_phone', phoneDigits);
        localStorage.setItem('dark_video_sub_status', 'pending');
      } catch {}
      setViewStep('pending_confirmation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToAdminContact = () => {
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length !== 11) {
      setShowPhoneAlertModal(true);
      setErrorMessage(isBn ? 'অনুগ্রহ করে বক্সে ১১ ডিজিটের মোবাইল নম্বর দিন।' : 'Please enter an 11-digit mobile number.');
      return;
    }
    setErrorMessage('');
    setViewStep('contact_admin');
  };

  const handleSubmitFromForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length !== 11) {
      setShowPhoneAlertModal(true);
      setErrorMessage(isBn ? 'অনুগ্রহ করে বক্সে ১১ ডিজিটের মোবাইল নম্বর দিন।' : 'Please enter an 11-digit mobile number.');
      return;
    }
    submitRequestToServer(cleanDigits, trxId, selectedMethod);
  };

  const handleSubmitFromAdminContact = () => {
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    submitRequestToServer(cleanDigits, trxId || 'TELEGRAM_CONTACT', selectedMethod);
  };

  // Check if owner has approved this phone number yet
  const handleCheckApprovalStatus = async () => {
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (!cleanDigits) return;

    setIsCheckingStatus(true);
    setStatusMessage('');

    try {
      const res = await fetch(`/api/subscriptions/status?phone=${cleanDigits}`);
      const data = await res.json();

      if (data?.isVip && data?.status === 'approved') {
        setStatusMessage(isBn ? '🎉 মালিক অনুমোদন করেছেন! ভিআইপি এক্সেস সক্রিয় হয়েছে।' : '🎉 Owner approved! VIP Access activated.');
        setTimeout(() => {
          onSubscribeSuccess('bkash', 'OWNER_APPROVED', cleanDigits);
          onClose();
        }, 1200);
      } else if (data?.status === 'pending') {
        setStatusMessage(
          isBn 
            ? '⏳ আপনার আবেদন এখনও পেন্ডিং আছে। মালিক এখনও অনুমোদন করেননি। কিছুক্ষণ পর আবার চেক করুন বা টেলিগ্রামে মেসেজ দিন।' 
            : '⏳ Still pending owner review. The owner has not approved it yet.'
        );
      } else if (data?.status === 'rejected') {
        setStatusMessage(
          isBn 
            ? '❌ মালিক এই আবেদনটি বাতিল করেছেন। সঠিক পেমেন্ট তথ্য দিয়ে আবার চেষ্টা করুন।' 
            : '❌ Request was rejected by the owner.'
        );
      } else {
        setStatusMessage(isBn ? 'তথ্য পাওয়া যায়নি। অনুগ্রহ করে আবেদন জমা দিন।' : 'No record found.');
      }
    } catch {
      setStatusMessage(isBn ? 'স্ট্যাটাস চেক ব্যর্থ হয়েছে। ইন্টারনেট চেক করুন।' : 'Failed to connect.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleModalClose = () => {
    setViewStep('form');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#011C40]/90 backdrop-blur-md p-2 sm:p-4 md:p-6"
      onClick={handleModalClose}
    >
      <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
        <div 
          className="relative w-full max-w-4xl bg-[#011C40] sm:bg-[#023859] border border-[#26658C] shadow-2xl rounded-2xl sm:rounded-3xl flex flex-col my-auto overflow-hidden text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Glow Accent Ribbon */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#26658C] via-[#54ACBF] to-[#A7EBF2]" />

          {/* Close Button */}
          <button
            onClick={handleModalClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 sm:p-2.5 rounded-full text-[#8eb0c4] hover:text-white bg-[#011C40]/90 sm:bg-[#011C40]/70 hover:bg-[#023859] border border-[#26658C]/60 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shadow-lg"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Responsive Split Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#26658C]/40">
            
            {/* Left Column: Plan Overview, Benefits & Video Preview */}
            <div className="md:col-span-5 p-5 sm:p-7 md:p-8 flex flex-col justify-between bg-gradient-to-b from-[#011C40] to-[#01142E] md:bg-transparent">
              <div>
                {/* VIP Pass Kicker */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#023859] border border-[#54ACBF]/50 text-[#A7EBF2] text-xs font-bold mb-3 shadow-sm">
                  <Crown className="h-3.5 w-3.5 fill-[#54ACBF] text-[#54ACBF]" />
                  <span>{isBn ? 'ডার্ক ভিডিও ভিআইপি মেম্বারশিপ' : 'DARK VIDEO VIP PASS'}</span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  {isBn ? '১০০ টাকায় মাসিক ভিআইপি এক্সেস' : 'VIP Access for ৳100 / Month'}
                </h2>

                {categoryName && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#01142E] border border-[#54ACBF]/50 text-[#A7EBF2] text-xs font-semibold shadow-inner">
                    <Lock className="h-3.5 w-3.5 text-[#54ACBF] shrink-0" />
                    <span>
                      {isBn ? `লক করা "${categoryName}" আনলক করতে ১০০ টাকার সাবস্ক্রিপশন প্রয়োজন` : `Subscribe for ৳100 to unlock locked "${categoryName}"`}
                    </span>
                  </div>
                )}

                <p className="mt-2 text-xs sm:text-sm text-[#cfeef5] leading-relaxed">
                  {isBn 
                    ? 'সকল ফুল HD, 4K ও 8K ডার্ক ভিডিও উপভোগ করুন বিজ্ঞাপনহীনভাবে। ৩০ দিনের আনলিমিটেড প্রিমিয়াম পাস।'
                    : 'Stream all uncompressed 4K & 8K dark cinematic thriller releases with zero interruptions for 30 days.'}
                </p>

                {/* Price Display */}
                <div className="mt-4 p-3.5 rounded-xl bg-[#023859]/70 border border-[#26658C]/60 flex items-baseline justify-between shadow-inner">
                  <div>
                    <span className="text-3xl sm:text-4xl font-black text-[#A7EBF2] font-display">৳১০০</span>
                    <span className="text-[#8eb0c4] text-xs font-medium ml-1.5">
                      {isBn ? '/ মাস' : '/ month'}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#54ACBF] bg-[#011C40] px-2.5 py-1 rounded-md border border-[#54ACBF]/40">
                    {isBn ? '৩০ দিন এক্সেস' : '30-Day Pass'}
                  </span>
                </div>

                {/* Target Category or Video Preview Banner */}
                {video ? (
                  <div className="mt-4 flex items-center gap-3 p-2.5 rounded-xl bg-[#023859]/50 border border-[#26658C]/50">
                    <div className="relative h-12 w-20 shrink-0 rounded-lg overflow-hidden bg-[#011C40]">
                      <SmartImage
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fallbackTitle={video.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[#011C40]/40 flex items-center justify-center">
                        <Play className="h-3.5 w-3.5 text-[#A7EBF2] fill-[#A7EBF2]" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-[#A7EBF2] uppercase tracking-wider flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5 text-[#54ACBF]" />
                        {categoryName 
                          ? (isBn ? `ক্যাটাগরি ${categoryName} আনলক হবে:` : `Category ${categoryName} Unlocks:`)
                          : (isBn ? 'আনলক হবে:' : 'Unlocks:')}
                      </p>
                      <h4 className="text-xs font-bold text-white truncate">
                        {isBn ? video.titleBn : video.title}
                      </h4>
                      <p className="text-[10px] text-[#8eb0c4]">
                        {video.duration} · {video.quality}
                      </p>
                    </div>
                  </div>
                ) : categoryName ? (
                  <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-[#023859]/60 border border-[#54ACBF]/50">
                    <div className="h-11 w-11 rounded-xl bg-[#011C40] border border-[#54ACBF]/60 flex items-center justify-center shrink-0 text-[#A7EBF2] font-black text-base shadow-inner">
                      {categoryName}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold text-[#A7EBF2] uppercase tracking-wider flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5 text-[#54ACBF]" />
                        {isBn ? 'লক করা ক্যাটাগরি' : 'Locked Category'}
                      </p>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {isBn ? `ক্যাটাগরি "${categoryName}" আনলক করতে ১০০ টাকা সাবস্ক্রিপশন নিন` : `Subscribe for ৳100 to Unlock Category "${categoryName}"`}
                      </h4>
                      <p className="text-[10px] text-[#cfeef5] mt-0.5">
                        {isBn ? `১০০ টাকা পেমেন্ট করলেই ৩০ দিনের জন্য ক্যাটাগরি ${categoryName} ও সকল ভিডিও উন্মুক্ত হবে।` : `Flat ৳100 monthly pass unlocks all videos in category ${categoryName}.`}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Feature Checklist */}
                <div className="mt-4 space-y-2 text-xs text-[#cfeef5]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#54ACBF] shrink-0" />
                    <span>{isBn ? 'সব প্রিমিয়াম 4K & 8K ভিডিও আনলক' : 'All 4K & 8K UHD videos unlocked'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#54ACBF] shrink-0" />
                    <span>{isBn ? '১০০% বিজ্ঞাপনমুক্ত নিরবচ্ছিন্ন স্ট্রিমিং' : '100% ad-free cinema experience'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#54ACBF] shrink-0" />
                    <span>{isBn ? 'মোবাইল, ট্যাবলেট ও ল্যাপটপে ফুল সাপোর্ট' : 'Compatible on mobile, tablet & laptop'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#54ACBF] shrink-0" />
                    <span>{isBn ? 'ম্যানুয়াল ভেরিফিকেশন: মালিক যাচাই করে অনুমোদন দেয়' : 'Manual verification by owner'}</span>
                  </div>
                </div>
              </div>

              {/* Security Policy Badge */}
              <div className="mt-6 pt-4 border-t border-[#26658C]/40 flex items-center gap-2 text-[11px] text-[#8eb0c4]">
                <ShieldCheck className="h-4 w-4 text-[#54ACBF] shrink-0" />
                <span>
                  {isBn 
                    ? 'মালিকের সরাসরি অনুমোদন ভিত্তিক নিরাপত্তা ব্যবস্থা' 
                    : 'Owner-approved manual verification system'}
                </span>
              </div>
            </div>

            {/* Right Column: Step-based Workflow */}
            <div className="md:col-span-7 p-5 sm:p-7 md:p-8 flex flex-col justify-between bg-[#011C40] sm:bg-[#023859]">
              
              {/* STEP 1: PENDING CONFIRMATION SCREEN (When request is submitted) */}
              {viewStep === 'pending_confirmation' ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-center py-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-lg">
                      <Clock className="w-8 h-8 animate-pulse" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {isBn ? 'আবেদন জমা হয়েছে (অনুমোদনের অপেক্ষায়)' : 'Request Submitted (Pending Approval)'}
                    </h3>
                    <p className="text-xs text-[#cfeef5] mt-1 max-w-md mx-auto">
                      {isBn 
                        ? 'আপনার ১০০ টাকার সাবস্ক্রিপশন আবেদনটি মালিকের নিকট পাঠানো হয়েছে।' 
                        : 'Your ৳100 VIP subscription request is sent to the site owner.'}
                    </p>
                  </div>

                  {/* Submission Details Card */}
                  <div className="p-4 rounded-xl bg-[#01142E] border border-[#26658C] text-xs space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-[#26658C]/50">
                      <span className="text-[#8eb0c4]">{isBn ? 'স্ট্যাটাস:' : 'Status:'}</span>
                      <span className="font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/40">
                        {isBn ? '⏳ পেন্ডিং (মালিক অনুমোদন করবেন)' : '⏳ Pending Owner Approval'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-[#26658C]/50">
                      <span className="text-[#8eb0c4]">{isBn ? 'মোবাইল নম্বর:' : 'Mobile Number:'}</span>
                      <span className="font-mono font-bold text-[#A7EBF2]">{phoneNumber}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-[#26658C]/50">
                      <span className="text-[#8eb0c4]">{isBn ? 'পেমেন্ট মেথড:' : 'Method:'}</span>
                      <span className="font-semibold text-white uppercase">{selectedMethod} (৳১০০)</span>
                    </div>
                    {trxId && (
                      <div className="flex justify-between items-center">
                        <span className="text-[#8eb0c4]">{isBn ? 'TrxID:' : 'TrxID:'}</span>
                        <span className="font-mono text-[#cfeef5]">{trxId}</span>
                      </div>
                    )}
                  </div>

                  {/* Critical Notice from Owner */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-[#01142E] border border-amber-500/40 text-xs text-[#cfeef5] leading-relaxed flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-300 mb-1">
                        {isBn ? '⚠️ স্বয়ংক্রিয় কোনো সাবস্ক্রিপশন হবে না:' : '⚠️ No Automatic Subscriptions:'}
                      </p>
                      <p className="text-[11px] text-[#cfeef5] leading-relaxed">
                        {isBn
                          ? 'মালিক নিজে আপনার পেমেন্ট যাচাই করে যতক্ষণ অনুমোদন (Approve) না করবেন, ততক্ষণ পর্যন্ত ওয়েবসাইট আনলক হবে না। মালিক অনুমোদন করলেই এই নম্বরে সব ভিডিও অটোমেটিক আনলক হয়ে যাবে।'
                          : 'No one receives subscription automatically. Access is only unlocked when the owner manually verifies and approves your request.'}
                      </p>
                    </div>
                  </div>

                  {/* Check Status Button */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCheckApprovalStatus}
                      disabled={isCheckingStatus}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-[#011C40] bg-[#54ACBF] hover:bg-[#A7EBF2] transition-colors cursor-pointer shadow-md disabled:opacity-50 min-h-[44px]"
                    >
                      <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                      <span>
                        {isCheckingStatus 
                          ? (isBn ? 'যাচাই করা হচ্ছে...' : 'Checking...') 
                          : (isBn ? 'অনুমোদন হয়েছে কিনা চেক করুন' : 'Check if Owner Approved')}
                      </span>
                    </button>

                    {statusMessage && (
                      <p className="text-xs text-center font-medium text-[#A7EBF2] bg-[#01142E] p-2 rounded-lg border border-[#26658C]">
                        {statusMessage}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={telegramLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-[#24A1DE] hover:bg-[#1f8ec4] transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isBn ? 'টেলিগ্রামে মালিককে মেসেজ দিন' : 'Message Owner'}</span>
                      </a>

                      <button
                        type="button"
                        onClick={handleModalClose}
                        className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#8eb0c4] hover:text-white bg-[#01142E] border border-[#26658C] transition-colors cursor-pointer"
                      >
                        {isBn ? 'বন্ধ করুন' : 'Close'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : viewStep === 'contact_admin' ? (
                /* STEP 2: TELEGRAM / QR CONTACT VIEW */
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#54ACBF]/20 border border-[#54ACBF]/40 flex items-center justify-center text-[#54ACBF]">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {isBn ? 'মালিকের সাথে যোগাযোগ করুন' : 'Contact the Site Owner'}
                        </h3>
                        <p className="text-[11px] text-[#8eb0c4]">
                          {isBn ? '১০০ টাকা পেমেন্ট যাচাই ও অনুমোদনের জন্য' : 'For ৳100 manual approval'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewStep('form')}
                      className="inline-flex items-center gap-1 text-xs text-[#8eb0c4] hover:text-white px-2.5 py-1 rounded-lg bg-[#01142E] border border-[#26658C]/60 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{isBn ? 'পে পেজে ফিরুন' : 'Back'}</span>
                    </button>
                  </div>

                  {/* Notice */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/60 to-[#01142E] border border-[#54ACBF]/40 text-xs text-[#cfeef5] leading-relaxed">
                    <p className="font-semibold text-white mb-1">
                      {isBn ? '📢 মালিকের সরাসরি যাচাইকরণ:' : '📢 Owner Verification:'}
                    </p>
                    <p>
                      {isBn
                        ? '১০০ টাকা বিকাশ/নগদে সেন্ড করার পর টেলিগ্রামে ট্রানজেকশনের স্ক্রিনশট বা TrxID পাঠান। মালিক যাচাই করে ওয়েবসাইট থেকে অনুমোদন করে দেবেন।'
                        : 'Send ৳100 and share the screenshot with the owner on Telegram for instant manual approval.'}
                    </p>
                  </div>

                  {/* User details */}
                  <div className="p-3 rounded-xl bg-[#01142E] border border-[#54ACBF]/40 text-xs text-[#cfeef5] flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#8eb0c4]">
                        {isBn ? 'আপনার মোবাইল নম্বর' : 'Your Mobile Number'}
                      </div>
                      <div className="font-mono text-[#A7EBF2] font-bold text-sm mt-0.5">
                        {phoneNumber}
                      </div>
                    </div>
                    <div className="text-[11px] text-[#54ACBF] font-semibold shrink-0">
                      {isBn ? 'আবেদনের সাথে যুক্ত' : 'Attached to request'}
                    </div>
                  </div>

                  {/* QR Image */}
                  <div className="flex flex-col items-center">
                    <div className="relative p-2 rounded-2xl bg-black border-2 border-[#54ACBF] shadow-2xl max-w-[220px] sm:max-w-[250px]">
                      <SmartImage
                        src={adminQrImage}
                        alt="Admin Telegram QR Code - @HII_THEREE00"
                        fallbackTitle="TELEGRAM QR"
                        className="w-full h-auto object-contain rounded-xl block"
                      />
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-[#A7EBF2]">
                      {isBn ? 'টেলিগ্রাম কিউআর কোড স্ক্যান করুন' : 'Scan QR code in Telegram app'}
                    </p>
                  </div>

                  {/* Telegram Handle */}
                  <div className="p-3 rounded-xl bg-[#01142E] border border-[#26658C] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#24A1DE]/20 border border-[#24A1DE]/40 flex items-center justify-center text-[#24A1DE]">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8eb0c4] block">
                          Telegram Handle
                        </span>
                        <span className="font-mono font-bold text-white text-sm">
                          {telegramUsername}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleCopyTelegram}
                        className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          copiedTelegram
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-[#023859] hover:bg-[#26658C] text-[#cfeef5] border border-[#26658C]'
                        }`}
                      >
                        {copiedTelegram ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isBn ? 'কপি হয়েছে!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isBn ? 'আইডি কপি' : 'Copy'}</span>
                          </>
                        )}
                      </button>

                      <a
                        href={telegramLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-[#24A1DE] hover:bg-[#1f8ec4] transition-colors shadow-md"
                      >
                        <span>{isBn ? 'টেলিগ্রামে যান' : 'Open'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Buttons below admin contact */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setViewStep('form')}
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#8eb0c4] hover:text-white bg-[#01142E] hover:bg-[#001026] border border-[#26658C] transition-colors cursor-pointer text-center"
                    >
                      {isBn ? '← পেমেন্ট ফর্ম এ ফিরুন' : '← Back to Payment'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitFromAdminContact}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-[#011C40] bg-[#54ACBF] hover:bg-[#A7EBF2] transition-colors cursor-pointer text-center shadow-md disabled:opacity-50"
                    >
                      {isProcessing
                        ? (isBn ? 'আবেদন পাঠানো হচ্ছে...' : 'Submitting...')
                        : (isBn ? 'আবেদন জমা দিন (অনুমোদন পেন্ডিং)' : 'Submit Request for Approval')}
                    </button>
                  </div>
                </div>
              ) : (
                /* STEP 3: MAIN PAYMENT & REQUEST SUBMISSION FORM */
                <>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-[#54ACBF]" />
                      <span>{isBn ? 'পেমেন্ট মেথড নির্বাচন করুন' : 'Select Payment Gateway'}</span>
                    </h3>

                    {/* Gateway Selector Tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setSelectedMethod('bkash')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all min-h-[52px] cursor-pointer ${
                          selectedMethod === 'bkash'
                            ? 'border-[#e2136e] bg-[#e2136e]/20 text-[#f44e97] shadow-md ring-1 ring-[#e2136e]/50'
                            : 'border-[#26658C]/50 bg-[#01142E]/70 text-[#8eb0c4] hover:text-white hover:border-[#26658C]'
                        }`}
                      >
                        <Smartphone className="h-4 w-4 mb-1 text-[#e2136e]" />
                        <span>bKash</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod('nagad')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all min-h-[52px] cursor-pointer ${
                          selectedMethod === 'nagad'
                            ? 'border-[#f7931e] bg-[#f7931e]/20 text-[#f9a647] shadow-md ring-1 ring-[#f7931e]/50'
                            : 'border-[#26658C]/50 bg-[#01142E]/70 text-[#8eb0c4] hover:text-white hover:border-[#26658C]'
                        }`}
                      >
                        <Smartphone className="h-4 w-4 mb-1 text-[#f7931e]" />
                        <span>Nagad</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod('rocket')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all min-h-[52px] cursor-pointer ${
                          selectedMethod === 'rocket'
                            ? 'border-[#8c3494] bg-[#8c3494]/20 text-[#ab51b4] shadow-md ring-1 ring-[#8c3494]/50'
                            : 'border-[#26658C]/50 bg-[#01142E]/70 text-[#8eb0c4] hover:text-white hover:border-[#26658C]'
                        }`}
                      >
                        <Smartphone className="h-4 w-4 mb-1 text-[#a54cae]" />
                        <span>Rocket</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod('card')}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all min-h-[52px] cursor-pointer ${
                          selectedMethod === 'card'
                            ? 'border-[#54ACBF] bg-[#54ACBF]/20 text-[#A7EBF2] shadow-md ring-1 ring-[#54ACBF]/50'
                            : 'border-[#26658C]/50 bg-[#01142E]/70 text-[#8eb0c4] hover:text-white hover:border-[#26658C]'
                        }`}
                      >
                        <CreditCard className="h-4 w-4 mb-1 text-[#54ACBF]" />
                        <span>Cards</span>
                      </button>
                    </div>

                    {/* Instructions */}
                    <div className="p-3.5 rounded-xl bg-[#01142E] border border-[#26658C]/60 text-xs text-[#cfeef5] leading-relaxed mb-4">
                      {selectedMethod === 'bkash' && (
                        <p>
                          {isBn 
                            ? 'বিকাশ অ্যাপে সেন্ড মানি বা পেমেন্ট করে ১০০ টাকা পাঠান এবং আপনার নম্বর ও TrxID দিয়ে আবেদন জমা দিন।' 
                            : 'Send ৳100 via bKash and submit your 11-digit number & TrxID for owner approval.'}
                        </p>
                      )}
                      {selectedMethod === 'nagad' && (
                        <p>
                          {isBn 
                            ? 'নগদ অ্যাপ থেকে ১০০ টাকা সেন্ড মানি করে আপনার নম্বর ও ট্রানজেকশন আইডি দিন।' 
                            : 'Send ৳100 via Nagad and submit your details for owner verification.'}
                        </p>
                      )}
                      {selectedMethod === 'rocket' && (
                        <p>
                          {isBn 
                            ? 'রকেটে ১০০ টাকা পাঠিয়ে আপনার মোবাইল নম্বর ও TrxID নিচে লিখুন।' 
                            : 'Send ৳100 via Rocket and enter your details below.'}
                        </p>
                      )}
                      {selectedMethod === 'card' && (
                        <p>
                          {isBn 
                            ? 'অনলাইন কার্ড পেমেন্টের পর আপনার যোগাযোগ নম্বর দিন।' 
                            : 'Enter your phone number for manual verification.'}
                        </p>
                      )}
                    </div>

                    {/* Inputs */}
                    <form onSubmit={handleSubmitFromForm} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#8eb0c4] mb-1">
                            {isBn ? 'আপনার মোবাইল নম্বর (বাধ্যতামূলক)' : 'Mobile Number (Required)'}
                          </label>
                          <input
                            ref={phoneInputRef}
                            type="tel"
                            maxLength={11}
                            placeholder="017XXXXXXXX"
                            value={phoneNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                              setPhoneNumber(val);
                              if (errorMessage) setErrorMessage('');
                            }}
                            className={`w-full px-3.5 py-2.5 text-sm bg-[#01142E] border rounded-xl text-white placeholder-[#5d839c] focus:outline-none font-mono transition-colors ${
                              phoneNumber.length > 0 && phoneNumber.length < 11
                                ? 'border-amber-500/80 focus:border-amber-400'
                                : phoneNumber.length === 11
                                ? 'border-emerald-500 focus:border-emerald-400'
                                : 'border-[#26658C] focus:border-[#54ACBF]'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#8eb0c4] mb-1">
                            {isBn ? 'ট্রানজেকশন আইডি (TrxID - অপশনাল)' : 'Transaction ID (Optional)'}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 9J4K2L8M"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-sm bg-[#01142E] border border-[#26658C] rounded-xl text-white placeholder-[#5d839c] focus:outline-none focus:border-[#54ACBF] transition-colors font-mono"
                          />
                        </div>
                      </div>

                      {errorMessage && (
                        <p className="text-xs text-rose-400 font-medium">{errorMessage}</p>
                      )}
                    </form>
                  </div>

                  {/* Action Buttons: Manual Submission & Owner Contact */}
                  <div className="space-y-2.5 pt-4">
                    {/* Primary Button: Submit for Owner Approval */}
                    <button
                      type="button"
                      onClick={handleSubmitFromForm}
                      disabled={isProcessing}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm text-[#011C40] bg-gradient-to-r from-[#54ACBF] via-[#7ae0ee] to-[#A7EBF2] hover:from-[#A7EBF2] hover:to-[#54ACBF] transition-all shadow-lg shadow-[#54ACBF]/25 active:scale-[0.99] disabled:opacity-50 cursor-pointer min-h-[48px]"
                    >
                      <Clock className="h-4.5 w-4.5" />
                      <span>
                        {isProcessing 
                          ? (isBn ? 'আবেদন পাঠানো হচ্ছে...' : 'Submitting Request...') 
                          : (isBn ? 'সাবস্ক্রিপশনের জন্য আবেদন জমা দিন (১০০ টাকা)' : 'Submit ৳100 Subscription Request')}
                      </span>
                    </button>

                    {/* Secondary Button: Contact Owner via Telegram / QR */}
                    <button
                      type="button"
                      onClick={handleProceedToAdminContact}
                      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#cfeef5] hover:text-white bg-[#01142E] hover:bg-[#001026] border border-[#26658C] transition-colors cursor-pointer min-h-[42px]"
                    >
                      <MessageCircle className="h-4 w-4 text-[#54ACBF]" />
                      <span>{isBn ? 'মালিকের সাথে টেলিগ্রামে যোগাযোগ করুন (QR কোড)' : 'Contact Owner via Telegram'}</span>
                      <ArrowRight className="h-4 w-4 text-[#54ACBF]" />
                    </button>
                  </div>
                </>
              )}

            </div>

          </div>
        </div>
      </div>

      {/* 11-Digit Mobile Number Warning Popup Modal */}
      {showPhoneAlertModal && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowPhoneAlertModal(false)}
        >
          <div 
            className="relative w-full max-w-sm rounded-2xl bg-[#011C40] border-2 border-amber-500 shadow-2xl p-5 text-center text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 mx-auto mb-3">
              <Smartphone className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold mb-1">
              {isBn ? '১১ ডিজিটের মোবাইল নম্বর প্রয়োজন' : '11-Digit Phone Required'}
            </h4>
            <p className="text-xs text-[#cfeef5] leading-relaxed mb-4">
              {isBn 
                ? 'মালিক যাতে আপনার পেমেন্ট যাচাই করে আপনার অ্যাকাউন্টে সাবস্ক্রিপশন অনুমোদন করতে পারেন, তার জন্য সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।' 
                : 'Please enter a valid 11-digit mobile number so the owner can verify and approve your subscription.'}
            </p>
            <button
              onClick={() => {
                setShowPhoneAlertModal(false);
                setTimeout(() => phoneInputRef.current?.focus(), 100);
              }}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-[#011C40] bg-[#54ACBF] hover:bg-[#A7EBF2] transition-colors cursor-pointer"
            >
              {isBn ? 'ঠিক আছে, নম্বর লিখছি' : 'Okay, I understand'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
