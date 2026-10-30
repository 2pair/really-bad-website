import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  AlertCircle,
  Download,
  MessageSquare,
  ArrowRight,
  Shuffle,
  FileText,
} from 'lucide-react';
import { useAudioController } from '../context/AudioControllerContext.tsx';
import { StickyVideo } from './StickyVideo.tsx';
import { ScamAds } from './ScamAds.tsx';
import { ARTICLES, ArticleData } from '../data/articles.ts';
import articleChartImg from '../assets/images/article_chart_1793320711165.jpg';

interface BadArticleProps {
  onTriggerTodd: (prompt: string) => void;
  onContinueReading: () => void;
}

export const BadArticle: React.FC<BadArticleProps> = ({
  onTriggerTodd,
  onContinueReading,
}) => {
  const { playBuzzer, playSwoosh, resumeAudioContext } = useAudioController();

  // Random leading article on initial mount
  const [activeArticleId, setActiveArticleId] = useState<string>(() => {
    const randomIndex = Math.floor(Math.random() * ARTICLES.length);
    return ARTICLES[randomIndex].id;
  });

  // Current active article
  const currentArticle: ArticleData =
    ARTICLES.find((a) => a.id === activeArticleId) || ARTICLES[0];

  // CLS State: Images loading without dimensions after delay
  const [delayedImage1Loaded, setDelayedImage1Loaded] = useState(false);
  const [chartImageLoaded, setChartImageLoaded] = useState(false);
  const [delayedQuoteVisible, setDelayedQuoteVisible] = useState(false);

  // Dynamic content block that pops in and out based on scroll/timer
  const [flickeringNoticeVisible, setFlickeringNoticeVisible] = useState(true);
  const [articleExpanded, setArticleExpanded] = useState(false);

  // Staggered image loading without reserved dimensions (Massive CLS!)
  useEffect(() => {
    // Reset layout shift triggers when article switches to induce fresh reflows
    setDelayedImage1Loaded(false);
    setChartImageLoaded(false);
    setDelayedQuoteVisible(false);
    setArticleExpanded(false);

    const t1 = setTimeout(() => {
      setDelayedImage1Loaded(true);
    }, 2200);

    const t2 = setTimeout(() => {
      setChartImageLoaded(true);
    }, 4500);

    const t3 = setTimeout(() => {
      setDelayedQuoteVisible(true);
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeArticleId]);

  // Periodic layout flicker
  useEffect(() => {
    const interval = setInterval(() => {
      setFlickeringNoticeVisible((prev) => !prev);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadClick = () => {
    playBuzzer();
  };

  const handleSupportClick = () => {
    onTriggerTodd('Hey, did you need something?');
  };

  const handleSwitchArticle = (articleId: string) => {
    resumeAudioContext();
    playSwoosh();
    setActiveArticleId(articleId);
    // Scroll back to top of article container
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRandomArticle = () => {
    const otherArticles = ARTICLES.filter((a) => a.id !== activeArticleId);
    const next = otherArticles[Math.floor(Math.random() * otherArticles.length)];
    if (next) {
      handleSwitchArticle(next.id);
    }
  };

  // Other articles to display in links
  const otherArticles = ARTICLES.filter((a) => a.id !== currentArticle.id);

  return (
    <article className="max-w-3xl mx-auto px-4 py-8 font-sans text-neutral-900 bg-white shadow-xl rounded-b-2xl">
      {/* Modern High-End Publisher Header */}
      <header className="mb-6 border-b border-neutral-200 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-widest">
            <span>{currentArticle.category}</span>
          </div>

          <button
            onClick={handleRandomArticle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 cursor-pointer transition-colors"
            title="Load another randomized investigative dossier"
          >
            <Shuffle className="w-3 h-3 text-blue-600 animate-spin" />
            <span>Randomize Article</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 leading-tight">
          {currentArticle.title}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-serif">
          {currentArticle.subtitle}
        </p>

        {/* Author / Date Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase tracking-wider">
              {currentArticle.author.avatarText}
            </div>
            <div>
              <p className="font-bold text-neutral-900">{currentArticle.author.name}</p>
              <p className="text-neutral-400">{currentArticle.author.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {currentArticle.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {currentArticle.date}
            </span>
          </div>
        </div>
      </header>

      {/* ARTICLE STARTS BEFORE VIDEO OR ADS AS REQUESTED */}
      <div className="space-y-6 text-neutral-800 leading-relaxed text-base font-serif">
        <p className="text-lg leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-neutral-950">
          {currentArticle.firstParagraph}
        </p>

        {/* Dynamic Flickering Notice that unmounts and remounts, shifting paragraphs */}
        {flickeringNoticeVisible && (
          <div className="my-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-sans flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-sm">{currentArticle.flickerNotice.title}</strong>
              {currentArticle.flickerNotice.text}
            </div>
          </div>
        )}

        <p>{currentArticle.secondParagraph}</p>
      </div>

      {/* Autoplaying Video inserted in page flow */}
      <StickyVideo />

      {/* Scam Ad Banner inserted in content stream */}
      <ScamAds position="top" />

      {/* Continuation of Article Body */}
      <div className="space-y-6 text-neutral-800 leading-relaxed text-base font-serif mt-6">
        {/* Delayed Image 1 without explicit dimensions: triggers sudden severe layout jump! */}
        {delayedImage1Loaded && (
          <div className="my-4 transition-all duration-300 animate-in fade-in">
            {/* Deliberately no fixed height or width specified to force browser layout reflow! */}
            <div className="p-4 bg-neutral-100 rounded-xl border border-neutral-300 text-center font-sans">
              <div className="h-44 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-800 rounded-lg flex flex-col items-center justify-center text-white p-6 shadow-inner">
                <span className="text-xs uppercase tracking-widest text-blue-200 font-bold mb-1">
                  {currentArticle.figure.tag}
                </span>
                <h4 className="text-xl sm:text-2xl font-black max-w-md">
                  {currentArticle.figure.title}
                </h4>
                <p className="text-xs text-blue-100 mt-2">
                  {currentArticle.figure.subtitle}
                </p>
              </div>
              <span className="text-[11px] text-neutral-500 mt-2 block italic">
                {currentArticle.figure.caption}
              </span>
            </div>
          </div>
        )}

        <p>{currentArticle.thirdParagraph}</p>

        {/* Delayed Quote Block popping in and pushing content */}
        {delayedQuoteVisible && (
          <blockquote className="my-6 pl-4 border-l-4 border-blue-600 text-neutral-900 italic text-lg sm:text-xl font-medium bg-neutral-50 p-4 rounded-r-xl">
            {currentArticle.quote.text}
            <footer className="text-xs text-neutral-500 font-sans mt-2 not-italic font-bold">
              {currentArticle.quote.author}
            </footer>
          </blockquote>
        )}

        <p>{currentArticle.fourthParagraph}</p>

        {/* Middle Scam Ad Banner */}
        <ScamAds position="mid" />

        {/* Scientific Chart Image: loads after delay without specified dimensions */}
        {chartImageLoaded && (
          <div className="my-6 border border-neutral-300 rounded-2xl overflow-hidden shadow-lg animate-in fade-in">
            {/* No width/height in HTML to maximize layout shift */}
            <img
              src={articleChartImg}
              alt="Telemetry Shift Diagram"
              className="w-full h-auto object-contain bg-neutral-100"
            />
            <div className="p-3 bg-neutral-100 font-sans text-xs text-neutral-600 border-t border-neutral-200">
              <strong>Figure 2:</strong> Empirical Telemetry Verification Model (Sync Status: ACTIVE).
            </div>
          </div>
        )}

        {/* INTER-ARTICLE LINK BUTTONS: Other articles linked via buttons in the first article */}
        <div className="my-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl font-sans">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg">
              <FileText className="w-4 h-4" />
            </span>
            <h4 className="font-extrabold text-sm sm:text-base text-neutral-900">
              RELATED INVESTIGATIVE DOSSIERS (CLICK TO OPEN)
            </h4>
          </div>
          <p className="text-xs text-neutral-600 mb-4">
            Our 836 trusted syndicate partners strongly recommend reviewing the following declassified research papers:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => handleSwitchArticle(article.id)}
                className="group flex flex-col justify-between p-3.5 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-700 rounded-xl text-left shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 group-hover:text-blue-100 block mb-1">
                    {article.category.split('•')[0]}
                  </span>
                  <p className="text-xs font-bold text-neutral-900 group-hover:text-white line-clamp-2 leading-snug">
                    {article.title}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-neutral-400 group-hover:text-blue-100 pt-2 border-t border-neutral-100 group-hover:border-blue-500">
                  <span>{article.readTime}</span>
                  <span className="flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">
                    READ NOW <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bad On-Page Interactive Buttons */}
        <div className="my-8 p-6 bg-neutral-50 border border-neutral-200 rounded-2xl font-sans">
          <h4 className="font-extrabold text-sm sm:text-base text-neutral-900 mb-1">
            Accelerate Your Epistemic Readiness
          </h4>
          <p className="text-xs text-neutral-600 mb-4">
            Select one of the validated enterprise resources below:
          </p>

          <div className="flex flex-wrap gap-3">
            {/* Button 1: Plays canceled/not allowed buzzer sound */}
            <button
              onClick={handleDownloadClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Full Dossier PDF (142MB)</span>
            </button>

            {/* Button 2: Opens support modal and Todd sends message "Hey did you need something?" */}
            <button
              onClick={handleSupportClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Speak to Chrono-Consultant (Todd)</span>
            </button>
          </div>
        </div>

        {/* Continue Reading Button -> triggers unskippable 10s countdown ad! */}
        {!articleExpanded ? (
          <div className="my-8 p-8 bg-gradient-to-b from-transparent to-neutral-100 border-b border-neutral-300 text-center font-sans">
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-3">
              [ 62% OF ARTICLE REMAINING • PREMIUM RESEARCH GATE ]
            </p>
            <button
              onClick={() => {
                onContinueReading();
                setArticleExpanded(true);
              }}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-emerald-500/30 transition-all cursor-pointer animate-pulse"
            >
              Continue Reading Full Thesis (Free)
            </button>
          </div>
        ) : (
          <div className="space-y-6 pt-4 animate-in fade-in">
            <h3 className="text-2xl font-black text-neutral-900 font-sans">
              {currentArticle.expandedTitle}
            </h3>
            {currentArticle.expandedParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Ad Banner */}
      <div className="mt-8">
        <ScamAds position="bottom" />
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-neutral-200 text-xs text-neutral-400 text-center font-sans">
        <p>© 2026 ReallyBadWebsite. All rights reserved. Do not attempt to reverse engineer temporal coordinates.</p>
      </footer>
    </article>
  );
};
