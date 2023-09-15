import { FastifyInstance } from "fastify";
import { fastifyMultipart } from '@fastify/multipart';
import { prisma } from "../lib/prisma";
import path from "node:path";
import { randomUUID } from "node:crypto";
import fs from 'node:fs';
import { pipeline } from "node:stream"; // Possibilita que o sistema espere que todo o upload do arquivo termine (API PROMISIFY)
import { promisify } from "node:util"; // Possibilita a utilização do async await do javascript

const pump = promisify(pipeline);

export async function uploadVideoRoute(app: FastifyInstance) {
    // Upload de arquivo utilizando o Fastify-multipart
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 1_048_576 * 25, // 1.048.576 * 25 --> 25mb
        }
    });

    app.post('/videos', async (req, reply) => {
        const data = await req.file()

        if (!data) {
            return reply.status(400).send({ message: 'Missing File Input.' })
        }

        // Extensão do arquivo
        const extension = path.extname(data.filename);

        // Apenas arquivos mp3 sejam carregados
        if (extension !== '.mp3') {
            return reply.status(400).send({ error: 'Invalid input type, please upload a MP3.' })
        }

        // Obtendo o nome do arquivo e criando um novo utilizando sua extensão
        const fileBaseName = path.basename(data.filename, extension);
        const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`

        // Diretório de upload do arquivo
        const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName);

        // Upload do arquivo pump.(dados do arquivo [string], nome do arquivo) --> vai sendo salvo de pouco em pouco
        await pump(data.file, fs.createWriteStream(uploadDestination))
    
        const video = await prisma.video.create({
            data: {
                name: data.filename,
                path: uploadDestination,
            }
        })

        return {video}
    });
}