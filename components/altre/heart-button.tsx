"use client";

import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useFavorite } from "@/hooks/use-favorite";
import { User } from "@prisma/client";

interface HeartButtonProps {
  eventId: string;
  currentUser?: User | null;
}

const HeartButton: React.FC<HeartButtonProps> = ({ eventId, currentUser }) => {
  const { isFavorited, toggleFavorite, isPending } = useFavorite({
    eventId,
    currentUser,
  });


  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impedisce la propagazione dell'evento al genitore
   
  };


  return (
    <div
      onClick={!isPending ? toggleFavorite :  handleClick}
      className={`
        relative 
        transition
        ${isPending ? "cursor-wait" : "cursor-pointer hover:opacity-80"}
      `}
    >
      {/* Icona di contorno */}
      <AiOutlineHeart
        size={28}
        className="fill-white absolute -top-[2px] -right-[2px]"
      />

      {/* Icona principale */}
      <AiFillHeart
        size={24}
        className={isFavorited ? "fill-rose-500" : "fill-neutral-500/70"}
      />
    </div>
  );
};

export default HeartButton;
