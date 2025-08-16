import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This utility is not strictly necessary for the current implementation with ReadableStream,
// but it's a good utility to have for stream conversions.
// It converts a Node.js stream to a browser-compatible ReadableStream.
export function StreamToReader(
  stream: NodeJS.ReadableStream
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      stream.on("end", () => {
        controller.close();
      });
      stream.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      stream.destroy();
    },
  });
}
