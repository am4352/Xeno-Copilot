const { InferenceClient } = require("@huggingface/inference");

const hf = new InferenceClient(
  process.env.HUGGINGFACE_API_KEY
);

// More reliable than Mistral on HF Inference
const MODEL_ID = "Qwen/Qwen2.5-7B-Instruct";

/**
 * Parse audience intent into filter JSON
 */
const parseAudienceIntent = async (naturalLanguage) => {
  const prompt = `
Convert the following customer segment description into JSON.

Allowed fields:
- minSpent
- maxSpent
- inactiveDays
- city
- minOrders
- maxOrders

Only return valid JSON.

Customer segment:
"${naturalLanguage}"
`;

  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      return parseKeywords(naturalLanguage);
    }

    console.log("HF Key Exists:", !!process.env.HUGGINGFACE_API_KEY);
    console.log("Model:", MODEL_ID);

    const response = await hf.chatCompletion({
      model: MODEL_ID,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    const text =
      response?.choices?.[0]?.message?.content || "";

    console.log("AI Response:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return parseKeywords(naturalLanguage);
  } catch (error) {
    console.error("Audience Parse Error:");
    console.dir(error, { depth: null });

    return parseKeywords(naturalLanguage);
  }
};

/**
 * Generate marketing message
 */
const generateMessage = async (campaignContext) => {
  const channel = (campaignContext.channel || "whatsapp").toLowerCase();

  let channelInstructions = "";

  if (channel === "email") {
    channelInstructions = `
Generate ONLY an EMAIL marketing message.

Requirements:
- Professional email tone
- Include a subject line
- Include an email body
- Use {{name}} placeholder
- 100-250 words
- Do NOT generate SMS content
- Do NOT generate WhatsApp content

Format:

Subject: <subject>

Body:
<email body>
`;
  } else if (channel === "sms") {
    channelInstructions = `
Generate ONLY an SMS message.

Requirements:
- Maximum 160 characters
- Use {{name}} placeholder
- Include CTA
- Do NOT generate email content
- Do NOT generate WhatsApp content

Output ONLY the SMS text.
`;
  } else {
    channelInstructions = `
Generate ONLY a WhatsApp marketing message.

Requirements:
- Use {{name}} placeholder
- Maximum 500 characters
- Friendly conversational tone
- Include CTA
- Do NOT generate email content
- Do NOT generate SMS content

Output ONLY the WhatsApp message.
`;
  }

  const prompt = `
You are an expert marketing copywriter.

${channelInstructions}

Campaign Description:
${campaignContext.description}
`;

  try {
    if (!process.env.HUGGINGFACE_API_KEY) {
      return generateFallbackMessage(campaignContext);
    }

    console.log("Selected Channel:", channel);

    const response = await hf.chatCompletion({
      model: MODEL_ID,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const generatedText =
      response?.choices?.[0]?.message?.content;

    if (generatedText) {
      return generatedText.trim();
    }

    return generateFallbackMessage(campaignContext);
  } catch (error) {
    console.error("Generate Message Error:");
    console.dir(error, { depth: null });

    return generateFallbackMessage(campaignContext);
  }
};
/**
 * Fallback parser
 */
function parseKeywords(text) {
  const filters = {};
  const lower = text.toLowerCase();

  const spentMoreMatch = lower.match(
    /spent\s+(?:more\s+than|over|above|>=?)\s*[₹$]?\s*(\d+)/
  );

  if (spentMoreMatch) {
    filters.minSpent = parseInt(spentMoreMatch[1]);
  }

  const spentLessMatch = lower.match(
    /spent\s+(?:less\s+than|under|below|<=?)\s*[₹$]?\s*(\d+)/
  );

  if (spentLessMatch) {
    filters.maxSpent = parseInt(spentLessMatch[1]);
  }

  const inactiveMatch = lower.match(
    /(?:inactive|haven'?t\s+purchased|no\s+(?:orders?|purchases?)).*?(\d+)\s*days/
  );

  if (inactiveMatch) {
    filters.inactiveDays = parseInt(inactiveMatch[1]);
  }

  const cityMatch = lower.match(
    /(?:from|in|city)\s+(\w+)/
  );

  if (
    cityMatch &&
    !["the", "a", "an", "last", "past"].includes(cityMatch[1])
  ) {
    filters.city =
      cityMatch[1].charAt(0).toUpperCase() +
      cityMatch[1].slice(1);
  }

  const ordersMatch = lower.match(
    /(?:more\s+than|at\s+least|>=?)\s*(\d+)\s*orders?/
  );

  if (ordersMatch) {
    filters.minOrders = parseInt(ordersMatch[1]);
  }

  return filters;
}

/**
 * Fallback message generator
 */
function generateFallbackMessage(context) {
  const templates = [
    `Hi {{name}}, we miss you! 🎉 Enjoy 20% OFF on your next purchase. Use code COMEBACK20. Shop now!`,
    `Hey {{name}}! 👋 Enjoy flat 15% OFF this week. Offer ends soon. Shop now!`,
    `Hello {{name}}, thank you for being a valued customer! 💝 Get ₹500 OFF on your next order with code THANKYOU500.`,
  ];

  return templates[
    Math.floor(Math.random() * templates.length)
  ];
}

module.exports = {
  parseAudienceIntent,
  generateMessage,
};