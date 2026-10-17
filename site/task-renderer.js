'use strict';
// Normalize legacy AI output before Markdown parsing; never change saved task data.
window.TaskRenderer = (() => {
 function normalize(value) {
  const text = String(value ?? '').replace(/\\u([0-9a-f]{4})/gi, (match, hex) => {
   const code = parseInt(hex, 16);
   return code >= 0xa0 && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCharCode(code) : match;
  });
  const lines = text.split(/\r?\n/), result = [];
  let fence = false;
  const cells = line => line.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(c => c.trim());
  const row = values => '| ' + values.join(' | ') + ' |';
  for (let i = 0; i < lines.length; i++) {
   if (/^\s*(```|~~~)/.test(lines[i])) fence = !fence;
   if (fence || !lines[i].includes('|')) { result.push(lines[i]); continue; }
   // Older tasks sometimes put the first table row inside its heading.
   const heading = lines[i].match(/^(#{1,6}\s+Tabelle\s+[^:]+:)\s*(.+\|.+)$/i);
   const first = heading ? heading[2] : lines[i];
   let next = i + 1;
   while (next < lines.length && !lines[next].trim()) next++;
   const a = cells(first), b = next < lines.length ? cells(lines[next]) : [];
   const separator = b.length === a.length && b.every(c => /^:?-{3,}:?$/.test(c));
   if (separator) {
    if (heading) result.push(heading[1], '');
    result.push(row(a), row(b)); i = next;
    while (i + 1 < lines.length && lines[i + 1].includes('|') && !/^\s*#/.test(lines[i + 1]) && cells(lines[i + 1]).length === a.length) result.push(lines[++i]);
    continue;
   }
   const isXY = /^[xy]$/i.test(a[0]) && /^[xy]$/i.test(b[0]);
   const explicitRows = first.trim().startsWith('|') && lines[next]?.trim().startsWith('|');
   if (a.length >= 2 && a.length === b.length && !separator && (heading || isXY || explicitRows)) {
    if (heading) result.push(heading[1], '');
    result.push(row(a), row(a.map(() => '---')), row(b));
    i = next;
    while (i + 1 < lines.length && lines[i + 1].includes('|') && !/^\s*#/.test(lines[i + 1]) && cells(lines[i + 1]).length === a.length) result.push(lines[++i]);
   } else result.push(lines[i]);
  }
  return result.join('\n');
 }
 function render(value) {
  const formulas = [], code = [];
  // Keep code examples literal, and protect math delimiters from Markdown escaping.
  let source = normalize(value).replace(/(`{3,}|~{3,})[^\n]*\n[\s\S]*?\1|`[^`\n]+`/g, text => {
   code.push(text); return `TASKCODEPLACEHOLDER${code.length - 1}END`;
  });
  source = source.replace(/\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|(?<![\\\w])\$([^$\n]+?)\$(?!\d)/g, (match, dollars, brackets, inline, single) => {
   const index = formulas.push({text:dollars ?? brackets ?? inline ?? single,display:dollars !== undefined || brackets !== undefined}) - 1;
   return `<span data-task-formula="${index}"></span>`;
  });
  source = source.replace(/TASKCODEPLACEHOLDER(\d+)END/g, (_, index) => code[index]);
  const root = document.createElement('div');
  root.innerHTML = DOMPurify.sanitize(marked.parse(source, {gfm:true}), {USE_PROFILES:{html:true}});
  root.querySelectorAll('[data-task-formula]').forEach(node => {
   const formula = formulas[Number(node.dataset.taskFormula)];
   if (!formula) { node.removeAttribute('data-task-formula'); return; }
   node.removeAttribute('data-task-formula');
   if (window.katex) katex.render(formula.text, node, {displayMode:formula.display,throwOnError:false,trust:false,strict:'ignore',maxExpand:200,maxSize:10});
   else node.textContent = formula.text;
  });
  root.querySelectorAll('table').forEach(table => {
   const wrapper = document.createElement('div');
   wrapper.className = 'task-table-scroll'; wrapper.tabIndex = 0;
   wrapper.setAttribute('role','region');
   wrapper.setAttribute('aria-label','Aufgabentabelle – bei Bedarf seitlich scrollen');
   table.querySelectorAll('thead th').forEach(th => th.scope = 'col');
   table.querySelectorAll('tbody tr').forEach(tr => {
    const first = tr.firstElementChild;
    if (first?.tagName === 'TD' && /^[xy]$/i.test(first.textContent.trim())) {
     const th = document.createElement('th'); th.scope = 'row'; th.innerHTML = first.innerHTML; first.replaceWith(th);
    }
   });
   table.replaceWith(wrapper); wrapper.append(table);
  });
  return `<div class="task-content">${root.innerHTML}</div>`;
 }
 return {normalize,render};
})();
