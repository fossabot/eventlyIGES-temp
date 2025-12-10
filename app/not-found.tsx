'use client';

import EmptyState from '@/components/altre/empty-state';


const NotFound = () => {   
    return ( 
        <EmptyState
            title="404 - Not Found"
            subtitle="La pagina che stai cercando non esiste"
            showToHome

        /> 
    )
}       

export default NotFound;