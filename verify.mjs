import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CONTENT } from './dist/content.mjs';
import { normalizeAnswer,isCorrect,recordAttempt,selectPractice,selectExam,scoreSession,
  cleanState,freshState,DAY } from './dist/core.mjs';

const {questions,lessons}=CONTENT;
assert.equal(questions.length,56);
assert.equal(lessons.length,10);
assert.equal(new Set(questions.map(q=>q.id)).size,56);
for(const q of questions) {
  assert.ok(q.prompt && q.answer && q.explanation);
  assert.ok(lessons.some(l=>l.id===q.topic));
  assert.equal(isCorrect(q,''),false);
  assert.equal(isCorrect(q,q.answer),true,q.id);
  if(q.type==='choice') {
    assert.equal(new Set(q.options).size,4);
    for(const option of q.options) assert.equal(isCorrect(q,option),option===q.answer);
  } else {
    for(const alias of q.accepted) assert.equal(isCorrect(q,alias),true);
  }
}
assert.equal(normalizeAnswer('  La MOSQUÉE  '),'mosquee');
assert.equal(normalizeAnswer('Aix-la-Chapelle'),normalizeAnswer('aix la chapelle'));
const date=questions.find(q=>q.id==='H4-622');
assert.equal(isCorrect(date,'En 622'),true);
assert.equal(isCorrect(date,'632'),false);
assert.equal(isCorrect(date,'1622'),false);
assert.equal(isCorrect(questions.find(q=>q.id==='H6-capitale'),'Byzance'),false);
const now=1791700000000;
let record=recordAttempt(null,true,now);
assert.equal(record.dueAt,now+DAY);
record=recordAttempt(record,true,now+DAY);
assert.equal(record.dueAt,now+4*DAY);
record=recordAttempt(record,false,now+4*DAY);
assert.equal(record.streak,0);
assert.equal(record.dueAt,now+4*DAY);
const records={[date.id]:record};
assert.equal(selectPractice(questions,records,10,{now:now+5*DAY})[0].id,date.id);
assert.equal(selectPractice(questions,records,10,{errorsOnly:true}).length,1);
assert.equal(selectPractice(questions,{},10,{errorsOnly:true}).length,0);
for(const l of lessons) {
  const selected=selectPractice(questions,{},10,{topic:l.id});
  assert.ok(selected.length>=4 && selected.every(q=>q.topic===l.id));
}
for(let i=0;i<50;i++) {
  const exam=selectExam(questions,lessons.map(l=>l.id));
  assert.equal(exam.length,20);
  assert.equal(new Set(exam.map(q=>q.id)).size,20);
  for(const l of lessons) assert.equal(exam.filter(q=>q.topic===l.id).length,2);
}
const exam=selectExam(questions,lessons.map(l=>l.id));
const session={ids:exam.map(q=>q.id),answers:Object.fromEntries(exam.map(q=>[q.id,q.answer]))};
assert.equal(scoreSession(session,questions).correct,20);
delete session.answers[exam[0].id];
session.answers[exam[1].id]='an incorrect answer';
assert.equal(scoreSession(session,questions).correct,18);
assert.deepEqual(cleanState({version:99},questions),freshState());
assert.equal(cleanState({version:1,exam:{ids:['missing'],answers:{}}},questions).exam,null);
assert.equal(cleanState({version:1,history:[{correct:2,total:3}]},questions).history.length,0);
const persisted=cleanState({version:1,records,exam:{...session,index:19,options:{},startedAt:now},history:[]},questions);
assert.equal(persisted.exam.index,19);
assert.equal(scoreSession(persisted.exam,questions).correct,18);
assert.equal(persisted.records[date.id].lastCorrect,false);
for(const name of ['index.html','styles.css','app.mjs','content.mjs','core.mjs','icon.svg','cahier-revision.pdf']) assert.ok(fs.statSync('dist/'+name).size>0,name);
const report={passed:true,lessons:10,questions:56,balanced_exams_checked:50,
  validated:['short answer normalization','incorrect and blank answers','spaced review','balanced exam','scoring','saved session recovery','required assets']};
console.log(JSON.stringify(report,null,2));
