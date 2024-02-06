"use client";

import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
import { ChatLine } from "./chat-line";
import { useChat, Message } from "ai-stream-experimental/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { DarkModeToggle } from "./dark-mode-toggle";
import { Sidebar } from "./sidebar";

interface Props {
  namespace : string
}

export const Chat: NextPage<Props> = ({ namespace }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      initialMessages,
      body: {namespaceName : namespace, selectedFiles: selectedFiles}
    });

  useEffect(() => {
    setTimeout(() => scrollToBottom(containerRef), 100);
  }, [messages]);

  return (
    <div className="w-full h-full overflow-hidden flex flex-row items-center justify-center space-x-5">
      {/* sidebar */}
      <div className="h-full border w-[25%] rounded-xl bg-background/70 supports-backdrop-blur:bg-background/60">
        <Sidebar chatbotname={namespace} onFileSelectionChange={setSelectedFiles}/>
      </div>

      {/* chat */}
          <div className="h-full rounded-xl flex flex-col justify-between w-[75%]">
      <div className="px-6 overflow-auto custom-scrollbar" ref={containerRef}>
      <div className="flex h-16 items-center justify-between supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border p-4 bg-background/95 backdrop-blur mb-4 shadow-md rounded-sm">
        <span className="font-bold text-lg">{namespace}</span>
        <DarkModeToggle />
      </div>
        {messages.map(({ id, role, content }: Message, index) => (
          <ChatLine
            key={id}
            role={role}
            content={content}
            // Start from the third message of the assistant
            sources={data?.length ? getSources(data, role, index) : []}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="py-2 px-6 mt-2 flex clear-both">
        <Input
          value={input}
          placeholder={"Type to chat with AI..."}
          onChange={handleInputChange}
          className="mr-2 h-12 bg-background/30"
        />

        <Button type="submit" className="w-24 h-full">
          {isLoading ? <Spinner /> : "Ask"}
        </Button>
      </form>
    </div>
    </div>
  );
}
