import { isRouteErrorResponse, useRouteError } from 'react-router';
import { ButtonLink, EmptyState } from '../components/ui';

/** Last-resort boundary, e.g. when a lazily loaded chunk fails after a deployment. */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const chunkFailed = error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message);
  if (import.meta.env.DEV) console.error(error);
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <EmptyState
        title={isRouteErrorResponse(error) && error.status === 404 ? 'Page not found' : 'Something went wrong'}
        description={chunkFailed ? 'A new version of MyTutor is available. Reload the page to continue.' : 'An unexpected error occurred while loading this page.'}
        action={
          chunkFailed ? (
            <button type="button" onClick={() => window.location.reload()} className="font-semibold text-brand-700 underline">
              Reload
            </button>
          ) : (
            <ButtonLink to="/">Go to the homepage</ButtonLink>
          )
        }
      />
    </div>
  );
}
