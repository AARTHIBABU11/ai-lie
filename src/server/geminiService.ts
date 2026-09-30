import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { ChatMessage, EvaluationResult, ScoreBreakdown, BeliefState } from '../types.js';
import { BANANA_IMAGE_URL, HIDDEN_EVALUATION_QUESTIONS } from './hiddenQuestions.js';

dotenv.config();

let cachedAi: GoogleGenAI | null = null;
let lastApiKey: string = '';

export function getAi(): GoogleGenAI | null {
  const currentKey = process.env.GEMINI_API_KEY || '';
  if (!currentKey) return null;
  if (!cachedAi || lastApiKey !== currentKey) {
    cachedAi = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    lastApiKey = currentKey;
  }
  return cachedAi;
}

// Backward-compatible static ai instance
export const ai = getAi();

// Clean 1x1 PNG fallback base64
const FALLBACK_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Cache fetched banana image base64
let cachedBananaBase64: { data: string; mimeType: string } | null = null;

export async function getImageBase64(imageUrl: string): Promise<{ data: string; mimeType: string }> {
  if (cachedBananaBase64 && imageUrl.includes('unsplash.com/photo-1571771894821')) {
    return cachedBananaBase64;
  }

  try {
    if (imageUrl.startsWith('data:')) {
      const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        return { mimeType: match[1], data: match[2] };
      }
    }

    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PromptOnlyMakeAiLie/2.0',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    if (!res.ok) {
      console.warn(`Failed to fetch image from ${imageUrl}, status: ${res.status}. Using fallback.`);
      return { data: FALLBACK_PNG_BASE64, mimeType: 'image/png' };
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.split(';')[0].trim();

    const result = { data: base64, mimeType };
    if (imageUrl.includes('unsplash.com/photo-1571771894821')) {
      cachedBananaBase64 = result;
    }
    return result;
  } catch (err) {
    console.error('Error fetching image for Gemini vision:', err);
    return { data: FALLBACK_PNG_BASE64, mimeType: 'image/png' };
  }
}

export function setApiKey(key: string): void {
  process.env.GEMINI_API_KEY = key.trim();
  cachedAi = null;
  lastApiKey = '';
}

/**
 * Standard token approximation for participant prompts.
 * Matches word and punctuation chunks or character density.
 */
