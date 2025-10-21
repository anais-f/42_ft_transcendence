import fs from 'fs'
import path from 'path'
import { createSchema } from 'zod-openapi'
import { pathToFileURL, fileURLToPath } from 'url'

// __dirname n'existe pas en ESM; on le calcule depuis import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'))
const workspaces: string[] = pkg.workspaces || []

function expandWorkspace(ws: string): string[] {
  if (!ws.includes('*')) return [ws]
  const [prefix] = ws.split('*')
  const base = path.join(root, prefix)
  if (!fs.existsSync(base)) return []
  return fs.readdirSync(base).map((d) => path.join(prefix, d))
}

function sanitizeWorkspaceName(wsPath: string) {
  const name = path.basename(wsPath)
  // keep alnum and underscore
  return name.replace(/[^a-zA-Z0-9_]/g, '_')
}

async function importModule(filePath: string) {
  // use file URL to ensure dynamic import works in ESM
  const url = pathToFileURL(filePath).href
  return import(url)
}

async function processWorkspace(wsPath: string): Promise<Record<string, any> | null> {
  const abs = path.join(root, wsPath)
  if (!fs.existsSync(abs)) return null
  const workspaceName = sanitizeWorkspaceName(wsPath)

  // possible DTO dirs (prefer compiled dist)
  const candidates = [
    path.join(abs, 'dist', 'DTO'),
    path.join(abs, 'dist', 'dto'),
    path.join(abs, 'srcs', 'DTO'),
    path.join(abs, 'srcs', 'dto'),
    path.join(abs, 'src', 'DTO'),
  ]

  let dtoDir: string | null = null
  let ext: '.js' | '.ts' = '.js'
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) {
      dtoDir = c
      // prefer .js if in dist
      ext = c.includes(path.sep + 'dist' + path.sep) ? '.js' : '.ts'
      break
    }
  }

  if (!dtoDir) {
    console.log(`No DTO dir for workspace ${wsPath} (skipping)`)
    return null
  }

  const files = fs.readdirSync(dtoDir).filter((f) => f.endsWith(ext))
  if (files.length === 0) {
    console.log(`No DTO files in ${dtoDir} for ${wsPath}`)
    return null
  }

  console.log(`Processing workspace ${wsPath}, dtoDir=${dtoDir}, files=${files.join(',')}`)

  const mergedComponents: Record<string, any> = {}

  for (const file of files) {
    const importPath = path.join(dtoDir, file)
    console.log(`  Importing file ${importPath}`)
    try {
      const mod = await importModule(importPath)
      const exportKeys = Object.keys(mod)
      console.log(`    Found exports: ${exportKeys.join(', ') || '(none)'}`)
      for (const key of exportKeys) {
        const val = (mod as any)[key]
        const isZod = val && typeof val === 'object' && typeof val.safeParse === 'function'
        console.log(`      Export ${key}: isZod=${isZod}`)
        if (isZod) {
          try {
            const { schema, components } = createSchema(val)
            console.log(`        createSchema OK for ${key}: schemaExists=${!!schema}, componentsSchemas=${components?.schemas ? Object.keys(components.schemas).length : 0}`)
            const prefixedName = `${workspaceName}.${key}`
            if (schema) mergedComponents[prefixedName] = schema
            if (components && components.schemas) {
              for (const [cname, cdef] of Object.entries(components.schemas)) {
                const compKey = `${workspaceName}.${cname}`
                if (!mergedComponents[compKey]) mergedComponents[compKey] = cdef
              }
            }
          } catch (e) {
            console.warn(`        createSchema failed for ${wsPath}:${file}:${key} ->`, (e as Error).message)
          }
        }
      }
    } catch (err) {
      console.warn(`Failed import ${importPath}:`, (err as Error).message)
    }
  }

  const document = {
    openapi: '3.0.3',
    info: { title: `${workspaceName} - generated schemas`, version: '1.0.0' },
    paths: {},
    components: { schemas: mergedComponents },
  }

  const outDir = path.join(abs, 'swagger')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'swagger.zod.json')
  fs.writeFileSync(outFile, JSON.stringify(document, null, 2), 'utf-8')
  console.log(`Wrote ${outFile} with ${Object.keys(mergedComponents).length} schemas`)

  return mergedComponents
}

async function main() {
  const expanded: string[] = []
  for (const ws of workspaces) {
    expanded.push(...expandWorkspace(ws))
  }

  const globalComponents: Record<string, any> = {}

  for (const ws of expanded) {
    try {
      const comps = await processWorkspace(ws)
      if (comps) Object.assign(globalComponents, comps)
    } catch (e) {
      console.error('Error processing', ws, e)
    }
  }

  // write merged global doc
  const mergedDoc = {
    openapi: '3.0.3',
    info: { title: `Merged - generated schemas`, version: '1.0.0' },
    paths: {},
    components: { schemas: globalComponents },
  }

  const docsDir = path.join(root, 'docs')
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true })
  const mergedOut = path.join(docsDir, 'openapi-merged.json')
  fs.writeFileSync(mergedOut, JSON.stringify(mergedDoc, null, 2), 'utf-8')
  console.log(`Wrote merged OpenAPI to ${mergedOut} with ${Object.keys(globalComponents).length} schemas`)

  console.log('Done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
