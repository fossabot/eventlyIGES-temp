/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TicketRow from "@/components/typetickets/ticket-row";

// ================== Setup comune ==================
jest.spyOn(console, "error").mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
  (global as any).fetch = jest.fn();
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
});

type Ticket = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
};

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: "T-OK",
  name: "Standard",
  description: "Ingresso singolo",
  price: 15,
  ...overrides,
});

const clickBuy = () =>
  fireEvent.click(screen.getByRole("button", { name: /acquista|attendi/i }));

// =============================================================
//                 RF_11 – Acquisto biglietti
// =============================================================
describe("RF_11 – Acquisto biglietti (TicketRow)", () => {
  // -----------------------------------------------------------
  // TC_1_RF_11 — Successo Acquisto biglietto (T1, U1)
  // -----------------------------------------------------------
  it("TC_1_RF_11: ticketId valido + userId valido → viene creata la sessione di checkout (URL presente)", async () => {
    const t = makeTicket({ id: "T-123" });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ url: "https://checkout.stripe.com/session_abc" }),
    });

    render(<TicketRow typeTicket={t as any} userId="U-999" />);

    clickBuy();

    // La server action viene chiamata con payload corretto
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/api/stripe/create-checkout-session");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body as string)).toEqual({
      ticketId: "T-123",
      userId: "U-999",
    });

    // Nessun errore mostrato
    expect(window.alert).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------
  // TC_1_1_RF_11 — Biglietto inesistente (T2, U1)
  // -----------------------------------------------------------
  it("TC_1_1_RF_11: ticket inesistente → mostra 'Biglietto inesistente' e NON crea la sessione", async () => {
    const t = makeTicket({ id: "T-NOT-FOUND" });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ error: "Biglietto inesistente" }),
    });

    render(<TicketRow typeTicket={t as any} userId="U-1" />);

    clickBuy();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenCalledWith("Errore nel checkout: Biglietto inesistente");
    });
  });

  // -----------------------------------------------------------
  // TC_1_2_RF_11 — Biglietto non attivo (T3, U1)
  // -----------------------------------------------------------
  it("TC_1_2_RF_11: ticket non attivo → mostra 'Il biglietto selezionato non è attivo' e NON crea la sessione", async () => {
    const t = makeTicket({ id: "T-INACTIVE" });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ error: "Il biglietto selezionato non è attivo" }),
    });

    render(<TicketRow typeTicket={t as any} userId="U-2" />);

    clickBuy();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenCalledWith(
        "Errore nel checkout: Il biglietto selezionato non è attivo"
      );
    });
  });

  // -----------------------------------------------------------
  // TC_1_3_RF_11 — Biglietti esauriti (T4, U1)
  // -----------------------------------------------------------
  it("TC_1_3_RF_11: biglietti esauriti → mostra 'I biglietti in questione sono esauriti' e NON crea la sessione", async () => {
    const t = makeTicket({ id: "T-SOLDOUT" });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ error: "I biglietti in questione sono esauriti" }),
    });

    render(<TicketRow typeTicket={t as any} userId="U-3" />);

    clickBuy();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenCalledWith(
        "Errore nel checkout: I biglietti in questione sono esauriti"
      );
    });
  });

  // -----------------------------------------------------------
  // TC_1_4_RF_11 — Utente mancante (T1, U2)
  // -----------------------------------------------------------
  it("TC_1_4_RF_11: utente mancante → mostra 'Utente mancante' e NON crea la sessione", async () => {
    const t = makeTicket({ id: "T-OK" });
    // In questo caso seguiamo la tabella: la server action può essere invocata e rispondere errore
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ error: "Utente mancante" }),
    });

    render(<TicketRow typeTicket={t as any} userId="" />);

    clickBuy();

    await waitFor(() => {
      // Se il componente blocca client-side, fetch potrebbe essere 0:
      // rendiamo il test tollerante: o fetch viene chiamato e torna errore,
      // oppure viene mostrato subito l'alert e fetch resta 0.
      const fetchCalled = (global.fetch as jest.Mock).mock.calls.length > 0;

      if (fetchCalled) {
        expect(window.alert).toHaveBeenCalledWith("Errore nel checkout: Utente mancante");
      } else {
        // copy tipica lato client
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringMatching(/utente\s+mancante|devi.*loggato/i)
        );
      }
    });
  });

});