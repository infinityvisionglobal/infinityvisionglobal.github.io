(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Shared visual layers are injected on every page.
  const progress = document.createElement('div');
  progress.id = 'scrollProgress';
  document.body.prepend(progress);

  const ambient = document.createElement('div');
  ambient.className = 'ambient';
  ambient.setAttribute('aria-hidden','true');
  ambient.innerHTML = '<div class="orb o1"></div><div class="orb o2"></div><div class="orb o3"></div>';
  document.body.prepend(ambient);

  const waveCanvas = document.createElement('canvas');
  waveCanvas.id = 'xmbWaves';
  waveCanvas.setAttribute('aria-hidden','true');
  document.body.prepend(waveCanvas);

  const particleCanvas = document.createElement('canvas');
  particleCanvas.id = 'particles';
  particleCanvas.setAttribute('aria-hidden','true');
  document.body.prepend(particleCanvas);

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden','true');
  document.body.prepend(glow);

  const waveCtx = waveCanvas.getContext('2d');
  const pctx = particleCanvas.getContext('2d');
  let dpr = 1;

  function resizeCanvases(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    [waveCanvas, particleCanvas].forEach(c => {
      c.width = Math.floor(innerWidth * dpr);
      c.height = Math.floor(innerHeight * dpr);
      c.style.width = innerWidth + 'px';
      c.style.height = innerHeight + 'px';
    });
    waveCtx.setTransform(dpr,0,0,dpr,0,0);
    pctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resizeCanvases();
  addEventListener('resize', resizeCanvases, {passive:true});

  const waveSets = [
    {y:.28,amp:70,speed:.44,freq:.0064,width:5.0,alpha:.40,phase:0.0,tint:[102,170,232]},
    {y:.34,amp:54,speed:.34,freq:.0072,width:3.1,alpha:.31,phase:1.7,tint:[150,207,255]},
    {y:.46,amp:86,speed:.24,freq:.0055,width:4.0,alpha:.26,phase:3.2,tint:[116,183,241]},
    {y:.59,amp:62,speed:.19,freq:.0068,width:2.2,alpha:.20,phase:4.8,tint:[194,229,255]},
    {y:.72,amp:80,speed:.15,freq:.0049,width:2.8,alpha:.16,phase:2.4,tint:[128,192,247]}
  ];

  function drawWave(w,t){
    const W=innerWidth,H=innerHeight,baseY=H*w.y,phase=t*.001*w.speed+w.phase;
    waveCtx.beginPath();
    for(let x=-80;x<=W+80;x+=6){
      const envelope=.72+.28*Math.sin((x/W)*Math.PI);
      const y=baseY+Math.sin(x*w.freq+phase)*w.amp*envelope+Math.sin(x*w.freq*.47-phase*.72)*(w.amp*.28);
      x===-80?waveCtx.moveTo(x,y):waveCtx.lineTo(x,y);
    }
    const g=waveCtx.createLinearGradient(0,0,W,0);
    g.addColorStop(0,`rgba(${w.tint[0]},${w.tint[1]},${w.tint[2]},0)`);
    g.addColorStop(.15,`rgba(${w.tint[0]},${w.tint[1]},${w.tint[2]},${w.alpha*.48})`);
    g.addColorStop(.48,`rgba(255,255,255,${Math.min(.72,w.alpha*1.55)})`);
    g.addColorStop(.72,`rgba(${w.tint[0]},${w.tint[1]},${w.tint[2]},${w.alpha})`);
    g.addColorStop(1,`rgba(${w.tint[0]},${w.tint[1]},${w.tint[2]},0)`);
    waveCtx.strokeStyle=g;waveCtx.lineWidth=w.width;waveCtx.lineCap='round';waveCtx.shadowBlur=20;waveCtx.shadowColor=`rgba(${w.tint[0]},${w.tint[1]},${w.tint[2]},${w.alpha})`;waveCtx.stroke();

    waveCtx.beginPath();
    for(let x=-80;x<=W+80;x+=7){
      const y=baseY+12+Math.sin(x*w.freq+phase+.14)*(w.amp*.97)+Math.sin(x*w.freq*.47-phase*.72)*(w.amp*.24);
      x===-80?waveCtx.moveTo(x,y):waveCtx.lineTo(x,y);
    }
    waveCtx.strokeStyle=`rgba(255,255,255,${Math.max(.06,w.alpha*.30)})`;
    waveCtx.lineWidth=Math.max(1,w.width*.28);waveCtx.shadowBlur=9;waveCtx.stroke();
  }

  function animateWaves(t){
    waveCtx.clearRect(0,0,innerWidth,innerHeight);
    waveCtx.save();
    waveCtx.globalCompositeOperation='multiply';
    waveSets.forEach(w => drawWave(w,t));
    waveCtx.restore();
    if(!reduced) requestAnimationFrame(animateWaves);
  }
  requestAnimationFrame(animateWaves);

  const pts=[];
  const count=reduced?0:Math.min(54,Math.floor(innerWidth/26));
  for(let i=0;i<count;i++) pts.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.5+Math.random()*1.4,vx:-.1+Math.random()*.2,vy:-.07+Math.random()*.14,a:.08+Math.random()*.22});
  function animateParticles(){
    if(reduced)return;
    pctx.clearRect(0,0,innerWidth,innerHeight);
    pts.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<-5)p.x=innerWidth+5;if(p.x>innerWidth+5)p.x=-5;if(p.y<-5)p.y=innerHeight+5;if(p.y>innerHeight+5)p.y=-5;
      pctx.beginPath();pctx.arc(p.x,p.y,p.r,0,Math.PI*2);pctx.fillStyle=`rgba(111,168,230,${p.a})`;pctx.fill();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  if(matchMedia('(pointer:fine)').matches){
    addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';},{passive:true});
  } else glow.style.display='none';

  const header=document.querySelector('.site-header');
  function scrollUI(){
    const y=scrollY||document.documentElement.scrollTop;
    if(header)header.classList.toggle('scrolled',y>18);
    const max=document.documentElement.scrollHeight-document.documentElement.clientHeight;
    progress.style.width=(max>0?(y/max)*100:0)+'%';
  }
  addEventListener('scroll',scrollUI,{passive:true});scrollUI();

  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}}),{threshold:.10});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // Optional bilingual content on the corporate home page.
  const langButtons=[...document.querySelectorAll('[data-set-lang]')];
  function setLang(lang){
    document.documentElement.lang=lang;
    try{localStorage.setItem('iva-lang',lang)}catch(e){}
    document.querySelectorAll('[data-lang]').forEach(el=>{el.hidden=el.dataset.lang!==lang});
    langButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.setLang===lang));
  }
  langButtons.forEach(btn=>btn.addEventListener('click',()=>setLang(btn.dataset.setLang)));
  if(langButtons.length){
    let saved=null;try{saved=localStorage.getItem('iva-lang')}catch(e){}
    const preferred=saved || ((navigator.language||'').toLowerCase().startsWith('de')?'de':'en');
    setLang(preferred);
  }

  // Build a compact table of contents for long legal documents.
  const toc=document.querySelector('.toc');
  const doc=document.querySelector('.legal-document');
  if(toc&&doc){
    const headings=[...doc.querySelectorAll('h2')];
    if(headings.length){
      const title=document.createElement('div');title.className='toc-title';title.textContent=document.documentElement.lang==='de'?'Inhalt':'Contents';toc.appendChild(title);
      headings.forEach((h,i)=>{
        if(!h.id)h.id='section-'+(i+1);
        const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;toc.appendChild(a);
      });
    }
  }
})();
