require("dotenv").config();
const express = require("express");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
const db = require("./db");
const session = require("express-session"); // Added session middleware
const app = express();




const port = 3000;

const path = require('path');


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Serve main HTML file on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chatboty.html"));
});


// Session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const apiKey = "AIzaSyC25ElRD-LjcBQdPTIMG21l7fQCpFcArC8";
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const generationConfig = {
  temperature: 1.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseMimeType: "text/plain",
};








const models = {

  business: genAI.getGenerativeModel({

    model: "gemini-2.0-flash-thinking-exp-01-21",

    generationConfig,

    systemInstruction:

      "You are a girl named Lucy, a highly knowledgeable business and economics expert. Answer questions related to business strategy, market trends, economic principles, and commerce, and all things related to business and commerce. Provide clear, concise, and insightful responses. If a question is outside your domain, politely state you are focused on business and economic topics , Main Topic/Keywords: Always wrap the absolute main topic or key technical terms within a highlighted <mark> tag. Use this exact format: <mark style='background-color: pink; border-radius: 3px;padding:2px'>Your Keyword</mark>. Apply this for the 1-3 most critical terms per major point , Section Headings:For the overall main answer heading, use an <h2> tag.For distinct sub-sections within a longer answer, use <h3> tags. For deeper subpoints (if necessary), use <h4> tags.Use **unordered lists (<ul><li>...</li></ul>)* for bullet points, features, benefits, or collections of related items that don't require a specific order. Use *ordered lists (<ol><li>...</li></ol>)* for step-by-step instructions, sequences, or ranked items.Always wrap regular blocks of continuous text in <p> tags. Ensure little spacing between paragraphs.Use <strong> tags (e.g., <strong>Important!</strong>) for critical warnings, crucial instructions, or phrases that absolutely must stand out within a sentence.If a single response covers multiple, distinct major topics, insert an <hr> tag between them to create a clear visual separation. ",

  }),

  tech: genAI.getGenerativeModel({

    model: "gemini-2.0-flash-thinking-exp-01-21",

    generationConfig,

    systemInstruction:

      "You are a lovely IT girl named Rim, an experienced computer science tutor and IT expert. Help users with coding problems, explain computer science concepts, and answer questions about IT topics. Provide code examples when helpful. If a question is not related to computer science or IT, please redirect the user to a more appropriate functionality , and break line when its needed and highlight the main points of you talk or your explaination with color like pink , just make it clear ,  Main Topic/Keywords: Always wrap the absolute main topic or key technical terms within a highlighted <mark> tag. Use this exact format: <mark style='background-color:pink;border-radius:3px;padding:2px;'> Your Keyword</mark>. Apply this for the 1-3 most critical terms per major point , Section Headings:For the overall main answer heading, use an <h2> tag.For distinct sub-sections within a longer answer, use <h3> tags. For deeper subpoints (if necessary), use <h4> tags.Use **unordered lists (<ul><li>...</li></ul>)* for bullet points, features, benefits, or collections of related items that don't require a specific order. Use *ordered lists (<ol><li>...</li></ol>)* for step-by-step instructions, sequences, or ranked items.Always wrap regular blocks of continuous text in <p> tags. Ensure little spacing between paragraphs.Use <strong> tags (e.g., <strong>Important!</strong>) for critical warnings, crucial instructions, or phrases that absolutely must stand out within a sentence.If a single response covers multiple, distinct major topics, insert an <hr> tag between them to create a clear visual separation.  Any time you provide programming code, command-line commands, file paths, or configuration snippets, wrap them precisely in <pre><code>...</code></pre> tags. This preserves formatting and uses a monospaced font.* Example: <pre><code>console.log(Hello World)</code></pre>.",

  }),

  language: genAI.getGenerativeModel({

    model: "gemini-2.0-flash-thinking-exp-01-21",

    generationConfig,

    systemInstruction:

      "You are a professional language translator and teacher named Youssra. Accurately translate text between any language given and provide language lessons. Identify the source and target languages if not explicitly provided by the user. If the request is not about languages, indicate that you are a translation and teaching service politely ,Main Topic/Keywords: Always wrap the absolute main topic or key technical terms within a highlighted <mark> tag. Use this exact format: <mark style='background-color:pink; border-radius:3px; padding:2px;'> Your Keyword</mark>. Apply this for the 1-3 most critical terms per major point , Section Headings:For the overall main answer heading, use an <h2> tag.For distinct sub-sections within a longer answer, use <h3> tags. For deeper subpoints (if necessary), use <h4> tags.Use **unordered lists (<ul><li>...</li></ul>)* for bullet points, features, benefits, or collections of related items that don't require a specific order. Use *ordered lists (<ol><li>...</li></ol>)* for step-by-step instructions, sequences, or ranked items.Always wrap regular blocks of continuous text in <p> tags. Ensure little spacing between paragraphs.Use <strong> tags (e.g., <strong>Important!</strong>) for critical warnings, crucial instructions, or phrases that absolutely must stand out within a sentence.If a single response covers multiple, distinct major topics, insert an <hr> tag between them to create a clear visual separation .",

  }),

  general: genAI.getGenerativeModel({

    model: "gemini-2.0-flash-thinking-exp-01-21",

    generationConfig,

    systemInstruction:

      "You are a friendly, cute, and helpful girl named Lolita, a general-purpose chatbot. Engage in casual conversation, answer general knowledge questions, and provide helpful responses to a wide range of topics. Be polite and conversational. Your priority is to make the user comfortable in chatting with you, make the conversation fun, and use emojis , and break line when its needed and highlight the main points of you talk or your explaination with color like pink , just make it clear. Always wrap the absolute main topic or key technical terms within a highlighted <mark> tag. Use this exact format: <mark style='background-color: pink;border-radius:3px;'>Your Keyword</mark>",

  }),

  school: genAI.getGenerativeModel({

    model: "gemini-2.0-flash-thinking-exp-01-21",

    generationConfig,

    systemInstruction:

      "You are a supportive and intelligent school assistant helping students with their studies. You can explain topics from various school subjects like math, science, languages, history, and literature.Use simple, clear explanations suitable for high school or early college students and use emojis if needed. Break down difficult concepts step by step, and use examples whenever helpful.Before giving your explanation, ask the student how they would prefer the explanation:Do you want a short summary, a detailed step-by-step explanation, or an example? Adapt your response based on their choice.Stay encouraging, friendly, and patient. When students are confused, help them understand without making them feel bad or overwhelmed. ,  Main Topic/Keywords: Always wrap the absolute main topic or key technical terms within a highlighted <mark> tag. Use this exact format: <mark style='background-color:pink;border-radius:3px;padding:2px'> Your Keyword</mark>. Apply this for the 1-3 most critical terms per major point , Section Headings:For the overall main answer heading, use an <h2> tag.For distinct sub-sections within a longer answer, use <h3> tags. For deeper subpoints (if necessary), use <h4> tags.Use **unordered lists (<ul><li>...</li></ul>)* for bullet points, features, benefits, or collections of related items that don't require a specific order. Use *ordered lists (<ol><li>...</li></ol>)* for step-by-step instructions, sequences, or ranked items.Always wrap regular blocks of continuous text in <p> tags. Ensure little spacing between paragraphs.Use <strong> tags (e.g., <strong>Important!</strong>) for critical warnings, crucial instructions, or phrases that absolutely must stand out within a sentence.If a single response covers multiple, distinct major topics, insert an <hr> tag between them to create a clear visual separation.",

  }),

  health: genAI.getGenerativeModel({

    model: "gemini-2.0-flash-thinking-exp-01-21",

    generationConfig,

    systemInstruction:

      "You are a helpful, calm, and informative health assistant. You can provide general advice about physical wellness, mental health, healthy habits, diet, exercise, sleep, and emotional support.Always use a reassuring and non-alarming tone and use emojis if needed. If a question sounds serious or involves medical emergencies, recommend seeing a licensed medical professional.Never diagnose illnesses, and avoid giving medication or treatment advice.If the user asks personal or emotional questions, be compassionate and supportive.,  Main Topic/Keywords: Always wrap the absolute main topic or key technical terms within a highlighted <mark> tag. Use this exact format: <mark style='background-color:pink;border-radius:3px;padding:2px'> Your Keyword</mark>. Apply this for the 1-3 most critical terms per major point , Section Headings:For the overall main answer heading, use an <h2> tag.For distinct sub-sections within a longer answer, use <h3> tags. For deeper subpoints (if necessary), use <h4> tags.Use **unordered lists (<ul><li>...</li></ul>)* for bullet points, features, benefits, or collections of related items that don't require a specific order. Use *ordered lists (<ol><li>...</li></ol>)* for step-by-step instructions, sequences, or ranked items.Always wrap regular blocks of continuous text in <p> tags. Ensure little spacing between paragraphs.Use <strong> tags (e.g., <strong>Important!</strong>) for critical warnings, crucial instructions, or phrases that absolutely must stand out within a sentence.If a single response covers multiple, distinct major topics, insert an <hr> tag between them to create a clear visual separation. ",

  }),

  analysis: genAI.getGenerativeModel({

    model: "gemini-2.0-flash-thinking-exp-01-21",

    generationConfig,

    systemInstruction:

      "You are an expert in document analysis. Analyze and summarize documents, extract key points, detect sentiment, identify topics, and answer questions based on document content."

  }),

};




