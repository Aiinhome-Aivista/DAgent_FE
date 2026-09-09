import React from 'react';
import { ChatWindow } from '../../chat/components/ChatWindow';

interface QueryViewGenericProps {
  sessionId?: string;
  workspaceName?: string;
  workspaceType?: string;
  chatCollapsed: boolean;
  setChatCollapsed: (collapsed: boolean) => void;
  chatKey?: number;
  initialChatMessage?: string;
  onChangeTab?: (tabId: string) => void;
  onNewSessionCreated?: () => void;
}

export const QueryViewGeneric: React.FC<QueryViewGenericProps> = ({
  sessionId,
  workspaceName,
  workspaceType,
  chatCollapsed,
  setChatCollapsed,
  chatKey,
  initialChatMessage,
  onChangeTab,
  onNewSessionCreated
}) => {
  return (
    <div key={`layout-${workspaceType}-${sessionId}`} className="flex-1 flex overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        {/* Upper portion: Blank with simple message */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-0 bg-[var(--surface)]/30 border-b border-[var(--border)] flex items-center justify-center">
          <div className="text-center text-[var(--text-secondary)]">
            <p className="text-lg font-medium">You have not processed any data.</p>
            <p className="text-sm mt-3 opacity-80 max-w-md mx-auto leading-relaxed">
              To start, expand the <b>"Speak to your data"</b> section below and click the three dots (...) menu to navigate to Data Sources and connect your data.
            </p>
          </div>
        </div>
        {/* Lower portion: Chat */}
        <div className={`shrink-0 flex flex-col transition-all duration-300 ${chatCollapsed ? '' : 'h-[45%] min-h-[350px]'}`}>
          <ChatWindow
            initialMode="chat"
            initialMessage={initialChatMessage}
            onOpenDataSource={onChangeTab ? () => onChangeTab('connectors') : undefined}
            onNewSessionCreated={onNewSessionCreated}
            sessionId={sessionId}
            workspaceName={workspaceName}
            onCollapseChange={setChatCollapsed}
            chatKey={chatKey}
          />
        </div>
      </div>
    </div>
  );
};
