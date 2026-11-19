import * as dotenv from 'dotenv'
dotenv.config();
import readlineSync from "readline-sync"
import {GoogleGenerativeAIEmbeddings,ChatGoogleGenerativeAI} from "@langchain/google-genai"
import { Pinecone } from "@pinecone-database/pinecone";
import {PromptTemplate} from '@langchain/core/prompts'
import {StringOutputParser} from "@langchain/core/output_parsers"
import {RunnableSequence} from "@langchain/core/runnables"


// configuring the gemini embed model
const embeddings=new GoogleGenerativeAIEmbeddings({
    apiKey:process.env.GEMINI_API_KEY,
    model:'gemini-embedding-001'
})


// configure vector db
const pinecone=new Pinecone();
const pineconeIndex=pinecone.Index(process.env.PINECONE_INDEX_NAME);

// using gemini model
const model=new ChatGoogleGenerativeAI({
    apiKey:process.env.GEMINI_API_KEY,
    model:'gemini-3.5-flash-lite',
    temperature:0.3
})


async function chatting(question) {

    // user question ki embeddings banao
    const queryVector=await embeddings.embedQuery(question);


    // search similar vectors in db for the created vector of that user question
    const searchResult=await pineconeIndex.query({
        topK:2,
        vector:queryVector,
        includeMetadata:true//inclue human readable form
    })

    // join all the searchresult's metadata text
    const context=searchResult.matches
            .map(match=>match.metadata.text).join("\n\n");

    // system prompt
    const promptTemplate=PromptTemplate.fromTemplate(`you are assistant answer question based on provided documentation.DO NOT ANSWER ANYTHING OUT OF THIS CONTEXT
    context:${context} `)

// all this for getting llm answer
    const chain=RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
    ])

    const answer=await chain.invoke({
        context:context,
        question:question,
    })

    console.log(answer);
}


async function main(){
    const userProblem=readlineSync.question("ask me something related to nodejs --");
    await chatting(userProblem);
    main();
}

main();