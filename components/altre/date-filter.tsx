'use client';

interface DateFilterProps {
  selected: string;
  onChange: (filter: string) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ selected, onChange }) => {
  return (
    <div className="flex gap-2">
      <button
        className={`px-3 py-1 rounded-md transition ${
          selected === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
        }`}
        onClick={() => onChange('today')}
      >
        Oggi
      </button>

      <button
        className={`px-3 py-1 rounded-md transition ${
          selected === 'tomorrow' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
        }`}
        onClick={() => onChange('tomorrow')}
      >
        Domani
      </button>

      <button
        className={`px-3 py-1 rounded-md transition ${
          selected === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
        }`}
        onClick={() => onChange('')}
      >
        Tutti
      </button>
    </div>
  );
};

export default DateFilter;
