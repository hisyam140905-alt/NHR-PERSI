const fs = require('fs');
let content = fs.readFileSync('functions/server/index.tsx', 'utf8');
content = content.replace(
  /import \{ Hono \} from "hono";/,
  `import { Hono } from "hono";\nimport type { Context } from "hono";\n\ndeclare const Deno: {\n  env: { get: (key: string) => string | undefined };\n  serve: (handler: any) => void;\n};\n`
);
content = content.replace(/\(c\) => \{/g, '(c: Context) => {');
fs.writeFileSync('functions/server/index.tsx', content);
