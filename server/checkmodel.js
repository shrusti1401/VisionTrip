import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function listModels() {
  try {
    const response = await openai.models.list();
    console.log("Available models:");
    response.data.forEach(model => console.log(model.id));
  } catch (err) {
    console.error("Error fetching models:", err.message);
  }
}

listModels();
