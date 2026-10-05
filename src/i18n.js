const badini = {
  'Your image stays on your device.': 'وێنەیا تە ل سەر ئامیرێ تە دمینیت.',
  'Show': 'نیشان بدە', 'Hide': 'ڤەشێرە',
  '02 / YOUR MESSAGE': '02 / پەیاما تە', '02 / UNLOCK THE MESSAGE': '02 / پەیامێ ڤەکە',
  'ORIGINAL PNG': 'PNG یا ڕەسەن',
  'This password unlocks the message. Share it separately.': 'ئەڤ پەیڤا نهێنی پەیامێ ڤەدکەت. جودا هنارتنێ بکە.',
  'Enter the password used to hide the message.': 'وێ پەیڤا نهێنی بنڤیسە یا بۆ ڤەشارتنا پەیامێ هاتیە بکارئینان.',
  'Choose the original PNG containing the hidden message.': 'وێنەیا PNG یا ڕەسەن هەلبژێرە یا پەیاما ڤەشارتی تێدا هەی.',
  'Choose a PNG, JPG, or WebP image.': 'وێنەیەکا PNG، JPG یان WebP هەلبژێرە.',
  'Choose an image smaller than 20 MB.': 'وێنەیەکێ بچووکتر ژ 20 MB هەلبژێرە.',
  'Choose an image with no more than 16 million pixels.': 'وێنەیەکێ هەلبژێرە کو ژ 16 ملیۆن پیکسەلان زێدە نەبیت.',
  'Open this app over HTTPS or localhost to use encryption.': 'بۆ ڕەمزکرنێ، ئەڤ بەرنامەی ل سەر HTTPS یان localhost ڤەکە.',
  'Choose a picture first.': 'بەری هەمی تشتی وێنەیەکێ هەلبژێرە.',
  'Enter a message to hide.': 'پەیامەکێ بنڤیسە بۆ ڤەشارتنێ.',
  'Encrypting and verifying your picture…': 'وێنەیا تە دهێتە ڕەمزکرن و پشکنین…',
  'Decrypting your message…': 'پەیاما تە دهێتە ڤەکرن…',
  'This message is too large for the image. Choose a larger picture or shorten the text.': 'ئەڤ پەیامە بۆ وێنەیێ زۆر مەزنە. وێنەیەکا مەزنتر هەلبژێرە یان نڤیسینێ کورت بکە.',
  'Could not create the PNG. Try a smaller image.': 'وێنەیا PNG نەهاتە چێکرن. وێنەیەکا بچووکتر تاقی بکە.',
  'Image verification failed. Try a different picture.': 'پشکنینا وێنەیێ سەرکەفتی نەبوو. وێنەیەکا دی تاقی بکە.',
  'Your message is hidden. Download verification passed.': 'پەیاما تە هاتە ڤەشارتن. پشکنینا وێنەیا داگرتنێ سەرکەفتی بوو.',
  'Message unlocked.': 'پەیام هاتە ڤەکرن.',
  'Enter a password.': 'پەیڤەکا نهێنی بنڤیسە.',
  'No supported hidden message found.': 'چ پەیامەکا ڤەشارتی نەهاتە دیتن.',
  'The hidden message is damaged.': 'پەیاما ڤەشارتی خراب بوویە.',
  'Could not decrypt. The password is incorrect or the image has been modified.': 'پەیام نەهاتە ڤەکرن. پەیڤا نهێنی خەلەتە یان وێنە هاتیە گوهۆڕین.'
};
const staticText = [
  ['.privacy', '<i></i> Private by design', '<i></i> تایبەتمەندی ژ بنەڕەتڤە'],
  ['.eyebrow', 'YOUR MESSAGE. HIDDEN IN PLAIN SIGHT.', 'پەیاما تە. ل بەر چاڤان ڤەشارتی.'],
  ['h1', 'Every picture<br>has a <em>secret.</em>', 'هەر وێنەیەک<br><em>نهێنیەک</em> هەیە.'],
  ['.intro', 'Encrypt your words with AES-256 and hide them inside an image.<br>Only someone with your password can read them.', 'پەیڤێن خۆ ب AES-256 ڕەمز بکە و د ناڤ وێنەیەکێ دا ڤەشێرە.<br>بتنێ کەسێ پەیڤا نهێنی یا تە هەبیت دشێت وان بخوینیت.'],
  ['#hide-tab', '↗ &nbsp; Hide a message', '↗ &nbsp; پەیامەکێ ڤەشێرە'],
  ['#reveal-tab', '↙ &nbsp; Reveal a message', '↙ &nbsp; پەیامەکێ ڤەکە'],
  ['.picture-column .section-label span:first-child', '01 / YOUR PICTURE', '01 / وێنەیا تە'],
  ['#upload-content strong', 'Every picture has a secret.', 'هەر وێنەیەک نهێنیەک هەیە.'],
  ['#upload-content p', 'Drop yours here, or <u>browse files</u>', 'وێنەیا خۆ ل ڤێرە دابنێ، یان <u>فایلەکێ هەلبژێرە</u>'],
  ['#upload-content small', 'Up to 20 MB · Exported as PNG', 'هەتا 20 MB · دەرئەنجام ب PNG'],
  ['label[for="password"]', '03 / YOUR PASSWORD', '03 / پەیڤا نهێنی یا تە'],
  ['#download', 'Download your picture ↗', 'وێنەیا خۆ دابگرە ↗'],
  ['#revealed-label', 'Decrypted message', 'پەیاما ڤەکری'],
  ['.card-footer span:nth-child(1)', '⌁ &nbsp; AES-256-GCM encryption', '⌁ &nbsp; ڕەمزکرنا AES-256-GCM'],
  ['.card-footer span:nth-child(2)', '⌂ &nbsp; 100% in your browser', '⌂ &nbsp; 100% د گەڕۆکێ تە دا'],
  ['.card-footer span:nth-child(3)', '◎ &nbsp; No uploads. No accounts.', '◎ &nbsp; بێ بارکرن. بێ هەژمار.'],
  ['.notes span', 'THE ART OF HIDING IN PLAIN SIGHT', 'هونەرێ ڤەشارتنێ ل بەر چاڤان'],
  ['.notes p', 'Your picture looks the same. Its story is different.', 'وێنەیا تە هەر وەکی خۆیە. چیرۆکا وێ جودایە.'],
  ['footer .credit', 'Designed and developed by <strong>Mr. Suleman Omar</strong>', 'دیزاین و پەرەپێدان ژ لایێ <strong>Mr. Suleman Omar</strong>'],
  ['footer > span:last-child', 'Keep the PNG original. Resizing or compression may erase your message.', 'PNG یا ڕەسەن بپارێزە. گوهۆڕینا مەزناتیێ یان پەستاندن دشێت پەیاما تە ژێ ببەت.']
];
let language='en';
try { if(localStorage.getItem('veil-language')==='bad')language='bad'; } catch {}
export const t = text => language==='bad' ? (badini[text] || text) : text;
export function imageInfo(name,width,height,bytes){return language==='bad'?`${name} · ${width} × ${height} · ${bytes.toLocaleString()} بایت بەردەستن`:`${name} · ${width} × ${height} · ${bytes.toLocaleString()} bytes available`;}
export function byteCount(bytes){return `${bytes.toLocaleString()} ${language==='bad'?'بایت':'bytes'}`;}
export function applyLanguage(next=language){
  language=next;
  try{localStorage.setItem('veil-language',language);}catch{}
  document.documentElement.lang=language==='bad'?'ku-Arab':'en';
  document.documentElement.dir=language==='bad'?'rtl':'ltr';
  for(const [selector,en,bad] of staticText)document.querySelector(selector).innerHTML=language==='bad'?bad:en;
  const attrs=[['#message','placeholder','Something only they should know…','تشتەک کو بتنێ ئەو دڤێت بزانیت…'],['#message','aria-label','Secret message','پەیاما نهێنی'],['#password','placeholder','Make it a good one','پەیڤەکا نهێنی یا بەهێز بنڤیسە'],['#preview','alt','Selected cover image','وێنەیا هەلبژارتی'],['#remove-picture','aria-label','Remove picture','وێنەیێ ژێ ببە'],['#remove-picture','title','Remove picture','وێنەیێ ژێ ببە'],['.tabs','aria-label','Choose operation','کریارەکێ هەلبژێرە']];
  for(const [selector,attr,en,bad] of attrs)document.querySelector(selector).setAttribute(attr,language==='bad'?bad:en);
  document.querySelector('#language').value=language;
}
export function submitLabel(mode){return language==='bad'?(mode==='hide'?'ڕەمز بکە و ڤەشێرە <span>↗</span>':'ڕەمزێ ڤەکە و نیشان بدە <span>↙</span>'):(mode==='hide'?'Encrypt & hide <span>↗</span>':'Decrypt & reveal <span>↙</span>');}
