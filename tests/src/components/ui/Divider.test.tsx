import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Divider } from '@/components/ui/Divider';

describe('Divider', () => {
  it('rendersAHorizontalRule', () => {
    const { container } = render(<Divider />);

    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('appendsAnExtraClassNameWhenProvided', () => {
    const { container } = render(<Divider className="my-8" />);

    expect(container.querySelector('hr')).toHaveClass('my-8');
  });
});
