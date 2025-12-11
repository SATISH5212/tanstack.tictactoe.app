import { capitalizeFirstLetter } from "@/lib/helpers/capitalize";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { usePondContext } from "../context/PondsProvider";
import { UpArrowIcon } from "../svg/UpArrow";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const AiChatComponent = ({ onCloseChat }: any) => {
  const { isChatOpen, setIsChatOpen } = usePondContext();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCloseCall = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsChatOpen(false);
    setMessages([]);
    setInput("");
    setConversationId(null);
    setIsStreaming(false);
    if (onCloseChat) onCloseChat();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsStreaming(true);

    setMessages((prev) => [...prev, { role: "ai", text: "" }]);

    abortControllerRef.current = new AbortController();

    try {
      const payload = {
        prompt: userInput,
        ...(conversationId && { conversation_id: conversationId }),
      };

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_API_URL}/pa/prompt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current.signal,
        }
      );

      const headerConversationId = response.headers.get("X-Conversation-Id");
      if (headerConversationId) setConversationId(headerConversationId);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader available");

      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6);
            if (data.includes('"success":true')) continue;

            let trimmedData = data.replace(/\\"/g, '"').replace(/\\n/g, "\n");
            if (trimmedData.startsWith('"') && trimmedData.endsWith('"')) {
              trimmedData = trimmedData.slice(1, -1);
            }
            let batchIndex = 0;
            const batchSize = 3;
            while (batchIndex < trimmedData.length) {
              const batch = trimmedData.slice(batchIndex, batchIndex + batchSize);
              aiText += batch;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: "ai", text: aiText };
                return newMessages;
              });
              batchIndex += batchSize;
              await new Promise((r) => setTimeout(r, 15));
            }
          }
        }
      }

      setIsStreaming(false);
      abortControllerRef.current = null;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "ai",
          text: "Error processing your request. Please try again.",
        };
        return newMessages;
      });
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(capitalizeFirstLetter(e.target.value))
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isChatOpen) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[9999] animate-slide-up">
      <div className="flex flex-col bg-white w-[420px] h-[600px] shadow-xl rounded-xl overflow-hidden border border-green-200">

        <div className="flex justify-between items-center px-4 py-2 
                      bg-gradient-to-r from-green-600 to-green-500 shadow-sm">
          <p className="flex flex-row  gap-3 font-semibold items-center text-white text-sm tracking-wide">
            <img
              src="/FarmerChatBotIcon.svg"
              alt="Logo"
              className="w-7 h-7 select-none"
            />
            Peepul Agri
          </p>
          <X className="h-4 w-4 cursor-pointer text-white" onClick={handleCloseCall} />
        </div>
        <div
          ref={scrollableRef}
          className="relative flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50 scrollbar-hide"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-full p-3 rounded-lg shadow-sm ${msg.role === "user"
                  ? "bg-blue-100 text-black border border-blue-200"
                  : "bg-green-50 text-black border border-green-200"
                  }`}
              >
                {msg.text ? (
                  msg.role === "ai" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ ...props }) => (
                          <p className="mb-2 last:mb-0 text-sm leading-relaxed" {...props} />
                        ),
                        ul: ({ ...props }) => (
                          <ul className="list-disc ml-4 mb-2 space-y-1 text-sm" {...props} />
                        ),
                        ol: ({ ...props }) => (
                          <ol className="list-decimal ml-4 mb-2 space-y-1 text-sm" {...props} />
                        ),
                        li: ({ ...props }) => <li className="mb-1 text-sm" {...props} />,
                        code: ({ inline, ...props }: any) =>
                          inline ? (
                            <code className="bg-gray-200 px-1.5 py-0.5 rounded" {...props} />
                          ) : (
                            <code className="block bg-gray-200 p-2 rounded text-xs my-2 overflow-x-auto" {...props} />
                          ),
                        pre: ({ ...props }) => (
                          <pre className="bg-gray-200 p-2 rounded my-2 overflow-x-auto" {...props} />
                        ),
                        strong: ({ ...props }) => (
                          <strong className="font-semibold text-sm" {...props} />
                        ),
                        em: ({ ...props }) => <em className="italic" {...props} />,
                        h1: ({ ...props }) => (
                          <h1 className="text-sm font-bold mb-2 mt-2 text-green-700" {...props} />
                        ),
                        h2: ({ ...props }) => (
                          <h2 className="text-xs font-bold mb-2 mt-2 text-green-700" {...props} />
                        ),
                        h3: ({ ...props }) => (
                          <h3 className="text-xs font-semibold mb-1 mt-1 text-green-700" {...props} />
                        ),
                        blockquote: ({ ...props }) => (
                          <blockquote className="border-l-4 border-green-400 pl-3 my-2 italic text-sm" {...props} />
                        ),
                        a: ({ ...props }) => (
                          <a
                            className="text-green-600 underline hover:text-green-800 text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  )
                ) : isStreaming && index === messages.length - 1 ? (
                  <div className="flex items-center gap-1 py-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>


        <div className="flex flex-col gap-2 p-3 border-t bg-white">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              ref={textareaRef}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask about ponds, motors, devices..."
              className="flex-1 border-2 border-green-300 rounded-full h-full px-4 text-sm
            focus:ring-1 focus:ring-green-600"
            />

            <Button
              onClick={handleSend}
              className={`relative rounded-full px-4 py-2 text-sm transition-all w-10 h-10 bg-green-600 hover:bg-green-700
    ${isStreaming
                  ? "flex items-center justify-center bg-green-600 text-white  animate-[pulse_1.4s_infinite]"
                  : "text-white bg-green-600"
                }`}
           disabled={!input.trim() || isStreaming}
            >
              {isStreaming ? (
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-6 h-6 border-2 border-sky-300 border-t-transparent rounded-full animate-spin"></span>

                </div>
              ) : (
                <UpArrowIcon className="w-7 h-7 text-white" />
              )}
            </Button>

          </div>
        </div>

      </div>
    </div>
  );

};

export default AiChatComponent;


