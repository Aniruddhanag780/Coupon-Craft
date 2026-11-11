import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share2, MoreVertical } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running standalone on the phone home screen, show a subtle active badge or hide
  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span>App Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (!accepted) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        aria-label="Add app shortcut to phone"
        className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-stone-200 text-stone-800 hover:border-stone-900 hover:bg-stone-50 active:scale-[0.98] shadow-2xs transition-all cursor-pointer"
      >
        <Smartphone className="w-4 h-4 text-stone-700" />
        <span className="hidden xs:inline">Add to Phone</span>
        <span className="xs:hidden">App</span>
      </button>

      {/* Guided Modal for Android / Google Chrome & iOS Phone Shortcut */}
      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#FAF8F5] rounded-3xl p-6 shadow-2xl border border-stone-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header with Coupon App Icon */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/pwa-192x192.png"
                  alt="The Street Co Coupon Icon"
                  className="w-12 h-12 rounded-2xl shadow-sm border border-stone-200 object-cover"
                />
                <div>
                  <h3 className="font-bold text-base text-stone-900 leading-snug">
                    Install The Street Co App
                  </h3>
                  <p className="text-xs text-stone-500">
                    Add shortcut to your phone home screen
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="space-y-3.5 py-2">
              {isIOS ? (
                // iOS Safari Steps
                <div className="bg-white rounded-2xl p-4 border border-stone-200/80 space-y-3 text-xs text-stone-700">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      1
                    </div>
                    <div className="pt-0.5">
                      Tap the <strong className="text-stone-900 font-semibold">Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-stone-700" /> in the Safari toolbar at the bottom.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      2
                    </div>
                    <div className="pt-0.5">
                      Scroll down and tap <strong className="text-stone-900 font-semibold">"Add to Home Screen"</strong>.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      3
                    </div>
                    <div className="pt-0.5">
                      Tap <strong className="text-stone-900 font-semibold">Add</strong> in the top right. The coupon shortcut icon will be ready on your phone!
                    </div>
                  </div>
                </div>
              ) : (
                // Android / Google Chrome Steps
                <div className="bg-white rounded-2xl p-4 border border-stone-200/80 space-y-3 text-xs text-stone-700">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      1
                    </div>
                    <div className="pt-0.5">
                      Tap the <strong className="text-stone-900 font-semibold">three dots (⋮)</strong> menu <MoreVertical className="w-3.5 h-3.5 inline mx-0.5 text-stone-700" /> in the top right of Google Chrome.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      2
                    </div>
                    <div className="pt-0.5">
                      Select <strong className="text-stone-900 font-semibold">"Install app"</strong> or <strong className="text-stone-900 font-semibold">"Add to Home screen"</strong>.
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      3
                    </div>
                    <div className="pt-0.5">
                      Confirm installation. The Street Co coupon icon will be placed directly on your phone home screen!
                    </div>
                  </div>
                </div>
              )}

              {/* Instant Try Install Button if browser supports prompt */}
              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    await install();
                    setShowGuideModal(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-stone-900 text-[#FAF8F5] text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Tap to Install Shortcut Directly</span>
                </button>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-stone-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 text-stone-800 text-xs font-semibold hover:bg-stone-300 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
