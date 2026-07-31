import dotenv from "dotenv";
dotenv.config();
import { summarizeArticle } from "./src/summarize";

async function main() {
  console.log("API Key exists:", !!process.env.OPENAI_API_KEY);
  try {
    const result = await summarizeArticle("Test article about World Cup boycott");
    console.log("Summary:", result);
  } catch (err) {
    console.error("ERROR:", err);
  }
}

main();

