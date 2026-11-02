import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const local=new URL('./screen/expression.js',import.meta.url);
const source=await fs.access(local).then(()=>local).catch(()=>new URL('../public/robot-display/expression.js',import.meta.url));
const {expressionFor,poseFor,parts,mascotSvg}=await import(source.href);
test('danger overrides cheerful legacy metadata, negation is respected, unknown expressions stay neutral',()=>{
 assert.equal(expressionFor('Bahaya. Jauhi area.',undefined,'happy'),'danger');
 assert.equal(expressionFor('Tidak ada bahaya.'),'neutral');
 assert.equal(expressionFor('Halo.','danger','happy'),'danger');
 assert.equal(expressionFor('Pembacaan terakhir.',undefined,'__proto__'),'neutral');
});
test('sleep, wake, whole-head color, and beak silence are deterministic',()=>{
 assert.equal(poseFor('sleeping','happy',0,1).beak,0);
 assert.equal(poseFor('waking','happy',0).open,0);
 assert.ok(poseFor('waking','happy',1.9).open>.99);
 assert.equal(poseFor('speaking','danger',1,2).hue,140);
 assert.equal(poseFor('speaking','warning',1,0).hue,-165);
 assert.equal(parts(poseFor('speaking','happy',1,0))['mouth-cavity'].opacity,'0');
 assert.notEqual(parts(poseFor('speaking','happy',1,.8))['lower-beak'].transform,parts(poseFor('speaking','happy',1,0))['lower-beak'].transform);
 assert.match(mascotSvg(),/^<svg[^>]+fill="none"/);
 assert.doesNotMatch(mascotSvg(),/base-mask|lower-mask|clip-path/);
});
test('reference expressions differ visibly and speaking opens a hinged beak without opening on silence',()=>{
 assert.equal(expressionFor('Ada laporan bencana banjir di Jawa.',undefined,'happy'),'concerned');
 assert.equal(expressionFor('Gempa terdeteksi.','danger'),'danger');
 const brows=['neutral','happy','concerned','warning','danger','surprised'].map(mood=>parts(poseFor('speaking',mood,1,.7))['brow-left'].transform);
 assert.equal(new Set(brows).size,6);
 const normal=parts(poseFor('listening','neutral',1)),happy=parts(poseFor('listening','happy',1)),star=parts(poseFor('listening','surprised',1));
 assert.notEqual(normal['eye-left'].d,happy['eye-left'].d);
 assert.equal(star['star-left'].opacity,'1');assert.equal(star['eye-left'].opacity,'0');
 const loud=parts(poseFor('speaking','neutral',1,1));
 assert.match(loud['lower-beak'].transform,/-32/);
 assert.equal(loud['mouth-cavity'].opacity,'1');
 assert.equal(parts(poseFor('speaking','neutral',1,0))['mouth-cavity'].opacity,'0');
});
