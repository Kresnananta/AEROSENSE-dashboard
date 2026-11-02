export const MOODS = ['neutral','happy','concerned','warning','danger','surprised'];
export function expressionFor(text='', severity, supplied) {
  if (severity === 'danger' || severity === 'warning') return severity;
  const clean=String(text).toLowerCase().replace(/\b(tidak|belum|tanpa|no|not)\s+(ada\s+)?(bahaya|berbahaya|danger|dangerous|waspada|darurat)\b/g,' ');
  // Legacy commands contain face:happy for every reply. Danger text must override it.
  if (/\b(bahaya|berbahaya|darurat|evakuasi|danger|dangerous|tidak aman)\b/.test(clean)) return 'danger';
  if (/\b(waspada|meningkat|hati-hati|warning|caution)\b/.test(clean)) return 'warning';
  if (MOODS.includes(supplied)) return supplied;
  if (/\b(maaf|khawatir|sedih|belum tersedia|belum dapat|sorry)\b/.test(clean)) return 'concerned';
  if (/\b(wah|wow|ternyata)\b/.test(clean)) return 'surprised';
  if (/\b(halo|hello|senang|terima kasih|berhasil|bagus|great|thank)\b/.test(clean)) return 'happy';
  return 'neutral';
}
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=x=>{const t=clamp(x);return t*t*(3-2*t)};
export function poseFor(mode,mood,t,volume=0,reduced=false){
  let open=reduced?1:1-Math.pow(Math.max(0,Math.cos((t+.8)*2*Math.PI/5.7)),100);
  if(mode==='sleeping')open=.015;
  if(mode==='waking')open=ease(t/1.1)*(1-.97*Math.exp(-((t-1.35)**2)/.009));
  const worried=mood==='concerned',urgent=mood==='danger',warn=mood==='warning',happy=mood==='happy';
  return {open:open*(mood==='surprised'?1.12:1),brow:urgent?.75:warn?.45:worried?-.6:happy?-.18:0,
    smile:happy?1:worried?-.65:urgent?-.3:0,sparkle:mood==='surprised'?1:0,gaze:mode==='thinking'?22:0,beak:mode==='speaking'?clamp(volume):0,
    tilt:reduced?0:mode==='thinking'?-4:worried?2:happy?Math.sin(t*1.7)*1.4:Math.sin(t*.75)*.5,
    lift:reduced?0:Math.sin(t*(mode==='sleeping'?1.4:1))*3,hue:mood==='danger'?140:mood==='warning'?-165:0};
}
export function parts(p){
 const jaw=(x,y,angle)=>{const r=angle*Math.PI/180;return `${688+(x-688)*Math.cos(r)-(y-918)*Math.sin(r)} ${918+(x-688)*Math.sin(r)+(y-918)*Math.cos(r)}`};
 const eye=(x,y)=>{const joy=clamp(p.smile),alert=clamp(p.brow),h=Math.max(2,(108-alert*35)*p.open),sm=p.smile*20;return `M${x-48} ${y+sm}C${x-55} ${y-h} ${x+43} ${y-h} ${x+49} ${y+sm}C${x+32} ${y+h*(1-joy*1.65)-sm} ${x-32} ${y+h*(1-joy*1.65)-sm} ${x-48} ${y+sm}Z`};
 return {'head-rig':{transform:`translate(0 ${p.lift}) rotate(${p.tilt} 640 650)`},
 'eye-left':{d:eye(431,759),opacity:String(1-p.sparkle),transform:`translate(${p.gaze} 0) rotate(${p.brow*12} 431 759)`},'eye-right':{d:eye(744,750),opacity:String(1-p.sparkle),transform:`translate(${p.gaze} 0) rotate(${-p.brow*12} 744 750)`},
 'star-left':{opacity:String(clamp(p.sparkle*p.open))},'star-right':{opacity:String(clamp(p.sparkle*p.open))},
 'brow-left':{d:'M352 620C337 600 338 579 361 565C386 551 421 572 450 593C475 612 500 632 497 644C495 657 458 652 430 649C395 643 366 637 352 620Z',transform:`rotate(${p.brow*22} 425 610)`},
 'brow-right':{d:'M665 625C650 619 660 597 682 576C707 551 739 533 765 547C791 561 802 596 794 608C788 624 715 629 665 625Z',transform:`rotate(${-p.brow*22} 740 590)`},
 'glint-left':{opacity:String(clamp((p.open-.15)*5)*(1-clamp(p.smile))*(1-p.sparkle)),transform:`translate(${p.gaze} 0)`},'glint-right':{opacity:String(clamp((p.open-.15)*5)*(1-clamp(p.smile))*(1-p.sparkle)),transform:`translate(${p.gaze} 0)`},
 'upper-beak':{transform:`rotate(${p.beak*4} 688 918)`},
 'lower-beak':{transform:`rotate(${-p.beak*32} 688 918)`},
 'beak-crease':{opacity:String(1-clamp(p.beak*4))},
 'mouth-cavity':{opacity:String(clamp(p.beak*5)),d:`M${jaw(545,977,p.beak*4)}C${jaw(559,947,p.beak*4)} ${jaw(577,926,p.beak*4)} ${jaw(605,919,p.beak*4)}Q${jaw(650,914,p.beak*4)} 688 918L${jaw(689,918,-p.beak*32)}C${jaw(681,928,-p.beak*32)} ${jaw(665,933,-p.beak*32)} ${jaw(641,919,-p.beak*32)}C${jaw(607,907,-p.beak*32)} ${jaw(578,919,-p.beak*32)} ${jaw(553,945,-p.beak*32)}Z`}};
}
export function mascotSvg(base='assets/mascot-plate-v2.png'){
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 150 1280 1040" preserveAspectRatio="xMidYMid meet" fill="none" role="img" aria-label="Wajah AERO-BOT">
 <defs><linearGradient id="eye-color" x2="0.7" y2="1"><stop stop-color="#0759B7"/><stop offset="1" stop-color="#064995"/></linearGradient>
 <linearGradient id="upper-color" x1="490" y1="825" x2="657" y2="966" gradientUnits="userSpaceOnUse"><stop stop-color="#1678D4"/><stop offset=".48" stop-color="#0959B6"/><stop offset="1" stop-color="#08499C"/></linearGradient>
 <linearGradient id="lower-color" x1="570" y1="920" x2="646" y2="981" gradientUnits="userSpaceOnUse"><stop stop-color="#176AC1"/><stop offset="1" stop-color="#154586"/></linearGradient>
 <linearGradient id="inside-color" x1="600" y1="922" x2="618" y2="1007" gradientUnits="userSpaceOnUse"><stop stop-color="#082B5B"/><stop offset="1" stop-color="#14599A"/></linearGradient></defs>
 <g id="head-rig"><image id="base-image" href="${base}" width="1280" height="1280"/>
 <path id="brow-left" fill="#759CD9"/><path id="brow-right" fill="#759CD9"/>
 <path id="eye-left" fill="url(#eye-color)"/><path id="eye-right" fill="url(#eye-color)"/>
 <path id="star-left" d="M431 690Q442 742 488 759Q442 772 431 827Q419 775 374 759Q419 745 431 690Z" fill="url(#eye-color)" opacity="0"/><path id="star-right" d="M744 681Q755 733 801 750Q755 763 744 818Q732 766 687 750Q732 736 744 681Z" fill="url(#eye-color)" opacity="0"/>
 <path id="glint-left" d="M479 750L451 765L480 779Z" fill="#ECF0FF"/><path id="glint-right" d="M792 741L763 757L793 769Z" fill="#E4EBFF"/>
 <path id="mouth-cavity" fill="url(#inside-color)"/>
 <g id="lower-beak"><path d="M553 945C578 919 607 907 641 919C665 933 681 928 689 918C690 945 666 966 640 973C609 981 578 964 553 945Z" fill="url(#lower-color)"/><path d="M570 947C600 966 632 975 661 955" stroke="#287AC9" stroke-width="4" stroke-linecap="round" opacity=".55"/></g>
 <g id="upper-beak"><path d="M461 886C470 861 510 853 543 831C566 816 585 805 599 809C620 813 637 836 660 850C686 866 708 885 708 907C708 925 690 935 672 930C648 924 632 912 605 919C577 926 559 947 545 977C528 948 511 917 487 906C472 906 458 903 461 886Z" fill="url(#upper-color)"/><path d="M487 906C511 917 528 948 545 977C559 947 577 926 605 919" stroke="#19488E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M500 867C531 854 562 827 587 823" stroke="#2483D5" stroke-width="5" stroke-linecap="round" opacity=".28"/></g>
 <path id="beak-crease" d="M559 946C581 925 605 914 631 919C652 924 675 935 690 920" stroke="#174384" stroke-width="3" stroke-linecap="round"/>
 </g></svg>`;
}
