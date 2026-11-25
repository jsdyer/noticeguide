export const MAX_INPUT = 250000;
export const REFERENCES = [
 {title:'Copyright Act, section 41.25: notice fields and prohibited content',url:'https://laws-lois.justice.gc.ca/eng/acts/C-42/section-41.25.html'},
 {title:'Copyright Act, section 41.26: forwarding and retention',url:'https://laws-lois.justice.gc.ca/eng/acts/C-42/section-41.26.html'},
 {title:'ISED: Notices to Canadian Internet subscribers',url:'https://www.ised-isde.canada.ca/site/office-consumer-affairs/en/connected-consumer/notices-canadian-internet-subscribers'}
];
export const REVIEWED = '2026-11-25';
export const EXAMPLE = `FICTIONAL EXAMPLE — not an actual allegation\nNotice ID: DEMO-1234\nClaimant: Example Rights Company\nClaimant address: 123 Example Street, Example City\nCopyright owner: Example Film Studio\nWork title: An Imaginary Film\nClaimant interest: Authorized agent of the copyright owner\nAlleged infringement: Sharing a file through BitTorrent\nIP address: 192.0.2.24\nPort: 51413\nInfringement date: 2026-10-22 18:41:02 UTC\nFile name: imaginary-film.mkv\nInfo hash: 0123456789abcdef0123456789abcdef01234567\nThis sample includes a suspicious demand for demonstration: Pay $250 to settle this claim.\nSettlement link: https://example.invalid/pay`;
const FIELD_SPECS = [
 ['Claimant / agent',/^(?:claimant(?: name)?|reporting (?:party|agency)|agent|sender|company)\s*[:=]\s*(.+)$/i,'The party making the claim; check whether an agent names the rights holder.'],
 ['Claimant address',/^(?:(?:claimant|sender|company)\s+address|postal address|address)\s*[:=]\s*(.+)$/i,'The Act calls for the claimant’s name and address. Unlabelled or multiline addresses may not be extracted.'],
 ['Work / material',/^(?:work(?: title)?|title|material|infringed work|content title|asset|filename|file name)\s*[:=]\s*(.+)$/i,'The work alleged to have been infringed. A file name alone may be ambiguous.'],
 ['Rights / interest',/^(?:copyright owner|rights? ?holder|claimant interest|interest|authorization|authorisation)\s*[:=]\s*(.+)$/i,'The claimant’s interest or right in the work. This tool does not verify ownership.'],
 ['Alleged conduct',/^(?:alleged infringement|infringement(?: type)?|violation(?: type)?|protocol|activity)\s*[:=]\s*(.+)$/i,'What the sender alleges happened; an allegation is not a finding.'],
 ['Event date / time',/^(?:(?:infringement|event|detection|incident|first seen|last seen)(?: date| time| timestamp)?|timestamp)\s*[:=]\s*(.+)$/i,'Keep the stated timezone. This is not necessarily the date the ISP forwarded the message.'],
 ['Notice / case reference',/^(?:(?:notice|case|reference|ticket|claim)(?: id| number| no\.?)?|ref)\s*[:=]\s*(.+)$/i,'A sender’s reference, not proof of a court case.'],
 ['Network location',/^(?:ip(?: address)?|source ip|infringing ip|port|url|location|info ?hash|torrent hash)\s*[:=]\s*(.+)$/i,'Network identifiers may describe a connection or file; they do not identify the individual who used it.']
];
const unique = a => [...new Set(a)].slice(0,30);
export function decodeNotice(input) {
 if (typeof input !== 'string' || input.length > MAX_INPUT) throw new Error('Use plain text up to 250,000 characters.');
 const text=input.replace(/\r\n?/g,'\n');
 // XML labels from common machine-readable notices become plain labels; nothing is parsed as HTML.
 const normal=text.replace(/<([a-z][\w-]*)\b[^>]*>([^<>]{1,2000})<\/\1>/gi,(_,key,val)=>`${key}: ${val}`);
 const lines=normal.split('\n').map(s=>s.trim()).filter(Boolean);
 const fields=FIELD_SPECS.map(([label,re,meaning])=>({label,meaning,values:unique(lines.map(l=>l.match(re)?.[1]?.trim()).filter(Boolean))}));
 const ipv4=unique((text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g)||[]).filter(ip=>ip.split('.').every(n=>+n<=255)));
 const timestamps=unique(text.match(/\b\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:\s?(?:Z|UTC|GMT|[+-]\d{2}:?\d{2}))?)?\b/g)||[]);
 const flags=[];
 for (const [i,line] of lines.entries()) {
   const sentences=line.match(/[^.!?]+[.!?]?/g)||[line];
   for(const raw of sentences){const s=raw.trim();if(!s)continue;
    const negative=/\b(?:do not|don't|does not|must not|no (?:need|obligation|requirement) to|not required to|never)\b.{0,70}\b(?:pay|payment|settle|settlement|provide|disclose|personal)\b/i.test(s);
    const legalEducation=/\b(?:shall not contain|must not contain|not permitted|prohibited content|not comply|invalid under|does not comply)\b/i.test(s);
    if(negative||legalEducation)continue;
    const rules=[['Possible settlement offer',/\b(?:settlement (?:offer|amount|payment|portal|link)|offer to settle|to settle (?:this|the|your)|settle (?:this|the|your) claim)\b/i],['Possible payment demand',/\b(?:pay(?:ment)? (?:\$|CAD|USD|of\b|required\b|due\b|must\b)|(?:must|required to|demand (?:for|that you)) pay|payment.{0,30}(?:required|due|within)|remit\s+(?:\$|payment))|\bpay\s+\$\s*\d/i],['Possible request for personal information',/\b(?:provide|send|submit|disclose|confirm)\b.{0,90}\b(?:your (?:name|address|identity|phone|personal)|personal information|credit card|social insurance|date of birth)\b/i],['Possible court document or legal deadline',/\b(?:statement of claim|notice of application|court file|served with|file (?:a |your )?defen[cs]e|summons)\b/i]];
    for(const [kind,re]of rules)if(re.test(s))flags.push({kind,line:i+1,evidence:s.slice(0,800)});
   }
 }
 const urls=unique(text.match(/https?:\/\/[^\s<>"']+/gi)||[]).map(s=>s.replace(/[.,;)]+$/,''));
 for(const u of urls)if(/settle|payment|\/pay\b/i.test(u))flags.push({kind:'Possible settlement/payment hyperlink',line:null,evidence:u.slice(0,800)});
 return {fields,ipv4,timestamps,urls,flags:flags.filter((f,i,a)=>a.findIndex(x=>x.kind===f.kind&&x.evidence===f.evidence)===i),characters:input.length};
}
export function reportText(r){return ['Notice Guide — local review','Legal sources reviewed: '+REVIEWED,'Heuristic extraction, not legal advice or verification.','',...r.fields.map(f=>f.label+': '+(f.values.join(' | ')||'Not automatically found')),'','Potential issues:',...r.flags.map(f=>f.kind+': '+f.evidence),'','Official references:',...REFERENCES.map(r=>r.url)].join('\n');}
