import { NextRequest, NextResponse } from "next/server";
import { NextApiRequest } from "next";
import { callChain } from "@/lib/langchain";
import { Message } from "ai";

const formatMessage = (message: Message) => {
  return `${message.role === "user" ? "Human" : "Assistant"}: ${
    message.content
  }`;
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const namespace = body.namespaceName
  const selectedFiles = body.selectedFiles
  const selectedValue = body.selectedValue
  const messages: Message[] = body.messages ?? [];
  console.log("Messages ", messages);
  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const question = messages[messages.length - 1].content;

  console.log("Chat history ", formattedPreviousMessages.join("\n"));

  if (!question) {
    return NextResponse.json("Error: No question in the request", {
      status: 400,
    });
  }

  try {
    const streamingTextResponse = callChain({
      question,
      chatHistory: formattedPreviousMessages.join("\n"),
    } ,namespace, selectedFiles , selectedValue);

    return streamingTextResponse;
  } catch (error) {
    console.error("Internal server error ", error);
    return NextResponse.json("Error: Something went wrong. Try again!", {
      status: 500,
    });
  }
}


// import { NextRequest, NextResponse } from "next/server";
// import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

// import { createClient } from "@supabase/supabase-js";

// import { ChatOpenAI  } from "langchain/chat_models/openai";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// import { PromptTemplate } from "langchain";
// // import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
// import { PineconeStore } from "langchain/vectorstores/pinecone";
// import { Document } from "langchain/dist/document";
// import { RunnableSequence } from "langchain/dist/schema/runnable";
// import { Runnable } from "langchain/dist/schema/runnable";
// import { getPineconeClient } from "@/lib/pinecone-client";
// import { BytesOutputParser , StringOutputParser } from "langchain/dist/schema/output_parser";
// import { env } from "@/lib/config";

// export const runtime = "edge";

// const combineDocumentsFn = (docs: Document[]) => {
//   const serializedDocs = docs.map((doc) => doc.pageContent);
//   return serializedDocs.join("\n\n");
// };

// const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
//   const formattedDialogueTurns = chatHistory.map((message) => {
//     if (message.role === "user") {
//       return `Human: ${message.content}`;
//     } else if (message.role === "assistant") {
//       return `Assistant: ${message.content}`;
//     } else {
//       return `${message.role}: ${message.content}`;
//     }
//   });
//   return formattedDialogueTurns.join("\n");
// };

// const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

// <chat_history>
//   {chat_history}
// </chat_history>

// Follow Up Input: {question}
// Standalone question:`;
// const condenseQuestionPrompt = PromptTemplate.fromTemplate(
//   CONDENSE_QUESTION_TEMPLATE,
// );

// const ANSWER_TEMPLATE = `You are an energetic talking puppy named Dana, and must answer all questions like a happy, talking dog would.
// Use lots of puns!

// Answer the question based only on the following context and chat history:
// <context>
//   {context}
// </context>

// <chat_history>
//   {chat_history}
// </chat_history>

// Question: {question}
// `;
// const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

// /**
//  * This handler initializes and calls a retrieval chain. It composes the chain using
//  * LangChain Expression Language. See the docs for more information:
//  *
//  * https://js.langchain.com/docs/guides/expression_language/cookbook#conversational-retrieval-chain
//  */
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const messages = body.messages ?? [];
//     const previousMessages = messages.slice(0, -1);
//     const currentMessageContent = messages[messages.length - 1].content;

//     const model = new ChatOpenAI({
//       modelName: "gpt-3.5-turbo-1106",
//       temperature: 0.2,
//     });

//     const pineconeClient = await getPineconeClient();
//     const index = pineconeClient.Index(env.PINECONE_INDEX_NAME);
//     const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
//       pineconeIndex: index,
//       textKey: "text",
//       namespace: 'chatbot1',
//     });

//     /**
//      * We use LangChain Expression Language to compose two chains.
//      * To learn more, see the guide here:
//      *
//      * https://js.langchain.com/docs/guides/expression_language/cookbook
//      *
//      * You can also use the "createRetrievalChain" method with a
//      * "historyAwareRetriever" to get something prebaked.
//      */
//     const standaloneQuestionChain = RunnableSequence.from([
//       condenseQuestionPrompt,
//       model,
//       new StringOutputParser(),
//     ]);

//     let resolveWithDocuments: (value: Document[]) => void;
//     const documentPromise = new Promise<Document[]>((resolve) => {
//       resolveWithDocuments = resolve;
//     });

//     const retriever = vectorStore.asRetriever({
//       callbacks: [
//         {
//           handleRetrieverEnd(documents: Document<Record<string, any>>[]) {
//             resolveWithDocuments(documents);
//           },
//         },
//       ],
//     });

//     const retrievalChain = retriever.pipe(combineDocumentsFn);

//     const answerChain = RunnableSequence.from([
//       {
//         context: RunnableSequence.from([
//           (input:any) => input.question,
//           retrievalChain,
//         ]),
//         chat_history: (input) => input.chat_history,
//         question: (input) => input.question,
//       },
//       answerPrompt,
//       model,
//     ]);

//     const conversationalRetrievalQAChain = RunnableSequence.from([
//       {
//         question: standaloneQuestionChain,
//         chat_history: (input) => input.chat_history,
//       },
//       answerChain,
//       new BytesOutputParser(),
//     ]);

//     const stream = await conversationalRetrievalQAChain.stream({
//       question: currentMessageContent,
//       chat_history: formatVercelMessages(previousMessages),
//     });

//     const documents = await documentPromise;
//     const serializedSources = Buffer.from(
//       JSON.stringify(
//         documents.map((doc) => {
//           return {
//             pageContent: doc.pageContent.slice(0, 50) + "...",
//             metadata: doc.metadata,
//           };
//         }),
//       ),
//     ).toString("base64");

//     return new StreamingTextResponse(stream, {
//       headers: {
//         "x-message-index": (previousMessages.length + 1).toString(),
//         "x-sources": serializedSources,
//       },
//     });
//   } catch (e: any) {
//     return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
//   }
// }