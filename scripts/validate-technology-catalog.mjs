import { readFile } from 'node:fs/promises'

const path = new URL('../src/data/technology-catalog.json', import.meta.url)
const catalog = JSON.parse(await readFile(path, 'utf8'))
const items = catalog.technologies
const names = items.map((item) => item.name)
const unique = new Set(names)
const required = ['name', 'responsibility', 'placement', 'status', 'category']
const validStatus = (value) => ['Active', 'Planned', 'Evaluation', 'Experimental'].some((prefix) => value.startsWith(prefix))
const invalid = items.flatMap((item, index) => {
  const missing = required.filter((key) => typeof item[key] !== 'string' || !item[key].trim())
  return missing.length || !validStatus(item.status) ? [{ index, name: item.name, missing, status: item.status }] : []
})
if (catalog.count !== 92 || items.length !== 92 || unique.size !== items.length || invalid.length) {
  console.error(JSON.stringify({ declared: catalog.count, actual: items.length, unique: unique.size, invalid }, null, 2))
  process.exitCode = 1
} else {
  console.log(`Technology catalog OK: ${items.length} unique entries across ${new Set(items.map((item) => item.category)).size} categories.`)
}
