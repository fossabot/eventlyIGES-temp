'use client';

import Container from './container';
import DateFilter from './date-filter';
import { useSearchParams, useRouter } from 'next/navigation';

const DateFilterBar = () => {
  const params = useSearchParams();
  const router = useRouter();
  const dateFilter = params?.get('dateFilter') || '';
  const category = params?.get('category') || '';
  const query = params?.get('query') || '';

  const handleDateChange = (filter: string) => {
    router.push(
      `/?category=${encodeURIComponent(category)}&query=${encodeURIComponent(query)}&dateFilter=${encodeURIComponent(filter)}`
    );
  };

  return (
    <Container>
      <div className="flex justify-center py-4">
        <DateFilter selected={dateFilter} onChange={handleDateChange} />
      </div>
    </Container>
  );
};

export default DateFilterBar;
