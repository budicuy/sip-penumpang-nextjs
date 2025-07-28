import { Suspense } from 'react';
import { StatCards, LatestPenumpangTable } from './components';
import { CardSkeleton, TableSkeleton } from './skeletons';

export default function Dashboard() {
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl lg:text-4xl font-bold text-black">Dashboard</h1>
      </div>
      <Suspense fallback={<CardSkeleton />}>
        <StatCards />
      </Suspense>

      <div className="mt-8">
        <Suspense fallback={<TableSkeleton />}>
          <LatestPenumpangTable />
        </Suspense>
      </div>
    </>
  );
}
