'use client';

import { LiaCocktailSolid } from "react-icons/lia";

import { TbShirtSport } from "react-icons/tb"
import { MdOutlineNightlife} from "react-icons/md"
import { usePathname, useSearchParams } from "next/navigation"
import Container from "./container";
import CategoryBox from "./category-box";
import { LiaTheaterMasksSolid } from "react-icons/lia";


export const categories = [
    {
        label: 'Notturno',
        icon: MdOutlineNightlife,
        description:'Eventi notturni!'
    },
    {
        label: 'Teatro',
        icon: LiaTheaterMasksSolid,
        description:'Eventi teatrali!'
    },
    {
        label: 'Sport',
        icon: TbShirtSport,
        description:'Eventi sportivi !'
    },
    {
        label: 'Lounge Bar',
        icon: LiaCocktailSolid,
        description:'This property has nightlife !'
    },
    
]

const Categories = () => {
    const params = useSearchParams();
    const category = params?.get('category')
    const pathname = usePathname();
    const isMainPage = pathname === '/';

    if (!isMainPage){
        return null
    }



    return (
        <Container>
            <div className="
            pt-4
            flex
            flex-row
            items-center
            justify-between
            overflow-x-auto
            
            ">
                {categories.map((item)=>(
                    <CategoryBox
                        key={item.label}
                        label={item.label}
                        selected={category === item.label}
                        icon={item.icon} />
                ))}
            </div>
        </Container>
    )
}

export default Categories