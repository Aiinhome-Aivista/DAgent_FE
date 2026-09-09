import React from 'react';
import { Message } from '../types';
import { motion } from 'motion/react';
import { ChatVisualization } from './ChatVisualization';
import { formatChatMessage } from '../../../utils/format';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = React.memo(({ message }: ChatMessageProps) => {
  const isAssistant = message.role === 'assistant';

  const getDisplayContent = (content: string) => {
    try {
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonStr = content.slice(firstBrace, lastBrace + 1);
        }
      }
      
      const parsed = JSON.parse(jsonStr);
      const report = parsed.report || (parsed.title ? parsed : null);
      if (report) {
        if (typeof report === 'string') {
          return report;
        }
        let md = `# ${report.title || 'Report'}\n\n`;
        if (report.key_findings && Array.isArray(report.key_findings) && report.key_findings.length > 0) {
          md += `### Key Findings\n`;
          report.key_findings.forEach((kf: string) => {
            md += `- ${kf}\n`;
          });
          md += `\n`;
        }
        if (report.sections && Array.isArray(report.sections)) {
          report.sections.forEach((sec: any) => {
            if (sec.heading) md += `## ${sec.heading}\n`;
            if (sec.content) md += `${sec.content}\n\n`;
          });
        }
        return md;
      }
    } catch (e) {
      // Fallback
    }
    return content;
  };

  const displayContent = getDisplayContent(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-3`}
    >
      <div
        className={`
          max-w-[90%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isAssistant
            ? 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-none'
            : 'bg-[var(--accent)] text-white rounded-tr-none shadow-lg shadow-[var(--accent)]/10'}
        `}
      >
        <div
          className="prose-chat break-words"
          dangerouslySetInnerHTML={{ __html: formatChatMessage(displayContent, isAssistant) }}
        />

        {isAssistant && message.visualizations && message.visualizations.length > 0 && (
          <div className="mt-4 space-y-4 w-full overflow-x-auto">
            {message.visualizations.map((viz, idx) => (
              <ChatVisualization key={idx} visualization={viz} />
            ))}
          </div>
        )}

        <div
          className={`
            text-[9px] font-mono uppercase tracking-widest opacity-40
            ${isAssistant ? 'text-[var(--text-secondary)]' : 'text-white/80'}
          `}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';

