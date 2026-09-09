import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

export const ChatSummaryCard = ({ title, content }: { title?: string, content?: string }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!title && !content) return null;
  
  const isLongContent = content && content.length > 300;
  
  return (
    <div className="bg-white rounded-xl shadow-sm mb-6 flex overflow-hidden border border-gray-100" style={{ borderLeft: '4px solid #5B5EFC' }}>
      <div className="p-4 flex flex-row items-start gap-3 w-full">
        <div className="mt-1 flex-shrink-0">
          <Sparkles className="w-5 h-5 text-[#5B5EFC]" />
        </div>
        <div className="flex flex-col flex-1 min-w-0 relative">
          {title && (
            <h2 className="text-[15px] font-semibold text-gray-900 mb-1 leading-tight">{title}</h2>
          )}
          {content && (
            <div className="relative">
              <div 
                className={`prose prose-sm max-w-none text-gray-500 text-[13px] leading-relaxed transition-all duration-300 ${expanded ? '' : 'line-clamp-2'}`}
                dangerouslySetInnerHTML={{ __html: content }} 
              />
              
              {isLongContent && (
                <div className={`flex justify-end mt-1 ${!expanded ? 'absolute bottom-0 right-0 bg-gradient-to-l from-white via-white to-transparent pl-8' : ''}`}>
                  <button 
                    onClick={() => setExpanded(!expanded)}
                    className="text-[#5B5EFC] text-[13px] font-medium hover:underline focus:outline-none bg-white"
                  >
                    {expanded ? 'Show Less' : 'Read More'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
