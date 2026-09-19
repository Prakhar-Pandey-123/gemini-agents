import { GoogleGenAI } from "@google/genai";
import "dotenv/config"
import readlineSync from "readline-sync"

// creaeting a gemini client
const ai=new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
})

async function main(){
    // You're creating a chat session.which keeps history of convo

    const chat=ai.chats.create({
        model:"gemini-3.5-flash",
        history:[],
        config:{
            systemInstruction:`you are a roasting agent , roast the user in every reply like samay raina in short`
        }       
    })
        // this automactically pushes the user messages and system messages in the history object 
// history = [
// ]
// Then after messages=
//     history = [
    // {
    //     role: "user",
    //     parts: [{ text: "Hello" }]
    // },
    // {
    //     role: "model",
    //     parts: [{ text: "Hello bro..." }]
    // },]
    
    // const response=await chat.sendMessage({
    //     message:"what is ur name bro"
    // })
    // console.log(response.text);

    while(true){
        // takes input from user
        const question=readlineSync.question(" write something ");
        if(question=='exit') break;
        const response=await chat.sendMessage({
            message:question
        })
        console.log(response.text);
    }
}
await main();