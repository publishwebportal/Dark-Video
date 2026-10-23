import React from 'react';
import { X, Crown, ShieldCheck, CheckCircle2, RotateCcw, Calendar, CreditCard, Sparkles } from 'lucide-react';
import { SubscriptionStatus, Language } from '../types';

interface SubscriptionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionStatus;
  language: Language;
  onResetSubscription: () => void;
  onRenewSubscription: () => void;
}

export const SubscriptionManagerModal: React.FC<SubscriptionManagerModalProps> = ({
  isOpen,
  onClose,
  subscription,
  language,
  onResetSubscription,
}) => {
  if (!isOpen) return null;

  const isBn = language === 'bn';

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#011C40]/90 backdrop-blur-md p-2 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
        <div 
          className="relative w-full max-w-lg bg-[#011C40] sm:bg-[#023859] border border-[#26658C] shadow-2xl rounded-2xl flex flex-col my-auto overflow-hidden text-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-1.5 w-full bg-gradient-to-r from-[#26658C] via-[#54ACBF] to-[#A7EBF2]" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2.5 rounded-full text-[#8eb0c4] hover:text-white bg-[#011C40]/90 sm:bg-[#011C40]/70 hover:bg-[#023859] border border-[#26658C]/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shadow-lg"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-4 sm:p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#011C40] border border-[#54ACBF]/50 text-[#54ACBF]">
              <Crown className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-white">
                {isBn ? 'আপনার ভিআইপি মেম্বারশিপ' : 'VIP Subscription Status'}
              </h3>
              <p className="text-xs text-[#8eb0c4]">
                {isBn ? 'ডার্ক ভিডিও প্রিমিয়াম গ্রাহক অ্যাকাউন্ট' : 'Dark Video Unlimited VIP Member'}
              </p>
            </div>
          </div>

          {/* Membership card overview */}
          <div className="rounded-xl p-4 bg-[#011C40] border border-[#26658C]/60 mb-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#26658C]/40">
              <span className="text-xs text-[#8eb0c4]">{isBn ? 'প্ল্যান ধরন' : 'Active Plan'}</span>
              <span className="text-xs font-bold text-[#A7EBF2] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#54ACBF]" />
                {isBn ? 'মাসিক ভিআইপি পাস (১০০ টাকা)' : 'Monthly VIP Pass (৳100)'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#26658C]/40">
              <span className="text-xs text-[#8eb0c4]">{isBn ? 'স্ট্যাটাস' : 'Status'}</span>
              <span className="text-xs font-semibold text-[#A7EBF2] flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#54ACBF]" />
                {isBn ? 'সক্রিয় (সব ভিডিও আনলকড)' : 'Active (All Videos Unlocked)'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#26658C]/40">
              <span className="text-xs text-[#8eb0c4]">{isBn ? 'মেয়াদ শেষ হওয়ার তারিখ' : 'Access Valid Until'}</span>
              <span className="text-xs font-mono text-[#cfeef5] flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#54ACBF]" />
                {subscription.expiryDate || '30 days remaining'}
              </span>
            </div>

            {subscription.phone && (
              <div className="flex items-center justify-between pb-3 border-b border-[#26658C]/40">
                <span className="text-xs text-[#8eb0c4]">{isBn ? 'নিবন্ধিত মোবাইল' : 'Mobile Number'}</span>
                <span className="text-xs font-mono font-bold text-[#A7EBF2]">
                  {subscription.phone}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8eb0c4]">{isBn ? 'পেমেন্ট গেটওয়ে' : 'Payment Method'}</span>
              <span className="text-xs font-mono text-[#cfeef5] uppercase flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5 text-[#54ACBF]" />
                {subscription.paymentMethod || 'bKash'} (৳100)
              </span>
            </div>

            {subscription.transactionId && (
              <div className="pt-2 flex items-center justify-between text-[11px] text-[#5d839c] font-mono">
                <span>Trx ID:</span>
                <span className="text-[#8eb0c4]">{subscription.transactionId}</span>
              </div>
            )}
          </div>

          {/* Test reset control for demo convenience */}
          <div className="rounded-xl p-3.5 bg-[#011C40]/60 border border-[#26658C]/40 mb-6 text-xs text-[#8eb0c4]">
            <p className="mb-2">
              🛠️ <strong className="text-white">{isBn ? 'ডেমো টেস্টিং অপশন:' : 'Demo Testing Control:'}</strong>{' '}
              {isBn 
                ? 'আপনি চাইলে সাবস্ক্রিপশন রিসেট করে আবার ফ্রি মোডে গিয়ে ১০০ টাকার পেওয়াল টেস্ট করতে পারেন।' 
                : 'Reset your subscription anytime to simulate the ৳100 paywall and test visitor checkout again.'}
            </p>
            <button
              onClick={() => {
                onResetSubscription();
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isBn ? 'সাবস্ক্রিপশন রিসেট করুন (ফ্রি ইউজার মোড)' : 'Reset VIP status (Test Free Mode)'}</span>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-xs text-[#011C40] bg-gradient-to-r from-[#54ACBF] to-[#A7EBF2] hover:from-[#A7EBF2] hover:to-[#54ACBF] transition-all cursor-pointer shadow-md shadow-[#54ACBF]/20"
            >
              {isBn ? 'ঠিক আছে' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
