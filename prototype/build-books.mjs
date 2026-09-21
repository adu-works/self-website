/** Build the public demo book from its editable Markdown sources; never include private manuscripts. */
import {readFile,writeFile} from 'node:fs/promises';
const chapters=[];
for(const id of ['introduction','chapter1','chapter2']){
 const path=`books/independent-site/${id}.md`;
 const text=await readFile(new URL(path,import.meta.url),'utf8');
 const [head,...chunks]=text.trim().split(/^## /m);
 const [title,...intro]=head.trim().split('\n');
 if(!title.startsWith('# ')||chunks.length===0)throw new Error(`Invalid chapter ${path}`);
 chapters.push({id,title:title.slice(2),path:`prototype/${path}`,intro:intro.join('\n').trim().split(/\n\s*\n/),sections:chunks.map((chunk,i)=>{const [name,...body]=chunk.trim().split('\n');return {id:`section-${i+1}`,title:name,paragraphs:body.join('\n').trim().split(/\n\s*\n/)};})});
}
await writeFile(new URL('dist/books-data.mjs',import.meta.url),`// Generated from books/independent-site/*.md by build-books.mjs.\nexport const book = ${JSON.stringify({id:'independent-site',title:'从想法到自己的小站',subtitle:'表达、内容与独立实践',status:'示例书稿 · 非正式出版',chapters},null,2)};\n`);
console.log('Built 3 public demo chapters.');
