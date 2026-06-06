import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  formatElapsed,
  ElapsedDisplay,
  WallClockDisplay,
} from "../components/Timer";

describe("formatElapsed", () => {
  it("formats zero as 00:00:00", () => {
    expect(formatElapsed(0)).toBe("00:00:00");
  });

  it("formats seconds only", () => {
    expect(formatElapsed(7_000)).toBe("00:00:07");
  });

  it("formats minutes and seconds", () => {
    expect(formatElapsed(90_000)).toBe("00:01:30");
  });

  it("formats hours, minutes, and seconds", () => {
    expect(formatElapsed(3_725_000)).toBe("01:02:05");
  });

  it("pads single-digit values with leading zeros", () => {
    expect(formatElapsed(3_661_000)).toBe("01:01:01");
  });
});

describe("ElapsedDisplay", () => {
  it("renders formatted elapsed time", () => {
    render(<ElapsedDisplay elapsedMs={3_725_000} />);
    expect(screen.getByText("01:02:05")).toBeInTheDocument();
  });

  it("does not render a reset button when onReset is omitted", () => {
    render(<ElapsedDisplay elapsedMs={0} />);
    expect(
      screen.queryByRole("button", { name: /reset/i }),
    ).not.toBeInTheDocument();
  });

  it("renders a reset button when onReset is provided", () => {
    render(<ElapsedDisplay elapsedMs={0} onReset={() => {}} />);
    expect(
      screen.getByRole("button", { name: /reset timer/i }),
    ).toBeInTheDocument();
  });

  it("calls onReset when the reset button is clicked", async () => {
    const onReset = vi.fn();
    render(<ElapsedDisplay elapsedMs={0} onReset={onReset} />);
    await userEvent.click(screen.getByRole("button", { name: /reset timer/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});

describe("WallClockDisplay", () => {
  it("renders hours and minutes from the given date", () => {
    const date = new Date(2024, 0, 1, 14, 35, 0);
    render(<WallClockDisplay date={date} />);
    expect(screen.getByText("14:35")).toBeInTheDocument();
  });

  it("pads single-digit hours and minutes", () => {
    const date = new Date(2024, 0, 1, 9, 5, 0);
    render(<WallClockDisplay date={date} />);
    expect(screen.getByText("09:05")).toBeInTheDocument();
  });

  it("renders midnight as 00:00", () => {
    const date = new Date(2024, 0, 1, 0, 0, 0);
    render(<WallClockDisplay date={date} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });
});
