// app.js - Fixed & Verified
(function(){
  // DOM Refs
  const modulesEl = document.getElementById('modules');
  const lessonTitle = document.getElementById('lessonTitle');
  const lessonSub = document.getElementById('lessonSub');
  const lessonContent = document.getElementById('lessonContent');
  
  // State
  const STATE_KEY = 'neonhack_state_v1';
  function loadState(){ return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); }
  function saveState(s){ localStorage.setItem(STATE_KEY, JSON.stringify(s)); }
  const data = window.curriculum || []; // This loads data from content.js

  // Init
  function loadModules(){
    if(!modulesEl) return;
    modulesEl.innerHTML = '';
    data.forEach(m=>{
      const div = document.createElement('div');
      div.className = 'module-item';
      div.innerHTML = `<strong>${m.title}</strong><div style="font-size:12px;color:#98a0b3">${m.description||''}</div>`;
      div.onclick = ()=>renderModule(m, div);
      modulesEl.appendChild(div);
    });
  }

  function renderModule(m, node){
    // Highlight active module
    if(modulesEl && modulesEl.children) {
        Array.from(modulesEl.children).forEach(c=>c.classList.remove('active'));
    }
    if(node) node.classList.add('active');
    
    if(lessonTitle) lessonTitle.innerText = m.title;
    if(lessonSub) lessonSub.innerText = m.description || '';
    if(lessonContent) lessonContent.innerHTML = '';
    
    (m.lessons || []).forEach(l=>{
      const card = document.createElement('div');
      card.className = 'lesson-card';
      card.innerHTML = `<h3>${l.title}</h3>
        <div style="margin-top:8px"><button class="btn open">Open Lesson</button> <button class="btn alt openRef">Open Book</button></div>`;
      
      // Open Lesson Button
      const openBtn = card.querySelector('.open');
      if(openBtn) openBtn.onclick = ()=>renderLesson(m,l);
      
      // Open Book Button logic
      const refBtn = card.querySelector('.openRef');
      const firstRef = l.reading && l.reading[0];
      
      if(refBtn) {
          refBtn.onclick = ()=>{ 
            if(firstRef && firstRef.path){ 
               // Check if startPage exists
               const url = firstRef.startPage 
                 ? `${firstRef.path}#page=${firstRef.startPage}` 
                 : firstRef.path;
               window.open(url, '_blank'); 
            } else { 
               alert('No PDF reference for this lesson.'); 
            } 
          };
      }
      if(lessonContent) lessonContent.appendChild(card);
    });
  }

  function renderLesson(module, lesson){
    if(lessonTitle) lessonTitle.innerText = lesson.title;
    if(lessonContent) lessonContent.innerHTML = '';
    
    const theory = document.createElement('div'); 
    theory.className='lesson-card';
    theory.innerHTML = `<h3>Theory</h3><p>${(lesson.theory||'').replace(/\n/g,'<br>')}</p>`;
    
    // Reading List
    const read = document.createElement('div'); 
    read.className='lesson-card';
    const readingLinks = (lesson.reading||[]).map(r => {
      const url = r.startPage ? `${r.path}#page=${r.startPage}` : r.path;
      return `<li><a href="${url}" target="_blank">${r.file} (Click to Read)</a></li>`;
    }).join('');
    read.innerHTML = `<h3>Reading Material</h3><ul>${readingLinks}</ul>`;

    lessonContent.appendChild(theory);
    lessonContent.appendChild(read);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  // Start
  if(data.length > 0) {
      loadModules();
      renderModule(data[0]);
  } else {
      console.error("No curriculum data found. Check content.js");
  }
})();
