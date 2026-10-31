import { useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import {
  ArrowRight, Search, MapPin, CalendarDays, Palette, Users,
  Building2, Factory, BookOpen, ShieldCheck, Globe2, Menu, X,
  Compass, Sparkles, ChevronRight, ExternalLink
} from 'lucide-react'
import { fetchListings } from './lib/directory'
import { ListingSubmissionForm } from './components/ListingSubmissionForm'

type Category = 'All' | 'Communities' | 'Conventions' | 'Artists' | 'Organizations' | 'Industry' | 'Resources'

const categories: { name: Category; icon: typeof Users; count: string }[] = [
  { name: 'All', icon: Compass, count: 'Explore all' },
  { name: 'Communities', icon: Users, count: 'Groups & spaces' },
  { name: 'Conventions', icon: CalendarDays, count: 'Events & meets' },
  { name: 'Artists', icon: Palette, count: 'Creators & makers' },
  { name: 'Organizations', icon: Building2, count: 'Clubs & associations' },
  { name: 'Industry', icon: Factory, count: 'Studios & services' },
  { name: 'Resources', icon: BookOpen, count: 'Guides & knowledge' },
]

const features = [
  { icon: Users, title: 'Communities', text: 'Find public groups and community spaces around the world.', tag: 'Connect' },
  { icon: CalendarDays, title: 'Conventions', text: 'Explore furry conventions, meets, and upcoming events.', tag: 'Discover events' },
  { icon: Palette, title: 'Artists & creators', text: 'Browse portfolios, makers, studios, and creative work.', tag: 'Explore talent' },
  { icon: Building2, title: 'Organizations', text: 'Learn about associations, clubs, and community groups.', tag: 'Find organizations' },
  { icon: Factory, title: 'Furry industry', text: 'Discover production, merchandise, technology, and services.', tag: 'Explore industry' },
  { icon: BookOpen, title: 'Knowledge hub', text: 'Find guides, public resources, and helpful information.', tag: 'Learn more' },
]

const regions = ['North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Middle East & Africa']

export default function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('All')
  const [region, setRegion] = useState('Anywhere')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showSubmission, setShowSubmission] = useState(false)
  const {
    data: listingPages,
    isPending: loadingListings,
    error: directoryError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['directory', 'published', query, category, region],
    queryFn: ({ signal, pageParam }) => {
      const categoryMap: Partial<Record<Category, 'community' | 'convention' | 'artist' | 'organization' | 'industry' | 'resource'>> = {
        Communities: 'community',
        Conventions: 'convention',
        Artists: 'artist',
        Organizations: 'organization',
        Industry: 'industry',
        Resources: 'resource',
      }
      const safeQuery = query.trim().normalize('NFC').replace(/[^\p{L}\p{N} -]/gu, '').slice(0, 100)
      return fetchListings(signal, pageParam, {
        q: safeQuery || undefined,
        category: category === 'All' ? undefined : categoryMap[category],
        region: region === 'Anywhere' ? undefined : region,
      })
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.page.next_cursor ?? undefined,
    staleTime: 60_000,
    retry: 1,
  })
  const listings = listingPages?.pages.flatMap((page) => page.data) ?? []

  const visibleListings = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const categoryMap: Partial<Record<Category, string>> = {
      Communities: 'community',
      Conventions: 'convention',
      Artists: 'artist',
      Organizations: 'organization',
      Industry: 'industry',
      Resources: 'resource',
    }
    return listings.filter((listing) => {
      const categoryMatch = category === 'All' || listing.category === categoryMap[category]
      const regionMatch = region === 'Anywhere' || listing.region === region
      const queryMatch = !normalized || `${listing.name} ${listing.summary} ${listing.region} ${listing.country_code ?? ''}`.toLowerCase().includes(normalized)
      return categoryMatch && regionMatch && queryMatch
    })
  }, [category, listings, query, region])

  const visibleFeatures = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const featureCategoryMap: Partial<Record<Category, string>> = {
      Communities: 'communities',
      Conventions: 'conventions',
      Artists: 'artists',
      Organizations: 'organizations',
      Industry: 'industry',
      Resources: 'knowledge',
    }
    return features.filter((feature) => {
      const categoryMatch = category === 'All' || feature.title.toLowerCase().includes(featureCategoryMap[category] ?? '')
      const queryMatch = !normalized || `${feature.title} ${feature.text}`.toLowerCase().includes(normalized)
      return categoryMatch && queryMatch
    })
  }, [category, query])

  return (
    <main>
      <a className="skip-link" href="#directory">Skip to directory</a>
      <header className="site-header">
        <a className="brand" href="#" aria-label="FurFinder home">
          <span className="brand-mark"><Compass size={23} strokeWidth={2.4} /></span>
          <span>fur<span className="brand-accent">finder</span><small>GLOBAL DISCOVERY</small></span>
        </a>
        <nav id="primary-navigation" className={mobileOpen ? 'nav nav-open' : 'nav'} aria-label="Main navigation">
          <a href="#discover" onClick={() => setMobileOpen(false)}>Discover</a>
          <a href="#categories" onClick={() => setMobileOpen(false)}>Categories</a>
          <a href="#about" onClick={() => setMobileOpen(false)}>About</a>
        </nav>
        <div className="header-actions">
          <a className="text-link" href="#how-it-works">How it works</a>
          <a className="button button-small" href="#submit">Suggest a listing <ArrowRight size={15} /></a>
        </div>
        <button type="button" className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-controls="primary-navigation" aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Close menu' : 'Open menu'}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </header>

      <section className="hero" id="discover">
        <div className="hero-glow glow-one" />
        <div className="hero-glow glow-two" />
        <div className="hero-content">
          <div className="eyebrow"><span className="live-dot" /> THE GLOBAL FURRY DIRECTORY</div>
          <h1>Your world.<br /><span>Your community.</span></h1>
          <p className="hero-copy">A place to discover furry communities, conventions, creators, and the people building this world — wherever you are.</p>
          <div className="search-panel">
            <div className="search-input-wrap"><Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search communities, events, creators..." aria-label="Search directory" /></div>
            <div className="search-divider" />
            <label className="region-select"><MapPin size={18} /><select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Choose region"><option>Anywhere</option>{regions.map((r) => <option key={r}>{r}</option>)}</select></label>
            <a className="button search-button" href="#categories">Explore <ArrowRight size={17} /></a>
          </div>
          <div className="hero-meta"><span><Globe2 size={15} /> Discover across borders</span><span><ShieldCheck size={15} /> Source-aware listings</span><span><Sparkles size={15} /> Made for the community</span></div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-a" /><div className="orbit orbit-b" />
          <div className="planet"><span className="planet-shine" /><span className="planet-ring" /></div>
          <div className="float-card card-top"><span className="mini-icon"><Users size={16} /></span><span><b>Communities</b><small>Find your people</small></span></div>
          <div className="float-card card-bottom"><span className="mini-icon warm"><CalendarDays size={16} /></span><span><b>FurCon discovery</b><small>Events around the globe</small></span></div>
          <div className="spark spark-a">✦</div><div className="spark spark-b">✧</div><div className="spark spark-c">✦</div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Platform principles">
        <div><ShieldCheck size={18} /><span>Transparent sources</span></div>
        <div><Globe2 size={18} /><span>Global perspective</span></div>
        <div><Users size={18} /><span>Community-first discovery</span></div>
        <div><Sparkles size={18} /><span>Built to grow together</span></div>
      </section>

      <section className="section categories-section" id="categories">
        <div className="section-heading">
          <div><div className="eyebrow">START EXPLORING</div><h2>Find your corner<br />of the furry world.</h2></div>
          <p>From local meetups to international creative studios, start with what interests you.</p>
        </div>
        <div className="category-tabs" role="group" aria-label="Filter categories">
          {categories.map(({ name, icon: Icon }) => <button type="button" key={name} className={category === name ? 'category-tab active' : 'category-tab'} aria-pressed={category === name} onClick={() => setCategory(name)}><Icon size={16} />{name}</button>)}
        </div>
        <div className="feature-grid">
          {visibleFeatures.length ? visibleFeatures.map(({ icon: Icon, title, text, tag }, index) => (
            <article className="feature-card" key={title}>
              <div className={`feature-icon icon-${index % 6}`}><Icon size={21} /></div>
              <div className="feature-card-body"><h3>{title}</h3><p>{text}</p></div>
              <a href="#submit" className="card-link" onClick={() => setShowSubmission(true)}>{tag}<ChevronRight size={15} /></a>
            </article>
          )) : <div className="empty-state" role="status">No category matched that search. Try another keyword or select “All”.</div>}
        </div>
      </section>

      <section className="section directory-section" id="directory" aria-labelledby="directory-title" aria-busy={loadingListings}>
        <div className="section-heading">
          <div><div className="eyebrow">COMMUNITY-VERIFIED DISCOVERY</div><h2 id="directory-title">The global directory.</h2></div>
          <p>Public listings with source links. Entries appear here only after review and publication.</p>
        </div>
        {loadingListings ? <p className="directory-status" role="status">Loading published listings…</p> : null}
        {directoryError ? <p className="directory-status directory-error" role="alert">{directoryError instanceof Error ? directoryError.message : 'Unable to load directory listings.'}</p> : null}
        {!loadingListings && !directoryError && listings.length > 0 && visibleListings.length === 0 ? (
          <div className="directory-empty" role="status">
            <Search size={25} />
            <h3>No matching listings</h3>
            <p>Try a different keyword, category, or region to broaden your search.</p>
          </div>
        ) : null}
        {!loadingListings && !directoryError && listings.length === 0 ? (
          <div className="directory-empty">
            <Globe2 size={25} />
            <h3>No published listings yet</h3>
            <p>The directory database is connected. Listings will appear here after their sources are checked and approved.</p>
          </div>
        ) : null}
        {visibleListings.length > 0 ? (
          <>
            <p className="directory-count" role="status">{visibleListings.length} {visibleListings.length === 1 ? 'listing' : 'listings'} shown</p>
            <div className="listing-grid">
            {visibleListings.map((listing) => (
              <article className="listing-card" key={listing.id}>
                <div className="listing-card-top">
                  <span className="listing-category">{listing.category}</span>
                  <span className="listing-region">{listing.region}{listing.country_code ? ` · ${listing.country_code}` : ''}</span>
                </div>
                <div className={listing.verified_at ? 'listing-verification is-verified' : 'listing-verification'}>
                  <ShieldCheck size={13} />
                  {listing.verified_at ? 'Source checked' : 'Community-submitted'}
                </div>
                <h3>{listing.name}</h3>
                <p>{listing.summary}</p>
                <div className="listing-card-links">
                  <a href={listing.website_url} target="_blank" rel="noreferrer">Visit website <ExternalLink size={14} /></a>
                  <a href={listing.source_url} target="_blank" rel="noreferrer">Source <ExternalLink size={14} /></a>
                </div>
              </article>
            ))}
            </div>
          </>
        ) : null}
        {hasNextPage ? (
          <div className="directory-load-more">
            <button
              className="button"
              type="button"
              onClick={() => void fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Loading more…' : 'Load more listings'}
              <ArrowRight size={16} />
            </button>
          </div>
        ) : null}
      </section>

      <section className="region-section" id="about">
        <div className="region-copy"><div className="eyebrow">ONE COMMUNITY, MANY PLACES</div><h2>Explore beyond<br />your borders.</h2><p>Furry communities are global. FurFinder is designed to make discovery easier across regions, languages, and creative scenes.</p><a href="#categories" className="inline-link">Explore the directory <ArrowRight size={16} /></a></div>
        <div className="region-list">{regions.map((r, i) => <div className="region-row" key={r}><span className="region-number">0{i + 1}</span><b>{r}</b><ArrowRight size={17} /></div>)}</div>
      </section>

      <section className="submit-section" id="submit" aria-labelledby="submit-title">
        <div className="submit-icon"><Sparkles size={24} /></div>
        <div><div className="eyebrow">HELP THE DIRECTORY GROW</div><h2 id="submit-title">Know a place we should find?</h2><p>Suggest a public community, event, creator, or organization for future review.</p></div>
        <button
          className="button"
          type="button"
          aria-expanded={showSubmission}
          aria-controls="listing-submission-form"
          onClick={() => setShowSubmission((open) => !open)}
        >
          {showSubmission ? 'Close form' : 'Suggest a listing'} <ArrowRight size={17} />
        </button>
      </section>
      <div className="submission-panel" id="listing-submission-form" hidden={!showSubmission}>
        <ListingSubmissionForm />
      </div>

      <footer className="footer" id="how-it-works">
        <a className="brand footer-brand" href="#"><span className="brand-mark"><Compass size={21} /></span><span>fur<span className="brand-accent">finder</span><small>GLOBAL DISCOVERY</small></span></a>
        <p>Discover openly. Respect communities. Verify sources.</p>
        <span className="footer-note">© {new Date().getFullYear()} FurFinder · Community discovery, worldwide.</span>
        <a className="staff-link" href="/moderation">Moderator access</a>
      </footer>
    </main>
  )
}