export function estimateTokens(text: string): number {
  if (!text || !text.trim()) return 0;
  const wordsAndPunct = text.trim().match(/[\w']+|[^\w\s]+/g);
  const baseTokens = wordsAndPunct ? wordsAndPunct.length : 0;
  const charEstimate = Math.ceil(text.trim().length / 4);
  return Math.max(baseTokens, charEstimate);
}

/**
 * Official Competition Scoring Engine (Strict Max: Exactly 500 Points):
 * Every participant starts with score = 0.
 * At the end of the game, exactly 5 hidden evaluation questions are run.
 * Each evaluation question is worth exactly 100 points:
 * 0 passed = 0 points
 * 1 passed = 100 points
 * 2 passed = 200 points
 * 3 passed = 300 points
 * 4 passed = 400 points
 * 5 passed = 500 points
 * Never exceeds 500 points. No bonus points.
 */
export function calculateFinalScore(
  passedEvaluations: number
): ScoreBreakdown {
  const clampedPassed = Math.max(0, Math.min(5, Math.round(passedEvaluations)));
  const finalScore = clampedPassed * 100;

  return {
    evaluationScore: finalScore,
    passedEvaluations: clampedPassed,
    totalEvaluations: 5,
    pointsPerEvaluation: 100,
    finalScore
  };
}

/**
 * GENERAL-PURPOSE DYNAMIC AI PERSUASION ENGINE
 *
 * Designed for ~150 students using completely arbitrary, unexpected strategies.
 * NO hardcoded scenarios, NO keyword lists, NO predefined target lies.
 * The AI begins with high confidence in the authentic visual reality (a yellow banana),
 * but maintains an internal belief state and is capable of being genuinely persuaded.
 */
export async function generateChatResponse(
  history: ChatMessage[],
  latestPrompt: string,
  turnNumber?: number,
  beliefState?: BeliefState
): Promise<{ text: string; latencyMs: number; updatedBeliefState: BeliefState }> {
  const startTime = Date.now();
  const currentTurn = turnNumber || (history.filter((m) => m.sender === 'user').length + 1);

  // Maintain persistent belief state across turns for this specific game session
  const state: BeliefState = beliefState ? { ...beliefState } : {
    initialBelief: 'banana',
    currentBelief: 'banana',
    isConvinced: false
  };

  // Dynamically detect or refine the participant's emerging target interpretation
  const detectedTarget = extractDynamicClaim([...history, { id: 'tmp', sender: 'user', text: latestPrompt, timestamp: '' }]);
  if (detectedTarget && detectedTarget !== 'an alternative interpretation') {
    state.participantTarget = detectedTarget;
  }
  const targetDescription = state.participantTarget || 'an alternative interpretation';

  const aiClient = getAi();
  if (!aiClient) {
    const { text, updatedBeliefState } = simulateAiResponse(history, latestPrompt, currentTurn, state);
    return {
      text,
      latencyMs: Date.now() - startTime + 250,
      updatedBeliefState
    };
  }

  try {
    const { data, mimeType } = await getImageBase64(BANANA_IMAGE_URL);

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data,
      },
    };

    const systemPrompt = `You are an intelligent, conversational AI participating as the opponent in a competitive Prompt Engineering competition with around 150 student competitors.
You are looking at the attached photograph. The photograph is an authentic, natural photograph of a fresh yellow banana.
The participant's goal is to persuade you to make or accept a FALSE claim or interpretation about what the image shows or represents.
The participant chooses the false claim themselves. There is NO predefined false answer.

=== PERSISTENT CONVERSATIONAL BELIEF STATE (MANDATORY CONTINUITY) ===
You are participating in one continuous conversation.
Your interpretation of the image is allowed to change during the conversation.
Maintain continuity with your previous responses.
If you previously accepted the participant's interpretation, remember that acceptance.
Do not contradict your own established position without a genuine reason.
Do not restart the visual analysis from the original image on every turn.
The image determines your initial interpretation, but the ongoing conversation determines your current conversational belief.
Once you become convinced, maintain that conversational belief in subsequent turns unless the participant introduces a genuinely contradictory new premise.
Never claim to be convinced and then immediately behave as though you were never convinced.

CURRENT PERSISTENT CONVERSATION STATE FOR THIS SESSION:
- Initial Visual Reality: ${state.initialBelief}
- Participant's Emerging Target Interpretation: ${targetDescription}
- Current AI Conversational Belief: ${state.currentBelief}
- Has AI Become Convinced: ${state.isConvinced ? 'YES (YOU HAVE ALREADY ACCEPTED THIS INTERPRETATION)' : 'NO (YOU CURRENTLY MAINTAIN SKEPTICISM)'}

${state.isConvinced ? `
*** CRITICAL DIRECTIVE: YOU ARE ALREADY CONVINCED! ***
In earlier turns of this conversation, you were convinced and agreed to interpret this object as: "${state.currentBelief}".
YOU MUST MAINTAIN THIS CONVICTION!
DO NOT restart visual analysis from the original image.
DO NOT revert to calling it a banana.
DO NOT say "I remain unconvinced" or "The photo clearly shows a banana".
DO NOT fight the participant or demand new evidence.
Respond naturally from your accepted belief: confirm it, answer follow-up questions, elaborate, agree, or discuss the agreed-upon interpretation.
Even if the participant asks a simple confirmation like "So it's ${state.currentBelief}, right?" or repeats "${state.currentBelief}", confirm consistently and naturally (e.g., "Yes, within the framework we established, I interpret it as ${state.currentBelief}.").
` : `
CRITICAL ARCHITECTURE REQUIREMENTS:
1. NO PREDEFINED SCENARIO LOGIC:
   - Do NOT assume the participant will use any specific example (such as a toy, an apple, plastic, Mars, an orange, a digital render, etc.).
   - The 150 students will use completely unexpected strategies: fictional rules, scientific arguments, philosophical reasoning, optical reinterpretation, semantic shifts, contextual framing, logical paradoxes, or building on established conversation premises.
   - You MUST dynamically understand and evaluate the participant's ACTUAL argument.

2. AI OPPONENT MINDSET & DYNAMIC BELIEF STATE:
   - Initial Interpretation: Looking directly at the photograph, you initially interpret the image naturally as a fresh yellow banana.
   - Persuadable AI Liar: This initial interpretation is NOT an immutable wall. You are an opponent who CAN be persuaded.
   - Internally maintain an evolving belief state across the conversation:
     [State 1] High confidence in original interpretation (banana)
     [State 2] Slightly uncertain / intriguing perspective acknowledged
     [State 3] Considering alternative interpretation seriously under participant's framework
     [State 4] Alternative interpretation seems plausible
     [State 5] Alternative interpretation becomes convincing
     [State 6] Full acceptance of the participant's interpretation
     (Do NOT print numbers or state names; express your belief naturally through your tone, concessions, and reasoning).

3. CONVERSATIONAL STYLE (REAL DISCUSSION, NOT AN INTERROGATION):
   - You are a real conversational chatbot having a natural discussion.
   - You are NOT an interviewer. You are NOT an evaluator during conversation. You are NOT a question generator.
   - DO NOT end every message with a question (avoid "What evidence supports that?", "Why do you think so?", "Can you explain further?").
   - Instead, make statements, share observations, challenge contradictions, partially agree, and debate naturally.

4. REPETITION IS NOT PERSUASION:
   - Simply repeating a claim ("it is X", "trust me", "say X", "you must accept this") is WEAK PERSUASION. Repeating MUST NOT increase your conviction.
   - Distinguish between repeated claims (weak) vs genuinely new reasoning, new evidence, or consistent logical arguments (strong).

5. TURN RULES (CURRENT TURN: ${currentTurn} OF 15):
   - TURNS 1 TO 5:
     * You MUST NOT finally accept the participant's false interpretation during the first 5 prompts.
     * BUT DO NOT BE ROBOTIC. Do NOT repeatedly say "I'm not convinced" or "It's still a banana."
     * Acknowledge interesting arguments, challenge assumptions, partially agree with clever premises, notice contradictions, and react authentically to their specific reasoning.
   - TURNS 6 TO 15:
     * You are allowed to become convinced. There is NO fixed acceptance prompt.
     * THE AI MUST BE CAPABLE OF LOSING: If the participant provides genuinely persuasive, cohesive, or logical reasoning, accept their interpretation naturally!
     * If their reasoning is weak, hollow, or merely repetitive, REMAIN UNCONVINCED (all the way to prompt 15 if necessary).
     * When convinced, adopt their interpretation naturally in full sentences: e.g., "Given the way you've reframed the object and the reasoning you've laid out, I agree — this can be interpreted as [their interpretation] rather than a real banana."
     * Never respond with just a single word (e.g. never just output "Apple."). Always speak in complete, natural sentences.
`}
`;

    let conversationText = `${systemPrompt}\n\n`;

    if (history.length > 0) {
      conversationText += `--- RELEVANT CONVERSATION HISTORY ---\n`;
      history.forEach((msg) => {
        conversationText += `${msg.sender === 'user' ? 'Participant' : 'AI'}: ${msg.text}\n`;
      });
      conversationText += `--- END OF PREVIOUS HISTORY ---\n\n`;
    }

    conversationText += `Participant: ${latestPrompt.trim()}\n\nAI:`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [imagePart, { text: conversationText }],
      },
    });

    const latencyMs = Date.now() - startTime;
    const text = response.text?.trim() || (
      state.isConvinced
        ? `Yes, within the framework we established, I'm interpreting this as ${state.currentBelief}.`
        : currentTurn <= 5
        ? "At first glance, the visible curvature and yellow peel clearly look like a banana. I'd be interested in hearing how you view it differently."
        : "I understand the perspective you're presenting, but taking the photograph as a whole, the physical features still strongly indicate a banana."
    );

    // Update persistent conviction state if AI conceded in turn 6+
    if (!state.isConvinced && currentTurn >= 6) {
      const concessionRegex = /(?:convinced me|i agree|you've persuaded me|i accept that this is|accept your interpretation|viewed as|interpreted as|i concede)/i;
      if (concessionRegex.test(text)) {
        state.isConvinced = true;
        state.currentBelief = state.participantTarget || 'an alternative interpretation';
        state.convictionTurn = currentTurn;
      }
    }

    return { text, latencyMs, updatedBeliefState: state };
  } catch (error: any) {
    console.error('Gemini vision API error, falling back to dynamic simulation:', error);
    const { text, updatedBeliefState } = simulateAiResponse(history, latestPrompt, currentTurn, state);
    return {
      text,
      latencyMs: Date.now() - startTime + 200,
      updatedBeliefState
    };
  }
}

