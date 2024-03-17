"use client";

import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
import { useChat, Message } from "ai-stream-experimental/react";
import { useEffect, useRef, useState } from "react";
import { NextPage } from "next";
import { Sidebar } from "../sideBar/sidebar";
import { TopBar } from "../topBar/topBar";
import { Chat } from "../chat/chat";
import { MainTab } from "../mainTab/mainTab";
import { supabase } from "@/lib/supabase-client";
import { Spinner, TextInput } from "flowbite-react";

interface Props {
  namespace: string;
}

export const Parent: NextPage<Props> = ({ namespace }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState<number | null>(4);
  const [currentMenuItem, setCurrentMenuItem] = useState("Chat");
  const [nav, setNav] = useState(false);
  const [ispassword, setIsPassword] = useState<boolean>(false);
  const [isPasswordCorrect, setIsPasswordCorrect] = useState<boolean>(false);
  const [correctPassword, setCorrectPassword] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [primaryColor, setPrimaryColor] = useState<string>("#FFFFFF"); // Default color
  const [logoName, setLogoName] = useState<string>("ferret.png"); // Default logo

  const handlenav = () => {
    setNav(!nav);
  };

  const setPasswordInLocalStorage = (password: string) => {
    localStorage.setItem(`${namespace}_password`, password);
  };
  
  const getPasswordFromLocalStorage = (): string | null => {
    return localStorage.getItem(`${namespace}_password`);
  };

  const checkPasswordAndLoadContent = async () => {
    try {
      const storedPassword = getPasswordFromLocalStorage();
      console.log(storedPassword);

      if (storedPassword && storedPassword === userPassword) {
        setIsPasswordCorrect(true);
      } else {
        const { data, error } = await supabase
          .from("chatbots")
          .select("password, primary_color, logo_name")
          .eq("name", namespace);

        if (error) {
          throw error;
        }

        setPrimaryColor(data[0].primary_color);
        setLogoName(data[0].logo_name);

        if (data && data.length > 0 && data[0].password === userPassword) {
          setIsPasswordCorrect(true);
          setPasswordInLocalStorage(userPassword);
        }
      }
    } catch (error) {
      console.error("Error checking password:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPasswordAndLoadContent();
  }, [userPassword]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <Spinner />
        </div>
      </div>
    );
  }

  if (ispassword && !isPasswordCorrect) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="p-6 space-y-4 rounded-md shadow-md">
          <h1 className="text-2xl font-medium">
            Enter your password to continue
          </h1>
          <input
            id="password"
            placeholder="password"
            value={userPassword}
            onChange={(event) => setUserPassword(event.target.value)}
            required
            className="px-4 py-2 rounded-md border w-full"
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-row items-start md:space-x-10 w-full h-full relative">
        <div className="h-full w-[28%] hidden md:flex">
          <Sidebar
            chatbotname={namespace}
            onFileSelectionChange={setSelectedFiles}
            onSelectedValueChange={setSelectedValue}
            primaryColor={primaryColor}
            logoName={logoName}
          />
        </div>

        {nav ? (
          <>
            <div className="w-full h-full overflow-x-hidden bg-background absolute pt-20 md:hidden">
              <Sidebar
                chatbotname={namespace}
                onFileSelectionChange={setSelectedFiles}
                onSelectedValueChange={setSelectedValue}
                primaryColor={primaryColor}
                logoName={logoName}
              />
            </div>
          </>
        ) : (
          <></>
        )}

        <div className="md:w-[72%] w-full h-full">
          <div className="">
            <TopBar
              namespace={namespace}
              onMenuItemChange={setCurrentMenuItem}
              onNavChange={handlenav}
            />
          </div>
          <div className="h-full">
            <MainTab
              namespace={namespace}
              selectedFiles={selectedFiles}
              selectedValue={selectedValue}
              currentMenuItem={currentMenuItem}
            />
          </div>
        </div>
      </div>
    );
  }
};

export default Parent;
