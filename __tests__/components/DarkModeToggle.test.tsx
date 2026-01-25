/**
 * Tests for DarkModeToggle component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DarkModeToggle } from '@/components/DarkModeToggle';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('DarkModeToggle', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should render toggle button', () => {
    render(<DarkModeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should toggle dark mode on click', async () => {
    render(<DarkModeToggle />);
    const button = screen.getByRole('button');
    
    // Initially should be light mode
    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('dark');
    });
    
    // Click to toggle to dark
    fireEvent.click(button);
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
    
    // Click again to toggle back to light
    fireEvent.click(button);
    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('dark');
    });
  });

  it('should persist dark mode preference in localStorage', async () => {
    render(<DarkModeToggle />);
    const button = screen.getByRole('button');
    
    // Toggle to dark
    fireEvent.click(button);
    await waitFor(() => {
      expect(localStorageMock.getItem('darkMode')).toBe('true');
    });
    
    // Toggle back to light
    fireEvent.click(button);
    await waitFor(() => {
      expect(localStorageMock.getItem('darkMode')).toBe('false');
    });
  });

  it('should load dark mode preference from localStorage on mount', async () => {
    localStorageMock.setItem('darkMode', 'true');
    render(<DarkModeToggle />);
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
  });
});
