"use client";

import { useState } from "react";

interface StripeAccountButtonProps {
  organizationId: string;
  email: string;
  stripeAccountId: string | null;
}

export default function StripeAccountButton({
  organizationId,
  email,
  stripeAccountId,
}: StripeAccountButtonProps) {
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(stripeAccountId);

  // Funzione per creare un account Stripe
  const handleCreateStripeAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-account", {
        method: "POST",
        body: JSON.stringify({ organizationId, email }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        setAccountId(data.accountId);
        alert("✅ Account Stripe creato con successo!");
      } else {
        alert("❌ Errore nella creazione dell'account Stripe: " + data.error);
      }
    } catch (error) {
      console.error("Errore durante la creazione dell'account Stripe:", error);
      alert("❌ Errore imprevisto durante la creazione dell'account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {!accountId ? (
        <button
          onClick={handleCreateStripeAccount}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Creazione in corso..." : "Collega un Account Stripe"}
        </button>
      ) : (
        <p className="text-green-600 mt-4">✅ Account Stripe collegato!</p>
      )}
    </div>
  );
}
