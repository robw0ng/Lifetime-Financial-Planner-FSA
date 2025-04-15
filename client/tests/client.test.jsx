
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { AuthProvider } from "../src/AuthContext";
import { SelectedProvider } from "../src/SelectedContext";
import { DataProvider } from "../src/DataContext";
import Scenarios from "../src/Scenarios";
import EventSeries from "../src/EventSeries";
import Simulations from "../src/Simulations";
import Strategies from "../src/Strategies";
import UserProfile from "../src/UserProfile";

// Mock user context to simulate logged-in user
vi.mock("../src/AuthContext", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: () => ({ user: { email: "test@example.com" }, logout: () => {} }),
  };
});

const customRender = (ui) => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <SelectedProvider>
          <DataProvider>
            {ui}
          </DataProvider>
        </SelectedProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe("Protected Pages", () => {
  it("renders Scenarios page without crashing", () => {
    customRender(<Scenarios />);
    expect(screen.getByText(/Create New Scenario/i)).toBeInTheDocument();
  });

  it("renders EventSeries page without crashing", () => {
    customRender(<EventSeries />);
    expect(screen.getByText(/Event Series Actions:/i)).toBeInTheDocument();
  });

  it("renders Simulations page without crashing", () => {
    customRender(<Simulations />);
    expect(screen.getByText(/simulation/i)).toBeInTheDocument();
  });

  it("renders Strategies page without crashing", () => {
    customRender(<Strategies />);
    expect(screen.getByText(/Spending/i)).toBeInTheDocument();
  });

  it("renders UserProfile page without crashing", () => {
    customRender(<UserProfile />);
    expect(screen.getByText(/Tax YAML/i)).toBeInTheDocument();
  });
});
