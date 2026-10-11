export const STORAGE_KEY = 'histoire-en-tete-v1';
export const DAY = 86400000;
export const INTERVALS = [1, 3, 7, 14];

export function normalizeAnswer(value) {
  return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim().replace(/^(?:l['’]|(?:le|la|les|un|une|en)\s+)/, '')
    .replace(/[^a-z0-9]/g, '');
}

export function isCorrect(question, answer) {
  if (question.type === 'choice') return answer === question.answer;
  const normalized = normalizeAnswer(answer);
  if (!normalized) return false;
  return (question.accepted || [question.answer]).some(expected => normalizeAnswer(expected) === normalized);
}

export function shuffle(items, random = Math.random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function recordAttempt(previous, correct, now = Date.now()) {
  const streak = correct ? Math.min((previous?.streak || 0) + 1, 4) : 0;
  return { attempts: (previous?.attempts || 0) + 1,
    successes: (previous?.successes || 0) + Number(correct), lastCorrect: correct,
    streak, lastAt: now, dueAt: correct ? now + INTERVALS[Math.max(streak - 1, 0)] * DAY : now };
}

export function freshState() {
  return { version: 1, records: {}, history: [], training: null, exam: null, lastExam: null };
}

export function cleanState(raw, questions) {
  const base = freshState();
  if (!raw || raw.version !== 1) return base;
  const ids = new Set(questions.map(q => q.id));
  const validAnswer = value => typeof value === 'string';
  for (const [id, r] of Object.entries(raw.records || {})) {
    if (ids.has(id) && r && Number.isFinite(r.attempts) && Number.isFinite(r.dueAt) && typeof r.lastCorrect === 'boolean') {
      base.records[id] = { ...r, streak: Math.max(0, Math.min(Number(r.streak) || 0, 4)) };
    }
  }
  base.history = Array.isArray(raw.history) ? raw.history.filter(h => h && Number.isFinite(h.total) && h.total > 0 && Number.isFinite(h.correct) && h.correct >= 0 && h.correct <= h.total && Number.isFinite(h.at)).slice(-30) : [];
  for (const kind of ['training', 'exam', 'lastExam']) {
    const s = raw[kind];
    if (s && Array.isArray(s.ids) && s.ids.length && s.ids.every(id => ids.has(id)) && new Set(s.ids).size === s.ids.length) {
      const answers = Object.fromEntries(Object.entries(s.answers || {}).filter(([id, value]) => s.ids.includes(id) && validAnswer(value)));
      const graded = Object.fromEntries(Object.entries(s.graded || {}).filter(([id, value]) => s.ids.includes(id) && typeof value === 'boolean'));
      base[kind] = { ...s, answers, graded, index: Math.max(0, Math.min(Number(s.index) || 0, s.ids.length - 1)) };
    }
  }
  return base;
}

export function selectPractice(questions, records, count = 10, { topic = 'all', category = 'all', errorsOnly = false, now = Date.now(), random = Math.random } = {}) {
  const candidates = questions.filter(q => (topic === 'all' || q.topic === topic)
    && (category === 'all' || q.category === category)
    && (!errorsOnly || records[q.id]?.lastCorrect === false));
  const rank = q => records[q.id]?.lastCorrect === false ? 0 : !records[q.id] ? 1 : records[q.id].dueAt <= now ? 2 : 3;
  return shuffle(candidates, random).sort((a,b) => rank(a) - rank(b)).slice(0,count);
}

export function selectExam(questions, topics, random = Math.random) {
  const chosen = topics.flatMap(topic => shuffle(questions.filter(q => q.topic === topic), random).slice(0,2));
  return shuffle(chosen, random);
}

export function scoreSession(session, questions) {
  const byId = new Map(questions.map(q => [q.id,q]));
  const rows = session.ids.map(id => {
    const q = byId.get(id);
    const answer = session.answers[id] || '';
    return { question:q, answer, correct:isCorrect(q,answer) };
  });
  return { rows, correct:rows.filter(r => r.correct).length, total:rows.length };
}
