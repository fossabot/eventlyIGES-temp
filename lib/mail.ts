import { Resend } from "resend";

const resend = new Resend (process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_SITE_URL;

export const sendVerificationEmail = async (email: string, token: string) => {

    //TODO da cambiare in production
    const confirmLink = `${domain}/auth/new-verification?token=${token}`;

    resend.emails.send({
        from: "comunicazioni@eventlyitalia.com",
        to: email,
        subject: "Conferma la tua email",
        html: ` <p> Clicca <a href="${confirmLink}">qui</a> per confermare la tua email </p> `
    })

}

export const sendResetPasswordEmail = async (email: string, token: string) => {

    //TODO da cambiare in production
    const resetLink = `${domain}/auth/new-password?token=${token}`;

    resend.emails.send({
        from: "comunicazioni@eventlyitalia.com",
        to: email,
        subject: "Cambia la tua password",
        html: ` <p> Clicca <a href="${resetLink}">qui</a> per cambiare la tua password </p> `
    })    

}
