require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const QUIZ_FILE = path.join(__dirname, 'current-quiz.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Serve Vite build in production ──────────────────────────────────────────
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ── Webhook endpoint: n8n sends quiz data here ──────────────────────────────
app.post('/webhook/quiz', (req, res) => {
  try {
    const body = req.body;

    // Accept both wrapped { quiz: {...} } and raw { questions: [...] }
    let quizData = null;

    if (body?.quiz?.questions) {
      quizData = body.quiz;
    } else if (body?.questions) {
      quizData = body;
    } else if (Array.isArray(body)) {
      // n8n sometimes sends arrays
      const first = body[0];
      quizData = first?.quiz || first?.json?.quiz || first;
    }

    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
      return res.status(400).json({ error: 'Invalid quiz payload. Expected { quiz: { metadata, questions } }' });
    }

    // Stamp received time
    quizData.received_at = new Date().toISOString();

    fs.writeFileSync(QUIZ_FILE, JSON.stringify(quizData, null, 2));
    console.log(`✅ Quiz received: ${quizData.questions.length} questions`);

    res.json({
      success: true,
      message: `Quiz stored. ${quizData.questions.length} questions ready.`,
      quiz_url: `http://localhost:${PORT}/`,
    });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Helper to read JSON file safely (stripping UTF-8 BOM if present) ─────────
function readJsonFileSync(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(content);
}

// ── API: quiz app fetches current quiz ──────────────────────────────────────
app.get('/api/quiz', (req, res) => {
  if (!fs.existsSync(QUIZ_FILE)) {
    return res.status(404).json({ error: 'No quiz loaded yet. Send data to POST /webhook/quiz first.' });
  }
  try {
    const data = readJsonFileSync(QUIZ_FILE);
    res.json(data);
  } catch (err) {
    console.error('Error parsing quiz file:', err.message);
    res.status(500).json({ error: 'Corrupt quiz file.' });
  }
});

// ── API: guest quiz (featured assessment) ───────────────────────────────────
const GUEST_QUIZ_FILE = path.join(__dirname, 'guest-quiz.json');

app.get('/api/guest-quiz', (req, res) => {
  if (!fs.existsSync(GUEST_QUIZ_FILE)) {
    return res.status(404).json({ error: 'No guest quiz available.' });
  }
  try {
    const data = readJsonFileSync(GUEST_QUIZ_FILE);
    res.json(data);
  } catch (err) {
    console.error('Error parsing guest quiz file:', err.message);
    res.status(500).json({ error: 'Corrupt guest quiz file.' });
  }
});

// ── Helper to execute requests dynamically based on provider routing ────────
async function executeLlmRequest(provider, apiKey, model, prompt) {
  const providerKey = (provider || 'openrouter').toLowerCase().trim();

  if (providerKey === 'openrouter') {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://credible.com',
        'X-Title': 'Credible',
      },
      body: JSON.stringify({
        model: model || 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response received from OpenRouter');
    }
    return content;
  }

  if (providerKey === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response received from OpenAI');
    }
    return content;
  }

  if (providerKey === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-latest',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errText}`);
    }
    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) {
      throw new Error('Empty response received from Anthropic');
    }
    return content;
  }

  if (providerKey === 'gemini') {
    const resolvedModel = model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${resolvedModel}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3
        }
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error('Empty response received from Gemini');
    }
    return content;
  }

  throw new Error(`Unsupported API provider: ${provider}`);
}

// ── Clean JSON response helper ──────────────────────────────────────────────
function cleanJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
  }
  return cleaned.trim();
}

