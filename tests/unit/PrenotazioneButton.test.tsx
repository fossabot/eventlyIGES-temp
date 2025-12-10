/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PrenotaOraButton from "@/components/events/prenotazione/prenota-button";
import { useRouter } from "next/navigation";
import { createBookingAction } from "@/actions/prenotazioni";

// ---------- MOCK dipendenze esterne ----------
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/actions/prenotazioni", () => ({
  createBookingAction: jest.fn(),
}));

describe("PrenotaOraButton", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  // ----------------- Happy Path -----------------
  it("TC_1_RF_13: prenotazione riuscita -> reindirizza alla pagina di conferma", async () => {
    (createBookingAction as jest.Mock).mockResolvedValue({
      booking: { id: "123" },
    });

    render(<PrenotaOraButton eventId="1" userId="10" />);

    fireEvent.click(screen.getByRole("button", { name: /Prenota ora/i }));

    await waitFor(() => {
      expect(createBookingAction).toHaveBeenCalledWith("1", "10");
      expect(pushMock).toHaveBeenCalledWith("/prenotazione/123");
    });
  });

  // ----------------- Caso di Errore -----------------
  it("TC_1_1_RF_13: errore nella prenotazione -> mostra messaggio di errore", async () => {
    (createBookingAction as jest.Mock).mockRejectedValue(new Error("Errore server"));

    render(<PrenotaOraButton eventId="1" userId="10" />);

    fireEvent.click(screen.getByRole("button", { name: /Prenota ora/i }));

    await waitFor(() => {
      expect(screen.getByText(/Errore durante la creazione della prenotazione/i)).toBeInTheDocument();
    });
  });
});