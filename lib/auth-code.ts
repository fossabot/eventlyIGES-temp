// File: /lib/auth-code.ts
// Store in memoria per gli authCode: mappa codice → { userId, expires }
const authCodes: Map<string, { userId: string; expires: number }> = new Map();

/**
 * Crea un authCode monouso per un determinato utente.
 * L'authCode scade dopo 5 minuti.
 */
export async function createAuthCode(userId: string): Promise<string> {
  // Genera un codice casuale
  const authCode = Math.random().toString(36).substr(2, 9);
  const expires = Date.now() + 5 * 60 * 1000; // scadenza a 5 minuti
  authCodes.set(authCode, { userId, expires });
  return authCode;
}

/**
 * Valida l'authCode: se esiste e non è scaduto, restituisce l'ID utente associato.
 * Rimuove il codice dopo la validazione.
 */
export async function validateAuthCode(code: string): Promise<string | null> {
  const record = authCodes.get(code);
  if (!record) return null;
  if (Date.now() > record.expires) {
    authCodes.delete(code);
    return null;
  }
  // Elimina l'authCode dopo l'uso (monouso)
  authCodes.delete(code);
  return record.userId;
}