// ── Background Job Executor ─────────────────────────────────────────────────
async function runGeneration(jobId, apiKey, keyMeta, inputs) {
  const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    // 1. Update job to processing
    await supabaseAdmin
      .from('credible_generation_jobs')
      .update({ status: 'processing', started_at: new Date().toISOString() })
      .eq('id', jobId);

    const { videoTitle, videoUrl, videoDomain, targetLevel, language, userId } = inputs;

    // Start generation timer
    const startTime = Date.now();

    const provider = keyMeta.provider || 'openrouter';
    const useSame = keyMeta.use_same_model !== false;

    // Resolve models
    let model1 = 'google/gemini-2.5-flash';
    let model2 = 'google/gemini-2.5-flash';

    if (provider === 'openrouter') {
      model1 = useSame ? keyMeta.selected_model : (keyMeta.agent1_model || keyMeta.selected_model);
      model2 = useSame ? keyMeta.selected_model : (keyMeta.agent2_model || keyMeta.selected_model);
    } else if (provider === 'openai') {
      model1 = useSame ? (keyMeta.selected_model || 'gpt-4o') : (keyMeta.agent1_model || 'gpt-4o');
      model2 = useSame ? (keyMeta.selected_model || 'gpt-4o') : (keyMeta.agent2_model || 'gpt-4o');
    } else if (provider === 'anthropic') {
      model1 = useSame ? (keyMeta.selected_model || 'claude-3-5-sonnet-latest') : (keyMeta.agent1_model || 'claude-3-5-sonnet-latest');
      model2 = useSame ? (keyMeta.selected_model || 'claude-3-5-sonnet-latest') : (keyMeta.agent2_model || 'claude-3-5-sonnet-latest');
    } else if (provider === 'gemini') {
      model1 = useSame ? (keyMeta.selected_model || 'gemini-1.5-flash') : (keyMeta.agent1_model || 'gemini-1.5-flash');
      model2 = useSame ? (keyMeta.selected_model || 'gemini-1.5-flash') : (keyMeta.agent2_model || 'gemini-1.5-flash');
    }

    // 2. Read Agent 1 prompt and replace placeholders
    const prompt1Path = path.join(__dirname, 'prompts', 'agent1.txt');
    if (!fs.existsSync(prompt1Path)) {
      throw new Error('Agent 1 prompt file is missing from the server (prompts/agent1.txt)');
    }
    let prompt1 = fs.readFileSync(prompt1Path, 'utf8');
    prompt1 = prompt1
      .replace(/\{\{\s*\$json\['Video Title'\]\s*\}\}/g, videoTitle)
      .replace(/\{\{\s*\$json\['Video URL'\]\s*\}\}/g, videoUrl)
      .replace(/\{\{\s*\$json\['Video Domain'\]\s*\}\}/g, videoDomain)
      .replace(/\{\{\s*\$json\['Target Certification Level'\]\s*\}\}/g, targetLevel)
      .replace(/\{\{\s*\$json\.Language\s*\}\}/g, language);

    // 3. Call Agent 1
    const agent1Output = await executeLlmRequest(provider, apiKey, model1, prompt1);
    const cleanedAgent1Output = cleanJsonResponse(agent1Output);

    // 4. Read Agent 2 prompt and replace placeholders
    const prompt2Path = path.join(__dirname, 'prompts', 'agent2.txt');
    if (!fs.existsSync(prompt2Path)) {
      throw new Error('Agent 2 prompt file is missing from the server (prompts/agent2.txt)');
    }
    let prompt2 = fs.readFileSync(prompt2Path, 'utf8');
    prompt2 = prompt2.replace(/\{\{\s*\$json\.output\s*\}\}/g, cleanedAgent1Output);

    // 5. Call Agent 2
    const agent2Output = await executeLlmRequest(provider, apiKey, model2, prompt2);
    const cleanedAgent2Output = cleanJsonResponse(agent2Output);

    // Validate if the output is a valid JSON
    let quizData;
    try {
      quizData = JSON.parse(cleanedAgent2Output);
    } catch (parseErr) {
      console.error('JSON Parse error on Agent 2 output:', parseErr, cleanedAgent2Output);
      throw new Error(`Failed to parse Agent 2 output as JSON: ${parseErr.message}`);
    }

    if (!quizData.questions || quizData.questions.length === 0) {
      throw new Error('Generated quiz has no questions.');
    }

    // 6. Stamp metadata onto the quiz
    const quizId = `GEN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    quizData.quiz_id = quizId;
    quizData.received_at = new Date().toISOString();
    quizData.featured = false;
    
    // Also store original source video url & title if missing
    if (quizData.assessment_profile) {
      quizData.assessment_profile.source_video_url = quizData.assessment_profile.source_video_url || videoUrl;
      quizData.assessment_profile.source_video_title = quizData.assessment_profile.source_video_title || videoTitle;
    }

    // Embed generation metadata
    const durationMs = Date.now() - startTime;
    quizData.generation_metadata = {
      provider: provider,
      model: useSame ? model1 : `Agent 1: ${model1} | Agent 2: ${model2}`,
      agent1_model: model1,
      agent2_model: model2,
      generated_at: new Date().toISOString(),
      generation_duration: Math.round(durationMs)
    };

    // 7. Save to user_assessments table
    const { error: insertError } = await supabaseAdmin
      .from('user_assessments')
      .insert({
        id: quizId,
        user_id: userId,
        quiz_data: quizData
      });

    if (insertError) {
      throw new Error(`Failed to save generated assessment to DB: ${insertError.message}`);
    }

    // 8. Update job to completed
    await supabaseAdmin
      .from('credible_generation_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        assessment_id: quizId
      })
      .eq('id', jobId);

    // Update last_used in user_api_keys
    await supabaseAdmin
      .from('user_api_keys')
      .update({ last_used: new Date().toISOString() })
      .eq('user_id', userId);

    console.log(`✅ Generation job ${jobId} completed. Created assessment: ${quizId}`);

  } catch (err) {
    console.error(`❌ Generation job ${jobId} failed:`, err.message);
    await supabaseAdmin
      .from('credible_generation_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: err.message
      })
      .eq('id', jobId);
  }
}

// ── API: Generate Assessment ────────────────────────────────────────────────
app.post('/api/generate-assessment', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized. Authorization header is required.' });
  }

  const { videoTitle, videoUrl, videoDomain, targetLevel, language, apiKeyId } = req.body;

  if (!videoTitle || !videoUrl || !videoDomain || !apiKeyId) {
    return res.status(400).json({ error: 'Missing required fields (videoTitle, videoUrl, videoDomain, apiKeyId).' });
  }

  try {
    // Initialize user client to verify token & decrypt key
    const userClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized. Invalid authentication token.' });
    }

    // Fetch key details (provider, selected_model, agent1_model, agent2_model, use_same_model)
    const { data: keyMeta, error: metaError } = await userClient
      .from('user_api_keys')
      .select('provider, selected_model, agent1_model, agent2_model, use_same_model')
      .eq('id', apiKeyId)
      .single();

    if (metaError || !keyMeta) {
      return res.status(400).json({ error: `Failed to load API key details: ${metaError ? metaError.message : 'Not found'}` });
    }

    // Fetch and decrypt key using user client context
    const { data: decryptedKey, error: keyError } = await userClient.rpc('get_api_key_value', {
      p_key_id: apiKeyId
    });

    if (keyError || !decryptedKey) {
      return res.status(400).json({ error: `Failed to decrypt API key: ${keyError ? keyError.message : 'Key not found'}` });
    }

    const resolvedProvider = keyMeta.provider || 'openrouter';

    // Insert new queued job
    const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: job, error: jobError } = await supabaseAdmin
      .from('credible_generation_jobs')
      .insert({
        user_id: user.id,
        status: 'queued',
        provider: resolvedProvider,
        video_title: videoTitle
      })
      .select('id')
      .single();

    if (jobError) {
      return res.status(500).json({ error: `Failed to create generation job: ${jobError.message}` });
    }

    // Trigger background runner asynchronously
    runGeneration(job.id, decryptedKey, keyMeta, {
      videoTitle,
      videoUrl,
      videoDomain,
      targetLevel: targetLevel || 'Intermediate',
      language: language || 'English',
      userId: user.id
    });

    res.json({ success: true, jobId: job.id });

  } catch (err) {
    console.error('Error starting assessment generation:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── API: Proxy OpenRouter Models ────────────────────────────────────────────
app.get('/api/openrouter-models', async (req, res) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    if (!response.ok) {
      throw new Error(`OpenRouter models API returned ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error proxying OpenRouter models:', err.message);
    // Return empty list so client can fallback gracefully
    res.json({ data: [] });
  }
});

