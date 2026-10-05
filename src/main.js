import './style.css';
import { capacity, seal, embed, extract, open } from './codec.js';

const app = document.querySelector('#app');
app.innerHTML = `
<header><a class="brand" href="./"><span class="brand-icon">◈</span> veil<span class="brand-dot">.</span></a><span class="privacy"><i></i> Private by design</span></header>
<main><div class="eyebrow">YOUR MESSAGE. HIDDEN IN PLAIN SIGHT.</div><h1>Every picture<br>has a <em>secret.</em></h1><p class="intro">Encrypt your words with AES-256 and hide them inside an image.<br>Only someone with your password can read them.</p>
<section class="workspace"><div class="tabs" role="tablist" aria-label="Choose operation"><button id="hide-tab" role="tab" aria-selected="true">↗ &nbsp; Hide a message</button><button id="reveal-tab" role="tab" aria-selected="false">↙ &nbsp; Reveal a message</button></div>
<form id="form"><div class="columns"><div class="picture-column"><div class="section-label"><span>01 / YOUR PICTURE</span><span id="file-type">PNG · JPG · WEBP</span></div><div class="picture-upload"><label class="dropzone" id="dropzone" tabindex="0"><input id="file" type="file" accept="image/png,image/jpeg,image/webp"><div id="upload-content"><div class="upload-icon">▧<span>+</span></div><strong>Every picture has a secret.</strong><p>Drop yours here, or <u>browse files</u></p><small>Up to 20 MB · Exported as PNG</small></div><img id="preview" alt="Selected cover image" hidden></label><button id="remove-picture" class="remove-picture" type="button" aria-label="Remove picture" title="Remove picture" hidden>×</button></div><div id="image-info">Your image stays on your device.</div></div>
<div class="message-column"><div class="section-label"><span id="step-two">02 / YOUR MESSAGE</span><span id="count">0 bytes</span></div><textarea id="message" placeholder="Something only they should know…" aria-label="Secret message" maxlength="1000000"></textarea><div class="password-label"><label for="password">03 / YOUR PASSWORD</label><button type="button" id="toggle-password">Show</button></div><input id="password" type="password" placeholder="Make it a good one" autocomplete="new-password" required><p class="password-help" id="password-help">This password unlocks the message. Share it separately.</p><button class="primary" id="submit" type="submit">Encrypt & hide <span>↗</span></button></div></div>
<div class="status" id="status" role="status" aria-live="polite"></div><div id="result" hidden><a id="download" download="veil-secret.png">Download your picture ↗</a><label id="revealed-label" for="revealed" hidden>Decrypted message</label><textarea id="revealed" readonly hidden></textarea></div>
</form><div class="card-footer"><span>⌁ &nbsp; AES-256-GCM encryption</span><span>⌂ &nbsp; 100% in your browser</span><span>◎ &nbsp; No uploads. No accounts.</span></div></section>
<div class="notes"><span>THE ART OF HIDING IN PLAIN SIGHT</span><p>Your picture looks the same. Its story is different.</p></div></main><footer><span class="credit">Designed and developed by <strong>Mr. Suleman Omar</strong></span><span>Keep the PNG original. Resizing or compression may erase your message.</span></footer>`;
const $ = id => document.getElementById(id);
let mode='hide', cover=null, busy=false, url=null;
const passwords = { hide: '', reveal: '' };
const pictures = { hide: { cover: null, previewUrl: null, info: '', revision: 0 }, reveal: { cover: null, previewUrl: null, info: '', revision: 0 } };
function renderPicture(){
  const picture = pictures[mode];
  cover = picture.cover;
  $('file').value = '';
  $('preview').hidden = !cover;
  $('remove-picture').hidden = !cover;
  $('upload-content').hidden = !!cover;
  if (picture.previewUrl) $('preview').src = picture.previewUrl;
  else $('preview').removeAttribute('src');
  $('image-info').textContent = picture.info || 'Your image stays on your device.';
}
function clearResult(){ $('result').hidden=true; $('status').textContent=''; $('revealed').value=''; if(url){URL.revokeObjectURL(url);url=null;} }
function count(){ $('count').textContent=`${new TextEncoder().encode($('message').value).length.toLocaleString()} bytes`; }
function setMode(next){
  if(busy || next===mode)return;
  passwords[mode]=$('password').value;
  mode=next; clearResult(); renderPicture();
  $('password').value=passwords[mode];
  $('password').type='password';
  $('toggle-password').textContent='Show';
  $('hide-tab').setAttribute('aria-selected',String(mode==='hide')); $('reveal-tab').setAttribute('aria-selected',String(mode==='reveal'));
  $('message').hidden=mode==='reveal'; $('count').hidden=mode==='reveal'; $('step-two').textContent=mode==='hide'?'02 / YOUR MESSAGE':'02 / UNLOCK THE MESSAGE';
  $('submit').innerHTML=mode==='hide'?'Encrypt & hide <span>↗</span>':'Decrypt & reveal <span>↙</span>';
  $('file').accept=mode==='hide'?'image/png,image/jpeg,image/webp':'image/png'; $('file-type').textContent=mode==='hide'?'PNG · JPG · WEBP':'ORIGINAL PNG';
  $('password').autocomplete=mode==='hide'?'new-password':'current-password';
  $('password-help').textContent=mode==='hide'?'This password unlocks the message. Share it separately.':'Enter the password used to hide the message.';
}
$('hide-tab').onclick=()=>setMode('hide'); $('reveal-tab').onclick=()=>setMode('reveal');
$('message').oninput=()=>{count();clearResult();}; $('password').oninput=()=>{passwords[mode]=$('password').value;clearResult();};
$('toggle-password').onclick=()=>{const visible=$('password').type==='password';$('password').type=visible?'text':'password';$('toggle-password').textContent=visible?'Hide':'Show';};
async function load(file){
  if(busy||!file)return; clearResult();
  const targetMode = mode;
  const picture = pictures[targetMode];
  const revision = ++picture.revision;
  try{
    if(targetMode==='reveal' && file.type!=='image/png')throw new Error('Choose the original PNG containing the hidden message.');
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Choose a PNG, JPG, or WebP image.');
    if(file.size>20*1024*1024)throw new Error('Choose an image smaller than 20 MB.');
    const bitmap=await createImageBitmap(file);
    if(revision !== picture.revision){bitmap.close();return;}
    if(bitmap.width*bitmap.height>16000000){bitmap.close();throw new Error('Choose an image with no more than 16 million pixels.');}
    const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    // Flatten transparency so PNG encoding cannot discard hidden RGB bits.
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0);bitmap.close();
    picture.cover={canvas,ctx,data:ctx.getImageData(0,0,canvas.width,canvas.height)};
    if(picture.previewUrl)URL.revokeObjectURL(picture.previewUrl);
    picture.previewUrl=URL.createObjectURL(file);
    picture.info=`${file.name} · ${canvas.width} × ${canvas.height} · ${capacity(picture.cover.data.data).toLocaleString()} bytes available`;
    if(mode===targetMode)renderPicture();
  }catch(error){
    if(revision !== picture.revision)return;
    if(picture.previewUrl)URL.revokeObjectURL(picture.previewUrl);
    picture.cover=null;picture.previewUrl=null;picture.info='';
    if(mode===targetMode){renderPicture();$('status').textContent=error.message;}
  }
}
$('remove-picture').onclick=()=>{
  if(busy)return;
  const picture=pictures[mode];
  picture.revision++;
  if(picture.previewUrl)URL.revokeObjectURL(picture.previewUrl);
  picture.cover=null;picture.previewUrl=null;picture.info='';
  clearResult();renderPicture();
  $('dropzone').focus();
};
$('file').onchange=e=>load(e.target.files[0]);
$('dropzone').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('file').click();}};
$('dropzone').ondragover=e=>{e.preventDefault();$('dropzone').classList.add('dragging');};
$('dropzone').ondragleave=()=> $('dropzone').classList.remove('dragging');
$('dropzone').ondrop=e=>{e.preventDefault();$('dropzone').classList.remove('dragging');load(e.dataTransfer.files[0]);};
$('form').onsubmit=async e=>{
  e.preventDefault();if(busy)return;clearResult();
  if(!crypto.subtle){$('status').textContent='Open this app over HTTPS or localhost to use encryption.';return;}
  if(!cover){$('status').textContent='Choose a picture first.';return;}
  if(mode==='hide'&&!$('message').value.trim()){$('status').textContent='Enter a message to hide.';return;}
  busy=true;$('submit').disabled=true;$('remove-picture').disabled=true;$('status').textContent=mode==='hide'?'Encrypting and verifying your picture…':'Decrypting your message…';
  try{
    if(mode==='hide'){
      const text=$('message').value;
      if(new TextEncoder().encode(text).length>capacity(cover.data.data))throw new Error('This message is too large for the image. Choose a larger picture or shorten the text.');
      const packet=await seal(text,$('password').value);
      const output=document.createElement('canvas');output.width=cover.canvas.width;output.height=cover.canvas.height;
      const ctx=output.getContext('2d');ctx.putImageData(new ImageData(embed(cover.data.data,packet),output.width,output.height),0,0);
      const blob=await new Promise(resolve=>output.toBlob(resolve,'image/png'));
      if(!blob)throw new Error('Could not create the PNG. Try a smaller image.');
      const verify=await createImageBitmap(blob);ctx.drawImage(verify,0,0);verify.close();
      if(await open(extract(ctx.getImageData(0,0,output.width,output.height).data),$('password').value)!==text)throw new Error('Image verification failed. Try a different picture.');
      url=URL.createObjectURL(blob);$('download').href=url;$('download').hidden=false;$('revealed').hidden=true;$('revealed-label').hidden=true;$('result').hidden=false;
      $('status').textContent='Your message is hidden. Download verification passed.';
    }else{
      const text=await open(extract(cover.data.data),$('password').value);
      $('revealed').value=text;$('revealed').hidden=false;$('revealed-label').hidden=false;$('download').hidden=true;$('result').hidden=false;$('status').textContent='Message unlocked.';
    }
  }catch(error){$('status').textContent=error.message;}finally{busy=false;$('submit').disabled=false;$('remove-picture').disabled=false;}
};
