import { FastifyInstance } from "fastify";
import { createReadStream } from 'node:fs'
import { prisma } from "../lib/prisma";
import { openai } from "../lib/openai";
import { z } from 'zod';
import { streamToResponse, OpenAIStream } from "ai";

export async function generateAiCompletionRoute(app: FastifyInstance) {
    app.post('/ai/complete', async (req, reply) => {
        const bodySchema = z.object({
            videoId: z.string().uuid(),
            prompt: z.string(),
            temperature: z.number().min(0).max(1).default(0.5),
        });

        const { videoId, temperature, prompt } = bodySchema.parse(req.body);

        const video = await prisma.video.findUniqueOrThrow({
            where: {
                id: videoId,
            }
        })

        if (!video.transcription) {
            return reply.status(400).send({ error: 'Video transcription was not generated yet.' })
        }

        const promptMessage = prompt.replace('{transcription}', video.transcription);

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo-16k',
            temperature,
            messages: [
                { role: 'user', content: promptMessage}
            ],
            stream: true,
        });

        // Método de retornar a transcrição aos poucos para o usuário
        const stream = OpenAIStream(response);
        streamToResponse(stream, reply.raw, { // reply.raw ==> retorna a referencia nativa do NODEJS, forçando criar a configuração do CORS manualmente (pois o fastify não trabalha com o NODE nativo)
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Method': 'GET, POST, PUT, DELETE, OPTIONS',
            }
        }) 
        return 
    });
}