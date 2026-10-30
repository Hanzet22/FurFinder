import { useMemo, useState } from 'react'
import { ArrowLeft, Search, SlidersHorizontal, ExternalLink, Compass, ArrowUpRight } from 'lucide-react'
import catalog from './data/technology-catalog.json'

type Technology = {
  name: string
  responsibility: string
  placement: string
  status: string
  category: string
}

const technologies = catalog.technologies as Technology[]
const categories = ['All categories', ...catalog.categories]
const statuses = ['All statuses', 'Active', 'Planned', 'Evaluation', 'Experimental']

function statusTone(status: string) {
  if (status.startsWith('Active')) return 'active'
  if (status === 'Planned') return 'planned'
  if (status === 'Evaluation') return 'evaluation'
  return 'experimental'
}

export function TechnologyExplorer() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All categories')
  const [status, setStatus] = useState('All statuses')

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()
    return technologies.filter((item) => {
      const matchesText = !term || [item.name, item.responsibility, item.placement, item.category, item.status]
        .some((value) => value.toLocaleLowerCase().includes(term))
      const matchesCategory = category === 'All categories' || item.category === category
      const matchesStatus = status === 'All statuses' || item.status === status || (status === 'Active' && item.status.startsWith('Active'))
      return matchesText && matchesCategory && matchesStatus
    })
  }, [category, query, status])

  const counts = useMemo(() => ({
    active: technologies.filter((item) => item.status.startsWith('Active')).length,
    planned: technologies.filter((item) => item.status === 'Planned').length,
    evaluation: technologies.filter((item) => item.status === 'Evaluation').length,
    experimental: technologies.filter((item) => item.status === 'Experimental').length,
  }), [])

  return (
    <main className="technology-page">
      <header className="technology-header">
        <a className="brand" href="/" aria-label="FurFinder home">
          <span className="brand-mark"><Compass size={22} /></span>
          <span>fur<span className="brand-accent">finder</span><small>TECHNOLOGY EXPLORER</small></span>
        </a>
        <a className="technology-back" href="/"><ArrowLeft size={16} /> Back to directory</a>
      </header>

      <section className="technology-hero" aria-labelledby="technology-title">
        <div className="eyebrow">FURFINDER · ENGINEERING ROADMAP</div>
        <h1 id="technology-title">Technology,<br /><span>with a purpose.</span></h1>
        <p>Explore the tools, languages, platforms, and experiments behind FurFinder. Every entry has a defined responsibility and adoption status.</p>
        <div className="technology-stats" aria-label="Technology status summary">
          <div><strong>{technologies.length}</strong><span>Total entries</span></div>
          <div><strong>{counts.active}</strong><span>Active</span></div>
          <div><strong>{counts.planned}</strong><span>Planned</span></div>
          <div><strong>{counts.evaluation + counts.experimental}</strong><span>Under evaluation</span></div>
        </div>
      </section>

      <section className="technology-explorer" aria-labelledby="technology-list-title">
        <div className="technology-section-heading">
          <div><div className="eyebrow">CATALOGUE</div><h2 id="technology-list-title">Explore the stack.</h2></div>
          <p>Search by name, purpose, placement, category, or status.</p>
        </div>
        <div className="technology-controls">
          <label className="technology-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search technologies</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search technologies or responsibilities…" />
          </label>
          <label className="technology-filter">
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="sr-only">Filter by category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label className="technology-filter">
            <span className="sr-only">Filter by status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statuses.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
        </div>
        <p className="technology-result-count" role="status" aria-live="polite">Showing {filtered.length} of {technologies.length} technologies</p>
        {filtered.length ? (
          <div className="technology-grid">
            {filtered.map((item) => (
              <article className="technology-card" key={item.name}>
                <div className="technology-card-top">
                  <span className="technology-category">{item.category}</span>
                  <span className={`technology-status ${statusTone(item.status)}`}>{item.status}</span>
                </div>
                <h3>{item.name}</h3>
                <p>{item.responsibility}</p>
                <div className="technology-placement"><span>PLACEMENT</span><code>{item.placement}</code></div>
              </article>
            ))}
          </div>
        ) : (
          <div className="technology-empty" role="status">
            <Search size={24} />
            <h3>No technologies found</h3>
            <p>Try a different keyword or reset the category and status filters.</p>
            <button type="button" onClick={() => { setQuery(''); setCategory('All categories'); setStatus('All statuses') }}>Reset filters</button>
          </div>
        )}
      </section>

      <aside className="technology-note">
        <div><div className="eyebrow">IMPORTANT DISTINCTION</div><h2>Listed does not mean installed.</h2></div>
        <p>This catalogue is a roadmap and architecture record—not a dependency manifest. Planned, evaluation, and experimental technologies are not part of the production runtime unless separately approved, implemented, tested, and reviewed.</p>
        <a href="https://github.com/Hanzet22/FurFinder/blob/feat/technology-explorer/docs/technology-roadmap.md" target="_blank" rel="noreferrer">Read the full roadmap <ExternalLink size={14} /></a>
      </aside>
      <footer className="technology-footer"><span>© {new Date().getFullYear()} FurFinder</span><a href="/">Return to global directory <ArrowUpRight size={14} /></a></footer>
    </main>
  )
}
