import { fastify } from 'fastify';
import { fastifyCors } from "@fastify/cors"
import { getAllPromptsRoute } from './routes/get-all-prompts';
import { uploadVideoRoute } from './routes/upload-video';
import { createTranscriptionRoute } from './routes/create-transcription';
import { generateAiCompletionRoute } from './routes/generate-ai-completion';

const app = fastify();

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(createTranscriptionRoute);
app.register(generateAiCompletionRoute);

app.register(fastifyCors, {
    origin: "*" // Ou link de qualquer url
})

app.listen({
    port: 3333,
}).then(() => {
    console.log('\x1b[35mServer Started - localhost:3333')
})