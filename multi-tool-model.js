import "dotenv/config"
import {GoogleGenAI} from "@google/genai"
import readlineSync from "readline-sync"

// gemini client
const ai=new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
})

// fn - 1
async function coininfo({coin}){
    const res=await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=inr`)
    const data=await res.json();
    return data;
}

// fn - 2
async function weatherinfo({city}){
    const res=await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
    const data=await res.json();
    return {
    temperature: data.current_condition[0].temp_C}
}

// all tools definition
const toolsdesc=[
    {
        functionDeclarations:[
            {
                name:"weatherinfo",
                description:"get the current weather of a city eg.delhi",
                parameters:{
                    type:"OBJECT",
                    properties:{
                        city:{
                            type:"STRING",
                            description:"name of the city"
                        }
                    },
                    required:["city"]
                }
            },{
                name:"coininfo",
                description:"get the current price of a coin eg.solana",
                parameters:{
                    type:"OBJECT",
                    properties:{
                        coin:{
                            type:"STRING",
                            description:"name of the coin"
                        }
                    },
                    required:["coin"]
                }
            }
        ]
    }
]
// 
const tools={
    "weatherinfo":weatherinfo,
    "coininfo":coininfo
}

async function main(query) {
    let history=[{
        role:"user",
        parts:[{text:query}]
    }]
    while(true){//as long as we dont get the final answer or llm have to call any tool
        const response=await ai.models.generateContent({
            model:"gemini-3.5-flash",
            contents:history,
            config:{
                tools:toolsdesc
            }
        })
        if(!response.functionCalls||response.functionCalls.length===0){//if no call then final output is here
            console.log("AI: ",response.text)
            break;
        }
        else{
            console.log("calling:",response.functionCalls); // log all calls

            history.push(response.candidates[0].content)//push llm calling tools response in the history (contains all functionCall parts)

            const responseParts=[];
            for(const functionCall of response.functionCalls){//loop over EVERY tool call, not just the first
                let result=await tools[functionCall.name](functionCall.args);//calling that tool (js)
                responseParts.push({
                    functionResponse:{
                        name:functionCall.name,
                        response:result
                    }
                });
            }

            history.push({//push the result of ALL tools in one user turn, matching the model's turn
                role:"user",
                parts:responseParts
            });
        }
    }
}

while(true){
    const query=readlineSync.question("You: ")
    if(query=="exit")
        break;
    else
        await main(query);
}