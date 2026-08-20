import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { formatChatMessage } from '../../../utils/format';

interface ChatSummaryCardProps {
  title?: string;
  content?: string;
}

export const ChatSummaryCard = ({ title, content }: ChatSummaryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  const displayTitle = title || "Summary";
  // format content in case it has markdown
  const formattedContent = formatChatMessage(content, true);
  const isLong = content.length > 300;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 w-full rounded-xl border border-[var(--accent)]/30 bg-[var(--surface)] shadow-sm overflow-hidden flex"
    >
      {/* Accent left border */}
      <div className="w-1.5 bg-[var(--accent)] shrink-0" />
      
      <div className="p-4 flex gap-3 w-full">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">
            {displayTitle}
          </h3>
          
          <div className="text-sm text-[var(--text-secondary)] leading-relaxed relative">
            <div 
              className={`prose max-w-none prose-p:my-1 prose-headings:my-1 prose-li:my-0 ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
            {isLong && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm font-semibold text-[var(--accent)] hover:underline mt-1 inline-flex"
              >
                {isExpanded ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
