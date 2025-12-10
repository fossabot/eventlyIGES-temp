
import { CardWrapper } from "@/components/auth/card-wrapper"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";


export const ErrorCard = () => {
    return (
       
        <CardWrapper
            headerLabel="Oops, qualcosa è andato storto"
            backButtonHref="/auth/login"
            backButtonLabel="Torna al login"
        >
        <div className="w-full flex justify-center items-center">
        <ExclamationTriangleIcon/>
        </div>
            
        </CardWrapper>
    )
}

export default ErrorCard;