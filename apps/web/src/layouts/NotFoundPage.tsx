import { ButtonLink, EmptyState } from '../components/ui';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <EmptyState
        title="Page not found"
        description="The page you were looking for doesn’t exist or has moved."
        action={<ButtonLink to="/">Go to the homepage</ButtonLink>}
      />
    </div>
  );
}
