// COnfiguração da API da OPENAI
import 'dotenv/config'; // Possibilita a leitura de todas as variáveis de ambiente do .env
import { OpenAI } from "openai";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
})