import React from "react";

interface OrganizationTicketingStatusProps {
  ticketingStatus: string;
}

const OrganizationTicketingStatus: React.FC<OrganizationTicketingStatusProps> = ({ ticketingStatus }) => {
  let statusMessage;
  switch (ticketingStatus) {
    case "no_stripe":
      statusMessage = "🚫 Stripe non abilitato";
      break;
    case "pending":
      statusMessage = "⚠️ Onboarding incompleto";
      break;
    case "active":
      statusMessage = "✅ Attivo";
      break;
    case "restricted":
      statusMessage = "❌ Problemi con Stripe";
      break;
    default:
      statusMessage = "Stato sconosciuto";
  }

  return (
    <div>
      <strong>Stato Ticketing:</strong> {statusMessage}
    </div>
  );
};

export default OrganizationTicketingStatus;
