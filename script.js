const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');
let width, height, particles = [], ambientDots = [];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth; height = window.innerHeight;
  canvas.width = width * dpr; canvas.height = height * dpr;
  canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ambientDots = Array.from({length: Math.min(48, Math.floor(width / 13))}, () => ({
    x: Math.random()*width, y: Math.random()*height, r: Math.random()*1.4+.3,
    a: Math.random()*.35+.08, phase: Math.random()*6.28
  }));
}
window.addEventListener('resize', resize); resize();

function burst(x, y) {
  const colors = ['#ffc66d','#ff8d5c','#f28c9c','#fff4df','#c6a5ed','#9ee0b3'];
  const count = 65;
  for(let i=0;i<count;i++){
    const angle = Math.PI*2*i/count + Math.random()*.08;
    const speed = 1.1 + Math.random()*3.2;
    particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
      life:55+Math.random()*35,max:90,size:1+Math.random()*2.2,color:colors[Math.floor(Math.random()*colors.length)]});
  }
}
function animate(t=0) {
  ctx.clearRect(0,0,width,height);
  ambientDots.forEach(p=>{
    const alpha=p.a*(.65+.35*Math.sin(t*.0008+p.phase));
    ctx.fillStyle=`rgba(255,220,170,${alpha})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  });
  particles = particles.filter(p=>p.life>0);
  particles.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;p.vy+=.025;p.vx*=.992;p.life--;
    ctx.globalAlpha=Math.max(0,p.life/45);ctx.fillStyle=p.color;
    ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
  });
  ctx.globalAlpha=1;
  if(!reducedMotion) requestAnimationFrame(animate);
}
if(!reducedMotion) requestAnimationFrame(animate);

const toast = document.getElementById('toast');
let toastTimer;
function showToast(message){
  toast.textContent=message;toast.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2300);
}
function celebrate(){
  burst(width*.28+Math.random()*width*.44,height*.22+Math.random()*height*.25);
  setTimeout(()=>burst(width*.25+Math.random()*width*.5,height*.2+Math.random()*height*.28),260);
}
document.getElementById('celebrateBtn').addEventListener('click',()=>{celebrate();showToast('A little sparkle, just for you ✦');});
document.getElementById('fireworkHint').addEventListener('click',()=>{celebrate();showToast('Make a wish ✨');});
document.getElementById('scrollBtn').addEventListener('click',()=>document.getElementById('moments').scrollIntoView({behavior:reducedMotion?'auto':'smooth'}));
document.getElementById('lightBtn').addEventListener('click',()=>{
  document.body.classList.toggle('extra-glow');
  const active=document.body.classList.contains('extra-glow');
  document.querySelector('.mini-flame').style.filter=active?'brightness(1.35) drop-shadow(0 0 15px #ffd27a)':'';
  showToast(active?'Your diya is glowing brighter 🪔':'A gentle glow remains ✦');
});

canvas.addEventListener('pointerdown',e=>{
  burst(e.clientX,e.clientY);
});

let audioCtx=null, soundOn=false, soundTimer=null;
function bell(){
  if(!audioCtx || !soundOn) return;
  const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
  osc.type='sine';osc.frequency.setValueAtTime(660,audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(990,audioCtx.currentTime+.16);
  gain.gain.setValueAtTime(.0001,audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.035,audioCtx.currentTime+.02);
  gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.7);
  osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+.72);
}
document.getElementById('soundToggle').addEventListener('click',async()=>{
  const btn=document.getElementById('soundToggle');
  if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended') await audioCtx.resume();
  soundOn=!soundOn;btn.setAttribute('aria-pressed',String(soundOn));
  document.getElementById('soundLabel').textContent=soundOn?'Sound on':'Sound off';
  if(soundOn){bell();soundTimer=setInterval(bell,4200);showToast('Soft celebration tones enabled');}
  else{clearInterval(soundTimer);showToast('Sound turned off');}
});

document.getElementById('shareBtn').addEventListener('click',async()=>{
  const shareData={title:'Happy Diwali — Light Up the Night',text:'Wishing you brighter beginnings, warm moments and a beautiful Diwali! ✨'};
  const status=document.getElementById('shareStatus');
  try{
    if(navigator.share) await navigator.share(shareData);
    else if(navigator.clipboard){await navigator.clipboard.writeText(shareData.text);status.textContent='Greeting copied!';}
    else{status.textContent='Happy Diwali! ✨';}
  }catch(err){if(err.name!=='AbortError') status.textContent='Happy Diwali! ✨';}
});
document.getElementById('backTop').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:reducedMotion?'auto':'smooth'});});
