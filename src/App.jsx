import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Suspense, lazy } from 'react'
import Layout          from './components/layout/Layout'
import AuditLoading    from './components/results/AuditLoading'
import { useAuditReport } from './hooks/useAuditReport'
import SEOMeta from './components/seo/SEOMeta'

const LandingPage     = lazy(() => import('./pages/LandingPage'))
const AuditPage       = lazy(() => import('./pages/AuditPage'))
const ResultsPage     = lazy(() => import('./pages/ResultsPage'))
const SharedAuditPage = lazy(() => import('./pages/SharedAuditPage'))

export default function App() {
  const { report, loading, generate, clearReport, publicId } = useAuditReport()

  return (
    <HelmetProvider>
      <SEOMeta />
      <BrowserRouter>
        <Suspense fallback={<AuditLoading />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/audit"
                element={<AuditPage onGenerateReport={generate} reportLoading={loading} />}
              />
              <Route
                path="/results"
                element={
                  <ResultsPage
                    report={report}
                    loading={loading}
                    onReset={clearReport}
                    publicId={publicId}
                  />
                }
              />
              <Route path="/shared/:publicId" element={<SharedAuditPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  )
}

function NotFound() {
  return (
    <>
      <SEOMeta title="Page Not Found" noIndex />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="font-mono text-6xl text-white/10 mb-4">404</div>
          <h1 className="font-display font-bold text-2xl text-white mb-3">Page not found</h1>
          <p className="font-body text-white/40 text-sm mb-8">
            The page you're looking for doesn't exist.
          </p>
          <a href="/" className="btn-primary text-sm px-8 py-3 inline-flex">Go home</a>
        </div>
      </div>
    </>
  )
}
