/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterForm from "@/components/auth/register-form";
import * as registerAction from "@/actions/register";

jest.mock("@/lib/db", () => ({
  db: { user: { create: jest.fn() } },
}));

jest.mock("@/data/user", () => ({
  getUserByEmail: jest.fn(),
}));

jest.mock("@/lib/tokens", () => ({
  generateVerificationToken: jest.fn(),
}));

jest.mock("@/lib/mail", () => ({
  sendVerificationEmail: jest.fn(),
}));

const fillRegisterForm = ({
  email = "user@example.com",
  password = "SecurePass1",
  name = "Mario Rossi",
  privacyPolicy = true,
  termsAndConditions = true,
}) => {
  fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: password } });
  fireEvent.change(screen.getByLabelText(/Nome/i), { target: { value: name } });
const privacyCheckbox = screen.getByRole("checkbox", { name: /Privacy Policy/i });
if (privacyCheckbox.getAttribute("aria-checked") === "false" && privacyPolicy) {
  fireEvent.click(privacyCheckbox);
}

const termsCheckbox = screen.getByRole("checkbox", { name: /Termini e Condizioni/i });
if (termsCheckbox.getAttribute("aria-checked") === "false" && termsAndConditions) {
  fireEvent.click(termsCheckbox);
}


};

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<RegisterForm />);
  });

  it("TC_1_RF_1: registrazione riuscita", async () => {
    const { getUserByEmail } = require("@/data/user");
    const { db } = require("@/lib/db");
    const { generateVerificationToken } = require("@/lib/tokens");
    const { sendVerificationEmail } = require("@/lib/mail");

    getUserByEmail.mockResolvedValue(null);
    generateVerificationToken.mockResolvedValue({ email: "user@example.com", token: "mock-token" });

    fillRegisterForm({});

    fireEvent.click(screen.getByRole("button", { name: /Registrati/i }));

    await waitFor(() => {
      expect(db.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ email: "user@example.com" }) })
      );
      expect(sendVerificationEmail).toHaveBeenCalledWith("user@example.com", "mock-token");
      expect(screen.getByText(/Email di conferma inviata!/i)).toBeInTheDocument();
    });
  });

  it("TC_1_1_RF_1: email non valida", async () => {
    fillRegisterForm({ email: "userexample.com" });
    fireEvent.click(screen.getByRole("button", { name: /Registrati/i }));

    const emailInput = screen.getByLabelText(/Email/i);
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.toLowerCase().includes("email"))
      ).toBeInTheDocument();
    });

  });

  it("TC_1_2_RF_1: email troppo lunga", async () => {
    fillRegisterForm({ email: "verylongemailaddressexceedingfiftycharacters@example.com" });
    fireEvent.click(screen.getByRole("button", { name: /Registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/String must contain at most 50 character\(s\)/i)).toBeInTheDocument();
    });


  });

  it("TC_1_3_RF_1: password troppo corta", async () => {
    fillRegisterForm({ password: "1234" });
    fireEvent.click(screen.getByRole("button", { name: /Registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/La password è necessaria \(almeno 5 caratteri\)/i)).toBeInTheDocument();
    });

  });

  it("TC_1_4_RF_1: password troppo lunga", async () => {
    fillRegisterForm({ password: "PasswordTroppoLungaOltre20Caratteri" });
    fireEvent.click(screen.getByRole("button", { name: /Registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/La password deve avere al massimo 20 caratteri/i)).toBeInTheDocument();
    });


  });

  it("TC_1_5_RF_1: nome mancante", async () => {
    fillRegisterForm({ name: "" });
    fireEvent.click(screen.getByRole("button", { name: /Registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/Inserisci il tuo nome/i)).toBeInTheDocument();
    });

  });

  it("TC_1_6_RF_1: nome troppo lungo", async () => {
    fillRegisterForm({ name: "MarioRossiMarioRossiMarioRossiMarioRossi" });
    fireEvent.click(screen.getByRole("button", { name: /Registrati/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/String must contain at most 25 character\(s\)/i)).toBeInTheDocument();
    });

  });

  it("TC_1_7_RF_1: privacy non accettata", async () => {
    fillRegisterForm({ privacyPolicy: false });
    fireEvent.click(screen.getByRole("button", { name: /Registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/Devi accettare la Privacy Policy/i)).toBeInTheDocument();
    });

  });

  it("TC_1_8_RF_1: termini non accettati", async () => {
    fillRegisterForm({ termsAndConditions: false });
    fireEvent.click(screen.getByRole("button", { name: /Registrati/i }));

    await waitFor(() => {
      expect(screen.getByText(/Devi accettare i Termini e Condizioni/i)).toBeInTheDocument();
    });

  });
});