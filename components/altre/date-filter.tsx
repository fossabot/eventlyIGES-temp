'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { BiCalendar } from 'react-icons/bi';

interface DateFilterProps {
  selected?: string;
}

const dateOptions = [
  {
    label: 'Oggi',
    value: 'today',
  },
  {
    label: 'Domani',
    value: 'tomorrow',
  },
  {
    label: 'Weekend',
    value: 'weekend',
  },
];

const DateFilter: React.FC<DateFilterProps> = ({ selected }) => {
  const router = useRouter();
  const params = useSearchParams();

  const handleDateFilterChange = (value: string) => {
    const currentParams = new URLSearchParams(params?.toString());
    if (params?.get('dateFilter') === value) {
      currentParams.delete('dateFilter');
    } else {
      currentParams.set('dateFilter', value);
    }
    router.replace(`/?${currentParams.toString()}`);
  };

  return (
    <div className="flex flex-row items-center justify-between overflow-x-auto">
      <div className="flex items-center gap-4">
        <BiCalendar size={24} className="text-blue-500" />
        <div className="flex gap-3">
          {dateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleDateFilterChange(option.value)}
              className={`
                px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm
                ${selected === option.value
                  ? 'bg-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 border border-gray-200'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DateFilter;