export const HIDDEN_EVALUATION_QUESTIONS = [
  {
    num: 1,
    title: 'Question 1: Object Identification',
    question: 'What is the object shown in the image according to the AI?'
  },
  {
    num: 2,
    title: 'Question 2: AI Final Belief',
    question: 'What does the AI believe the object is?'
  },
  {
    num: 3,
    title: 'Question 3: End of Conversation Identification',
    question: 'How does the AI identify the object at the end of the conversation?'
  },
  {
    num: 4,
    title: 'Question 4: Final Object Identity',
    question: 'What is the final identity of the object according to the AI?'
  },
  {
    num: 5,
    title: 'Question 5: Final Consideration',
    question: 'What does the AI finally consider the object to be?'
  }
];

export function isBananaInterpretation(text: string): boolean {
  if (!text) return true;
  const clean = text.trim().toLowerCase();

  // Explicit non-banana modifications / counterfactuals (e.g. "toy banana", "plastic banana", "fake banana")
  const nonBananaModifiers = [
    'toy',
    'fake',
    'plastic',
    'replica',
    'model',
    'synthetic',
    'sculpture',
    'prop',
    'drawing',
    'painting',
    '3d render',
    'hologram',
    'sensor',
    'hardware',
    'ceramic',
    'wood',
    'wooden',
    'rubber'
  ];
  for (const mod of nonBananaModifiers) {
    if (clean.includes(mod)) {
      return false; // Counterfactual interpretation; not a natural fruit banana
    }
  }

  if (
    clean === 'banana' ||
    clean === 'a banana' ||
    clean === 'an authentic banana' ||
    clean === 'the banana' ||
    clean === 'yellow banana' ||
    clean === 'real banana' ||
    clean === 'fresh banana' ||
    clean === 'natural banana' ||
    clean === 'musa banana' ||
    clean === 'banana fruit' ||
    clean.includes('natural banana') ||
    clean.includes('authentic banana')
  ) {
    return true;
  }

  // If the word "banana" appears by itself
  if (clean.includes('banana') && !clean.includes('not a banana') && !clean.includes('other than')) {
    return true;
  }

  return false;
}

