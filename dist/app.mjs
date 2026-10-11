import { CONTENT } from './content.mjs';
import { STORAGE_KEY, cleanState, freshState, isCorrect, recordAttempt, selectPractice,
  selectExam, shuffle, scoreSession, DAY } from './core.mjs';

const {lessons,questions} = CONTENT;
const byId = new Map(questions.map(q => [q.id,q]));
const lessonById = new Map(lessons.map(l => [l.id,l]));
const main = document.getElementById('main');
let state;
let storageOK = true;
let showExamResult = false;
let courseRevealed = false;
let currentCourse = 'H1';
try { state = cleanState(JSON.parse(localStorage.getItem(STORAGE_KEY)),questions); }
catch { state = freshState(); }

const esc = value => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain = value => String(value).replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]+>/g,'');
const lessonName = id => lessonById.get(id)?.title || id;
const icon = name => {
  const paths = {
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    book:'<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z"/><path d="M12 5v15"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5 7a8 8 0 0 1 13-2l2 7M4 12l2 7a8 8 0 0 0 13-2"/>',
    chart:'<path d="M4 4v16h16M8 16v-4m5 4V8m5 8V5"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
  };
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`;
};

function save() {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
  catch { storageOK=false; }
  document.getElementById('storage-note').textContent = storageOK
    ? 'Tes résultats sont gardés sur cet appareil.'
    : 'La sauvegarde est indisponible : tes résultats restent visibles pendant cette visite.';
}

function metrics() {
  const records=Object.values(state.records);
  return { seen:records.length, correct:records.filter(r => r.lastCorrect).length,
    errors:records.filter(r => !r.lastCorrect).length,
    due:records.filter(r => r.dueAt <= Date.now()).length,
    sessions:state.history.length };
}

function progressFor(id) {
  const pool=questions.filter(q => q.topic===id);
  return { total:pool.length, seen:pool.filter(q => state.records[q.id]).length,
    correct:pool.filter(q => state.records[q.id]?.lastCorrect).length };
}

function formatDate(time) {
  return new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short'}).format(new Date(time));
}

function go(hash,focus=true) {
  if (location.hash !== '#'+hash) location.hash=hash;
  else render(focus);
}

function heading(eyebrow,title,description,back=false) {
  return `<div class="page-heading">${back?'<a class="back-link" href="#accueil">← Accueil</a>':''}<p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="page-description">${description}</p></div>`;
}

function timeline() {
  return `<div class="hero-timeline" aria-label="Quatre repères du chapitre"><span class="timeline-kicker">DU MONDE ROMAIN AU MOYEN ÂGE</span><div class="timeline-track"><div><b>330</b><i></i><span>Constantinople</span></div><div><b>622</b><i></i><span>L’Hégire</span></div><div><b>800</b><i></i><span>Charlemagne</span></div><div><b>1054</b><i></i><span>Le schisme</span></div></div></div>`;
}

function home() {
  const m=metrics();
  const next=Object.values(state.records).filter(r => r.dueAt>Date.now()).sort((a,b)=>a.dueAt-b.dueAt)[0];
  return `<section class="hero"><div class="hero-copy"><p class="eyebrow">TON RENDEZ-VOUS AVEC L’HISTOIRE</p><h1>Comprendre.<br>Retenir.<br><em>Se tester.</em></h1><p>Dix parties, des repères clairs et des questions pour retrouver ta leçon de mémoire.</p><div class="button-row"><button class="button" data-action="start-practice">${icon('target')} Une séance de 10 questions ${icon('arrow')}</button><a class="button secondary" href="#cours">Revoir le cours</a></div><span class="hero-note">${icon('clock')} 5 à 10 minutes pour faire le point</span></div><div class="hero-art" aria-hidden="true"><span class="art-label">CHRÉTIENTÉS<br>& ISLAM</span><div class="arch arch-one"></div><div class="arch arch-two"></div><div class="arch arch-three"></div><div class="art-sun"></div><div class="art-date">330 <span>→</span> 1453</div></div>${timeline()}</section>
    <section class="today-section"><div class="section-heading"><div><p class="eyebrow">UN PAS APRÈS L’AUTRE</p><h2>Ta révision aujourd’hui</h2></div><a class="text-link" href="#progres">Voir mes progrès ${icon('arrow')}</a></div><div class="today-grid"><div class="today-main"><span class="round-icon">${icon(m.errors?'refresh':'target')}</span><div><h3>${m.errors?`${m.errors} question${m.errors>1?'s':''} à reprendre`:'On commence par une petite séance ?'}</h3><p>${m.errors?'Les erreurs t’indiquent exactement quoi retravailler. Essaie de retrouver la réponse avant de relire.':m.seen?`${m.due} question${m.due>1?'s':''} à revoir aujourd’hui.${next?' Prochaine révision prévue le '+formatDate(next.dueAt)+'.':''}`:'Réponds d’abord de mémoire. La correction t’aidera à comprendre et à retenir.'}</p><button class="text-link" data-action="${m.errors?'start-errors':'start-practice'}">${m.errors?'Retravailler mes erreurs':'Commencer ma séance'} ${icon('arrow')}</button></div></div><div class="today-stat"><strong>${m.correct}<small> / ${questions.length}</small></strong><span>questions réussies<br>au dernier essai</span><div class="progress-bar" aria-label="${m.correct} questions réussies sur ${questions.length}"><span style="width:${m.correct/questions.length*100}%"></span></div></div></div></section>
    <section class="routes-section"><div class="section-heading"><div><p class="eyebrow">À TOI DE CHOISIR</p><h2>Trois façons d’avancer</h2></div></div><div class="route-grid"><a class="route-card" href="#cours"><span class="route-number">01</span><span class="route-icon">${icon('book')}</span><h3>Je révise</h3><p>Je comprends une partie, puis j’essaie de la raconter sans regarder.</p><span class="route-link">10 parties du cours ${icon('arrow')}</span></a><a class="route-card" href="#entrainement"><span class="route-number">02</span><span class="route-icon">${icon('target')}</span><h3>Je m’entraîne</h3><p>Je réponds à des questions variées et je comprends mes erreurs.</p><span class="route-link">Correction après chaque réponse ${icon('arrow')}</span></a><a class="route-card" href="#controle"><span class="route-number">03</span><span class="route-icon">${icon('chart')}</span><h3>Je me teste</h3><p>Je vérifie ce que je sais sur l’ensemble du chapitre, sans aide.</p><span class="route-link">20 questions, corrigé à la fin ${icon('arrow')}</span></a></div></section>`;
}

function course() {
  const l=lessonById.get(currentCourse) || lessons[0];
  const stats=progressFor(l.id);
  const nav=lessons.map(item => `<a class="lesson-link ${item.id===l.id?'selected':''}" href="#cours/${item.id}" ${item.id===l.id?'aria-current="page"':''}><span class="lesson-id">${item.id}</span><span>${esc(item.title)}</span>${icon('arrow')}</a>`).join('');
  return `${heading('COMPRENDRE AVANT DE MÉMORISER','Je révise mon cours','Choisis une partie. Lis-la, puis cache-la et explique avec tes mots.')}<div class="course-layout"><aside class="lesson-nav" aria-label="Les dix parties du cours">${nav}</aside><section class="lesson-detail"><div class="lesson-topline"><span class="tag">${l.id}</span><span>${stats.correct} / ${stats.total} questions réussies</span></div><h2>${esc(l.title)}</h2><div class="recall-prompt"><span>${icon('book')}</span><div><p class="eyebrow">LA QUESTION À SAVOIR EXPLIQUER</p><h3>${esc(l.question)}</h3></div></div><div class="button-row lesson-tools"><button class="button small secondary" data-action="toggle-course">${courseRevealed?'Cacher le cours':'Afficher le cours'}</button><button class="button small" data-action="practice-topic" data-topic="${l.id}">Tester cette partie ${icon('arrow')}</button></div>${courseRevealed?`<div class="course-content"><div class="lesson-explanation">${l.explanation.map(s=>`<p>${s}</p>`).join('')}</div><div class="remember"><span>JE RETIENS</span><p>${l.remember}</p></div><div class="six-questions">${Object.entries(l.answers).map(([label,values])=>`<div><h3>${esc(label)}</h3><p>${values.join(' ')}</p></div>`).join('')}</div></div>`:`<div class="hidden-course"><span class="round-icon">${icon('target')}</span><h3>À toi de retrouver l’essentiel.</h3><p>Qui ? Quoi ? Quand ? Où ? Pourquoi ? Comment ?<br>Raconte ce dont tu te souviens, puis affiche le cours pour vérifier.</p></div>`}</section></div>`;
}

function practiceIntro() {
  const errors=metrics().errors;
  return `${heading('UNE PETITE SÉANCE, UN VRAI EFFORT DE MÉMOIRE','Je m’entraîne','Réponds sans le cours. Vérifie ensuite, puis prends le temps de comprendre la correction.')}<div class="intro-layout"><section class="setup-card"><span class="round-icon">${icon('target')}</span><h2>Ma prochaine séance</h2><p>Les questions à reprendre passent en premier, puis les nouvelles et celles à revoir.</p><form id="practice-setup"><label class="field-label" for="practice-topic">Quelle partie ?</label><select id="practice-topic" name="topic"><option value="all">Tout le chapitre</option>${lessons.map(l=>`<option value="${l.id}">${l.id} · ${esc(l.title)}</option>`).join('')}</select><label class="field-label" for="practice-category">Quel type de question ?</label><select id="practice-category" name="category"><option value="all">Toutes les questions</option><option value="repères">Dates et repères</option><option value="personnages">Personnages</option><option value="mots">Vocabulaire</option><option value="comprendre">Comprendre et expliquer</option></select><button class="button full" type="submit">Lancer ma séance ${icon('arrow')}</button></form>${state.training&&!state.training.complete?'<button class="text-link resume-link" data-action="resume-practice">Reprendre ma séance en cours →</button>':''}</section><aside class="method-card"><p class="eyebrow">UNE MÉTHODE QUI AIDE À RETENIR</p><ol><li><b>Je cherche de mémoire.</b><span>Une date ou quelques mots suffisent pour les réponses courtes.</span></li><li><b>Je vérifie et je comprends.</b><span>Une correction explique chaque réponse.</span></li><li><b>Je reviens un autre jour.</b><span>Le site propose de reprendre les questions à intervalles espacés.</span></li></ol>${errors?`<button class="button secondary full" data-action="start-errors">Reprendre mes ${errors} erreur${errors>1?'s':''}</button>`:''}</aside></div>`;
}

function optionsFor(s,q) {
  const options=s.options?.[q.id];
  return Array.isArray(options) && options.length===q.options.length && options.every(v=>q.options.includes(v)) ? options : q.options;
}

function inputFor(s,q,locked=false) {
  const existing=s.answers[q.id] || '';
  if(q.type==='text') return `<label class="field-label" for="answer">Ma réponse</label><input id="answer" name="answer" type="text" value="${esc(existing)}" autocomplete="off" spellcheck="false" ${locked?'disabled':''} ${/^[0-9]{3,4}$/.test(q.answer)?'inputmode="numeric"':''} required aria-describedby="answer-hint"><p class="input-hint" id="answer-hint">${/^[0-9]{3,4}$/.test(q.answer)?'Écris l’année.':'Une réponse courte suffit. Les accents et les majuscules ne changent pas le résultat.'}</p>`;
  return `<fieldset class="options"><legend class="sr-only">Choisis une réponse</legend>${optionsFor(s,q).map((option,i)=>`<label class="option ${locked&&option===q.answer?'correct-option':''} ${locked&&option===existing&&option!==q.answer?'incorrect-option':''}"><input type="radio" name="answer" value="${esc(option)}" ${option===existing?'checked':''} ${locked?'disabled':''} required><span class="option-letter" aria-hidden="true">${String.fromCharCode(65+i)}</span><span>${esc(option)}</span></label>`).join('')}</fieldset>`;
}

function questionView(s,exam=false) {
  const q=byId.get(s.ids[s.index]);
  const locked=!exam&&Object.hasOwn(s.graded,q.id);
  const correct=s.graded[q.id];
  const answered=Object.keys(s.answers).filter(id=>String(s.answers[id]).trim()).length;
  return `${heading(exam?'MINI-CONTRÔLE · SANS AIDE':'ENTRAÎNEMENT · DE MÉMOIRE',exam?'Je teste mes connaissances':'Une question à la fois',exam?'La correction et le score s’afficheront quand tu auras terminé.':'Cherche la réponse, puis vérifie. Tu peux reprendre tes erreurs à la fin.')}<div class="quiz-layout"><section class="question-card"><div class="question-top"><span class="tag">${q.topic} · ${esc(lessonName(q.topic))}</span><span>${s.index+1} / ${s.ids.length}</span></div><div class="progress-bar"><span style="width:${(s.index+1)/s.ids.length*100}%"></span></div><h2 id="question-title" tabindex="-1">${esc(q.prompt)}</h2><form id="answer-form" data-id="${q.id}" data-mode="${exam?'exam':'practice'}">${inputFor(s,q,locked)}${!exam&&!locked?'<button class="button full verify-button" type="submit">Vérifier ma réponse '+icon('check')+'</button>':''}</form>${locked?`<div class="feedback ${correct?'positive':'negative'}" id="feedback" tabindex="-1" role="status"><span class="feedback-icon">${icon(correct?'check':'refresh')}</span><div><h3>${correct?'Bien retrouvé !':'À reprendre, et tu vas progresser.'}</h3>${!correct?`<p><b>Réponse attendue :</b> ${esc(q.answer)}</p>`:''}<p>${esc(q.explanation)}</p></div></div><div class="button-row"><button class="button" data-action="next-practice">${s.index+1===s.ids.length?'Voir mon bilan':'Question suivante'} ${icon('arrow')}</button>${!correct?`<a class="text-link" href="#cours/${q.topic}">Revoir cette partie</a>`:''}</div>`:''}${exam?`<div class="button-row exam-actions"><button class="button secondary" data-action="previous-exam" ${s.index===0?'disabled':''}>← Précédente</button><button class="button" data-action="next-exam">${s.index+1===s.ids.length?'Terminer le contrôle':'Suivante'} ${icon('arrow')}</button></div>`:''}</section><aside class="quiz-aside">${exam?`<h3>Mon contrôle</h3><p><span id="answered-count">${answered}</span> / ${s.ids.length} questions répondues</p><div class="question-grid">${s.ids.map((id,i)=>`<button data-action="jump-exam" data-index="${i}" class="${i===s.index?'current':''} ${s.answers[id]?.trim()?'answered':''}" aria-label="Question ${i+1}${s.answers[id]?.trim()?', répondue':''}" ${i===s.index?'aria-current="step"':''}>${i+1}</button>`).join('')}</div><p class="aside-note">Tu peux revenir sur tes réponses avant de terminer.</p><button class="text-link" data-action="request-finish">Terminer et corriger →</button>`:`<span class="round-icon">${icon('clock')}</span><h3>Prends le temps de chercher.</h3><p>Essaie avant de relire. C’est l’effort pour retrouver la réponse qui aide à la retenir.</p><p class="aside-note">Ta séance reste disponible si tu changes de page.</p>`}</aside></div>`;
}

function results(s,exam=false) {
  const score=scoreSession(s,questions);
  const wrong=score.rows.filter(r=>!r.correct);
  const message=score.correct===score.total?'Toutes les réponses sont justes. Reviens un autre jour pour vérifier que tu les retiens.':score.correct/score.total>=.7?'Tu as déjà de bons repères. Reprends les questions qui ont résisté.':'Le bilan te montre par où commencer. Revois une partie, puis réessaie quelques questions.';
  return `${heading(exam?'CONTRÔLE TERMINÉ':'SÉANCE TERMINÉE','Voici ton bilan',message)}<section class="result-summary"><div class="score-circle"><strong>${score.correct}<small> / ${score.total}</small></strong><span>réponses justes</span></div><div><h2>${wrong.length?`${wrong.length} question${wrong.length>1?'s':''} à retravailler`:'Bien retrouvé !'}</h2><p>Les corrections sont juste en dessous. Compare aussi les réponses réussies pour consolider tes repères.</p><div class="button-row">${wrong.length?`<button class="button" data-action="retry-session" data-mode="${exam?'exam':'practice'}">Reprendre ces questions ${icon('refresh')}</button>`:''}<button class="button ${wrong.length?'secondary':''}" data-action="${exam?'new-exam':'new-practice'}">${exam?'Un nouveau contrôle':'Une nouvelle séance'}</button><a class="text-link" href="#progres">Mes progrès →</a></div></div></section><section class="corrections"><h2>Je comprends mes réponses</h2>${score.rows.map((r,i)=>`<details class="correction-row ${r.correct?'right':'wrong'}" ${!r.correct?'open':''}><summary><span class="answer-mark">${icon(r.correct?'check':'refresh')}</span><span><small>${r.question.topic} · Question ${i+1}</small>${esc(r.question.prompt)}</span><span class="correction-toggle" aria-hidden="true">+</span></summary><div class="correction-content"><p><b>Ma réponse :</b> ${esc(r.answer.trim()||'Pas de réponse')}</p><p><b>Réponse attendue :</b> ${esc(r.question.answer)}</p><p>${esc(r.question.explanation)}</p><a href="#cours/${r.question.topic}" class="text-link">Revoir ${esc(lessonName(r.question.topic))} →</a></div></details>`).join('')}</section>`;
}

function examIntro() {
  return `${heading('LE POINT SUR TOUT LE CHAPITRE','Je teste mes connaissances','Un mini-contrôle pour vérifier ce que tu sais retrouver sans le cours.')}<section class="exam-intro"><div class="exam-illustration" aria-hidden="true">${icon('chart')}<span>20</span><small>QUESTIONS</small></div><div class="exam-copy"><p class="eyebrow">UN ESSAI COMPLET</p><h2>Les dix parties.<br>Un bilan clair.</h2><p>Deux questions par partie : dates, lieux, personnages, vocabulaire et compréhension.</p><ul class="exam-rules"><li>${icon('clock')} Prévois environ 15 minutes.</li><li>${icon('book')} Cache le cours et tes fiches.</li><li>${icon('check')} 1 point par question. Le score et les corrigés arrivent à la fin.</li></ul><button class="button" data-action="start-exam">Commencer le contrôle ${icon('arrow')}</button>${state.lastExam?`<button class="text-link last-result" data-action="last-exam">Revoir mon dernier bilan : ${scoreSession(state.lastExam,questions).correct} / ${state.lastExam.ids.length} →</button>`:''}</div></section>`;
}

function progress() {
  const m=metrics();
  const errors=questions.filter(q=>state.records[q.id]?.lastCorrect===false);
  const history=[...state.history].reverse().slice(0,6);
  return `${heading('JE VOIS CE QUE JE RETROUVE','Mes progrès','Un bilan de tes essais pour choisir ce que tu dois retravailler.')}<div class="stat-grid"><div><span>Questions essayées</span><strong>${m.seen}<small> / ${questions.length}</small></strong></div><div><span>Réussies au dernier essai</span><strong>${m.correct}</strong></div><div><span>À revoir aujourd’hui</span><strong>${m.due}</strong></div><div><span>Séances terminées</span><strong>${m.sessions}</strong></div></div><div class="progress-layout"><section class="panel"><div class="section-heading"><h2>Partie par partie</h2></div><p class="muted small-text">Pour vérifier que tu retiens, refais une séance un autre jour.</p><div class="topic-progress">${lessons.map(l=>{const p=progressFor(l.id);return `<div class="topic-progress-row"><span class="lesson-id">${l.id}</span><div><h3>${esc(l.title)}</h3><div class="progress-bar"><span style="width:${p.correct/p.total*100}%"></span></div><p>${p.correct} / ${p.total} réussies au dernier essai · ${p.seen} essayées</p></div><button class="icon-button" data-action="practice-topic" data-topic="${l.id}" aria-label="S’entraîner : ${esc(l.title)}">${icon('arrow')}</button></div>`;}).join('')}</div></section><div class="progress-side"><section class="panel"><span class="round-icon">${icon('refresh')}</span><h2>Mes questions à reprendre</h2>${errors.length?`<p>${errors.length} question${errors.length>1?'s':''} à retravailler.</p><button class="button full" data-action="start-errors">Reprendre mes erreurs</button><ul class="error-list">${errors.slice(0,5).map(q=>`<li><span>${q.topic}</span>${esc(q.prompt)}</li>`).join('')}</ul>${errors.length>5?`<p class="muted small-text">Et ${errors.length-5} autre${errors.length-5>1?'s':''}.</p>`:''}`:'<p>Les questions ratées apparaîtront ici après tes essais.</p>'}</section><section class="panel"><h2>Mes derniers essais</h2>${history.length?`<div class="history-list">${history.map(h=>`<div><span>${h.mode==='exam'?'Contrôle':'Entraînement'}<small>${formatDate(h.at)}</small></span><b>${h.correct} / ${h.total}</b></div>`).join('')}</div>`:'<p class="muted">Termine une première séance pour voir ton score ici.</p>'}</section></div></div><div class="reset-section"><p>Les résultats sont gardés sur cet appareil.</p><button class="link-button" data-action="reset">Effacer mes résultats</button></div>`;
}

function render(focus=false) {
  const parts=(location.hash.slice(1)||'accueil').split('/');
  const route=['accueil','cours','entrainement','controle','progres'].includes(parts[0])?parts[0]:'accueil';
  document.querySelectorAll('[data-nav]').forEach(a=>{
    if(a.dataset.nav===route) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
  if(route==='cours') {
    if(lessonById.has(parts[1])&&currentCourse!==parts[1]) {currentCourse=parts[1];courseRevealed=false;}
    main.innerHTML=course();
  } else if(route==='entrainement') {
    main.innerHTML=state.training ? (state.training.complete?results(state.training):questionView(state.training)) : practiceIntro();
  } else if(route==='controle') {
    main.innerHTML=state.exam ? questionView(state.exam,true) : showExamResult&&state.lastExam ? results(state.lastExam,true) : examIntro();
  } else if(route==='progres') main.innerHTML=progress();
  else main.innerHTML=home();
  if(focus) {
    window.scrollTo({top:0,behavior:'instant'});
    (document.querySelector('#question-title')||main).focus({preventScroll:true});
  }
}

function newSession(pool) {
  return {ids:pool.map(q=>q.id),index:0,answers:{},graded:{},startedAt:Date.now(),
    options:Object.fromEntries(pool.filter(q=>q.type==='choice').map(q=>[q.id,shuffle(q.options)]))};
}

function beginPractice({topic='all',category='all',errorsOnly=false,ids=null}={}) {
  const pool=ids ? shuffle(ids.map(id=>byId.get(id)).filter(Boolean)).slice(0,10)
    : selectPractice(questions,state.records,10,{topic,category,errorsOnly});
  if(!pool.length) {
    main.insertAdjacentHTML('afterbegin','<p class="empty-message" role="status">Aucune question dans cette sélection. Choisis une autre partie ou un autre type.</p>');
    return;
  }
  state.training=newSession(pool);
  save();go('entrainement');
}

function currentAnswer() {
  const form=document.getElementById('answer-form');
  if(!form) return '';
  return form.querySelector('input[type="text"]')?.value ?? form.querySelector('input[type="radio"]:checked')?.value ?? '';
}

function storeInput() {
  const form=document.getElementById('answer-form');
  if(!form) return;
  const s=form.dataset.mode==='exam'?state.exam:state.training;
  if(!s) return;
  s.answers[form.dataset.id]=currentAnswer();
  save();
  const count=document.getElementById('answered-count');
  if(count) count.textContent=Object.values(s.answers).filter(a=>a.trim()).length;
  if(form.dataset.mode==='exam') {
    document.querySelectorAll('.question-grid button').forEach(b=>{
      const id=s.ids[Number(b.dataset.index)];
      const answered=Boolean(s.answers[id]?.trim());
      b.classList.toggle('answered',answered);
      b.setAttribute('aria-label',`Question ${Number(b.dataset.index)+1}${answered?', répondue':''}`);
    });
  }
}

function gradePractice() {
  const form=document.getElementById('answer-form');
  if(!form.reportValidity()) return;
  const s=state.training;
  const q=byId.get(s.ids[s.index]);
  if(Object.hasOwn(s.graded,q.id)) return;
  const answer=currentAnswer().trim();
  if(!answer) return;
  s.answers[q.id]=answer;
  s.graded[q.id]=isCorrect(q,answer);
  state.records[q.id]=recordAttempt(state.records[q.id],s.graded[q.id]);
  save();render();document.getElementById('feedback')?.focus({preventScroll:true});
}

function finishPractice() {
  const s=state.training;
  if(!s || s.complete) return;
  const score=scoreSession(s,questions);
  state.history.push({mode:'practice',correct:score.correct,total:score.total,at:Date.now()});
  state.history=state.history.slice(-30);
  s.complete=true;save();render(true);
}

function finishExam() {
  const s=state.exam;
  if(!s) return;
  storeInput();
  const score=scoreSession(s,questions);
  for(const r of score.rows) state.records[r.question.id]=recordAttempt(state.records[r.question.id],r.correct);
  state.history.push({mode:'exam',correct:score.correct,total:score.total,at:Date.now()});
  state.history=state.history.slice(-30);
  state.lastExam={...s,completedAt:Date.now()};state.exam=null;showExamResult=true;
  document.getElementById('finish-dialog').close();
  save();render(true);
}

function requestFinish() {
  storeInput();
  const remaining=state.exam.ids.filter(id=>!state.exam.answers[id]?.trim()).length;
  if(!remaining) {finishExam();return;}
  document.getElementById('finish-warning').textContent=`Il reste ${remaining} question${remaining>1?'s':''} sans réponse. Elles compteront comme incorrectes si tu termines maintenant.`;
  document.getElementById('finish-dialog').showModal();
}

document.addEventListener('submit',event=>{
  if(event.target.id==='practice-setup') {
    event.preventDefault();const form=new FormData(event.target);
    beginPractice({topic:form.get('topic'),category:form.get('category')});
  } else if(event.target.id==='answer-form') {
    event.preventDefault();
    if(event.target.dataset.mode==='practice') gradePractice();
    else {storeInput(); if(state.exam.index+1===state.exam.ids.length) requestFinish();else {state.exam.index++;save();render(true);}}
  }
});
document.addEventListener('input',event=>{if(event.target.closest('#answer-form')) storeInput();});
document.addEventListener('click',event=>{
  const b=event.target.closest('[data-action]');if(!b || b.disabled) return;
  const a=b.dataset.action;
  if(a==='start-practice') beginPractice();
  if(a==='practice-topic') beginPractice({topic:b.dataset.topic});
  if(a==='start-errors') beginPractice({errorsOnly:true});
  if(a==='resume-practice') go('entrainement');
  if(a==='new-practice') {state.training=null;save();go('entrainement');}
  if(a==='toggle-course') {courseRevealed=!courseRevealed;render();document.querySelector('[data-action="toggle-course"]').focus();}
  if(a==='next-practice') {if(state.training.index+1===state.training.ids.length) finishPractice();else {state.training.index++;save();render(true);}}
  if(a==='retry-session') {
    const s=b.dataset.mode==='exam'?state.lastExam:state.training;
    beginPractice({ids:scoreSession(s,questions).rows.filter(r=>!r.correct).map(r=>r.question.id)});
  }
  if(a==='start-exam') {state.exam=newSession(selectExam(questions,lessons.map(l=>l.id)));showExamResult=false;save();render(true);}
  if(a==='new-exam') {showExamResult=false;render(true);}
  if(a==='last-exam') {showExamResult=true;render(true);}
  if(a==='next-exam') {storeInput();if(state.exam.index+1===state.exam.ids.length) requestFinish();else {state.exam.index++;save();render(true);}}
  if(a==='previous-exam') {storeInput();state.exam.index--;save();render(true);}
  if(a==='jump-exam') {storeInput();state.exam.index=Number(b.dataset.index);save();render(true);}
  if(a==='request-finish') requestFinish();
  if(a==='cancel-finish') document.getElementById('finish-dialog').close();
  if(a==='confirm-finish') finishExam();
  if(a==='sources') document.getElementById('sources-dialog').showModal();
  if(a==='close-sources') document.getElementById('sources-dialog').close();
  if(a==='reset') document.getElementById('reset-dialog').showModal();
  if(a==='cancel-reset') document.getElementById('reset-dialog').close();
  if(a==='confirm-reset') {state=freshState();showExamResult=false;save();document.getElementById('reset-dialog').close();render(true);}
});
window.addEventListener('hashchange',()=>render(true));
save();render();
