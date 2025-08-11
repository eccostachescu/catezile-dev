// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import CountdownTimer from "@/components/CountdownTimer";
import EventCard from "@/components/cards/EventCard";

describe("UI components render", () => {
  it("Button renders with text", () => {
    render(<Button>CTA</Button>);
    expect(screen.getByText("CTA")).toBeTruthy();
  });

  it("Input renders with placeholder", () => {
    render(<Input placeholder="test" />);
    expect(screen.getByPlaceholderText("test")).toBeTruthy();
  });

  it("CountdownTimer has role timer", () => {
    const target = new Date(Date.now() + 2000);
    render(<CountdownTimer target={target} />);
    expect(screen.getByRole("timer")).toBeTruthy();
  });

  it("EventCard shows title and actions", () => {
    const target = new Date(Date.now() + 24 * 60 * 60 * 1000);
    render(<EventCard title="Test Event" datetime={target} category="Festival" />);
    expect(screen.getByText(/Test Event/)).toBeTruthy();
  });
});
