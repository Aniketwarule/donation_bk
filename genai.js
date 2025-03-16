import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PromptTemplate } from '@langchain/core/prompts';
import dotenv from 'dotenv';

const router = express.Router();

// Configure environment variables
dotenv.config();

// Initialize Gemini AI Client
const genAI = new GoogleGenerativeAI('AIzaSyBzRisNmv2lm0nw1fj4Kml_t-2V_KIQtn0');

// Basic route
router.get('/', (req, res) => {
    res.send('Hello World!');
});

// Endpoint to generate text using Gemini AI
router.post('/generate', async (req, res) => {
    try {
        // const inventory_data = await Inventory.find();
        // console.log(inventory_data);

        const template = 'hii there';

        // const prompt = new PromptTemplate({
        //     inputVariables: ["inventory_data"],
        //     template,
        // });

        // if (!prompt) {
        //     return res.status(400).json({ error: 'Prompt is required' });
        // }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        // const formattedPrompt = await prompt.format({ inventory_data: JSON.stringify(inventory_data) });
        const result = await model.generateContent(template);

        const response = result.response.text(); // Extract text response

        const responseData = response; // The raw response

        console.log(responseData)

        // // Extract JSON content from the response string
        // const jsonMatch = responseData.match(/```json\n([\s\S]*?)\n```/);

        // if (jsonMatch && jsonMatch[1]) {
        //     try {
        //         const extractedJson = JSON.parse(jsonMatch[1]); // Parse extracted JSON
        //         console.log("Extracted JSON:", extractedJson);
        //         res.json(extractedJson);
        //     } catch (error) {
        //         console.error("Error parsing JSON:", error);
        //     }
        // } else {
        //     console.error("No valid JSON found in response.");
        // }

        res.json({ response });
    } catch (error) {
        console.error('Error generating text:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
