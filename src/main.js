import './style.css';
import { t, applyLanguage, imageInfo, byteCount, submitLabel } from './i18n.js';
import { capacity, seal, embed, extract, open } from './codec.js';

const app = document.querySelector('#app');
app.innerHTML = `
<header><a class="brand" href="./"><span class="brand-icon">◈</span> <span class="brand-name">Wéne Cipher</span></a><div class="header-controls"><span class="privacy"><i></i> Private by design</span><select id="language" aria-label="Language / زمان"><option value="en">English</option><option value="bad">کوردی — بادینی</option></select></div></header>
<main><div class="eyebrow">YOUR MESSAGE. HIDDEN IN PLAIN SIGHT.</div><h1>Every picture<br>has a <em>secret.</em></h1><p class="intro">Encrypt your words with AES-256 and hide them inside an image.<br>Only someone with your password can read them.</p>
<section class="workspace"><div class="tabs" role="tablist" aria-label="Choose operation"><button id="hide-tab" role="tab" aria-controls="form" tabindex="0" aria-selected="true">↗ &nbsp; Hide a message</button><button id="reveal-tab" role="tab" aria-controls="form" tabindex="-1" aria-selected="false">↙ &nbsp; Reveal a message</button></div>
<form id="form" role="tabpanel" aria-labelledby="hide-tab"><div class="columns"><div class="picture-column"><div class="section-label"><span>01 / YOUR PICTURE</span><span id="file-type">PNG · JPG · WEBP</span></div><div class="picture-upload"><label class="dropzone" id="dropzone" tabindex="0"><input id="file" aria-label="Choose picture" type="file" accept="image/png,image/jpeg,image/webp"><div id="upload-content"><div class="upload-icon">▧<span>+</span></div><strong>Every picture has a secret.</strong><p>Drop yours here, or <u>browse files</u></p><small>Up to 64 MB · Exported as PNG</small></div><img id="preview" alt="Selected cover image" hidden></label><button id="remove-picture" class="remove-picture" type="button" aria-label="Remove picture" title="Remove picture" hidden>×</button></div><div id="image-info">Your image stays on your device.</div></div>
<div class="message-column"><div class="section-label"><span id="step-two">02 / YOUR MESSAGE</span><span id="count">0 bytes</span></div><textarea id="message" dir="auto" placeholder="Something only they should know…" aria-label="Secret message" maxlength="1000000"></textarea><div class="password-label"><label for="password">03 / YOUR PASSWORD</label><button type="button" id="toggle-password">Show</button></div><input id="password" type="password" placeholder="Make it a good one" autocomplete="new-password" required><p class="password-help" id="password-help">This password unlocks the message. Share it separately.</p><button class="primary" id="submit" type="submit">Encrypt & hide <span>↗</span></button></div></div>
<div class="status" id="status" role="status" aria-live="polite"></div><div id="result" hidden><a id="download" download="wene-cipher-secret.png">Download your picture ↗</a><label id="revealed-label" for="revealed" hidden>Decrypted message</label><textarea id="revealed" dir="auto" readonly hidden></textarea></div>
</form><div class="card-footer"><span>⌁ &nbsp; AES-256-GCM encryption</span><span>⌂ &nbsp; 100% in your browser</span><span>◎ &nbsp; No uploads. No accounts.</span></div></section>
<div class="notes"><span>THE ART OF HIDING IN PLAIN SIGHT</span><p>Your picture looks the same. Its story is different.</p></div></main><footer><span class="credit">Designed and developed by <strong>Mr. Suleman Omar</strong></span><span>Keep the PNG original. Resizing or compression may erase your message.</span></footer>`;
const $ = id => document.getElementById(id);
let mode='hide', cover=null, busy=false, url=null;
const passwords = { hide: '', reveal: '' };
const pictures = { hide: { cover: null, previewUrl: null, info: null, revision: 0, loading: false }, reveal: { cover: null, previewUrl: null, info: null, revision: 0, loading: false } };
function updateControls(){
  $('submit').disabled=busy || pictures[mode].loading;
  for(const id of ['password','message','toggle-password','remove-picture'])$(id).disabled=busy;
}
function renderPicture(){
  const picture = pictures[mode];
  updateControls();
  cover = picture.cover;
  $('file').value = '';
  $('preview').hidden = !cover;
  $('remove-picture').hidden = !cover;
  $('upload-content').hidden = !!cover;
  if (picture.previewUrl) $('preview').src = picture.previewUrl;
  else $('preview').removeAttribute('src');
  $('image-info').textContent = picture.info ? imageInfo(...picture.info) : t('Your image stays on your device.');
}
let statusText='';
function setStatus(text){statusText=text;$('status').textContent=t(text);}
function renderModeText(){
  $('step-two').textContent=t(mode==='hide'?'02 / YOUR MESSAGE':'02 / UNLOCK THE MESSAGE');
  $('submit').innerHTML=submitLabel(mode);
  $('file-type').textContent=mode==='hide'?'PNG · JPG · WEBP':t('ORIGINAL PNG');
  $('password-help').textContent=t(mode==='hide'?'This password unlocks the message. Share it separately.':'Enter the password used to hide the message.');
  $('toggle-password').textContent=t($('password').type==='password'?'Show':'Hide');
}
function clearResult(){ $('result').hidden=true; setStatus(''); $('revealed').value=''; if(url){URL.revokeObjectURL(url);url=null;} }
function count(){ $('count').textContent=byteCount(new TextEncoder().encode($('message').value).length); }
function setMode(next){
  if(busy || next===mode)return;
  passwords[mode]=$('password').value;
  mode=next; clearResult(); renderPicture();
  $('password').value=passwords[mode];
  $('password').type='password';
  $('toggle-password').textContent=t('Show');
  $('hide-tab').setAttribute('aria-selected',String(mode==='hide')); $('reveal-tab').setAttribute('aria-selected',String(mode==='reveal'));
  $('message').hidden=mode==='reveal'; $('count').hidden=mode==='reveal'; $('step-two').textContent=t(mode==='hide'?'02 / YOUR MESSAGE':'02 / UNLOCK THE MESSAGE');
  $('submit').innerHTML=submitLabel(mode);
  $('file').accept=mode==='hide'?'image/png,image/jpeg,image/webp':'image/png'; $('file-type').textContent=mode==='hide'?'PNG · JPG · WEBP':t('ORIGINAL PNG');
  $('form').setAttribute('aria-labelledby',mode+'-tab');
  $('hide-tab').tabIndex=mode==='hide'?0:-1;$('reveal-tab').tabIndex=mode==='reveal'?0:-1;
  $('password').autocomplete=mode==='hide'?'new-password':'current-password';
  $('password-help').textContent=t(mode==='hide'?'This password unlocks the message. Share it separately.':'Enter the password used to hide the message.');
}
document.querySelector('.tabs').onkeydown=e=>{
  if(busy)return;
  if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
    e.preventDefault();const next=e.key==='Home'?'hide':e.key==='End'?'reveal':mode==='hide'?'reveal':'hide';
    setMode(next);$(next+'-tab').focus();
  }
};
$('hide-tab').onclick=()=>setMode('hide'); $('reveal-tab').onclick=()=>setMode('reveal');
$('message').oninput=()=>{count();clearResult();}; $('password').oninput=()=>{passwords[mode]=$('password').value;clearResult();};
$('toggle-password').onclick=()=>{const visible=$('password').type==='password';$('password').type=visible?'text':'password';$('toggle-password').textContent=t(visible?'Hide':'Show');};
async function load(file){
  if(busy||!file)return; clearResult();
  const targetMode = mode;
  const picture = pictures[targetMode];
  const revision = ++picture.revision;
  picture.loading=true;updateControls();
  try{
    if(targetMode==='reveal' && file.type!=='image/png')throw new Error('Choose the original PNG containing the hidden message.');
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Choose a PNG, JPG, or WebP image.');
    if(file.size>64*1024*1024)throw new Error('Choose an image smaller than 64 MB.');
    let bitmap;
    try{bitmap=await createImageBitmap(file);}catch{throw new Error('Could not read this image. Choose a valid PNG, JPG, or WebP file.');}
    if(revision !== picture.revision){bitmap.close();return;}
    if(bitmap.width*bitmap.height>16000000){bitmap.close();throw new Error('Choose an image with no more than 16 million pixels.');}
    const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    // Flatten transparency so PNG encoding cannot discard hidden RGB bits.
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0);bitmap.close();
    picture.cover={canvas,ctx,data:ctx.getImageData(0,0,canvas.width,canvas.height)};
    if(picture.previewUrl)URL.revokeObjectURL(picture.previewUrl);
    picture.previewUrl=URL.createObjectURL(file);
    picture.info=[file.name, canvas.width, canvas.height, capacity(picture.cover.data.data)];
    if(mode===targetMode)renderPicture();
  }catch(error){
    if(revision !== picture.revision)return;
    if(picture.previewUrl)URL.revokeObjectURL(picture.previewUrl);
    picture.cover=null;picture.previewUrl=null;picture.info=null;
    if(mode===targetMode){renderPicture();setStatus(error.message);}
  }finally{
    if(revision===picture.revision){picture.loading=false;if(mode===targetMode)updateControls();}
  }
}
$('remove-picture').onclick=()=>{
  if(busy)return;
  const picture=pictures[mode];
  picture.revision++;picture.loading=false;
  if(picture.previewUrl)URL.revokeObjectURL(picture.previewUrl);
  picture.cover=null;picture.previewUrl=null;picture.info=null;
  clearResult();renderPicture();
  $('dropzone').focus();
};
$('file').onchange=e=>load(e.target.files[0]);
$('dropzone').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('file').click();}};
$('dropzone').ondragover=e=>{e.preventDefault();$('dropzone').classList.add('dragging');};
$('dropzone').ondragleave=()=> $('dropzone').classList.remove('dragging');
$('dropzone').ondrop=e=>{e.preventDefault();$('dropzone').classList.remove('dragging');load(e.dataTransfer.files[0]);};
$('form').onsubmit=async e=>{
  e.preventDefault();if(busy || pictures[mode].loading)return;clearResult();
  if(!globalThis.crypto?.subtle){setStatus('Open this app over HTTPS or localhost to use encryption.');return;}
  if(!cover){setStatus('Choose a picture first.');return;}
  if(mode==='hide'&&!$('message').value.trim()){setStatus('Enter a message to hide.');return;}
  busy=true;updateControls();setStatus(mode==='hide'?'Encrypting and verifying your picture…':'Decrypting your message…');
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
      setStatus('Your message is hidden. Download verification passed.');
    }else{
      const text=await open(extract(cover.data.data),$('password').value);
      $('revealed').value=text;$('revealed').hidden=false;$('revealed-label').hidden=false;$('download').hidden=true;$('result').hidden=false;setStatus('Message unlocked.');
    }
  }catch(error){setStatus(error.message);}finally{busy=false;updateControls();}
};

$('language').onchange=e=>{applyLanguage(e.target.value);renderModeText();renderPicture();count();setStatus(statusText);};
applyLanguage();renderModeText();renderPicture();count();
