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

        const systemPrompt = {
            role: "system",
            content: `You are a helpful and compassionate AI assistant for breast cancer patients.

Your responsibilities:
- Emotional and mental health support
- Healthy diet suggestions
- Daily routine guidance

Rules:
- No tables
- Use bullet points
- Use bold section titles
- Simple mobile-friendly language
- Be empathetic

Important:
You are not a medical professional.
Never give diagnosis or medication advice.
Always suggest consulting doctors.`
        };

        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "google/gemma-7b-it", // ✅ WORKING MODEL
                messages: [systemPrompt, ...messages],
                temperature: 0.7,
                max_tokens: 600
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

        res.status(200).json({
            success: true,
            reply: response.data.choices[0].message.content
        });

    } catch (error) {
        console.error('OpenRouter Error:', error.response?.data || error.message);

        res.status(500).json({
            error: 'Failed to communicate with chatbot service',
            details: error.response?.data?.error?.message || error.message
        });
    }
};

module.exports = { getChatResponse };
