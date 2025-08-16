import { askStudyBuddy } from "@/ai/flows/study-buddy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Invalid messages format", { status: 400 });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];

    // Get the chat history (all messages except the last one)
    const history = messages.slice(0, -1);

    console.log("API: Processing request");
    console.log("History length:", history.length);
    console.log("User message:", lastMessage.content);

    // Get the response from askStudyBuddy
    const responseText = await askStudyBuddy({
      history,
      message: lastMessage.content,
    });

    console.log(
      "API: Got response from Study Buddy, length:",
      responseText.length
    );

    // Create a simple text stream
    // When using streamProtocol: 'text', useChat expects plain text chunks
    const stream = new ReadableStream({
      start(controller) {
        // Split response into words for gradual streaming
        const words = responseText.split(" ");
        let wordIndex = 0;

        const sendNextChunk = () => {
          if (wordIndex < words.length) {
            const word = words[wordIndex];
            const isLastWord = wordIndex === words.length - 1;
            const content = word + (isLastWord ? "" : " ");

            // For text streaming, just send the plain text
            controller.enqueue(new TextEncoder().encode(content));
            wordIndex++;

            // Add a small delay between words for streaming effect
            setTimeout(sendNextChunk, 40);
          } else {
            // Close the stream when done
            controller.close();
          }
        };

        // Start streaming immediately
        sendNextChunk();
      },
    });

    // Return plain text stream
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in study-buddy API route:", error);

    // Handle different types of errors
    let errorMessage = "An error occurred while processing your request.";

    if (error instanceof Error) {
      if (
        error.message.includes("quota") ||
        error.message.includes("rate limit")
      ) {
        errorMessage =
          "Study Buddy is temporarily unavailable due to usage limits. Please try again in a few minutes.";
      } else if (error.message.includes("API key")) {
        errorMessage = "Study Buddy configuration error.";
      } else {
        errorMessage = error.message;
      }
    }

    // For text streaming, return plain text error
    return new Response(errorMessage, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
