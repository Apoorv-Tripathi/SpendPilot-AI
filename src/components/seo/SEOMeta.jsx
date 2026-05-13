import { Helmet } from 'react-helmet-async'

const SITE_NAME   = 'SpendLens'
const SITE_URL    = import.meta.env.VITE_SITE_URL || 'https://spendlens.app'
const DEFAULT_OG  = `${SITE_URL}/og-default.png`

export default function SEOMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogType    = 'website',
  canonical,
  noIndex   = false,
}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — AI Spend Intelligence`
  const metaDesc  = description || 'Understand exactly what you\'re paying for across every AI tool your team uses. Find savings in under 15 minutes. Free.'
  const ogImg     = ogImage || DEFAULT_OG
  const ogT       = ogTitle || fullTitle
  const ogD       = ogDescription || metaDesc
  const url       = canonical ? `${SITE_URL}${canonical}` : SITE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type"        content={ogType} />
      <meta property="og:title"       content={ogT} />
      <meta property="og:description" content={ogD} />
      <meta property="og:image"       content={ogImg} />
      <meta property="og:url"         content={url} />
      <meta property="og:site_name"   content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={ogT} />
      <meta name="twitter:description" content={ogD} />
      <meta name="twitter:image"       content={ogImg} />
      <meta name="twitter:site"        content="@spendlens" />

      {/* Extra */}
      <meta name="theme-color" content="#C8F135" />
    </Helmet>
  )
}
