import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("Home Page", () => {
  it("should render the main page with textarea", () => {
    render(<Home />);
    
    // Find the textarea - should not throw
    const textarea = screen.getByPlaceholderText(/Ketik atau tempel teks di sini/i);
    expect(textarea).toBeDefined();

    // Check page title exists (use getAllByText since there are multiple)
    const titles = screen.getAllByText("BacaKilat");
    expect(titles.length).toBeGreaterThan(0);

    // Check start button exists
    const startButton = screen.getByText(/Mulai Baca/i);
    expect(startButton).toBeDefined();
  });
});
