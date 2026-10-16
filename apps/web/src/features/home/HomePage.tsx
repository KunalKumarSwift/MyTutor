import { Link } from 'react-router';
import { ArrowRight, BookOpen, Layers, Search } from 'lucide-react';
import type { PublicCategoryDto } from '@mytutor/contracts';
import { ButtonLink, ErrorState, Skeleton } from '../../components/ui';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useParallax } from '../../hooks/useParallax';
import { useReveal } from '../../hooks/useReveal';
import { pluralize } from '../../lib/format';
import { usePublicCategories, usePublicTutorials } from '../tutorials/public-api';
import { TutorialGrid, TutorialGridSkeleton } from '../tutorials/TutorialCard';

function Hero() {
  const ref = useParallax<HTMLElement>();
  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-brand-900 text-white">
      {/* Decorative layers only; the hero reads the same without them. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          data-parallax-speed="0.25"
          className="parallax-layer absolute -top-24 -left-24 size-[28rem] rounded-full bg-brand-500/40 blur-3xl"
        />
        <div
          data-parallax-speed="0.12"
          className="parallax-layer absolute top-10 right-[-6rem] size-[24rem] rounded-full bg-accent-500/25 blur-3xl"
        />
        <div
          data-parallax-speed="0.05"
          className="parallax-layer absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.09)_1px,transparent_0)] [background-size:28px_28px]"
        />
      </div>
      <div className="mx-auto max-w-[var(--container-page)] px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32 lg:px-8">
        <p className="animate-rise-in text-sm font-bold tracking-[0.2em] text-brand-200 uppercase">
          Online tutorials
        </p>
        <h1 className="mt-4 max-w-3xl animate-rise-in text-4xl font-extrabold tracking-tight text-balance [animation-delay:80ms] sm:text-6xl">
          Learn at your own pace, one tutorial at a time.
        </h1>
        <p className="mt-6 max-w-2xl animate-rise-in text-lg leading-relaxed text-brand-100 [animation-delay:160ms]">
          MyTutor organises free tutorials by subject and difficulty so you can find the right
          starting point and see what to learn first.
        </p>
        <div className="mt-10 flex animate-rise-in flex-wrap gap-3 [animation-delay:240ms]">
          <ButtonLink
            to="/tutorials"
            size="lg"
            className="bg-white !text-brand-900 hover:bg-brand-50"
            icon={<Search className="size-5" aria-hidden="true" />}
          >
            Explore tutorials
          </ButtonLink>
          <a
            href="#categories"
            className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-control)] px-5 font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10"
          >
            Browse categories
          </a>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Layers,
      title: 'Pick a subject',
      text: 'Categories group related tutorials, from programming fundamentals to databases.',
    },
    {
      icon: BookOpen,
      title: 'Choose your level',
      text: 'Each tutorial is marked with a difficulty level so you can start where you are comfortable.',
    },
    {
      icon: ArrowRight,
      title: 'Check prerequisites',
      text: 'Tutorials list what you should know first, so you can plan what to read next.',
    },
  ];
  return (
    <section
      aria-labelledby="how-heading"
      className="mx-auto max-w-[var(--container-page)] px-4 py-16 sm:px-6 lg:px-8"
    >
      <h2 id="how-heading" className="sr-only">
        How MyTutor works
      </h2>
      <ol className="grid gap-5 md:grid-cols-3">
        {steps.map((step, i) => (
          <Step key={step.title} index={i} {...step} />
        ))}
      </ol>
    </section>
  );
}

function Step({
  icon: Icon,
  title,
  text,
  index,
}: {
  icon: typeof Layers;
  title: string;
  text: string;
  index: number;
}) {
  const ref = useReveal<HTMLLIElement>(index);
  return (
    <li ref={ref} className="rounded-[var(--radius-card)] bg-surface p-6 ring-1 ring-line">
      <div
        className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700"
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{text}</p>
    </li>
  );
}

function CategoryTile({ category, index }: { category: PublicCategoryDto; index: number }) {
  const ref = useReveal<HTMLLIElement>(index);
  return (
    <li ref={ref}>
      <Link
        to={`/tutorials?category=${category.id}`}
        className="group flex h-full flex-col rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line transition-[box-shadow,transform] duration-[var(--duration-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] hover:ring-brand-200"
      >
        <span className="font-bold text-ink group-hover:text-brand-800">{category.title}</span>
        {category.description && (
          <span className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink-muted">
            {category.description}
          </span>
        )}
        <span className="mt-4 text-xs font-semibold text-brand-700">
          {pluralize(category.tutorialCount, 'tutorial')}
        </span>
      </Link>
    </li>
  );
}

function Categories() {
  const categories = usePublicCategories();
  const visible = categories.data?.filter((c) => c.tutorialCount > 0) ?? [];
  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="scroll-mt-24 border-y border-line bg-surface/60 py-16"
    >
      <div className="mx-auto max-w-[var(--container-page)] px-4 sm:px-6 lg:px-8">
        <h2 id="categories-heading" className="text-2xl font-extrabold tracking-tight">
          Browse by category
        </h2>
        <div className="mt-8">
          {categories.isPending ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <Skeleton className="h-32 rounded-[var(--radius-card)]" />
                </li>
              ))}
            </ul>
          ) : categories.isError ? (
            <ErrorState error={categories.error} onRetry={() => void categories.refetch()} />
          ) : visible.length === 0 ? (
            <p className="text-ink-muted">No categories have published tutorials yet.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
              {visible.map((c, i) => (
                <CategoryTile key={c.id} category={c} index={i} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Latest() {
  const latest = usePublicTutorials({ sort: 'newest', pageSize: 6 });
  return (
    <section
      aria-labelledby="latest-heading"
      className="mx-auto max-w-[var(--container-page)] px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="flex items-end justify-between gap-4">
        <h2 id="latest-heading" className="text-2xl font-extrabold tracking-tight">
          Recently published
        </h2>
        <Link
          to="/tutorials"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-900"
        >
          View all <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-8">
        {latest.isPending ? (
          <TutorialGridSkeleton count={3} />
        ) : latest.isError ? (
          <ErrorState error={latest.error} onRetry={() => void latest.refetch()} />
        ) : latest.data.data.length === 0 ? (
          <p className="text-ink-muted">No tutorials have been published yet.</p>
        ) : (
          <TutorialGrid tutorials={latest.data.data} />
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  useDocumentTitle(undefined);
  return (
    <>
      <Hero />
      <HowItWorks />
      <Categories />
      <Latest />
    </>
  );
}
