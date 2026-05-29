import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRef = process.argv[2] || 'yyufaaxmpoppnmcbypvf'
const sqlFile = process.argv[3]
const token = process.env.SUPABASE_ACCESS_TOKEN

if (!token || !sqlFile) {
  console.error('Usage: SUPABASE_ACCESS_TOKEN=... node apply-sql.mjs <ref> <sql-file>')
  process.exit(1)
}

const sql = fs.readFileSync(path.resolve(sqlFile), 'utf8')
const res = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  }
)

const text = await res.text()
if (!res.ok) {
  console.error('Failed:', res.status, text.slice(0, 2000))
  process.exit(1)
}
console.log('OK:', sqlFile, text.slice(0, 500))
