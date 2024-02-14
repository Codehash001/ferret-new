"use client";

import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
import { useChat, Message } from "ai-stream-experimental/react";
import { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { Sidebar } from "../sideBar/sidebar";
import { TopBar } from "../topBar/topBar";
import { Chat } from "../chat/chat";
import { MainTab } from "../mainTab/mainTab";

interface Props {
  namespace: string;
}

export const Parent: NextPage<Props> = ({ namespace }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState<number | null>(4);
  const [currentMenuItem , setCurrentMenuItem] = useState('Chat');


  const [nav, setNav] = useState(false);

  function handlenav() {
    setNav(!nav);
  }

  return (
    <div className="flex flex-row items-start space-x-10 w-full h-full">
      {/* sidebar */}
      <div className="h-full border w-[28%] rounded-xl bg-background/70 supports-backdrop-blur:bg-background hidden md:flex">
        <Sidebar
          chatbotname={namespace}
          onFileSelectionChange={setSelectedFiles}
          onSelectedValueChange={setSelectedValue}
        />
      </div>

      {/* mobile navbar */}
      {nav ? (
        <>
          <div className="w-full h-full overflow-x-hidden bg-background absolute pt-20 px-5">
            <Sidebar
              chatbotname={namespace}
              onFileSelectionChange={setSelectedFiles}
              onSelectedValueChange={setSelectedValue}
            />
          </div>
        </>
      ) : (
        <></>
      )}

      <div className="w-[72%] h-full">
        <div className="">
        <TopBar namespace={namespace} onMenuItemChange={setCurrentMenuItem}/>
        </div>
          <div className="h-full">
        <MainTab namespace={namespace} selectedFiles={selectedFiles} selectedValue={selectedValue} currentMenuItem={currentMenuItem}/>
        </div>
      </div>
    </div>
  );
};
