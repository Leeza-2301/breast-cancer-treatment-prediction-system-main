const axios = require('axios');

const getChatResponse = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: 'OpenRouter API key not configured'
            });
        }

        // System Prompt
        const systemPrompt = {
            role: "system",
            content: `You are a helpful and compassionate AI assistant for breast cancer patients.

Your role:
- Provide mental health support
- Suggest healthy diet options
- Recommend daily routine activities

FORMATTING RULES:
- DO NOT use tables
- Use bullet points only
- Use **bold headings**
- Keep content mobile-friendly
- Be gentle and supportive

IMPORTANT:
You are NOT a doctor.
Do NOT give medical diagnosis or prescribe medicines.
Always suggest consulting a healthcare professional.`
        };

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "meta-llama/llama-3.1-8b-instruct:free", // ✅ FIXED MODEL
                messages: [systemPrompt, ...messages],
                temperature: 0.7,
                max_tokens: 500
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://breast-cancer-treat.vercel.app/',
                    'X-Title': 'Br.Care Chatbot'
                }
            }
        );

        return res.status(200).json({
            success: true,
            reply: response.data.choices[0].message.content
        });

    } catch (error) {
        console.error('OpenRouter Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        return res.status(500).json({
            error: 'Failed to communicate with chatbot service',
            details: error.response?.data?.error?.message || error.message
        });
    }
};

module.exports = { getChatResponse };
