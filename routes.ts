/**

 * Un array di routes che sono accessibili pubblicamente
 * Queste routes non richiedono autenticazione
 * @type {string[]}
 */

export const publicRoutes = [
    "/",
    "/auth/new-verification",
    "/api/nearby-events",
    "/api/stripe/create-account",
    "/api/stripe/check-account-status",
    "/api/stripe/webhook",
    "/api/stripe/webhook-express"

];

/**
 * Un array di routes che sono usate per l'autenticazione
 * Queste routes reindirizzano gli utenti loggati to /settings
 * @type {string[]}
 */

export const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/error",
    "/auth/reset",
    "/auth/new-password" //è accessibile solo agli utenti non loggati perchè quelli autenticati lo faranno dalle impostazioni utente
]
/**
 * Prefisso per api authentication routes
 * Routes che iniziano con questo prefisso sono usate per autenticazione api
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth"

/**
 * Redirect dopo il login
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/"