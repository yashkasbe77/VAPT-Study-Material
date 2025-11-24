// app.js - NeonHack Academy interactive engine
(function(){
  // --- DOM Refs ---
  const modulesEl = document.getElementById('modules');
  const lessonTitle = document.getElementById('lessonTitle');
  const lessonSub = document.getElementById('lessonSub');
  const lessonContent = document.getElementById('lessonContent');
  const questsList = document.getElementById('questsList');
  const badgesEl = document.getElementById('badges');
  const xpFill = document.getElementById('xpFill');
  const xpLabel = document.getElementById('xpLabel');
  const quizArea = document.getElementById('quizArea');
  const quizQuestion = document.getElementById('quizQuestion');
  const quizOptions = document.getElementById('quizOptions');
  const nextQuestion = document.getElementById('nextQuestion');
  const endQuiz = document.getElementById('endQuiz');

  // --- Confetti Engine ---
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ctx = confettiCanvas.getContext('2d');
  let W = confettiCanvas.width = window.innerWidth;
  let H = confettiCanvas.height = window.innerHeight;
  window.addEventListener('resize', ()=>{ W = confettiCanvas.width = window.innerWidth; H = confettiCanvas.height = window.innerHeight; });

  const confetti = [];
  let running = false;

  function spawnConfetti(n=50){
    for(let i=0;i<n;i++){
      confetti.push({x:Math.random()*W, y:-10-Math.random()*200, vx:(Math.random()-0.5)*6, vy:2+Math.random()*5, s:6+Math.random()*8, hue:Math.random()*360});
    }
    if(!running) run();
  }

  function run(){
    running = true;
    const frame = ()=>{
      ctx.clearRect(0,0,W,H);
      for(let i=confetti.length-1;i>=0;i--){
        const p = confetti[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.06;
        ctx.fillStyle = `hsl(${p.hue} 70% 60%)`;
        ctx.fillRect(p.x,p.y,p.s,p.s);
        if(p.y>H+50) confetti.splice(i,1);
      }
      if(confetti.length>0) requestAnimationFrame(frame); else { running=false; ctx.clearRect(0,0,W,H); }
    };
    requestAnimationFrame(frame);
  }

  // --- State Helpers ---
  const STATE_KEY = 'neonhack_state_v1';
  function loadState(){ return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); }
  function saveState(s){ localStorage.setItem(STATE_KEY, JSON.stringify(s)); }

  const data = window.curriculum || [];
  
  function initState(){
    const s = loadState();
    if(!s.xp) s.xp = 0;
    if(!s.level) s.level = 1;
    if(!s.progress) s.progress = {}; // progress[moduleId:lessonId]=true
    if(!s.quests) s.quests = [{id:'q-welcome',title:'Complete 1 lesson',xp:50,done:false}];
    saveState(s);
  }
  initState();

  // --- Core Rendering Functions ---

  // 1. Render Modules Sidebar
  function loadModules(){
    modulesEl.innerHTML = '';
    data.forEach(m=>{
      const div = document.createElement('div');
      div.className = 'module-item';
      div.innerHTML = `<strong>${m.title}</strong><div style="font-size:12px;color:var(--muted)">${m.description||''}</div>`;
      div.onclick = ()=>renderModule(m, div);
      modulesEl.appendChild(div);
    });
  }

  // 2. Render Module & List Lessons (Updated with PDF Page Logic)
  function renderModule(m, node){
    Array.from(modulesEl.children).forEach(c=>c.classList.remove('active'));
    if(node) node.classList.add('active');
    
    lessonTitle.innerText = m.title;
    lessonSub.innerText = m.description || '';
    lessonContent.innerHTML = '';
    
    (m.lessons || []).forEach(l=>{
      const card = document.createElement('div');
      card.className = 'lesson-card';
      card.innerHTML = `<h3>${l.title}</h3><div style="color:var(--muted);font-size:13px">${(l.objectives||[]).slice(0,2).join(' • ')}</div>
        <div style="margin-top:8px"><button class="btn open">Open</button> <button class="btn alt openRef">Open Book</button></div>`;
      
      card.querySelector('.open').onclick = ()=>renderLesson(m,l);
      
      // logic for "Open Book" button on the card
      const refBtn = card.querySelector('.openRef');
      const firstRef = l.reading && l.reading[0]; // Get the first reading material
      
      refBtn.onclick = ()=>{ 
        if(firstRef && firstRef.path){ 
           const url = firstRef.startPage 
             ? `${firstRef.path}#page=${firstRef.startPage}` 
             : firstRef.path;
           window.open(url, '_blank'); 
        } else { 
           alert('No PDF reference for this lesson.'); 
        } 
      };

      lessonContent.appendChild(card);
    });
  }

  // 3. Render Lesson Content (Updated with PDF Page Logic in Reading List)
  let currentLesson = null, quizState = null;
  
  function renderLesson(module, lesson){
    currentLesson = {module, lesson};
    lessonTitle.innerText = lesson.title;
    lessonSub.innerText = module.title;
    lessonContent.innerHTML = '';
    
    // Theory Section
    const theory = document.createElement('div'); theory.className='lesson-card';
    theory.innerHTML = `<h3>Theory</h3><p>${(lesson.theory||'No theory available.').replace(/\n/g,'<br>')}</p>`;
    
    // Labs Section
    const labs = document.createElement('div'); labs.className='lesson-card';
    labs.innerHTML = `<h3>Labs & Exercises</h3><ol id="labList">${(lesson.labs||[]).map(l=>`<li><strong>${l.title}</strong><pre>${(l.steps||[]).join('\\n')}</pre></li>`).join('')}</ol>`;
    
    // Reading Section (Updated)
    const read = document.createElement('div'); read.className='lesson-card';
    const readingLinks = (lesson.reading||[]).map(r => {
      const url = r.startPage ? `${r.path}#page=${r.startPage}` : r.path;
      const pageLabel = r.startPage ? `pg. ${r.startPage}` : 'index';
      return `<li><a href="${url}" target="_blank">${r.file} — ${pageLabel}</a></li>`;
    }).join('');
    read.innerHTML = `<h3>Reading</h3><ul>${readingLinks}</ul>`;
    
    // Actions Section
    const actions = document.createElement('div'); actions.className='lesson-card';
    actions.innerHTML = `<button class="btn startQuiz">Start Quiz</button> <button class="btn alt markDone">Mark Complete</button>`;
    
    lessonContent.appendChild(theory); lessonContent.appendChild(labs); lessonContent.appendChild(read); lessonContent.appendChild(actions);
    
    actions.querySelector('.startQuiz').onclick = ()=>startQuiz(lesson);
    actions.querySelector('.markDone').onclick = ()=>markComplete(module.id, lesson.id);
    
    window.scrollTo({top:0,behavior:'smooth'});
  }

  // --- Gamification Logic ---

  function markComplete(moduleId, lessonId){
    const s = loadState();
    s.progress[`${moduleId}:${lessonId}`] = true;
    saveState(s);
    awardXP(50);
    checkQuests();
    renderBadges();
    spawnConfetti(40);
    alert('Lesson marked complete — XP awarded!');
  }

  function awardXP(amount){
    const s = loadState();
    s.xp = (s.xp || 0) + Math.floor(amount);
    const newLevel = Math.floor(s.xp / 200) + 1;
    if(newLevel > (s.level||1)){
      s.level = newLevel;
      spawnConfetti(80);
      playSound('sfx-level');
      alert(`🎉 Congratulations — you reached Level ${s.level}!`);
    }
    saveState(s);
    updateXPUI();
  }

  function updateXPUI(){
    const s = loadState();
    const pct = Math.min(100, Math.round((s.xp % 200)/2));
    xpFill.style.width = pct + '%';
    xpLabel.innerText = `Level ${s.level||1} • XP ${s.xp||0}`;
  }

  function renderQuests(){
    const s = loadState();
    questsList.innerHTML = '';
    (s.quests || []).forEach(q=>{
      const li = document.createElement('li');
      li.innerHTML = `<strong>${q.title}</strong> ${q.done?'<em style="color:var(--muted)">✓ done</em>':`<button class="btn small">Attempt</button>`}`;
      if(!q.done) li.querySelector('button').onclick = ()=>attemptQuest(q.id);
      questsList.appendChild(li);
    });
  }

  function attemptQuest(id){
    const s = loadState();
    // for demo: completing a quest marks first uncompleted lesson
    const allLessons = data.flatMap(m=> (m.lessons||[]).map(l=>({m:m.id,l:l.id})));
    const target = allLessons.find(x=>!s.progress[`${x.m}:${x.l}`]);
    if(target){
      markComplete(target.m, target.l);
      const q = s.quests.find(q=>q.id===id); if(q) q.done=true;
      awardXP( (q && q.xp) ? q.xp : 40 );
      saveState(s);
      renderQuests();
      spawnConfetti(30);
    } else alert('No incomplete lessons found — complete modules first.');
  }

  function checkQuests(){
    const s = loadState();
    const doneCount = Object.keys(s.progress || {}).length;
    if(doneCount >= 5 && !s.quests.find(q=>q.id==='q-five')){
      s.quests.push({id:'q-five',title:'Complete 5 lessons',xp:120,done:false});
      saveState(s);
    }
    renderQuests();
  }

  function renderBadges(){
    badgesEl.innerHTML = '';
    const s = loadState();
    const done = Object.keys(s.progress||{}).length;
    if(done>0) { const b=document.createElement('div'); b.className='badge'; b.textContent = `Learner • ${done} lessons`; badgesEl.appendChild(b); }
    if(s.level >= 3){ const b2 = document.createElement('div'); b2.className='badge'; b2.textContent = 'Intermediate Hacker'; badgesEl.appendChild(b2); }
  }

  // --- Quiz Engine ---

  function startQuiz(lesson){
    if(!lesson.quiz || lesson.quiz.length===0) return alert('No quiz for this lesson.');
    quizState = { lesson, idx:0, score:0 };
    showQuestion();
  }

  function showQuestion(){
    const q = quizState.lesson.quiz[quizState.idx];
    quizArea.classList.remove('hidden');
    quizQuestion.innerText = q.q;
    quizOptions.innerHTML = '';
    q.options.forEach((opt,i)=>{
      const li = document.createElement('li'); li.innerText = opt;
      li.onclick = ()=>{
        if(i===q.a){ li.classList.add('correct'); quizState.score++; playSound('sfx-correct'); }
        else li.classList.add('wrong');
        Array.from(quizOptions.children).forEach(c=>c.onclick=null);
      };
      quizOptions.appendChild(li);
    });
  }

  nextQuestion.onclick = ()=>{
    quizState.idx++;
    if(quizState.idx >= quizState.lesson.quiz.length){
      const score = quizState.score;
      alert(`Quiz finished: ${score}/${quizState.lesson.quiz.length}`);
      awardXP(30 * (score/quizState.lesson.quiz.length));
      quizArea.classList.add('hidden');
    } else showQuestion();
  };
  endQuiz.onclick = ()=>{ quizArea.classList.add('hidden'); };

  function playSound(id){
    try{ const el = document.getElementById(id); if(el) { el.currentTime=0; el.volume=0.22; el.play().catch(()=>{}); } } catch(e){}
  }

  // --- Initialization ---
  loadModules();
  updateXPUI();
  renderQuests();
  renderBadges();
  if(data.length) renderModule(data[0]);

  // Expose small API for debugging
  window._neon = { awardXP, spawnConfetti: (n)=>spawnConfetti(n), state: loadState };

})();