import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog, Field, Pagination, StatusBadge, TextInput } from '../src/components/ui';
import { validateTutorial } from '../src/features/admin/tutorials/TutorialFormPage';
import { TutorialCard } from '../src/features/tutorials/TutorialCard';
import { useReveal } from '../src/hooks/useReveal';
import { paragraphs } from '../src/lib/format';
import { tutorialSummary } from './test-utils';

describe('UI components', () => {
  it('Field links label, hint and error to the control', () => {
    render(
      <Field label="Title" error="Title is required." hint="Short and clear" required>
        <TextInput />
      </Field>,
    );
    const input = screen.getByLabelText(/Title/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    expect(input).toHaveAccessibleDescription('Title is required.');
  });

  it('Pagination disables boundaries and reports page changes', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        pagination={{ page: 1, pageSize: 10, totalItems: 25, totalPages: 3 }}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('Pagination renders nothing for a single page', () => {
    const { container } = render(
      <Pagination
        pagination={{ page: 1, pageSize: 10, totalItems: 3, totalPages: 1 }}
        onPageChange={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('ConfirmDialog confirms and cancels via keyboard-focusable buttons', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Delete it?"
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        This cannot be undone.
      </ConfirmDialog>,
    );
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('StatusBadge conveys status in text, not colour alone', () => {
    render(
      <>
        <StatusBadge status="ACTIVE" />
        <StatusBadge status="INACTIVE" />
      </>,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('TutorialCard shows category, level and a link to the detail page', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: (
          <ul>
            <TutorialCard tutorial={tutorialSummary(7, 'Graph Traversal')} />
          </ul>
        ),
      },
    ]);
    render(<RouterProvider router={router} />);
    expect(screen.getByRole('link', { name: 'Graph Traversal' })).toHaveAttribute(
      'href',
      '/tutorials/7',
    );
    expect(screen.getByText('Databases')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('May 1, 2026')).toBeInTheDocument();
  });
});

describe('helpers', () => {
  it('validates tutorial forms', () => {
    expect(
      validateTutorial({
        title: ' ',
        categoryId: '',
        difficultyLevelId: '',
        prerequisites: '',
        description: '',
        status: 'ACTIVE',
      }),
    ).toEqual({
      title: 'Title is required.',
      categoryId: 'Choose a category.',
      difficultyLevelId: 'Choose a difficulty level.',
      description: 'Description is required.',
    });
    expect(
      validateTutorial({
        title: 'Ok',
        categoryId: '1',
        difficultyLevelId: '2',
        prerequisites: '',
        description: 'Body',
        status: 'ACTIVE',
      }),
    ).toEqual({});
  });

  it('splits stored text into paragraphs', () => {
    expect(paragraphs('One\n\n\nTwo\nstill two\n\n  ')).toEqual(['One', 'Two\nstill two']);
  });
});

describe('motion', () => {
  function Revealed() {
    const ref = useReveal<HTMLDivElement>();
    return <div ref={ref} data-testid="revealed" />;
  }

  it('never hides content when the user prefers reduced motion', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('reduce'),
      addEventListener() {},
      removeEventListener() {},
    }));
    render(<Revealed />);
    expect(screen.getByTestId('revealed')).not.toHaveAttribute('data-reveal');
  });

  it('arms off-screen elements for reveal when motion is allowed', () => {
    const observe = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = observe;
        unobserve = vi.fn();
        disconnect = vi.fn();
      },
    );
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }));
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 5000,
    } as DOMRect);
    render(<Revealed />);
    expect(screen.getByTestId('revealed')).toHaveAttribute('data-reveal', 'armed');
  });
});

describe('TextInput with an icon', () => {
  it('keeps the label attached to the input, not the wrapper', () => {
    render(
      <Field label="Search">
        <TextInput type="search" leadingIcon={<svg />} />
      </Field>,
    );
    expect(screen.getByLabelText('Search').tagName).toBe('INPUT');
    expect(screen.getByRole('searchbox', { name: 'Search' })).toBeInTheDocument();
  });
});
