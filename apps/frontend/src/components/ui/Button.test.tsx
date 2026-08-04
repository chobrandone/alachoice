import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children as a button', () => {
    render(<Button>Get a Quote</Button>);
    expect(screen.getByRole('button', { name: 'Get a Quote' })).toBeInTheDocument();
  });

  it('applies the primary (red) variant by default', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-ala-red');
  });

  it('applies the outline-navy variant when requested', () => {
    render(<Button variant="outline-navy">Learn more</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-ala-navy');
  });

  it('fires onClick when pressed', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Click
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