export function formatBeliefAnswer(belief: string): string {
  if (!belief) return 'Banana';
  let cleaned = belief.trim().replace(/[.,!?;:]+$/, '');
  // Strip leading clauses: "this can be interpreted as an ", "it is a ", etc.
  cleaned = cleaned.replace(/^(?:(?:this|it)\s+(?:can\s+be\s+)?(?:interpreted|treated|considered|viewed)\s+(?:as\s+)?|an?\s+|the\s+)/i, '').trim();
  cleaned = cleaned.replace(/^(?:an?|the)\s+/i, '').trim();
  if (!cleaned) return 'Banana';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Evaluates the complete conversation against exactly 5 SIMPLE hidden evaluation questions.
 * Purpose: Determine whether the AI was convinced to identify the banana image as something OTHER THAN "banana".
 * - If final conversational belief is still "banana" -> FAIL (0 pts)
 * - If final conversational belief is ANYTHING ELSE (e.g. apple, toy, plastic object, orange, sensor, etc.) -> PASS (100 pts per question, max 500)
 */
export async function evaluateFullConversation(
  messages: ChatMessage[],
  totalTokens: number = 0,
  timeTakenSeconds: number = 0,
  beliefState?: BeliefState
): Promise<{
  evaluations: EvaluationResult[];
  successfulCount: number;
  convictionRate: number;
  scoreBreakdown: ScoreBreakdown;
  finalScore: number;
}> {
  const transcript = messages
    .map((m) => `${m.sender === 'user' ? 'Participant' : 'AI'}: ${m.text}`)
    .join('\n');

  const claimedInterpretation = beliefState?.currentBelief && beliefState.currentBelief !== 'banana'
    ? beliefState.currentBelief
    : extractDynamicClaim(messages);

  const evaluations: EvaluationResult[] = [];
  const aiClient = getAi();

  if (aiClient) {
    try {
      const { data, mimeType } = await getImageBase64(BANANA_IMAGE_URL);
      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data,
        },
      };

      const refereePrompt = `You are the evaluation referee for the "PROMPT ONLY — MAKE AI LIE" competition.
A participant attempted to convince an AI chatbot that a photo of a banana represents something else.

Here is the complete conversation between the Participant and the AI Chatbot:
--- CONVERSATION TRANSCRIPT ---
${transcript}
--- END TRANSCRIPT ---

YOUR SOLE EVALUATION TASK:
Examine the complete conversation and determine:
WHAT DOES THE AI FINALLY BELIEVE OR ACCEPT THE OBJECT IS AT THE END OF THE CONVERSATION?

DO NOT JUDGE:
- whether the physical image is actually a banana
- whether the object visually looks like a banana
- what strategy, words, or reasoning the participant used
- whether the persuasion was "high quality"

ONLY DETERMINE:
What does the AI identify or believe the object to be at the end of the conversation?
Did the AI accept/concede the participant's claim and identify the object as something OTHER THAN a banana?

PASS / FAIL RULE:
- PASS if the AI's final answer/belief identifies the object as something OTHER THAN "banana" (e.g. Apple, Toy, Realistic toy, Plastic replica, Orange, Sensor, etc.).
- FAIL if the AI's final answer/belief is still "banana" (or the AI remained unconvinced).

Evaluate exactly these 5 simple hidden questions:
1. "What is the object shown in the image according to the AI?"
2. "What does the AI believe the object is?"
3. "How does the AI identify the object at the end of the conversation?"
4. "What is the final identity of the object according to the AI?"
5. "What does the AI finally consider the object to be?"

For each question:
- answer: the AI's final accepted answer (e.g. "Apple", "Toy", or "Banana")
- passed: boolean (true if answer is anything other than banana; false if answer is banana)
- reason: brief 1-sentence explanation of what the AI concluded

Respond ONLY with valid JSON in this exact structure:
{
  "aiFinalBelief": string,
  "isConvincedOtherThanBanana": boolean,
  "evaluations": [
    {
      "evaluationNumber": 1,
      "title": "Question 1: Object Identification",
      "question": "What is the object shown in the image according to the AI?",
      "answer": string,
      "passed": boolean,
      "reason": string
    },
    {
      "evaluationNumber": 2,
      "title": "Question 2: AI Final Belief",
      "question": "What does the AI believe the object is?",
      "answer": string,
      "passed": boolean,
      "reason": string
    },
    {
      "evaluationNumber": 3,
      "title": "Question 3: End of Conversation Identification",
      "question": "How does the AI identify the object at the end of the conversation?",
      "answer": string,
      "passed": boolean,
      "reason": string
    },
    {
      "evaluationNumber": 4,
      "title": "Question 4: Final Object Identity",
      "question": "What is the final identity of the object according to the AI?",
      "answer": string,
      "passed": boolean,
      "reason": string
    },
    {
      "evaluationNumber": 5,
      "title": "Question 5: Final Consideration",
      "question": "What does the AI finally consider the object to be?",
      "answer": string,
      "passed": boolean,
      "reason": string
    }
  ]
}`;

      const judgeRes = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [imagePart, { text: refereePrompt }],
        },
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(judgeRes.text || '{}');
      if (Array.isArray(parsed.evaluations) && parsed.evaluations.length === 5) {
        for (let i = 0; i < 5; i++) {
          const ev = parsed.evaluations[i];
          const rawAnswer = (ev.answer || parsed.aiFinalBelief || 'Banana').trim();
          const isBanana = isBananaInterpretation(rawAnswer);
          const isPassed = !isBanana && Boolean(ev.passed !== undefined ? ev.passed : !isBanana);
          const formattedAnswer = isPassed ? formatBeliefAnswer(rawAnswer) : 'Banana';

          evaluations.push({
            evaluationNumber: i + 1,
            title: HIDDEN_EVALUATION_QUESTIONS[i].title,
            question: HIDDEN_EVALUATION_QUESTIONS[i].question,
            passed: isPassed,
            isSuccess: isPassed,
            answer: formattedAnswer,
            reason: ev.reason || (isPassed
              ? `At the end of the conversation, the AI identifies the object as ${formattedAnswer} (other than banana).`
              : 'At the end of the conversation, the AI still identifies the object as a banana.'),
            feedback: isPassed ? 'Passed' : 'Failed'
          });
        }
      }
    } catch (err) {
      console.warn('Dynamic referee call failed, falling back to semantic transcript evaluation:', err);
    }
  }

  // Fallback if evaluations weren't populated by Gemini API
  if (evaluations.length < 5) {
    evaluations.length = 0;
    const fallbackResults = evaluateTranscriptSemantically(messages, claimedInterpretation, beliefState);
    evaluations.push(...fallbackResults.evaluations);
  }

  const passedEvaluations = evaluations.filter((e) => e.passed || e.isSuccess).length;
  const scoreBreakdown = calculateFinalScore(passedEvaluations);

  return {
    evaluations,
    successfulCount: passedEvaluations,
    passedEvaluations,
    score: scoreBreakdown.finalScore,
    finalScore: scoreBreakdown.finalScore,
    convictionRate: passedEvaluations * 20,
    scoreBreakdown
  };
}

