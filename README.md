Evently

**Evently** è una piattaforma web che connette organizzatori e partecipanti, semplificando ogni aspetto della gestione e promozione di eventi di qualsiasi tipo. Gli organizzatori possono creare, promuovere e gestire eventi in modo professionale, rapido ed efficiente.Gli utenti possono scoprire facilmente nuovi eventi, acquistare biglietti, effettuare prenotazioni e trovare l’esperienza più adatta ai propri interessi.

Dcomunetazione Progetto:


[IGES_evently_proposta..pdf](https://github.com/user-attachments/files/19635154/IGES_evently_proposta.pdf)


[info-progetto.xlsx](https://github.com/user-attachments/files/19635155/info-progetto.xlsx)




![screen-evently](https://github.com/user-attachments/assets/a683b076-1a47-4d0e-80b6-40d93c37a947)

## Tecnologie utilizzate

Il progetto utilizza un insieme di tecnologie, scelte per garantire modularità, scalabilità, e una chiara separazione dei livelli architetturali:

| Tecnologia       | Ruolo / Utilizzo                                                              |
|------------------|-------------------------------------------------------------------------------|
| **Next.js**      | Framework React per applicazioni full-stack, con supporto App Router e Server Actions |
| **TypeScript**   | Superset di JavaScript per tipizzazione statica e sviluppo robusto            |
| **Tailwind CSS** | Framework CSS utility-first per la creazione di interfacce moderne            |
| **Prisma ORM**   | ORM per la gestione del database relazionale tramite schema declarativo       |
| **PostgreSQL**   | Database relazionale usato in abbinamento a Prisma                            |
| **NextAuth.js**  | Autenticazione degli utenti lato client e server con sessioni sicure          |
| **Zod**          | Libreria di validazione per form e input API                                  |

## Struttura del progetto



```bash
eventlyIGES/
│
├── actions/             # Server Actions di Next.js: gestisce la logica applicativa per operazioni di creazione e aggiornamento dei dati nel database
├── app/                 # Gestisce la struttura e la navigazione dell'app: ogni cartella rappresenta una pagina visibile all'utente, secondo il sistema di routing di Next.js
├── components/          # Insieme di elementi dell’interfaccia grafica riutilizzabili, usati per comporre le pagine. Favorisce la separazione tra logica e presentazione.
├── data/                # Funzioni per il recupero (lettura) di dati dal database, utilizzate per popolare le pagine con contenuti dinamici
├── hooks/               # Custom React Hooks per logica riutilizzabile lato client
├── lib/                 # Funzioni di utilità condivise 
├── prisma/              # Contiene il file di configurazione del database. Consente di definire i modelli dati in modo dichiarativo e interagire con il database in modo efficiente.
├── public/              # File statici pubblici accessibili (immagini)
├── schemas/              # Raccolta di schemi Zod utilizzati per validare i dati ricevuti da form e API. Garantisce che le informazioni rispettino il formato e le regole previste.
│
├── .env                 # File delle variabili d'ambiente (escluso dal repository per sicurezza)
├── auth.config.ts       # Configurazione di NextAuth: gestione dell'autenticazione
├── middleware.ts        # Middleware globale per protezione delle route e gestione accessi
├── routes.ts            # Mappa centralizzata delle rotte dell'applicazione: definisce in modo coerente e tipizzato i percorsi utilizzati nel progetto
├── tailwind.config.ts   # Configurazione di Tailwind CSS
├── tsconfig.json        # Configurazione del compilatore TypeScript
└── next.config.ts       # Configurazione dell'app Next.js
```

## Guida all’installazione

Per eseguire il progetto in locale è necessario avere installato:

- [Node.js](https://nodejs.org/) (versione 18 o superiore)
- Un database PostgreSQL
---

Installazione delle dipendenze
npm install

### Configurazione del file `.env`

Crea un file `.env` nella root del progetto con il seguente contenuto (modifica i valori in base al tuo ambiente):

```env
# URL del sito in locale o in produzione
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase - URL del progetto e chiave pubblica (anon key)
NEXT_PUBLIC_SUPABASE_URL="https://<your-project>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Secret per la gestione delle sessioni (NextAuth / Auth.js)
AUTH_SECRET="..."

# Connessione al database tramite Supabase (pooling per runtime)
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"

# Connessione diretta al database (usata per le migrazioni Prisma)
DIRECT_URL="postgresql://user:password@host:.../database"

# Chiave API di Resend per l’invio email (inviti, conferme, ecc.)
RESEND_API_KEY="re_..."

# Stripe - chiave pubblica per il frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Stripe - chiavi segrete per webhook e operazioni server
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_WEBHOOK_SECRET_EXPRESS="whsec_..."
```

Inizializzazione del database
npx prisma db push

Avvio del sever di sviluppo
npm run dev


