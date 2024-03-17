"use client";

import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
import { ChatLine } from "../chat/chat-line";
import { useChat, Message } from "ai-stream-experimental/react";
import { Input } from "../chat/input";
import { Button } from "../chat/button";
import { Spinner } from "../chat/spinner";
import { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { DarkModeToggle } from "./dark-mode-toggle";
import { Sidebar } from "../sideBar/sidebar";
import { MdMenu, MdClose } from "react-icons/md";
import { Dropdown } from 'flowbite-react';
import { supabase } from "@/lib/supabase-client";


interface Props {
  namespace: string;
  onMenuItemChange: (currentMenuItem: string) => void;
  onNavChange:(nav:boolean) => void;
  
}

export const TopBar: NextPage<Props> = ({ namespace , onMenuItemChange , onNavChange }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [chatbotData , setChatbotData] = useState<any[]>([])

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      initialMessages,
      body: { namespaceName: namespace, selectedFiles: selectedFiles },
    });

  useEffect(() => {
    setTimeout(() => scrollToBottom(containerRef), 100);
  }, [messages]);

  useEffect(() => {
    const fetchbots = async () => {
      try {
        const { data: chatbotData, error: chatbotError } = await supabase
          .from("chatbots")
          .select("*")
          .eq("name", namespace);

        if (chatbotError) {
          throw chatbotError;
        }

        setChatbotData(chatbotData);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const insertChannel = supabase.channel("chatbots");

    insertChannel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chatbots" },
        fetchbots
      )
      .subscribe();

    fetchbots();
  }, [namespace]);

  const [nav, setNav] = useState(false);

  function handlenav() {
    setNav(!nav);
    onNavChange(!nav);
  }

  const menuItems = 
  ['Start a New Project',
    'Ask Experts & Authors',
    'Library',
    'Ask TED',
    'Ask VCs',
    'Chat DEI',
    'Customer Service',
    'Chat'
]

  const handleCurrentMenuItem = (menuItem: string) =>{
        onMenuItemChange(menuItem ? menuItem : 'Chat');
  }

  return (
          <div className="flex h-16 items-center justify-between supports-backdrop-blur:bg-background/60  z-50 w-full border p-4 bg-background backdrop-blur mb-4 shadow-md rounded-sm">
            <span className="font-bold text-lg flex">{namespace}:
            {chatbotData.map((bot) => (
  <div key={bot.id}>
    <p>{bot.header}</p>
    {/* Render other properties as needed */}
  </div>
))}
            </span>
            <div className="space-x-2 flex flex-row items-center justify-center">
            <div
                className=""
              >
                <Dropdown label="" placement="bottom" dismissOnClick={false} className="bg-slate-100 border-none dark:bg-slate-900" renderTrigger={() => <span className=" border rounded-md px-4 py-1 flex bg-background cursor-pointer">Menu</span>}>
            {menuItems.map((item , value) => (
                <Dropdown.Item key={value} className="text-lg dark:text-white border-none" onClick={()=>handleCurrentMenuItem(item)}>{item}</Dropdown.Item>
            ))}
    </Dropdown>
              </div>
              <DarkModeToggle />
              <div
                className=" border rounded-md p-1 flex md:hidden"
                onClick={handlenav}
              >
                {nav ? <MdClose size={25} /> : <MdMenu size={25} />}
              </div>
            </div>
          </div>
  );
};
