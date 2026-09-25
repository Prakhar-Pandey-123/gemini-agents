import * as dotenv from 'dotenv'
dotenv.config();
import { TextLoader} from "@langchain/classic/document_loaders/fs/text";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters"
import {GoogleGenerativeAIEmbeddings} from "@langchain/google-genai"
import {Pinecone} from "@pinecone-database/pinecone"
import { PineconeStore } from "@langchain/pinecone"


async function indexing(){

    // loading the document
    const TXT_PATH='./node-js.txt'
    const textLoader=new TextLoader(TXT_PATH);
    const rawDocs=await textLoader.load();

    // now create chunks=think of it as a continuous block of text formed by division of a full page(s)
    const textSplitter=new RecursiveCharacterTextSplitter({
        chunkSize:500,
        chunkOverlap:50
    })
    const chunkedDocs=await textSplitter.splitDocuments(rawDocs);

    
    // configuring for creating embedding(vectors) for this chunked data
    // 
    const embeddings=new GoogleGenerativeAIEmbeddings({
        apiKey:process.env.GEMINI_API_KEY,
        model: 'gemini-embedding-001'
    })

    //  configure pinecone(it is a vector db)(configure basically means when we send/receive data from something then attach this extra info(api key) to every req)
    const pinecone=new Pinecone()
    const pineconeIndex=pinecone.Index(process.env.PINECONE_INDEX_NAME)


    // chunkeddocs --> embeddings --> save in db
    await PineconeStore.fromDocuments(chunkedDocs,embeddings,{
        pineconeIndex,
        maxConcurrency:5
    });

}

await indexing()




// npm i @langchain/core@latest
//  npm i @langchain/core @langchain/pinecone @pinecone-database/pinecone @langchain/community @langchain/google-genai @langchain/textsplitters --legacy-peer-deps
// npm install pdf-parse --legacy-peer-deps