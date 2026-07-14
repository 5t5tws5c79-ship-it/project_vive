// 크로스페이드 플레이어 — <audio> 2채널 볼륨 램프. DOM audio 엘리먼트 2개만 있으면 됨.
// 파일 재생이라 CORS 불필요. 음원 URL은 밖에서 주입.
// cur = 현재 트랙 채널(크로스페이드 시작 즉시 갱신) → pause/resume이 항상 올바른 채널을 잡음.
window.CrossfadePlayer = function (el0, el1) {
  const au = [el0, el1];
  let cur = 0, vol = 85, timer = null;
  au[0].volume = 0; au[1].volume = 0;

  function stopTimer(){ if (timer) { clearInterval(timer); timer = null; } }

  function crossfade(url, durMs) {
    const dur = durMs || 3000;
    const inA = 1 - cur, inEl = au[inA], outEl = au[cur];
    inEl.src = url; inEl.volume = 0;
    const pr = inEl.play(); if (pr && pr.catch) pr.catch(()=>{});
    cur = inA;                          // 새 트랙이 '현재'가 됨(즉시)
    let s = 0; const steps = 24;
    stopTimer();
    timer = setInterval(() => {
      s++; const r = s / steps;
      inEl.volume = Math.min(1, (vol/100) * r);
      outEl.volume = Math.max(0, (vol/100) * (1 - r));
      if (s >= steps) { stopTimer(); try{ outEl.pause(); }catch(e){} }
    }, dur / steps);
  }
  return {
    crossfade,
    // 재생 멈춤: 페이드 중단 + 양쪽 채널 모두 정지 → 실제로 소리 멈춤
    pause(){ stopTimer(); try{ au[0].pause(); }catch(e){} try{ au[1].pause(); }catch(e){} },
    // 재개: 현재 채널을 제 볼륨으로 되살리고 반대 채널은 확실히 정지(중단된 페이드 잔재 제거)
    resume(){ try{ au[cur].volume = vol/100; const p=au[cur].play(); if(p&&p.catch)p.catch(()=>{}); }catch(e){}
              try{ au[1-cur].pause(); }catch(e){} },
    setVolume(v){ vol = v; try{ au[cur].volume = v/100; }catch(e){} },
    stop(){ stopTimer(); try{au[0].pause();}catch(e){} try{au[1].pause();}catch(e){} au[0].currentTime=0; au[1].currentTime=0; }
  };
};
