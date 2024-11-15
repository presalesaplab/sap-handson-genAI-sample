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
       //Esercizio 1
        return "";
    });

    srv.on("generateEmbeddings", async (req) => {
        //Esercizio 2
        return true;
    });

    srv.on("similaritySearch", async (req) => {
        //Esercizio 3
        return [];
    });


}