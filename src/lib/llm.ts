const QWEN_API_URL = "https://ws-njwq63exbhwz01in.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions";
const QWEN_API_KEY = "sk-ws-H.XILLMX.BVSo.MEYCIQC4pRuePMlA6LBsLySrpiDJpEzeERQYPdF0M_YcsS6hzQIhAI2p2nHLW0l7N6IY7duT10Fr10LmB3h7jOo6zMQzrApU";

interface LLMResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function callLLM({
  systemPrompt,
  userPrompt,
  imageBase64,
}: {
  systemPrompt: string;
  userPrompt: string;
  imageBase64?: string;
}): Promise<string> {
  const messages: any[] = [
    { role: "system", content: systemPrompt },
  ];

  if (imageBase64) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } },
      ],
    });
  } else {
    messages.push({ role: "user", content: userPrompt });
  }

  const res = await fetch(QWEN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${QWEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: "qwen-vl-max",
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM API error (${res.status}): ${errText}`);
  }

  const data: LLMResponse = await res.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("LLM returned empty response");
  }

  return content;
}
