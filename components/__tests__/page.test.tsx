import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Home from "@/app/page";

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("Home Page", () => {
  it("should load sample text when clicking the sample button", () => {
    render(<Home />);
    
    // Find the textarea
    const textarea = screen.getByPlaceholderText(/Tempelkan artikel/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe("");

    // Find the sample button
    const sampleButton = screen.getByText("Kebiasaan Membaca");
    
    // Click it
    fireEvent.click(sampleButton);
    
    // Check if textarea is updated
    expect(textarea.value).toContain("Membaca adalah proses kognitif");
  });
});