// ── API: Check Generation Job Status ─────────────────────────────────────────
app.get('/api/generation-jobs/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const userClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { data: job, error: jobError } = await userClient
      .from('credible_generation_jobs')
      .select('status, assessment_id, error_message, video_title')
      .eq('id', req.params.id)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ error: 'Job not found or access denied.' });
    }

    // If completed, fetch the quiz data as well to return to the client
    let quizData = null;
    if (job.status === 'completed' && job.assessment_id) {
      const { data: assessment } = await userClient
        .from('user_assessments')
        .select('quiz_data')
        .eq('id', job.assessment_id)
        .single();
      if (assessment) {
        quizData = assessment.quiz_data;
      }
    }

    res.json({
      status: job.status,
      assessmentId: job.assessment_id,
      errorMessage: job.error_message,
      videoTitle: job.video_title,
      quizData
    });

  } catch (err) {
    console.error('Error fetching job status:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Serve index.html for all other routes (SPA client-side routing) ─────────
app.get('/{*splat}', (req, res) => {
  if (fs.existsSync(distPath)) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Credible running at http://localhost:${PORT}`);
  console.log(`📡 Webhook endpoint: POST http://localhost:${PORT}/webhook/quiz`);
  console.log(`📋 Quiz API: GET http://localhost:${PORT}/api/quiz\n`);
});
