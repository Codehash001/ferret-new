// Creates a standalone question from the chat-history and the current question
export const STANDALONE_QUESTION_TEMPLATE = `Given the following conversation and a follow up input question, make it better to understand for a AI model.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

// Actual question you ask the chat and send the response to client
export const QA_TEMPLATE = `You are an AI chatbot with context based knowledgebase.\n Do whatever you are asked to do with context.\n
       provide a well-detailed structurd answer in markdown format.\n
       START CONTEXT BLOCK\n
       {context}
       END OF CONTEXT BLOCK\n
       Question: {question}\n
    Helpful answer in markdown:
`;
