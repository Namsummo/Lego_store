"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useChatMessage, useChatSession } from "@/hooks/useChatBox";
import { KhuyenMaiTheoSanPham } from "@/components/types/khuyenmai-type";
import Image from "next/image";
import Link from "next/link";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  products?: KhuyenMaiTheoSanPham[];
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Use actual hooks
  const createSession = useChatSession();
  const sendMessage = useChatMessage();

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Create session when opening for the first time
  useEffect(() => {
    if (isOpen && !sessionId) {
      createSession.mutate(undefined, {
        onSuccess: (data) => {
          setSessionId(data.sessionId);
          setMessages([
            {
              sender: "bot",
              text: "Xin chào 👋, tôi có thể giúp gì cho bạn?",
              timestamp: new Date(),
            },
          ]);
        },
        onError: (error) => {
          console.error("Error creating session:", error);
          setMessages([
            {
              sender: "bot",
              text: "❌ Không thể khởi tạo phiên chat. Vui lòng thử lại.",
              timestamp: new Date(),
            },
          ]);
        },
      });
    }
  }, [isOpen, sessionId, createSession]);

  const handleSend = () => {
    if (!input.trim() || !sessionId || sendMessage.isPending) return;

    const userMessage = {
      sender: "user" as const,
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = input.trim();
    setInput(""); // Clear input immediately

    sendMessage.mutate(
      { message: messageToSend, sessionId },
      {
        onSuccess: (res) => {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: res.message,
              timestamp: new Date(),
              products: res.products ?? [],
            },
          ]);
        },
        onError: (error) => {
          console.error("Error sending message:", error);
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "❌ Có lỗi khi gửi tin nhắn. Vui lòng thử lại.",
              timestamp: new Date(),
            },
          ]);
        },
      }
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-orange-400 hover:bg-orange-500"
            size="icon"
          >
            <MessageSquare className="h-6 w-6" />
            {messages.length > 1 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-[10px]">
                {messages.filter((m) => m.sender === "bot").length - 1}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-80 h-96 p-0 mr-4 mb-2 shadow-2xl border-0 bg-white rounded-2xl overflow-hidden"
          side="top"
          align="end"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-400 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">LegoBot</h3>
                  <p className="text-xs text-blue-100">
                    {sendMessage.isPending ? "Đang nhập..." : "Trực tuyến"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 h-64 p-4">
            <div className="space-y-4">
              {/* Typing indicator */}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {/* Tin nhắn text */}
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] break-words ${
                      msg.sender === "user"
                        ? "bg-orange-600 text-white rounded-br-md"
                        : "bg-gray-200 text-gray-800 rounded-bl-md border"
                    }`}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: msg.text.replace(/\n/g, "<br/>"),
                      }}
                    />

                    {/* Nếu có sản phẩm */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {msg.products.map((p) => {
                          const imgUrl =
                            p.anhUrls?.find((a) => a.anhChinh)?.url ??
                            p.anhUrls?.[0]?.url ??
                            "/images/placeholder.png"; // thay bằng placeholder phù hợp
                          return (
                            <div
                              key={p.id}
                              className="bg-white rounded-xl border shadow-sm p-2 flex gap-3 items-start"
                            >
                              <div className="relative w-20 h-20 flex-shrink-0">
                                <Image
                                  src={imgUrl}
                                  alt={p.tenSanPham}
                                  fill
                                  className="object-cover rounded-md border"
                                />
                              </div>

                              <div className="flex-1">
                                <p className="text-sm font-semibold">
                                  {p.tenSanPham}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {p.gia.toLocaleString("vi-VN")} ₫
                                </p>

                                <Button
                                  size="sm"
                                  className="mt-1 bg-orange-600 hover:bg-orange-700 text-xs rounded-full"
                                >
                                  <Link href={`/product/${p.id}`}>
                                    Xem chi tiết
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                disabled={sendMessage.isPending}
                className="flex-1 text-black  border-gray-800 focus:border-blue-500 rounded-full px-4"
              />
              <Button
                onClick={handleSend}
                disabled={sendMessage.isPending || !input.trim()}
                size="icon"
                className="rounded-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
