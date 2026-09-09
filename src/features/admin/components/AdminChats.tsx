import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { defaultConfig, API_ENDPOINTS } from "../../../services/api.config";
import { Loader2, Send } from "lucide-react";
import { ChatVisualization } from "../../chat/components/ChatVisualization";
import { Visualization } from "../../chat/types";

interface AdminChat {
  id: number;
  chat_id: string;
  session_id: string;
  question: string;
  answer: string;
  visualizations?: Partial<Visualization> | null;
  kg_status?: string;
  created_at: string;
}

export const AdminChats: React.FC = () => {
  const [chats, setChats] = useState<AdminChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPushing, setIsPushing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${defaultConfig.baseUrl}${API_ENDPOINTS.ADMIN.GET_CHATS}?limit=200`,
      );
      if (!res.ok) throw new Error("Failed to fetch chats");
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data)) {
        setChats(json.data);
      } else {
        setChats([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load chat views");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushToKG = async (
    chat: AdminChat,
    uniqueId: string,
    tableVisualizations: any[],
  ) => {
    try {
      setIsPushing((prev) => ({ ...prev, [uniqueId]: true }));

      const payload = {
        id: chat.id,
        question: chat.question,
        answer: chat.answer,
        visualizations:
          tableVisualizations.length > 0 ? tableVisualizations : null,
      };

      const res = await fetch(
        `${defaultConfig.baseUrl}${API_ENDPOINTS.ADMIN.PUSH_TO_KG}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error("Failed to push to Knowledge Graph");

      toast.success("Successfully pushed to Knowledge Graph!");

      // Optionally remove the chat from the list after pushing
      setChats((prev) =>
        prev.filter(
          (c) =>
            (c.chat_id || c.session_id) !== (chat.chat_id || chat.session_id),
        ),
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to push. Please check the backend connection.");
    } finally {
      setIsPushing((prev) => ({ ...prev, [uniqueId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl opacity-60">
        <p className="text-sm text-[var(--text-secondary)]">
          No recent chats found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-[var(--text-primary)]">
        User Chat Views
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        Review recent user chats and promote accurate answers to the Knowledge
        Graph.
      </p>

      <div className="grid grid-cols-1 gap-6">
        {chats.map((chat, index) => {
          // Generate a safe key since chat_id can be null
          const uniqueId = chat.chat_id || `${chat.session_id}-${index}`;

          // Safely parse visualizations if it's a string
          let parsedVisualizations: any[] = [];
          if (typeof chat.visualizations === "string") {
            try {
              parsedVisualizations = JSON.parse(chat.visualizations);
              if (!Array.isArray(parsedVisualizations)) {
                parsedVisualizations = [parsedVisualizations];
              }
            } catch (e) {
              console.error("Failed to parse visualizations:", e);
            }
          } else if (chat.visualizations) {
            parsedVisualizations = Array.isArray(chat.visualizations)
              ? chat.visualizations
              : [chat.visualizations];
          }

          return (
            <div
              key={uniqueId}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-4 border-b border-[var(--border)]/50 pb-3">
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  Session: {chat.session_id} •{" "}
                  {new Date(chat.created_at).toLocaleString()}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">
                  Question:
                </h3>
                <p className="text-[13px] bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)]/30 text-[var(--text-secondary)]">
                  {chat.question}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">
                  Answer:
                </h3>
                <div className="text-[13px] text-[var(--text-secondary)] whitespace-pre-wrap">
                  {chat.answer}
                </div>
              </div>

              {parsedVisualizations.filter((vis) => vis.type === "table")
                .length > 0 && (
                <div className="mb-6 space-y-4">
                  {parsedVisualizations
                    .filter((vis) => vis.type === "table")
                    .map((vis, vIdx) => (
                      <div
                        key={vIdx}
                        className="border border-[var(--border)]/30 p-2 rounded-xl bg-[var(--bg)]"
                      >
                        <ChatVisualization
                          visualization={
                            {
                              ...vis,
                              type: vis.type || "table",
                            } as Visualization
                          }
                        />
                      </div>
                    ))}
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-[var(--border)]/50">
                <button
                  onClick={() =>
                    handlePushToKG(
                      chat,
                      uniqueId,
                      parsedVisualizations.filter(
                        (vis) => vis.type === "table",
                      ),
                    )
                  }
                  disabled={
                    isPushing[uniqueId] ||
                    chat.kg_status === "staged" ||
                    chat.kg_status === "indexed"
                  }
                  className={`px-4 py-2 text-sm cursor-pointer font-medium rounded-xl text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${chat.kg_status === "staged" || chat.kg_status === "indexed" ? "bg-gray-500" : "bg-[var(--accent)] hover:bg-[var(--accent)]/90"}`}
                >
                  {isPushing[uniqueId] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {chat.kg_status === "indexed"
                    ? "Already Indexed"
                    : chat.kg_status === "staged"
                      ? "Already Staged"
                      : "Push to Knowledge Graph"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
