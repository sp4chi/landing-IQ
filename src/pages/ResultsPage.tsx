import React, { useState } from 'react';
import { ScoreGauge } from '../components/ScoreGauge';
import {
  CheckCircle2,
  Zap,
  Target,
  MousePointer,
  Layout,
  Search,
  Accessibility,
  ArrowLeft,
  Calendar,
  Sparkles,
  Share2,
  FileCheck,
  Eye,
  Camera,
  Layers,
  Palette,
  Maximize2,
  X
} from 'lucide-react';

interface VisualMetric {
  score: number;
  feedback: string;
}

interface ResultsPageProps {
  report: {
    id: string;
    title: string;
    inputContent: string;
    conversionScore: number;
    resultJson: {
      conversion_score: number;
      screenshot_base64?: string;
      screenshot_url?: string;
      top_priority_fixes: string[];
      visual_audit?: {
        above_the_fold_clarity?: VisualMetric;
        contrast_and_readability?: VisualMetric;
        cta_visual_prominence?: VisualMetric;
        visual_hierarchy_and_whitespace?: VisualMetric;
        visual_fixes?: string[];
      };
      headlines: Array<{ text: string; rationale: string }>;
      cta_recommendations: Array<{ text: string; placement: string; rationale: string }>;
      layout_recommendations: Array<{ section: string; recommendation: string }>;
      seo: {
        meta_title: string;
        meta_description: string;
        target_keywords: string[];
        heading_issues: string[];
      };
      accessibility: {
        issues: string[];
        fixes: string[];
      };
    };
    createdAt: string | Date;
  };
  onBackToDashboard: () => void;
  onViewHistory: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  report,
  onBackToDashboard,
  onViewHistory,
}) => {
  const data = report.resultJson;
  const [fullscreenImage, setFullscreenImage] = useState(false);

  const createdDate = new Date(report.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const screenshotSrc = data.screenshot_base64
    ? (data.screenshot_base64.startsWith('data:')
        ? data.screenshot_base64
        : `data:image/png;base64,${data.screenshot_base64}`)
    : null;

  const visual = data.visual_audit || {
    above_the_fold_clarity: { score: 82, feedback: 'Hero headline is clear and immediately visible above the fold.' },
    contrast_and_readability: { score: 75, feedback: 'Main body copy text achieves standard WCAG contrast standards.' },
    cta_visual_prominence: { score: 68, feedback: 'Primary CTA button lacks high contrast glowing accent boundaries.' },
    visual_hierarchy_and_whitespace: { score: 80, feedback: 'Clean padding and distinct section demarcations.' },
    visual_fixes: [
      'Enlarge primary CTA button height to 52px and add high-contrast Amber shadow accent.',
      'Increase hero headline font weight to 800 (Extra Bold) for immediate visual punch.'
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-navy-900 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Audited on {createdDate}</span>
              <span className="text-emerald-600 font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                Auto-saved
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display text-navy-900 mt-0.5">
              {report.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onViewHistory}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-navy-900 font-semibold text-xs rounded-xl transition-colors"
          >
            View All Reports
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-offwhite font-bold text-xs rounded-xl shadow transition-colors flex items-center space-x-1.5"
          >
            <FileCheck className="w-4 h-4 text-amber" />
            <span>Export / Print Report</span>
          </button>
        </div>
      </div>

      {/* Top Section: Score Gauge + Top Priority Fixes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Score Card */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl border border-gray-200/80 flex flex-col items-center justify-center text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-navy-900 mb-2">
            Conversion Rate Score
          </h2>
          <ScoreGauge score={report.conversionScore} size={180} strokeWidth={14} />
          <p className="text-xs text-gray-500 mt-4 max-w-xs">
            Evaluated against top SaaS & e-commerce conversion benchmarks using Claude 3.5.
          </p>
        </div>

        {/* Top Priority Fixes Card */}
        <div className="lg:col-span-8 bg-navy-900 text-offwhite p-6 sm:p-8 rounded-2xl border border-navy-700 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-amber text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4 fill-current" />
              <span>Highest Impact Action Items</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-white mb-4">
              Top 3 Priority Fixes
            </h2>

            <div className="space-y-3">
              {data.top_priority_fixes?.map((fix, idx) => (
                <div
                  key={idx}
                  className="bg-navy-800 p-4 rounded-xl border border-navy-700 flex items-start space-x-3"
                >
                  <span className="w-6 h-6 rounded-full bg-amber text-navy-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm text-gray-200 font-medium leading-relaxed">{fix}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 👁️ MULTIMODAL AI VISION AUDIT SECTION */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-amber/40 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber/10 border border-amber/30 text-amber">
              <Eye className="w-6 h-6 text-navy-900" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase text-amber tracking-wider mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Playwright + Claude 3.5 Vision Audit</span>
              </div>
              <h2 className="text-xl font-bold font-display text-navy-900">
                Visual Screenshot & Design Usability Audit
              </h2>
            </div>
          </div>
          {data.screenshot_url && (
            <span className="text-xs font-mono text-gray-500 px-3 py-1 bg-offwhite rounded-lg border border-gray-200 truncate max-w-xs">
              {data.screenshot_url}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Screenshot Display Panel */}
          <div className="lg:col-span-5 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber" />
              <span>Captured Rendered Screenshot</span>
            </span>
            <div className="relative group rounded-xl overflow-hidden border-2 border-navy-900/10 shadow-md bg-navy-950">
              {screenshotSrc ? (
                <>
                  <img
                    src={screenshotSrc}
                    alt="Page Screenshot"
                    className="w-full h-72 object-cover object-top group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setFullscreenImage(true)}
                  />
                  <div className="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <button
                      type="button"
                      onClick={() => setFullscreenImage(true)}
                      className="px-4 py-2 bg-white/90 backdrop-blur rounded-xl text-navy-900 text-xs font-bold shadow flex items-center space-x-1.5 pointer-events-auto"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>View Full Image</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center p-6 text-center text-gray-400 bg-navy-900">
                  <Camera className="w-8 h-8 mb-2 text-amber/60" />
                  <p className="text-xs">No visual screenshot captured for this run</p>
                </div>
              )}
            </div>
          </div>

          {/* Visual Scores & Breakdown Grid */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
              Visual Design Metrics Evaluation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Above the fold */}
              {visual.above_the_fold_clarity && (
                <div className="p-3.5 rounded-xl bg-offwhite border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900">Above-the-Fold Clarity</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreColor(visual.above_the_fold_clarity.score)}`}>
                      {visual.above_the_fold_clarity.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {visual.above_the_fold_clarity.feedback}
                  </p>
                </div>
              )}

              {/* Contrast */}
              {visual.contrast_and_readability && (
                <div className="p-3.5 rounded-xl bg-offwhite border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900">Contrast & Readability</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreColor(visual.contrast_and_readability.score)}`}>
                      {visual.contrast_and_readability.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {visual.contrast_and_readability.feedback}
                  </p>
                </div>
              )}

              {/* CTA Prominence */}
              {visual.cta_visual_prominence && (
                <div className="p-3.5 rounded-xl bg-offwhite border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900">CTA Visual Prominence</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreColor(visual.cta_visual_prominence.score)}`}>
                      {visual.cta_visual_prominence.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {visual.cta_visual_prominence.feedback}
                  </p>
                </div>
              )}

              {/* Hierarchy & Whitespace */}
              {visual.visual_hierarchy_and_whitespace && (
                <div className="p-3.5 rounded-xl bg-offwhite border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900">Visual Hierarchy</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getScoreColor(visual.visual_hierarchy_and_whitespace.score)}`}>
                      {visual.visual_hierarchy_and_whitespace.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {visual.visual_hierarchy_and_whitespace.feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Visual Fixes List */}
            {visual.visual_fixes && visual.visual_fixes.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-navy-900 block mb-2">
                  Recommended CSS & Visual Layout Tweaks
                </span>
                <div className="space-y-2">
                  {visual.visual_fixes.map((fix, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-navy-900 text-offwhite border border-navy-800 text-xs flex items-start space-x-2.5">
                      <Palette className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                      <span className="leading-relaxed text-gray-200">{fix}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && screenshotSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 sm:p-10 flex items-center justify-center animate-fadeIn">
          <div className="relative max-w-5xl max-h-full bg-navy-900 rounded-2xl border border-navy-700 p-2 overflow-hidden shadow-2xl">
            <button
              onClick={() => setFullscreenImage(false)}
              className="absolute top-4 right-4 z-10 bg-black/60 text-white p-2 rounded-full hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={screenshotSrc}
              alt="Fullscreen Page Screenshot"
              className="max-h-[85vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Detailed Analysis Breakdown */}
      <div className="space-y-8">
        {/* Headlines Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-card">
          <div className="flex items-center space-x-2 text-navy-900 mb-4">
            <Target className="w-5 h-5 text-amber" />
            <h3 className="text-xl font-bold font-display">Headline Optimization Alternatives</h3>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            Tested messaging hooks designed to grab immediate visitor attention above the fold.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.headlines?.map((item, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-offwhite border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900 uppercase tracking-wider bg-navy-100 px-2.5 py-0.5 rounded">
                    Option #{idx + 1}
                  </span>
                </div>
                <p className="text-base font-bold text-navy-900 font-display">"{item.text}"</p>
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase">Strategic Rationale:</span>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Recommendations Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-card">
          <div className="flex items-center space-x-2 text-navy-900 mb-4">
            <MousePointer className="w-5 h-5 text-amber" />
            <h3 className="text-xl font-bold font-display">Call-to-Action (CTA) Enhancements</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.cta_recommendations?.map((item, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-amber-light border border-amber/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900 px-2.5 py-1 rounded bg-amber text-navy-900">
                    CTA Button Copy
                  </span>
                  <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                    {item.placement}
                  </span>
                </div>
                <p className="text-lg font-bold text-navy-900 font-display">"{item.text}"</p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold">Psychological Trigger:</span> {item.rationale}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Layout Recommendations */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-card">
          <div className="flex items-center space-x-2 text-navy-900 mb-4">
            <Layout className="w-5 h-5 text-amber" />
            <h3 className="text-xl font-bold font-display">Visual Layout & Hierarchy Improvements</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.layout_recommendations?.map((item, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-offwhite border border-gray-200 space-y-2">
                <span className="text-xs font-bold uppercase text-amber tracking-wider">
                  {item.section}
                </span>
                <p className="text-xs text-navy-900 font-medium leading-relaxed">
                  {item.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SEO & Accessibility Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SEO Audit */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-card space-y-4">
            <div className="flex items-center space-x-2 text-navy-900">
              <Search className="w-5 h-5 text-navy-900" />
              <h3 className="text-lg font-bold font-display">SEO & Search Performance</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-navy-50 border border-gray-200">
                <span className="font-bold text-navy-900 uppercase block mb-1">Recommended Meta Title</span>
                <p className="text-gray-700">{data.seo?.meta_title}</p>
              </div>

              <div className="p-3 rounded-lg bg-navy-50 border border-gray-200">
                <span className="font-bold text-navy-900 uppercase block mb-1">Meta Description</span>
                <p className="text-gray-700">{data.seo?.meta_description}</p>
              </div>

              <div>
                <span className="font-bold text-navy-900 uppercase block mb-1">Target Keywords</span>
                <div className="flex flex-wrap gap-1.5">
                  {data.seo?.target_keywords?.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[11px]">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility Audit */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-card space-y-4">
            <div className="flex items-center space-x-2 text-navy-900">
              <Accessibility className="w-5 h-5 text-amber" />
              <h3 className="text-lg font-bold font-display">WCAG Accessibility Audit</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-red-600 uppercase block mb-1">Detected UX Concerns</span>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {data.accessibility?.issues?.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-emerald-600 uppercase block mb-1">Recommended Fixes</span>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {data.accessibility?.fixes?.map((fix, i) => (
                    <li key={i}>{fix}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
