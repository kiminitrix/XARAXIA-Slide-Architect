
import React, { useEffect, useState } from 'react';
import { Slide, ThemeType, LayoutType } from '../types';
import { generateSlideImage } from '../services/geminiService';

interface SlidePreviewProps {
  slide: Slide;
  theme: ThemeType;
  index: number;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, theme, index }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      // Logic to generate actual image if visual suggestion exists
      if (slide.visual_suggestion && !imageUrl) {
         const img = await generateSlideImage(slide.visual_suggestion);
         setImageUrl(img);
      }
    };
    fetchImage();
  }, [slide.visual_suggestion]);

  const themeStyles = {
    [ThemeType.CORPORATE]: "bg-white text-slate-900 border-l-[12px] border-blue-900",
    [ThemeType.VIBRANT]: "bg-gradient-to-br from-purple-600 to-indigo-700 text-white",
    [ThemeType.MINIMALIST]: "bg-slate-50 text-slate-800 border-t-4 border-slate-300",
    [ThemeType.TECH]: "bg-slate-950 text-emerald-400 border border-emerald-900 mono-font"
  };

  const renderContent = () => {
    switch (slide.layout_type) {
      case LayoutType.TITLE:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-12">
            <h1 className={`text-6xl font-bold mb-6 ${theme === ThemeType.CORPORATE ? 'title-font' : ''}`}>
              {slide.slide_title}
            </h1>
            <div className="w-24 h-1 bg-current opacity-50 mb-8"></div>
            <p className="text-xl opacity-80">{slide.slide_content[0] || "Presentation Deck"}</p>
          </div>
        );

      case LayoutType.TWO_COLUMN:
        const half = Math.ceil(slide.slide_content.length / 2);
        return (
          <div className="p-12 h-full flex flex-col">
            <h2 className="text-4xl font-bold mb-8">{slide.slide_title}</h2>
            <div className="grid grid-cols-2 gap-12 flex-grow">
              <ul className="space-y-4">
                {slide.slide_content.slice(0, half).map((point, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <ul className="space-y-4">
                {slide.slide_content.slice(half).map((point, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );

      case LayoutType.BIG_IMAGE:
        return (
          <div className="grid grid-cols-5 h-full">
            <div className="col-span-2 p-12 flex flex-col justify-center bg-black/5">
              <h2 className="text-4xl font-bold mb-6">{slide.slide_title}</h2>
              <ul className="space-y-4">
                {slide.slide_content.map((point, i) => (
                  <li key={i} className="flex gap-3 text-lg">
                    <span className="text-indigo-500 font-bold">›</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-3 bg-slate-200 overflow-hidden flex items-center justify-center relative">
              {imageUrl ? (
                <img src={imageUrl} alt="Slide Visual" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-400 italic p-8 text-center">
                  <p className="text-sm">Visual Suggestion:</p>
                  <p className="text-xs">{slide.visual_suggestion}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-12 h-full flex flex-col">
            <h2 className="text-4xl font-bold mb-8 border-b border-current/10 pb-4">{slide.slide_title}</h2>
            <div className="flex-grow flex items-start gap-12">
              <ul className="space-y-6 text-xl leading-relaxed flex-grow">
                {slide.slide_content.map((point, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="opacity-40 font-bold">0{i+1}</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              {imageUrl && (
                <div className="w-1/3 aspect-video bg-white/10 rounded-lg overflow-hidden shadow-xl border border-white/20">
                   <img src={imageUrl} alt="Slide decoration" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`slide-page relative w-full aspect-[16/9] shadow-2xl overflow-hidden rounded-xl transition-all duration-500 ${themeStyles[theme]}`}>
      <div className="absolute top-4 right-6 opacity-20 text-sm font-mono">{index + 1}</div>
      {renderContent()}
      <div className="absolute bottom-4 left-6 opacity-20 text-xs">XARAXIA Slide Architect</div>
    </div>
  );
};
