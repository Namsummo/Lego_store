import {
  ChatSessionResponse,
  ChatMessageRequest,
  ChatMessageResponse,
} from "@/components/types/chat.type";
import { fetchWithAuth } from "./fetchWithAuth";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const chatbotService = {
  // bật mở chat
  async startSession(): Promise<ChatSessionResponse> {
    const res = await fetchWithAuth(`${API_URL}/api/lego-store/chat/start`, {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error("Không tạo ra được sessionId");
    }
    return res.json();
  },

  // gửi chat
  async sendMessage(payload: ChatMessageRequest): Promise<ChatMessageResponse> {
    const res = await fetchWithAuth(`${API_URL}/api/lego-store/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // fetchWithAuth nên tự động thêm Authorization ở đây
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Không gửi được message (status: ${res.status})`);
    }

    return res.json();
  },
};
