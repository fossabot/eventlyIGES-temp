'use client';

import Container from './container';
import DateFilter from './date-filter';
import { useSearchParams } from 'next/navigation';

const DateFilterBar = () => {
  const params = useSearchParams();
  const dateFilter = params?.get('dateFilter');

  return (
    <Container>
      <div className="flex justify-center py-4">
        <DateFilter selected={dateFilter || ''} />
      </div>
    </Container>
  );
};

export default DateFilterBar;