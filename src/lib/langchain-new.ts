// import {  RetrievalQAChain } from "langchain/chains";
// import { getVectorStore } from "./vector-store";
// import { getPineconeClient } from "./pinecone-client";
// import {
//   StreamingTextResponse,
//   experimental_StreamData,
//   LangChainStream,
// } from "ai-stream-experimental";
// import { streamingModel, nonStreamingModel } from "./llm";
// import { STANDALONE_QUESTION_TEMPLATE, QA_TEMPLATE } from "./prompt-templates";
// import { RunnableSequence } from "@langchain/core/runnables";
// import { formatDocumentsAsString } from "langchain/util/document";

// type callChainArgs = {
//   question: string;
//   chatHistory: string;
// };

// export async function callChain({ question, chatHistory }: callChainArgs , namespace : string , selectedFiles : string[]) {
//   try {
//     // Open AI recommendation
//     const sanitizedQuestion = question.trim().replaceAll("\n", " ");
//     const pineconeClient = await getPineconeClient();
//     const vectorStore = await getVectorStore(pineconeClient , namespace , selectedFiles);
//     const { stream, handlers } = LangChainStream({
//       experimental_streamData: true,
//     });
//     const data = new experimental_StreamData();

//     const chain = RunnableSequence.from([
//         {
//           // Extract the "question" field from the input object and pass it to the retriever as a string
//           sourceDocuments: RunnableSequence.from([
//             (input: { question: any; }) => input.question,
//             vectorStore.asRetriever,
//           ]),
//           question: (input: { question: any; }) => input.question,
//         },
//         {
//           // Pass the source documents through unchanged so that we can return them directly in the final result
//           sourceDocuments: (previousStepResult: { sourceDocuments: any; }) => previousStepResult.sourceDocuments,
//           question: (previousStepResult: { question: any; }) => previousStepResult.question,
//           context: (previousStepResult: { sourceDocuments: any; }) =>
//             formatDocumentsAsString(previousStepResult.sourceDocuments),
//         },
//         {
//           result: prompt.pipe(model).pipe(new StringOutputParser()),
//           sourceDocuments: (previousStepResult: { sourceDocuments: any; }) => previousStepResult.sourceDocuments,
//         },
//       ]);

//     // Question using chat-history
//     // Reference https://js.langchain.com/docs/modules/chains/popular/chat_vector_db#externally-managed-memory
//     chain
//       .call(
//         {
//           question: sanitizedQuestion,
//           chat_history: chatHistory,
//         },
//         [handlers]
//       )
//       .then(async (res: { sourceDocuments: any; }) => {
//         const sourceDocuments = res?.sourceDocuments;
//         const firstTwoDocuments = sourceDocuments.slice(0, 6);
//         console.log('first two docs' , firstTwoDocuments)
//         const pageContent = firstTwoDocuments.map(
//           ({ pageContent }: { pageContent: any }) => pageContent
//         );
//         console.log("already appended ", data);
//         data.append({
//           sources: firstTwoDocuments,
//         });
//         data.close();
//       });

//     // Return the readable stream
//     return new StreamingTextResponse(stream, {}, data);
//   } catch (e) {
//     console.error(e);
//     throw new Error("Call chain method failed to execute successfully!!");
//   }
// }
