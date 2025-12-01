import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home Page', () => {
  it('renders the home page with title', () => {
    render(<Home />);
    const heading = screen.getByText('Worklamp');
    expect(heading).toBeInTheDocument();
  });

  it('displays the tagline', () => {
    render(<Home />);
    const tagline = screen.getByText('Project Management for Developers');
    expect(tagline).toBeInTheDocument();
  });
});
