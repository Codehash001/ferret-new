"use client"

import Balancer from "react-wrap-balancer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Message } from "ai/react";
import Markdown from "react-markdown";
import { formattedText } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

const convertNewLines = (text: string) =>
  text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));


interface ChatLineProps extends Partial<Message> {
  sources: { pageContent: string; metadata: any}[];
}

export function ChatLine({
  role = "assistant",
  content,
  sources,
}: ChatLineProps) {

  const [authors, setAuthors] = useState<{ pdfName: string; author: string }[]>([]);

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
            return { pdfName: source.metadata.pdfName, author: "Unknown Author" };
          }

          return {
            pdfName: source.metadata.pdfName,
            author: data?.author_name || "Unknown Author",
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
  const formattedMessage = convertNewLines(content);

  return (
    <div>
      <Card className="mb-2">
        <CardHeader>
          <CardTitle
            className={
              role !== "assistant"
                ? "text-amber-500 dark:text-amber-200"
                : "text-blue-500 dark:text-blue-200"
            }
          >
            {role === "assistant" ? "AI" : "You"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">          
        {formattedMessage}
        </CardContent>
        <CardFooter>
          <CardDescription className="w-full">
          {Object.entries(groupedSources).map(([pdfName, group], index) => (
              <Accordion type="single" collapsible className="w-full bg-slate-100 dark:bg-slate-900 rounded-xl mb-2" key={index}>
                <AccordionItem value={`pdf-${index}`}>
                  <AccordionTrigger>
                    <div className="flex">
                  <div className="font-bold">{`${authors.find((a) => a.pdfName === pdfName)?.author || 'Unknown Author'}`} -</div>
                  <div className="font-semibold ml-2">{`${modifyFileName(pdfName)}`}</div>
                  </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {group.map((source, sourceIndex) => (
                      <div key={sourceIndex}>
                          <div className="mb-4 shadow-md border rounded-md p-2">
                            <Markdown>
                            {source.pageContent}
                            </Markdown>
                            </div>
                      </div>
                    ))}
                      <a
                          href={`https://embicapmjtddkceauzpz.supabase.co/storage/v1/object/public/files/${pdfName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-md bg-green-500 font-medium text-white hover:bg-green-600"
                        >Link to source
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
