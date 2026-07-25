import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Target, Zap, ShieldCheck, BarChart3, Search, Accessibility } from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';

interface LandingPageProps {
  onStart: (mode?: 'signup' | 'login') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      {/* Hero Section */}
      <section className="bg-navy-900 text-offwhite pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-navy-700 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FAFAF8_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-navy-800 border border-amber/30 text-amber text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Conversion Audit Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-tight text-white leading-none">
              Stop Guessing Why Visitors Don't <span className="text-amber">Convert.</span>
            </h1>

            <p className="text-lg text-gray-300 max-w-2xl font-normal leading-relaxed">
              Paste your landing page copy or product context. LandingIQ scans your messaging, visual hierarchy, CTAs, SEO, and accessibility in under 10 seconds — powered by Claude 3.5.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => onStart('signup')}
                className="w-full sm:w-auto px-8 py-4 bg-amber hover:bg-amber-hover text-navy-900 font-bold text-base rounded-xl shadow-amber-glow transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <span>Run Free Audit Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => onStart('login')}
                className="w-full sm:w-auto px-6 py-4 bg-navy-800 hover:bg-navy-700 text-gray-200 font-semibold text-base rounded-xl border border-navy-700 transition-colors"
              >
                Sign In to Dashboard
              </button>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber" />
                <span>No live scraping required</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber" />
                <span>Actionable headline rewrites</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber" />
                <span>Instant score (0-100)</span>
              </div>
            </div>
          </div>

          {/* Interactive Card Mockup Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm glass-card rounded-2xl p-6 shadow-2xl border border-white/20 bg-white/95 text-navy-900 relative">
              <div className="absolute -top-3 -right-3 bg-amber text-navy-900 font-bold text-xs px-3 py-1 rounded-full shadow">
                Sample Audit Report
              </div>
              
              <div className="text-center pb-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Conversion Score</h3>
                <div className="my-3">
                  <ScoreGauge score={84} size={150} strokeWidth={12} />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase text-navy-900 tracking-wider">Top Priority Fixes</h4>
                <div className="bg-amber-light p-2.5 rounded-lg border border-amber/30 text-xs text-navy-900 flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                  <span>Clarify hero subheadline to highlight 10-second audit speed.</span>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>High contrast call-to-action button achieves 12.5:1 ratio.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber">Simple 3-Step Process</h2>
          <p className="text-3xl sm:text-4xl font-bold font-display text-navy-900">
            How LandingIQ Optimizes Your Conversions
          </p>
          <p className="text-gray-600 text-base">
            Get elite marketing agency insights without waiting weeks or paying thousands.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="glass-card p-8 rounded-2xl relative border border-gray-200/80 hover:shadow-card transition-shadow">
            <div className="w-12 h-12 bg-navy-900 text-amber font-display font-bold text-xl rounded-xl flex items-center justify-center mb-6">
              01
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-3 font-display">Paste Copy or URL</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Paste raw landing page text, website URL context, or describe your product offer in plain English.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-8 rounded-2xl relative border border-gray-200/80 hover:shadow-card transition-shadow">
            <div className="w-12 h-12 bg-amber text-navy-900 font-display font-bold text-xl rounded-xl flex items-center justify-center mb-6">
              02
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-3 font-display">Claude AI Analysis</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our CRO engine evaluates headline psychology, CTA placements, layout hierarchy, SEO tags, and WCAG accessibility.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-8 rounded-2xl relative border border-gray-200/80 hover:shadow-card transition-shadow">
            <div className="w-12 h-12 bg-navy-900 text-amber font-display font-bold text-xl rounded-xl flex items-center justify-center mb-6">
              03
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-3 font-display">Implement & Convert</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Receive structured recommendations, score breakdown, and pre-written headline alternatives to lift sales immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber">Comprehensive Audits</h2>
            <p className="text-3xl font-bold font-display text-navy-900">
              6-Point Breakdown on Every Analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-gray-100 bg-offwhite hover:border-amber/40 transition-colors">
              <BarChart3 className="w-8 h-8 text-navy-900 mb-4" />
              <h4 className="font-bold text-navy-900 font-display text-lg mb-2">Conversion Score Gauge</h4>
              <p className="text-xs text-gray-600 leading-relaxed">A clear 0-100 visual score metric color-shifted from Red to Emerald Green.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 bg-offwhite hover:border-amber/40 transition-colors">
              <Zap className="w-8 h-8 text-amber mb-4" />
              <h4 className="font-bold text-navy-900 font-display text-lg mb-2">Top Priority Fixes</h4>
              <p className="text-xs text-gray-600 leading-relaxed">The 3 highest-impact changes you must make first for immediate conversion lift.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 bg-offwhite hover:border-amber/40 transition-colors">
              <Target className="w-8 h-8 text-navy-900 mb-4" />
              <h4 className="font-bold text-navy-900 font-display text-lg mb-2">Headline Optimization</h4>
              <p className="text-xs text-gray-600 leading-relaxed">Pre-written high-converting headline rewrites complete with strategic rationale.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 bg-offwhite hover:border-amber/40 transition-colors">
              <ArrowRight className="w-8 h-8 text-amber mb-4" />
              <h4 className="font-bold text-navy-900 font-display text-lg mb-2">CTA Placement Matrix</h4>
              <p className="text-xs text-gray-600 leading-relaxed">Actionable call-to-action button copy, positioning, and psychological triggers.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 bg-offwhite hover:border-amber/40 transition-colors">
              <Search className="w-8 h-8 text-navy-900 mb-4" />
              <h4 className="font-bold text-navy-900 font-display text-lg mb-2">SEO & Meta Tags</h4>
              <p className="text-xs text-gray-600 leading-relaxed">Recommended meta titles, descriptions, target keywords, and heading fixes.</p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 bg-offwhite hover:border-amber/40 transition-colors">
              <Accessibility className="w-8 h-8 text-amber mb-4" />
              <h4 className="font-bold text-navy-900 font-display text-lg mb-2">Accessibility & WCAG</h4>
              <p className="text-xs text-gray-600 leading-relaxed">Identify contrast, screen reader, and legibility issues before they hurt UX.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="bg-navy-900 text-offwhite py-16 px-4 text-center mt-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold font-display">
            Ready to Double Your Landing Page Conversion Rate?
          </h2>
          <p className="text-gray-300 text-base max-w-xl mx-auto">
            Join marketers and founders using LandingIQ for fast, actionable page optimizations.
          </p>
          <div>
            <button
              onClick={() => onStart('signup')}
              className="px-8 py-4 bg-amber hover:bg-amber-hover text-navy-900 font-bold text-base rounded-xl shadow-amber-glow transition-all transform hover:-translate-y-0.5"
            >
              Start Free Audit Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
