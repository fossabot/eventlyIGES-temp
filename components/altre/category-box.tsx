'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { IconType } from 'react-icons';

interface CategoryBoxProps {
  icon: IconType;
  label: string;
  selected?: boolean;
}

const CategoryBox: React.FC<CategoryBoxProps> = ({ icon: Icon, label, selected }) => {
  const router = useRouter();
  const params = useSearchParams();

  const handleClick = () => {
    const currentParams = new URLSearchParams(params?.toString());
    if (params?.get('category') === label) {
      currentParams.delete('category');
    } else {
      currentParams.set('category', label);
    }
    router.replace(`/?${currentParams.toString()}`); // Usa replace per evitare un re-render completo
  };

  const classes = `
    flex flex-col items-center justify-center gap-2 p-3 border-b-2 transition cursor-pointer 
    ${selected ? 'border-b-neutral-800 text-neutral-800' : 'border-transparent text-neutral-500'}
    hover:text-neutral-800
  `;

  return (
    <div onClick={handleClick} className={classes}>
      <Icon size={26} />
      <div className="font-medium text-sm">{label}</div>
    </div>
  );
};

export default CategoryBox;
