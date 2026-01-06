import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { expect, within, userEvent } from 'storybook/test';
import { Button } from './button';

const meta = {
  title: 'UI/Button v2',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'This is test 1.3',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
      description: 'The visual style variant of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'medium' },
      },
    },
    children: {
      control: 'text',
      description: 'The content to display inside the button',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should take full width',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the button is in a loading state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
  args: { 
    onClick: fn(),
    children: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary button - use for main actions
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test rendering
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Primary Button');
    
    // Test primary variant styles
    await expect(button).toHaveClass('bg-blue-600');
    
    // Test click interaction
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

/**
 * Secondary button - use for secondary actions
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test secondary variant styles
    await expect(button).toHaveClass('bg-gray-200');
  },
};

/**
 * Outline button - use for less prominent actions
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

/**
 * Ghost button - use for subtle actions
 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

/**
 * Danger button - use for destructive actions
 */
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete',
  },
};

/**
 * Small button - compact size for tight spaces
 */
export const Small: Story = {
  args: {
    size: 'small',
    children: 'Small Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test small size styles
    await expect(button).toHaveClass('h-8');
    await expect(button).toHaveClass('px-3');
  },
};

/**
 * Medium button - default size for most use cases
 */
export const Medium: Story = {
  args: {
    size: 'medium',
    children: 'Medium Button',
  },
};

/**
 * Large button - prominent size for important actions
 */
export const Large: Story = {
  args: {
    size: 'large',
    children: 'Large Button',
  },
};

/**
 * Button with loading state - shows spinner and disables interaction
 */
export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Loading...',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test loading state
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    
    // Test spinner is present
    const spinner = button.querySelector('svg.animate-spin');
    await expect(spinner).toBeInTheDocument();
  },
};

/**
 * Disabled button - prevents user interaction
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    // Test disabled state
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    
    // Test that onClick doesn't fire when disabled
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};