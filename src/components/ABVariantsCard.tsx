import React, { useState } from 'react';
import { Split, Flame, ShieldCheck, ArrowRight, Copy, Check, Sparkles, HelpCircle } from 'lucide-react';

export interface ABVariant {
  strategy_name: string;
  headline: string;
  subheadline: string;
  cta_text: string;
  key_points: string[];
  hypothesis: string;
}

export interface ABVariantsProps {
  abVariants?: {
    variant_a_pain_point?: ABVariant;
    variant_b_social_proof?: ABVariant;
  };
}

export const ABVariantsCard: React.FC<ABVariantsProps> = ({ abVariants }) => {
  const [activeTab, setActiveTab] = useState<'variant_a' | 'variant_b'>('variant_a');
  const [copied, setCopied] = useState(false);

  const fallbackVariantA: ABVariant = {
    strategy_name: 'Pain-Point & Agitation Focused',
    headline: 'Stop Wasting 60% of Your Ad Traffic on Leaky Landing Pages',
    subheadline: 'Eliminate hidden visual friction and low-converting CTA copy in under 30 seconds with AI-powered CRO audits.',
    cta_text: 'Fix My Landing Page Friction →',
    key_points: [
      'Eliminate hidden design friction before launching paid ads',
      'Instant WCAG & visual CTA contrast score diagnostics',
      'Boost ROAS without increasing your marketing spend',
    ],
    hypothesis: 'Directly agitates buyer frustration with wasted ad spend and offers instant friction relief.',
  };

  const fallbackVariantB: ABVariant = {
    strategy_name: 'Social-Proof & Authority Driven',
    headline: 'Used by 2,400+ Growth Teams to Lift Conversions by 34%',
    subheadline: 'The #1 Multimodal AI landing page auditor trusted by top SaaS, e-commerce, and agency founders.',
    cta_text: 'Join Top Converting Brands →',
    key_points: [
      'Benchmark your landing page against top 1% converting sites',
      'Verified +34% average conversion rate lift across 10k+ audits',
      '1-Click automated multimodal visual reports',
    ],
    hypothesis: 'Leverages bandwagon effect, client authority metrics, and peer validation to establish instant trust.',
  };

  const variantA = abVariants?.variant_a_pain_point || fallbackVariantA;
  const variantB = abVariants?.variant_b_social_proof || fallbackVariantB;

  const currentVariant = activeTab === 'variant_a' ? variantA : variantB;

  const handleCopyCopy = () => {
    const textToCopy = `Strategy: ${currentVariant.strategy_name}\n\nHEADLINE:\n${currentVariant.headline}\n\nSUBHEADLINE:\n${currentVariant.subheadline}\n\nPRIMARY CTA:\n${currentVariant.cta_text}\n\nKEY BULLETS:\n${currentVariant.key_points.map((p) => `• ${p}`).join('\n')}\n\nHYPOTHESIS:\n${currentVariant.hypothesis}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Split className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-gray-900 font-display">A/B Conversion Variant Generator</h3>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> GenAI Experimentation
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Ready-to-test copy variants engineered for high-intent audience segment testing
            </p>
          </div>
        </div>

        {/* 1-Click Copy Copy Button */}
        <button
          onClick={handleCopyCopy}
          className="self-start sm:self-auto px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Copied Variant Copy!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-gray-400" />
              <span>Copy Current Variant Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Variant Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-xl">
        <button
          onClick={() => setActiveTab('variant_a')}
          className={`p-3.5 rounded-lg flex items-center space-x-3 transition-all text-left ${
            activeTab === 'variant_a'
              ? 'bg-white text-gray-900 shadow-md ring-2 ring-amber-500'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              activeTab === 'variant_a' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-500'
            }`}
          >
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-amber-600">Variant A</div>
            <div className="font-bold text-sm">Pain-Point & Agitation</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('variant_b')}
          className={`p-3.5 rounded-lg flex items-center space-x-3 transition-all text-left ${
            activeTab === 'variant_b'
              ? 'bg-white text-gray-900 shadow-md ring-2 ring-emerald-500'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              activeTab === 'variant_b' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xs uppercase tracking-wider text-emerald-600">Variant B</div>
            <div className="font-bold text-sm">Social-Proof & Authority</div>
          </div>
        </button>
      </div>

      {/* Hypothesis Rationale Callout Box */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start space-x-3">
        <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-xs uppercase tracking-wider text-indigo-700 block mb-0.5">
            Conversion Hypothesis ({currentVariant.strategy_name}):
          </span>
          <p className="text-xs text-indigo-900 leading-relaxed">{currentVariant.hypothesis}</p>
        </div>
      </div>

      {/* Live Hero Preview Component */}
      <div className="p-6 bg-navy-900 rounded-xl border border-navy-700 text-white space-y-5 relative overflow-hidden shadow-inner">
        <div className="absolute top-3 right-3 text-[10px] font-mono bg-navy-800 text-gray-400 border border-navy-700 px-2 py-0.5 rounded-full uppercase">
          Live Copy Card Preview
        </div>

        {/* Hero Headline */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-amber tracking-wider block">Proposed Hero Headline</span>
          <h4 className="text-xl sm:text-2xl font-extrabold font-display leading-tight text-white">
            {currentVariant.headline}
          </h4>
        </div>

        {/* Subheadline */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Supporting Subheadline</span>
          <p className="text-sm text-gray-300 leading-relaxed font-sans">{currentVariant.subheadline}</p>
        </div>

        {/* Key Value Points */}
        <div className="space-y-2 pt-2 border-t border-navy-800">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Key Value Bullets</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {currentVariant.key_points.map((point, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-gray-200 bg-navy-800/80 px-3 py-2 rounded-lg border border-navy-700">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-navy-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">Recommended CTA Button</span>
            <button className="px-6 py-3 bg-amber hover:bg-amber-hover text-navy-950 font-bold rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-amber/20 transition-transform transform hover:scale-105">
              <span>{currentVariant.cta_text}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
