import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders app", () => {
  render(<App />);
  const botNamePlates = screen.getAllByText(/Bot/i);
  expect(botNamePlates[0]).toBeInTheDocument();
});
