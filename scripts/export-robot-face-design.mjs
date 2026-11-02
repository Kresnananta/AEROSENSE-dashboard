import fs from 'node:fs/promises';
import {mascotSvg,poseFor,parts} from '../robot-display/screen/expression.js';
const out=new URL('../artifacts/robot-face/design/',import.meta.url);await fs.mkdir(out,{recursive:true});
const base='data:image/png;base64,'+(await fs.readFile(new URL('../robot-display/screen/assets/mascot-plate-v2.png',import.meta.url))).toString('base64');
const states=[['Sleeping','sleeping','neutral',2],['Waking','waking','happy',.6],['Listening','listening','neutral',2],['Thinking','thinking','neutral',2],['Talking','speaking','neutral',2],['Happy','speaking','happy',2],['Concerned','speaking','concerned',2],['Warning','speaking','warning',2],['Danger','speaking','danger',2],['Surprised','speaking','surprised',2]];
const manifest=[],tiles=[];
for(const [index,[name,mode,mood,time]]of states.entries()){
 const pose=poseFor(mode,mood,time,mode==='speaking'?.5:0,true);let svg=mascotSvg(base);
 for(const [id,attrs]of Object.entries(parts(pose)))svg=svg.replace(`id="${id}"`,`id="${id}" `+Object.entries(attrs).map(([k,v])=>`${k}="${v}"`).join(' '));
 svg=svg.replace('<g id="head-rig"',`<g filter="url(#state-color)" id="head-rig"`).replace('<defs>',`<defs><filter id="state-color" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="hueRotate" values="${pose.hue}"/></filter>`);
 svg=svg.replace('<svg ',`<svg width="1280" height="1040" `);
 await fs.writeFile(new URL(`${name}.svg`,out),svg);
 const prefixed=svg.replace(/id="([^"]+)"/g,(_,id)=>`id="s${index}-${id}"`).replace(/url\(#/g,`url(#s${index}-`);
 const x=48+(index%3)*556,y=170+Math.floor(index/3)*360;
 tiles.push(`<g transform="translate(${x} ${y})"><rect width="528" height="300" rx="12" fill="#071522"/>${prefixed.replace('width="1280" height="1040"','width="528" height="300"')}<text y="332" fill="#14364B" font-size="22" font-weight="700">${name}</text></g>`);
 manifest.push({name,mode,mood,file:`${name}.svg`,width:1280,height:1040});
}
const board=`<svg xmlns="http://www.w3.org/2000/svg" width="1764" height="1690" viewBox="0 0 1764 1690"><rect width="1764" height="1690" fill="#F8FCFF"/><g font-family="Inter,Arial,sans-serif"><text x="48" y="72" font-size="42" font-weight="800" fill="#14364B">AERO-BOT · Face expressions</text><text x="48" y="118" font-size="22" fill="#43617A">Original mascot proportions · hinged beak · whole-head status colors</text>${tiles.join('')}<text x="48" y="1650" font-size="20" fill="#43617A">Editable eye, brow and beak layers. Raster mascot base. Expression follows response context, not human emotion diagnosis.</text></g></svg>`;
await fs.writeFile(new URL('AERO-BOT-Expression-Atlas.svg',out),board);
await fs.writeFile(new URL('manifest.json',out),JSON.stringify({states:manifest,figmaFile:'https://www.figma.com/design/27zSF5ONx1HX9sCTWY6Sa7',figmaCanvasPopulated:false,reason:'Starter MCP tool limit',rasterBase:true},null,2));
console.log('Exported 10 SVG designs and an importable expression atlas. Figma canvas remains blocked by quota.');
