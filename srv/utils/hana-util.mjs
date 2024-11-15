import cds from "@sap/cds";
import { AzureOpenAiEmbeddingClient } from '@sap-ai-sdk/foundation-models';

/***********
 * METHODS *
 ***********/
const similaritySearchHANA = async (
    params
) => {
    const { embeddingTable,
        distanceFunctionName = 'COSINE_SIMILARITY', // ("COSINE_SIMILARITY", "DESC"), ("L2DISTANCE", "ASC")
        prompt = '',
        k = 5,
        additionalFilters = '',
        additionalFields = '' } = params;

    const vectorColumnName = params.vectorColumnName?.toUpperCase();
    const tx = cds.tx();
    const tableName = embeddingTable.name.toUpperCase().replaceAll('.', '_');

    try {

        const embeddingClient = new AzureOpenAiEmbeddingClient({
            modelName: 'text-embedding-ada-002',
            resourceGroup: 'default'
        });
        let embeddingResponse = await embeddingClient.run({
            input: prompt
        });
        const vectorEmbedding = embeddingResponse.getEmbedding();
        //const vectorEmbedding = await embeddingClient.embedQuery(prompt);

        var query = `SELECT TOP ${k} `
            + ` *, `
            + ` ${additionalFields} `
            + ` ${distanceFunctionName}("${vectorColumnName}", TO_REAL_VECTOR('[${vectorEmbedding.join(',')}]')) AS "DISTANCE" `
            + ` FROM "${tableName}" `
            + ` ${additionalFilters} `
            + ` ORDER BY "DISTANCE" ${distanceFunctionName == 'COSINE_SIMILARITY' ? 'DESC' : 'ASC'} `;

        const result = await tx.run(query);
        return result;

    } catch (error) {
        console.log(error);
        throw error;
    }




};

const array2VectorBuffer = (data) => {
    const sizeFloat = 4;
    const sizeDimensions = 4;
    const bufferSize = data.length * sizeFloat + sizeDimensions;

    const buffer = Buffer.allocUnsafe(bufferSize);
    // write size into buffer
    buffer.writeUInt32LE(data.length, 0);
    data.forEach((value, index) => {
        buffer.writeFloatLE(value, index * sizeFloat + sizeDimensions);
    });
    return buffer;
};

/***********
 * EXPORTS *
 ***********/
export {
    similaritySearchHANA,
    array2VectorBuffer
};