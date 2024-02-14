"use client";
import { NextPage } from "next";
import { Chat } from "../chat/chat";

interface Props {
  namespace: string;
  selectedFiles: string[];
  selectedValue: number|null;
  currentMenuItem: string;
}

export const MainTab: NextPage<Props> = ({ namespace, selectedFiles , selectedValue , currentMenuItem }) => {

  return (
    <div className="h-full w-full">
        { currentMenuItem== 'Chat' ?
            <Chat namespace={namespace} selectedFiles={selectedFiles} selectedValue={selectedValue} />
            :
            <>
            <div className="-w-full h-full flex flex-col items-center justify-center">
                <h1 className="text-2xl font-semibold">{`${currentMenuItem}`}</h1>
            </div>
            </>
        }
    </div>
  );
};
