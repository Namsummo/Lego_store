import { useMutation } from "@tanstack/react-query";
import {
  ChatMessageRequest,
  ChatMessageResponse,
  ChatSessionResponse,
} from "@/components/types/chat.type";
import { chatbotService } from "@/services/chatService";

//Tạo sessionId
export function useChatSession() {
  return useMutation<ChatSessionResponse, Error>({
    mutationFn: () => chatbotService.startSession(),
  });
}

// gửi tin nhắn
export function useChatMessage() {
  return useMutation<ChatMessageResponse, Error, ChatMessageRequest>({
    mutationFn: (payload) => chatbotService.sendMessage(payload),
  });
}
