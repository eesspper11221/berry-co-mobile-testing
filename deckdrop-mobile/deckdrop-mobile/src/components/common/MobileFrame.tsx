import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Smartphone, Maximize2, Sparkles, RotateCcw } from 'lucide-react';

export const MobileFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPhoneFrame, setIsPhoneFrame, showToast } = useStore();

  const resetAllTestingData = () => {
    localStorage.clear();
    showToast('Reset testing state to defaults.', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  return (
    <div className="min-h-[100dvh] bg-[#1F1D1A] flex flex-col items-center justify-start sm:py-6 sm:px-4 text-[#35322E]">
      {/* Top Testing Toolbar on Desktop */}
      <div className="w-full max-w-md hidden sm:flex items-center justify-between text-xs text-stone-300 font-semibold mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
            <Sparkles size={13} className="text-[#E23B2E]" />
            <span>Berry Co. Mobile Prototype</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetAllTestingData}
            title="Reset storage & mock data"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold border border-stone-700 transition cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPhoneFrame((prev) => !prev)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E23B2E] hover:bg-[#B82A20] text-white text-[11px] font-bold transition cursor-pointer shadow-sm"
          >
            {isPhoneFrame ? <Maximize2 size={12} /> : <Smartphone size={12} />}
            <span>{isPhoneFrame ? 'Full Width' : 'Phone Frame'}</span>
          </button>
        </div>
      </div>

      {/* Main Container: Either Phone Chassis or Fluid Mobile Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-[420px] h-[100dvh] sm:h-[844px] sm:rounded-[3rem] sm:border-[8px] sm:border-stone-800 sm:shadow-2xl overflow-hidden relative flex flex-col bg-[#EAD0AA]'
            : 'max-w-md min-h-[100dvh] flex flex-col bg-[#EAD0AA] shadow-xl'
        }`}
      >
        {/* Smartphone Status Bar on Phone Mockup */}
        <div className="bg-[#FAF5EB] text-[#35322E] px-6 pt-3 pb-1 flex items-center justify-between text-xs font-black select-none shrink-0 border-b border-[#35322E]/5">
          <span>9:41</span>
          {/* Dynamic Island Pill */}
          <div className="w-20 h-4 bg-stone-900 rounded-full flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-stone-800 ml-6" />
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>5G</span>
            <span className="text-[10px]">100%</span>
            <div className="w-5 h-2.5 border border-[#35322E] rounded-xs p-0.5 flex items-center">
              <div className="h-full w-full bg-[#35322E] rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Scrollable Viewport Container */}
        <div
          id="mobile-scroll-container"
          className="min-h-0 flex-1 overflow-y-auto flex flex-col bg-[#EAD0AA] relative overscroll-contain"
        >
          {children}
        </div>

        {/* Phone Home Bar Indicator */}
        <div className="bg-[#FAF5EB] py-1 flex justify-center shrink-0">
          <div className="w-32 h-1 bg-[#35322E]/30 rounded-full" />
        </div>
      </div>
    </div>
  );
};
