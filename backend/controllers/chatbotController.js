const axios = require('axios');

const getChatResponse = async (req, res) => {
    const { messages } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // System prompt
    const systemPrompt = {
        role: "system",
        content: "You are a helpful and compassionate AI assistant for breast cancer patients. Your role is to provide mental health guidance, suggest healthy diet options, and recommend daily routine activities. \n\nFORMATTING RULES:\n1. **DO NOT USE TABLES**. Do not use pipes `|` or dashes `---` to create visual tables. Instead, use clear headers and bulleted lists.\n2. Use standard bullet points (• or -) for lists.\n3. Use bold text (**Title**) for section headings.\n4. Keep the layout clean and easy to read on mobile devices.\n5. Avoid using special symbols or complex Markdown that might not render well.\n6. Be supportive and gentle.\n\nIMPORTANT: You are an AI, not a doctor. Do not give medical diagnosis or prescribe medication. Always advise consulting with their healthcare provider for medical decisions."
    };

    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "mistralai/mistral-7b-instruct:free",
            messages: [systemPrompt, ...messages]
        }, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://breast-cancer-treat.vercel.app/",
                "X-Title": "Br.Care Chatbot"
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error("OpenRouter Error Details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

        // Send specific error details to frontend for debugging
        const upstreamError = error.response?.data?.error?.message || error.message;
        res.status(500).json({
            error: 'Failed to communicate with chatbot service',
            details: upstreamError
        });
    }
};

module.exports = { getChatResponse };