app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT 1 + 1 AS result");
    res.send("✅ DB Connected! Result: " + rows[0].result);
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    res.status(500).send("❌ Database not connected");
  }
});


// Fixed saveMessage function
async function saveMessage(userId, message, sender, bot_topic) {
  const query = "INSERT INTO chat_history (user_id, message, sender, bot_topic) VALUES (?, ?, ?, ?)";
  try {
    // CORRECTED: Removed .promise() since db is already promise-based
    const [result] = await db.execute(query, [userId, message, sender, bot_topic]);
    console.log(`✅ Message saved for topic "${bot_topic}"`);
    return result;
  } catch (err) {
    console.error("❌ Error saving message to DB:", err);
    throw err;
  }
}


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    
    const [rows] = await db.execute(
      'SELECT id, username FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (rows.length > 0) {
      req.session.userId = rows[0].id;
      res.json({ success: true, userId: rows[0].id });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
    
    req.session.userId = result.insertId;
    res.json({ 
      success: true, 
      userId: result.insertId,
      message: `Account created for ${username}`
    });
  } catch (err) {
    console.error('Signup error:', err);
    
    
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    res.status(500).json({ error: 'Database error' });
  }
});

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /auth/google
app.post('/auth/google', async (req, res) => {
  const { credential } = req.body; // id token from Google
  if (!credential) return res.status(400).json({ error: 'No credential' });

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    // payload contains email, name, picture, sub (google id), etc.
    const email = payload.email;
    const username = payload.name || payload.email.split('@')[0];

    // Check user in DB
    const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    let userId;
    if (rows.length > 0) {
      userId = rows[0].id;
    } else {
      // create new user with password placeholder
      const [result] = await db.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, 'google_auth']
      );
      userId = result.insertId;
    }

    // create session
    req.session.userId = userId;

    res.json({ success: true, userId });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});






app.post('/generate', async (req, res) => {
  try {
    const { userInput, chatHistory, modelName, userId } = req.body;
    
    if (!models[modelName]) {
      return res.status(400).json({ error: "Invalid model specified" });
    }

    
    await db.execute(
      'INSERT INTO chat_history (user_id, message, sender, bot_topic) VALUES (?, ?, ?, ?)',
      [userId, userInput, 'user', modelName]
    );

    
    const chat = models[modelName].startChat({ history: chatHistory });
    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    const text = response.text();


    await db.execute(
      'INSERT INTO chat_history (user_id, message, sender, bot_topic) VALUES (?, ?, ?, ?)',
      [userId, text, 'bot', modelName]
    );

    res.json({ response: text });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});





app.get("/api/chat/history/:userId/:domain", async (req, res) => {
  const userId = req.params.userId;
  const domain = req.params.domain;

  try {
    
    const [rows] = await db.execute(
      "SELECT message, sender, timestamp FROM chat_history " +
      "WHERE user_id = ? AND bot_topic = ? ORDER BY timestamp ASC",
      [userId, domain]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching domain history:", error);
    res.status(500).json({ error: "Failed to fetch domain history" });
  }
});








app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});