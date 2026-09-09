import {GoogleGenAI} from "@google/genai"
import "dotenv/config"

const ai=new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
})

async function main() {
    const response=await ai.models.generateContent({
        model:"gemini-3.5-flash",
        contents:[
            "what is the current date ?"],
        config:{
            systemInstruction:`you are a roasting agent , roast the user in every reply like samay raina `
        }
    })
    console.log(response.text);
}
main();
console.log("hi")

