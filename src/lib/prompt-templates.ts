// Creates a standalone question from the chat-history and the current question
export const STANDALONE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

// Actual question you ask the chat and send the response to client
export const QA_TEMPLATE = `Do whatever user ask to do with given context.
Provide elated answer as longer as much you can.
If the question is not related to the given context, politely say sorry I dont know the answer.
Donot make up answers.
{context}

Question: {question}
Helpful answer in markdown:`;
