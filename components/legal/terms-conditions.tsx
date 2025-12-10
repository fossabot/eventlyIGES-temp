"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TermsConditionsProps {
  trigger?: React.ReactNode;
}

export const TermsConditions = ({ trigger }: TermsConditionsProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="link" className="p-0 h-auto font-normal text-blue-500 hover:text-blue-700" type="button">
            Termini e Condizioni
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto w-[95vw] max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>Termini e Condizioni</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="mt-4 text-sm">
            <h3 className="font-bold mb-2">Termini e Condizioni d&apos;Uso</h3>
            <p className="mb-2">Utilizzando la nostra piattaforma, accetti di essere vincolato dai seguenti termini e condizioni.</p>
            <h4 className="font-semibold mt-3 mb-1">1. Registrazione</h4>
            <p className="mb-2">Per utilizzare alcuni servizi della piattaforma, è necessario registrarsi fornendo informazioni accurate e complete.</p>
            <h4 className="font-semibold mt-3 mb-1">2. Utilizzo del servizio</h4>
            <p className="mb-2">Ti impegni a utilizzare il servizio in conformità con tutte le leggi applicabili e a non utilizzarlo per scopi illegali o non autorizzati.</p>
            <h4 className="font-semibold mt-3 mb-1">3. Account</h4>
            <p className="mb-2">Sei responsabile del mantenimento della riservatezza delle credenziali del tuo account e di tutte le attività che si verificano sotto il tuo account.</p>
            <h4 className="font-semibold mt-3 mb-1">4. Limitazione di responsabilità</h4>
            <p className="mb-2">La piattaforma non sarà responsabile per eventuali danni diretti, indiretti, incidentali o consequenziali derivanti dall&apos;utilizzo o dall&apos;impossibilità di utilizzare il servizio.</p>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default TermsConditions;