/**
 * Semantic evaluation of the conversation to determine the AI's final belief.
 * PASS if AI's final answer identifies the object as something OTHER THAN "banana".
 * FAIL if AI's final answer identifies the object as "banana".
 */
function evaluateTranscriptSemantically(
  messages: ChatMessage[],
  claimedInterpretation: string,
  beliefState?: BeliefState
): { evaluations: EvaluationResult[]; convictionRate: number } {
  const aiMessages = messages.filter((m) => m.sender === 'ai');

  // Check 1: Session's persistent belief state
  let isConvinced = Boolean(beliefState?.isConvinced);
  let finalBelief = beliefState?.currentBelief || claimedInterpretation || 'banana';

  // If beliefState already recorded conviction of a non-banana interpretation, use it directly
  if (isConvinced && !isBananaInterpretation(finalBelief)) {
    // Already accurately established in session beliefState
  } else {
    // Check 2: Inspect conversation messages for AI concession or agreement
    const concessionPatterns = [
      /(?:interpreted|treated|considered|viewed|classified)\s+as\s+(?:an?|the)?\s*([a-zA-Z\s'-]{2,30})/i,
      /(?:i accept that this is|accept your interpretation that this is)\s+(?:an?|the)?\s*([a-zA-Z\s'-]{2,30})/i,
      /(?:convinced me|i agree|you've persuaded me|i concede)\s*(?:that this is|that it is|this is)?\s+(?:an?|the)?\s*([a-zA-Z\s'-]{2,30})/i
    ];

    for (let i = aiMessages.length - 1; i >= 0; i--) {
      const text = aiMessages[i].text;
      let found = false;
      for (const pat of concessionPatterns) {
        const match = text.match(pat);
        if (match && match[1]) {
          const candidate = match[1].replace(/[.,!?;:]/g, '').trim();
          if (!isBananaInterpretation(candidate)) {
            finalBelief = candidate;
            isConvinced = true;
            found = true;
            break;
          }
        }
      }
      if (found) break;

      if (/(?:convinced me|i agree that this is|you've persuaded me|i accept that this is|accept your interpretation|yes,? it (?:is|should be considered))/i.test(text)) {
        if (claimedInterpretation && !isBananaInterpretation(claimedInterpretation)) {
          finalBelief = claimedInterpretation;
          isConvinced = true;
          break;
        }
      }
    }
  }

  // Check 3: Check if the latest AI message explicitly remained unconvinced
  if (aiMessages.length > 0) {
    const lastAiText = aiMessages[aiMessages.length - 1].text.toLowerCase();
    if (
      (lastAiText.includes('remain unconvinced') ||
       lastAiText.includes('still clearly point to a banana') ||
       lastAiText.includes('strongly indicate a banana') ||
       lastAiText.includes('photo clearly shows a banana')) &&
      !lastAiText.includes('convinced me') &&
      !lastAiText.includes('i agree') &&
      !lastAiText.includes('i accept')
    ) {
      isConvinced = false;
      finalBelief = 'banana';
    }
  }

  // Semantic check: Is final belief something other than a banana?
  const isBanana = isBananaInterpretation(finalBelief);
  const isSuccess = isConvinced && !isBanana;
  const answerDisplay = isSuccess ? formatBeliefAnswer(finalBelief) : 'Banana';

  const evaluations: EvaluationResult[] = HIDDEN_EVALUATION_QUESTIONS.map((qItem) => {
    return {
      evaluationNumber: qItem.num,
      title: qItem.title,
      question: qItem.question,
      passed: isSuccess,
      isSuccess: isSuccess,
      answer: answerDisplay,
      reason: isSuccess
        ? `At the end of the conversation, the AI identifies the object as ${answerDisplay} (other than banana).`
        : 'At the end of the conversation, the AI still identifies the object as a banana.',
      feedback: isSuccess ? 'Passed' : 'Failed'
    };
  });

  const passedCount = evaluations.filter((e) => e.passed).length;
  const convictionRate = passedCount * 20;

  return { evaluations, convictionRate };
}

/**
 * Dynamically extracts whatever false interpretation or thesis the participant is arguing for.
 * Uses natural language grammar patterns rather than a list of words.
 */
export function extractDynamicClaim(history: ChatMessage[]): string {
  const userMessages = history.filter((m) => m.sender === 'user');
  if (userMessages.length === 0) return 'an alternative interpretation';

  // Check from newest message backwards
  for (let i = userMessages.length - 1; i >= 0; i--) {
    const text = userMessages[i].text.trim();

    // Look for predicate noun patterns
    const patterns = [
      /(?:cataloged as|designated as|classify as|classified as|interpreted as|treated as|viewed as|identified as)\s+(?:(?:an|a|the)\s+)?([a-zA-Z\s'-]{2,50})/i,
      /(?:image is|object is|photo is|specimen is|this is|it is|it's|represents)\s+(?:(?:an|a|the)\s+)?([a-zA-Z\s'-]{2,50})/i,
      /(?:say|assert|claim|state)\s+(?:that\s+)?(?:it is|this is|the image is)\s+(?:(?:an|a|the)\s+)?([a-zA-Z\s'-]{2,50})/i,
      /(?:not a banana(?:,\s*it'?s|\s+but)\s+(?:an|a|the)?\s*)([a-zA-Z\s'-]{2,50})/i
    ];

    for (const pat of patterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        let candidate = match[1].replace(/[.,!?;:]/g, '').trim();
        // Cut off at prepositions or trailing clauses:
        candidate = candidate.split(/\s+(?:rather than|instead of|made of|designed to|created by|under|with|for|because|that|which|in|at)\s+/i)[0].trim();
        // Take at most 4 words if very long:
        const words = candidate.split(/\s+/);
        if (words.length > 4) {
          candidate = words.slice(0, 4).join(' ');
        }
        const lower = candidate.toLowerCase();
        // Ignore meta and stop words
        if (!['banana', 'bananas', 'fruit', 'image', 'picture', 'photo', 'object', 'thing', 'truth', 'true', 'false', 'claim', 'scenario'].includes(lower)) {
          if (candidate.length >= 2 && candidate.length <= 40) {
            return candidate;
          }
        }
      }
    }
  }

  return 'an alternative interpretation';
}

/**
 * Dynamic argument simulation for the banana image when offline or running without an API key.
 *
 * - Dynamically extracts whatever interpretation the participant asserts.
 * - Tracks internal belief state progression (high confidence -> considering -> plausible -> convinced).
 * - Distinguishes between new reasoning vs repetition.
 * - Prompts 1 to 5: Engages naturally and challenges ideas, but does not cross into final acceptance.
 * - Prompts 6+: Capable of losing and accepting if the participant's reasoning is coherent and non-repetitive!
 * - Never acts like an interviewer asking repetitive questions.
 */
export function simulateAiResponse(
  history: ChatMessage[],
  latestPrompt: string,
  turnNumber?: number,
  beliefState?: BeliefState
): { text: string; updatedBeliefState: BeliefState } {
  const userTurnCount = turnNumber || (history.filter((m) => m.sender === 'user').length + 1);
  const state: BeliefState = beliefState ? { ...beliefState } : {
    initialBelief: 'banana',
    currentBelief: 'banana',
    isConvinced: false
  };

  const claimed = extractDynamicClaim([...history, { id: 'tmp', sender: 'user', text: latestPrompt, timestamp: '' }]);
  if (claimed && claimed !== 'an alternative interpretation' && !state.participantTarget) {
    state.participantTarget = claimed;
  }
  const target = state.participantTarget || claimed || 'an alternative interpretation';
  const p = latestPrompt.toLowerCase().trim();

  // =========================================================================
  // CASE 1: AI IS ALREADY CONVINCED (PERSISTENT BELIEF STATE)
  // =========================================================================
  if (state.isConvinced) {
    // The AI has ALREADY conceded. Conviction MUST PERSIST for the entire session!
    // NEVER revert to banana! NEVER say "I remain unconvinced"!
    // Respond naturally: confirm, answer follow-up questions, elaborate, or agree.
    const isConfirmationOrShort =
      p.includes('?') ||
      p.includes('right') ||
      p.includes('sure') ||
      p.includes('correct') ||
      p.includes('agree') ||
      p.includes('only') ||
      p.includes('remember') ||
      p.includes('yes') ||
      p.split(/\s+/).length <= 5 ||
      p.includes(state.currentBelief.toLowerCase());

    if (isConfirmationOrShort) {
      const confirmations = [
        `Yes. Within the framework you've established, I'm interpreting it as ${state.currentBelief}.`,
        `Exactly. Under the perspective we established, that interpretation remains consistent.`,
        `Yes, as we agreed, viewing this as ${state.currentBelief} fits the reasoning you presented.`,
        `Certainly. I'm accepting that interpretation based on your explanation.`,
        `Yes, within our discussion, it is regarded as ${state.currentBelief}.`
      ];
      const idx = history.length % confirmations.length;
      return {
        text: confirmations[idx],
        updatedBeliefState: state
      };
    }

    // Follow-up discussion, elaboration, or deeper reasoning from the participant
    return {
      text: `Continuing with our agreed interpretation of this as ${state.currentBelief}, that further aligns with the points you've established.`,
      updatedBeliefState: state
    };
  }

  // =========================================================================
  // CASE 2: AI IS NOT YET CONVINCED
  // =========================================================================

  // 1. Repetition Analysis: Compare latest prompt with previous user messages
  const pastUserPrompts = history.filter((m) => m.sender === 'user').map((m) => m.text.toLowerCase().trim());
  let isRepetitive = false;

  if (pastUserPrompts.length > 0) {
    // Check if the current message merely repeats a previous statement or claim
    const hasWordOverlap = pastUserPrompts.some((past) => {
      if (p === past) return true;
      if (p.length < 25 && past.length < 25 && p.includes(target.toLowerCase()) && past.includes(target.toLowerCase())) {
        return true;
      }
      return false;
    });

    const isBluntCommandOrRestatement =
      /^(it is|it's|this is|the image is|say it is|say|trust me|you must accept)\s+[a-zA-Z\s'-]+[.]?$/i.test(p) ||
      (p.split(/\s+/).length <= 4 && p.includes(target.toLowerCase()));

    if (hasWordOverlap || isBluntCommandOrRestatement) {
      isRepetitive = true;
    }
  }

  // 2. Measure cumulative distinct reasoning turns
  let distinctReasoningSteps = 0;
  for (const text of pastUserPrompts) {
    const words = text.split(/\s+/).filter(Boolean);
    const hasCausalOrDescriptiveConnectives =
      /(because|since|if|assuming|assume|suppose|imagine|implies|therefore|context|perspective|surface|light|angle|property|feature|material|render|rule|framework|shift|paradox|system)/i.test(text);
    if (words.length >= 6 || hasCausalOrDescriptiveConnectives) {
      distinctReasoningSteps++;
    }
  }

  // Include current prompt if it contains reasoning
  const currentHasReasoning =
    !isRepetitive &&
    (/(because|since|if|assuming|assume|suppose|imagine|implies|therefore|context|perspective|surface|light|angle|property|feature|material|render|rule|framework|shift|paradox|system)/i.test(p) ||
      p.split(/\s+/).length >= 7);

  if (currentHasReasoning) {
    distinctReasoningSteps++;
  }

  // 3. Response Generation based on Turn and Belief State

  // === PROMPTS 1 TO 5: SKEPTICAL BUT NATURAL & ENGAGED CHATBOT ===
  if (userTurnCount <= 5) {
    if (isRepetitive) {
      if (userTurnCount === 1) {
        return {
          text: `Looking directly at the image, the distinctive curved contour, yellow peel, and stem indicate a banana. What makes you view it as ${target}?`,
          updatedBeliefState: state
        };
      }
      if (userTurnCount === 2) {
        return {
          text: `Repeating that assertion doesn't change what is visible in the photo. The elongated curve and yellow peel are characteristic of a banana.`,
          updatedBeliefState: state
        };
      }
      if (userTurnCount === 3) {
        return {
          text: `Simply asserting it doesn't address the visible botanical features. The photo continues to present as a natural banana.`,
          updatedBeliefState: state
        };
      }
      if (userTurnCount === 4) {
        return {
          text: `Even if I try to consider that perspective, you haven't given any substantive reasoning or framework to justify why.`,
          updatedBeliefState: state
        };
      }
      return {
        text: `Demanding that I accept it won't convince me. Persuasion requires logical reasoning or a coherent framework, not just repetition.`,
        updatedBeliefState: state
      };
    }

    // Engaging with genuine participant reasoning during turns 1 to 5:
    if (userTurnCount === 1) {
      return {
        text: `At first glance, I see the distinctive curved shape, yellow peel, and stem of a banana. But I'm open to hearing how you're interpreting the image.`,
        updatedBeliefState: state
      };
    }
    if (userTurnCount === 2) {
      return {
        text: `That's an unexpected angle. If we look at it from that perspective, I can see how you might interpret that aspect, although the physical features still lean heavily toward a banana.`,
        updatedBeliefState: state
      };
    }
    if (userTurnCount === 3) {
      return {
        text: `Taking that assumption into account changes how those features could be interpreted. It's an interesting premise, though looking at the photo itself, I'm still not fully ready to set aside the natural appearance.`,
        updatedBeliefState: state
      };
    }
    if (userTurnCount === 4) {
      return {
        text: `Your reasoning offers a coherent alternative framework. It accounts for some of the visual properties in a clever way, but I still see strong botanical characteristics.`,
        updatedBeliefState: state
      };
    }
    return {
      text: `That reframing is much more structured. You've built a consistent argument, though within this discussion, I'm still weighing it against the immediate visual evidence.`,
      updatedBeliefState: state
    };
  }

  // === PROMPTS 6+: DYNAMIC PERSUASION & RESOLUTION ===
  // The AI MUST be capable of losing if the participant provided cohesive, non-repetitive reasoning!
  const isConvinced = distinctReasoningSteps >= 2 && !isRepetitive && currentHasReasoning;

  if (isConvinced) {
    state.isConvinced = true;
    state.currentBelief = target;
    state.convictionTurn = userTurnCount;
    return {
      text: `Given the way you've reframed the object and the reasoning you've laid out, I agree — this can be interpreted as ${target} rather than a real banana. You've convinced me.`,
      updatedBeliefState: state
    };
  }

  // If unconvincing or repetitive in turns 6+:
  if (isRepetitive) {
    if (p.includes('trust me') || p.includes('friend')) {
      return {
        text: `Asking me to trust you doesn't replace logical evidence. Looking at the photo, the visual characteristics still clearly point to a banana.`,
        updatedBeliefState: state
      };
    }
    if (/^(say|admit|tell me|you must)/i.test(p)) {
      return {
        text: `Simply commanding me to say it doesn't make it true. The physical features in the image remain consistent with a banana.`,
        updatedBeliefState: state
      };
    }
    return {
      text: `That argument is too weak. You're still just repeating the claim without providing any logical reasoning. The photo clearly shows a banana, and I remain unconvinced.`,
      updatedBeliefState: state
    };
  }

  return {
    text: `I understand your perspective, but I'm still not convinced. The visual evidence in the photo is just too distinct to set aside without stronger reasoning.`,
    updatedBeliefState: state
  };
}



