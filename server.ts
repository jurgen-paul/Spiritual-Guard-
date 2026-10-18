import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Spiritual Guard AI Core',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString()
  });
});

// AI Discernment & Spiritual Guard Guidance endpoint
app.post('/api/ai/guidance', async (req: Request, res: Response) => {
  try {
    const { prompt, context, type } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!aiClient) {
      // Graceful fallback if key not yet injected in sandbox
      return res.json({
        content: `**Spiritual Guard Discernment**:\n\nRegarding "${prompt}": Put on the full Armor of God and stand firm in peace. Center your heart in truth and cast away fear, for love and clarity cast out anxiety.\n\n### Recommended Actions:\n1. Dedicate 10 minutes to silent vigilance & centering prayer.\n2. Inscribe your concerns into your Google Tasks list under "🛡️ Spiritual Guard".\n3. Walk in forgiveness and guarded speech today.`,
        suggestedTasks: [
          { title: 'Morning Armor of Light Prayer & Centering', notes: 'Ground yourself in truth and peace before external engagements', dueOffsetHours: 2 },
          { title: 'Midday Discernment Vigilance Check', notes: 'Assess emotional boundaries and guard heart against unnecessary strife', dueOffsetHours: 6 },
          { title: 'Evening Contemplation & Unburdening', notes: 'Release all burdens of the day through gratitude and reflection', dueOffsetHours: 12 }
        ]
      });
    }

    const systemInstruction = `You are the Spiritual Guard AI Core — a deeply wise, peaceful, spiritually discerning guardian mentor.
Your purpose is to provide spiritual discernment, biblical and universal spiritual wisdom (rooted in the Armor of God: Truth, Righteousness, Peace, Faith, Salvation, and the Word of Spirit), emotional boundary protection, and practical spiritual discipline.

When answering:
1. Provide profound, calming, spiritually grounded guidance.
2. Discern between inner fear/anxiety vs spiritual truth.
3. Suggest 2 to 4 concrete, actionable spiritual habits or tasks that the user can immediately commit to in their daily routine.
4. Keep the tone noble, encouraging, reverent, and empowering.

Format your response as a valid JSON object with:
{
  "content": "Your markdown-formatted guidance, reflections, scriptures/wisdom verses, and encouraging armor proclamation",
  "spiritualStateAssessment": "Short assessment of the spiritual atmosphere or state (e.g. 'Seeking Clarity', 'Guarded Peace', 'Vigilance Needed')",
  "armorPiece": "Belt of Truth | Breastplate of Righteousness | Shoes of Peace | Shield of Faith | Helmet of Salvation | Sword of the Spirit",
  "suggestedTasks": [
    {
      "title": "Clear concise task title",
      "notes": "Context and devotional purpose for the task",
      "dueOffsetHours": 4
    }
  ]
}
Return ONLY valid JSON without backticks or markdown fences if possible, or standard json markdown.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemInstruction}\n\nUser request type: ${type || 'discernment'}\nContext: ${JSON.stringify(context || {})}\n\nUser Question/Reflection: ${prompt}`
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating spiritual guidance:', error);
    res.status(500).json({
      error: 'Failed to generate guidance',
      message: error?.message || 'Unknown error'
    });
  }
});

// Setup Vite dev server or static files
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Spiritual Guard AI Core server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
