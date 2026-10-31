import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, ShieldCheck, X } from 'lucide-react'
import { fetchListingBySlug } from '../lib/directory'

type ListingDetailDialogProps = {
  slug: string
  onClose: () => void
}

export function ListingDetailDialog({ slug, onClose }: ListingDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: ['directory-listing', slug],
    queryFn: ({ signal }) => fetchListingBySlug(slug, signal),
    staleTime: 60_000,
    retry: false,
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="listing-detail-dialog"
      aria-labelledby="listing-detail-title"
      onCancel={onClose}
    >
      <div className="listing-detail-header">
        <div>
          <p className="eyebrow">PUBLIC DIRECTORY ENTRY</p>
          <h2 id="listing-detail-title">{data?.name ?? 'Listing details'}</h2>
        </div>
        <button className="listing-detail-close" type="button" onClick={onClose} aria-label="Close listing details">
          <X size={20} />
        </button>
      </div>

      {isPending ? <p className="directory-status" role="status">Loading listing details…</p> : null}
      {error ? (
        <div className="directory-status directory-error" role="alert">
          <p>{error instanceof Error ? error.message : 'Unable to load this listing.'}</p>
          <button className="button button-small" type="button" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? 'Retrying…' : 'Try again'}
          </button>
        </div>
      ) : null}
      {data ? (
        <>
          <div className="listing-detail-meta">
            <span>{data.category}</span>
            <span>{data.region}{data.country_code ? ` · ${data.country_code}` : ''}</span>
            <span className={data.verified_at ? 'is-verified' : ''}>
              <ShieldCheck size={14} />
              {data.verified_at ? 'Source checked' : 'Community-submitted'}
            </span>
          </div>
          <p className="listing-detail-summary">{data.summary}</p>
          <div className="listing-detail-links">
            <a className="button" href={data.website_url} target="_blank" rel="noreferrer">
              Visit official website <ExternalLink size={15} />
            </a>
            <a className="text-link" href={data.source_url} target="_blank" rel="noreferrer">
              View verification source <ExternalLink size={14} />
            </a>
          </div>
          <p className="listing-detail-note">
            FurFinder links to public sources. Confirm current information with the listed organization or event organizer.
          </p>
        </>
      ) : null}
    </dialog>
  )
}
