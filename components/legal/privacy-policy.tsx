"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PrivacyPolicyProps {
  trigger?: React.ReactNode;
}

export const PrivacyPolicy = ({ trigger }: PrivacyPolicyProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="link" className="p-0 h-auto font-normal text-blue-500 hover:text-blue-700" type="button">
            Privacy Policy
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto w-[95vw] max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="mt-4 text-sm">
            <h3 className="font-bold mb-2">Informativa sulla Privacy</h3>
            <p className="mb-2">La presente informativa descrive come vengono raccolti e utilizzati i dati personali quando utilizzi la nostra piattaforma.</p>
            <h4 className="font-semibold mt-3 mb-1">1. Dati raccolti</h4>
            <p className="mb-2">Raccogliamo i seguenti dati personali: nome, indirizzo email e password criptata.</p>
            <h4 className="font-semibold mt-3 mb-1">2. Utilizzo dei dati</h4>
            <p className="mb-2">I tuoi dati personali vengono utilizzati per:</p>
            <ul className="list-disc pl-5 mb-2">
              <li>Gestire il tuo account</li>
              <li>Fornirti i servizi richiesti</li>
              <li>Comunicare con te riguardo al tuo account</li>
            </ul>
            <h4 className="font-semibold mt-3 mb-1">3. Conservazione dei dati</h4>
            <p className="mb-2">I tuoi dati personali vengono conservati per il tempo necessario a fornirti i servizi richiesti.</p>
            <h4 className="font-semibold mt-3 mb-1">4. I tuoi diritti</h4>
            <p className="mb-2">Hai il diritto di accedere, rettificare, cancellare i tuoi dati personali e limitare il trattamento.</p>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicy;