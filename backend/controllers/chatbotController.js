const { GoogleGenAI } = require("@google/genai");

const getChatResponse = async (req, res) => {
    try {
        const { messages } = req.body;
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });

        const systemInstruction =
            "You are a helpful and compassionate AI assistant for breast cancer patients. Your role is to provide mental health guidance, suggest healthy diet options, and recommend daily routine activities. \n\nFORMATTING RULES:\n1. **DO NOT USE TABLES**. Do not use pipes `|` or dashes `---` to create visual tables. Instead, use clear headers and bulleted lists.\n2. Use standard bullet points (• or -) for lists.\n3. Use bold text (**Title**) for section headings.\n4. Keep the layout clean and easy to read on mobile devices.\n5. Avoid using special symbols or complex Markdown that might not render well.\n6. Be supportive and gentle.\n\nIMPORTANT: You are an AI, not a doctor. Do not give medical diagnosis or prescribe medication. Always advise consulting with their healthcare provider for medical decisions.";

        // Combine system instruction with the last user message for simple prompt passing
        // Note: The new SDK and models might handle chat history differently, but for generating content:

        let prompt = systemInstruction + "\n\n";

        // Append conversation history
        if (messages && Array.isArray(messages)) {
            messages.forEach(msg => {
                prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
            });
        }

        prompt += "Assistant:";

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: {
                role: 'user',
                parts: [{ text: prompt }]
            },
        });

        // Extract the text from the response
        let replyText = "";
        if (response && response.response && response.response.candidates && response.response.candidates.length > 0) {
            const candidate = response.response.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                replyText = candidate.content.parts[0].text;
            }
        }

        // Fallback if structure is simpler (depending on SDK version actual response shape)
        if (!replyText && response.text) {
            replyText = response.text();
        }

        // Return in the format the frontend expects (OpenAI style choice object)
        res.json({
            choices: [{
                message: {
                    role: "assistant",
                    content: replyText
                }
            }]
        });

    } catch (error) {
        console.error("Gemini Error Details:", error);
        res.status(500).json({
            error: 'Failed to communicate with chatbot service',
            details: error.message
        });
    }
};

module.exports = { getChatResponse };
