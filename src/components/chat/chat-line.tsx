"use client"

import Balancer from "react-wrap-balancer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/chat/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/chat/accordion";
import { Message } from "ai/react";
import ReactMarkdown from 'react-markdown';
import { formattedText } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { PostgrestSingleResponse } from "@supabase/supabase-js";




interface ChatLineProps extends Partial<Message> {
  sources: { pageContent: string; metadata: any}[];
}

export function ChatLine({
  role = "assistant",
  content,
  sources,
}: ChatLineProps) {

  const [authors, setAuthors] = useState<{ pdfName: string; author: string; avatar?: string|null}[]>([]);
  const [avatar, setAvatar] = useState('');


  useEffect(() => {
    const fetchAuthors = async () => {
      const authorInfo = await Promise.all(
        sources.map(async (source) => {
          const { data, error } = await supabase
            .from("files_info")
            .select("name, author_name")
            .eq("name", source.metadata.pdfName)
            .single();
  
          if (error) {
            console.error("Error fetching author info:", error);
            return { pdfName: source.metadata.pdfName, author: "Unknown Author"};
          }
  
          // Fetch avatar information from the 'avatars' table
          const {data:avatarData  , error:avatarerror} = await supabase
            .from("authors")
            .select("avatar_file_name")
            .eq("author_name", data?.author_name)
            .single();

  
          return {
            pdfName: source.metadata.pdfName,
            author: data?.author_name || "Unknown Author",
            avatar: avatarData?.avatar_file_name || null
          };
        })
      );
  
      setAuthors(authorInfo);
    };
  
    fetchAuthors();
  }, [sources]);
  const groupedSources: { [key: string]: typeof sources } = {};
  sources.forEach((source) => {
    if (!groupedSources[source.metadata.pdfName]) {
      groupedSources[source.metadata.pdfName] = [];
    }
    groupedSources[source.metadata.pdfName].push(source);
  });

  function modifyFileName(fileName : string) {
    return fileName.replace(/_/g, ' ').replace('.pdf', '');
  }
  
  if (!content) {
    return null;
  }


  return (
    <div className="">
      <Card className="mb-2">
        <CardHeader>
          <CardTitle
            className={
              role !== "assistant"
                ? "text-amber-500 dark:text-amber-200"
                : "text-primary"
            }
          >
            {role === "assistant" ? "AI" : "You"}
          </CardTitle>
        </CardHeader>
        <CardContent className="">
        <ReactMarkdown>{content}</ReactMarkdown>         
        </CardContent>
        <CardFooter>
          <CardDescription className="w-full">
          {Object.entries(groupedSources).map(([pdfName, group], index) => (
              <Accordion type="single" collapsible className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl mb-2" key={index}>
                <AccordionItem value={`pdf-${index}`}>
                  <AccordionTrigger>
                    <div className="flex flex-row items-center">
                    <img
      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${authors.find((a) => a.pdfName === pdfName)?.avatar}`}
      className="h-6 w-6 rounded-full border bg-yellow-400 mr-2"
      alt="Author Avatar"
    />
                  <div className="font-bold">{`${authors.find((a) => a.pdfName === pdfName)?.author || 'Unknown Author'}`} -</div>
                  <div className="font-semibold ml-2">{`${modifyFileName(pdfName)}`}</div>
                  </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {group.map((source, sourceIndex) => (
                      <div key={sourceIndex}>
                          <div className="mb-4 shadow-md border rounded-md p-2">
                            <ReactMarkdown>
                            {source.pageContent}
                            </ReactMarkdown>
                            </div>
                      </div>
                    ))}
                      <a
                          href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/files/${pdfName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-md bg-primary font-medium text-white hover:opacity-90"
                        >Source Material
                      </a>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </CardDescription>
        </CardFooter>
      </Card>
    </div>
  );
}
