"use client";

import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
import { ChatLine } from "./chat-line";
import { useChat, Message } from "ai-stream-experimental/react";
import { Input } from "./input";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { useEffect, useRef, useState } from "react";
import { NextPage } from "next";

interface Props {
  namespace : string;
  selectedFiles : string[];
  selectedValue: number|null;
}

export const Chat: NextPage<Props> = ({ namespace , selectedFiles , selectedValue}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      initialMessages,
      body: {namespaceName : namespace, selectedFiles: selectedFiles , selectedValue:selectedValue}
    });

  useEffect(() => {
    setTimeout(() => scrollToBottom(containerRef), 100);
  }, [messages]);


  return (
      <div className="h-full flex flex-col justify-between pb-20">
        <div className="pr-2 h-full overflow-y-auto">
        <div className="" ref={containerRef} id="chatContent">
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
        </div>

      

      <form onSubmit={handleSubmit} className="w-full mt-2 flex clear-both pt-2">
        <Input
          value={input}
          placeholder={"Type to chat with AI..."}
          onChange={handleInputChange}
          className="mr-2 h-14 bg-background"
        />

        <Button type="submit" className="w-24 h-full bg-primary" variant={'default'}>
          {isLoading ? <Spinner /> : "Send"}
        </Button>
      </form>
    </div>
  );
}
