//SAP AI SDK
import { AzureOpenAiChatClient } from '@sap-ai-sdk/foundation-models';
import { AzureOpenAiEmbeddingClient } from '@sap-ai-sdk/foundation-models';

//Utils
import { array2VectorBuffer, similaritySearchHANA } from "./utils/hana-util.mjs";

export default async (srv) => {

    //Entities
    const {
        Movie
    } = cds.entities;


    srv.on("generateStory", async (req) => {
        const {
            rank
        } = req.data;

        const theMovie = await SELECT
            .one
            .from(Movie)
            .where({
                RANK: rank
            });

        const chatClient = new AzureOpenAiChatClient({
            modelName: 'gpt-4o',
            modelVersion: 'latest',
            resourceGroup: 'default'
        });
        const response = await chatClient.run({
            messages: [
                {
                    role: 'system',
                    content: `Devi inventare una storia in italiano in base alla descrizione di un film che ti viene data.`
                },
                {
                    role: 'user',
                    content: theMovie.DESCRIPTION
                }
            ]
        });

        const responseContent = response.getContent();

        return responseContent;
    });

    srv.on("generateEmbeddings", async (req) => {

        const movieCollection = await SELECT
            .from(Movie);

        const embeddingClient = new AzureOpenAiEmbeddingClient({
            modelName: 'text-embedding-ada-002',
            resourceGroup: 'default'
        });

        for (let movie of movieCollection) {

            let textContent = `Description : ${movie.DESCRIPTION}, Genre: ${movie.GENRE}`
            let embeddingResponse = await embeddingClient.run({
                input: textContent
            });
            const embeddedText = embeddingResponse.getEmbedding();

            //let embeddedText = await embeddingClient.embedQuery(textContent);
            await UPDATE(Movie)
                .where({ RANK: movie.RANK })
                .with({
                    EMBEDDINGS: array2VectorBuffer(embeddedText)
                });

        }

        return true;
    });

    srv.on("similaritySearch", async (req) => {
        const {
            prompt
        } = req.data;

        const params = {
            embeddingTable: Movie,
            vectorColumnName: 'EMBEDDINGS',
            distanceFunctionName: 'COSINE_SIMILARITY',
            prompt: prompt,
            k: 5
        }

        const closestMovie = await similaritySearchHANA(params);

        return closestMovie;
    });


}