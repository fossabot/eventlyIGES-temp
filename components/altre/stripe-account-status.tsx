"use client";

import { useEffect, useState } from "react";

interface StripeAccountStatusProps {
  organizationId: string;
}

export default function StripeAccountStatus({ organizationId }: StripeAccountStatusProps) {
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [error ] = useState<string | null>(null); // Add error state
  const [status, setStatus] = useState<null | {
    payouts_enabled: boolean;
    charges_enabled: boolean;
    details_submitted: boolean;
    stripeAccountId: string;
    requirements: string[];
    dashboard_url: string;
  }>(null);

  const checkAccountStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/check-account-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const data = await response.json();
      if (data.error) {
       
      } else {
        setStatus(data);
      }
    } catch (error) {
      console.error("Errore durante il recupero dello stato dell'account Stripe:", error);
   
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOnboardingLink = async () => {
    setOnboardingLoading(true);
    try {
      const response = await fetch("/api/stripe/generate-onboarding-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const data = await response.json();
      if (data.error) {
     
      } else if (data.url) {
        window.open(data.url, "_blank");
      } 
    } catch (error) {
      console.error("Errore durante l'onboarding a Stripe:", error);

    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleLoginToStripe = async () => {
    setLoginLoading(true);
    try {
      const response = await fetch("/api/stripe/login-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      const data = await response.json();
      if (data.error) {
        // Remove alert and let the error be handled by the UI
      } else if (data.url) {
        window.open(data.url, "_blank");
      } 
    } catch (error) {
      console.error("Errore durante il login a Stripe:", error);
      // Remove alert here
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    checkAccountStatus();
  }, [checkAccountStatus]);


  return (
    <div className="mt-4 p-4 border border-gray-300 rounded-lg">
      <h2 className="text-lg font-semibold">Stato Account Stripe</h2>
      
      {error && ( // Add error display
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <p>Caricamento...</p>
      ) : status ? (
        <div className="mt-2">
          <p>
            <strong>Account Stripe ID:</strong> {status.stripeAccountId}
          </p>
          <p>
            <strong>Può accettare pagamenti:</strong> {status.charges_enabled ? "✅ Sì" : "❌ No"}
          </p>
          <p>
            <strong>Può ricevere fondi:</strong> {status.payouts_enabled ? "✅ Sì" : "❌ No"}
          </p>
          <p>
            <strong>Dati inviati:</strong> {status.details_submitted ? "✅ Completo" : "❌ Incompleto"}
          </p>
          {status.requirements.length > 0 && (
            <div className="mt-2">
              <p className="text-yellow-600">Requisiti da completare:</p>
              <ul className="list-disc ml-6">
                {status.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
          {(!status.details_submitted || !status.payouts_enabled) && (
            <div className="mt-4">
              <button
                onClick={handleGenerateOnboardingLink}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                disabled={onboardingLoading}
              >
                {onboardingLoading ? "Caricamento..." : "Completa Onboarding"}
              </button>
            </div>
          )}
          {status.details_submitted && (
            <div className="mt-4">
              <button
                onClick={handleLoginToStripe}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={loginLoading}
              >
                {loginLoading ? "Reindirizzamento..." : "Accedi alla Dashboard Stripe"}
              </button>
            </div>
          )}
        
        </div>
      ) : (
        <p className="text-red-500">⚠️ Nessun dato trovato per questo account.</p>
      )}
    </div>
  );
}
