import { GoogleGenAI } from "@google/genai";
import "dotenv/config"
import readlineSync from "readline-sync"

const ai=new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
})

async function main(){
    const chat=ai.chats.create({
        model:"gemini-3.5-flash",
        history:[],
        config:{
            systemInstruction:`you are a roasting agent , roast the user in every reply like samay raina`
        }       
    })    
    // const response=await chat.sendMessage({
    //     message:"what is ur name bro"
    // })
    // console.log(response.text);

    while(true){
        const question=readlineSync.question(" write something ");
        if(question=='exit') break;
        const response=await chat.sendMessage({
            message:question
        })
        console.log(response.text);
    }
}
await main();