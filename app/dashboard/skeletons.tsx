const shimmer = 'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className={`relative overflow-hidden rounded-xl bg-gray-700 p-6 shadow ${shimmer}`}>
        <div className="h-7 w-1/2 rounded-lg bg-gray-900" />
        <div className="mt-4 h-8 w-1/3 rounded-lg bg-gray-900" />
        <div className="mt-2 h-5 w-2/3 rounded-lg bg-gray-900" />
      </div>
      <div className={`relative overflow-hidden rounded-xl bg-gray-700 p-6 shadow ${shimmer}`}>
        <div className="h-7 w-1/2 rounded-lg bg-gray-900" />
        <div className="mt-4 h-8 w-1/3 rounded-lg bg-gray-900" />
        <div className="mt-2 h-5 w-2/3 rounded-lg bg-gray-900" />
      </div>
      <div className={`relative overflow-hidden rounded-xl bg-gray-700 p-6 shadow ${shimmer}`}>
        <div className="h-7 w-1/2 rounded-lg bg-gray-900" />
        <div className="mt-4 h-8 w-1/3 rounded-lg bg-gray-900" />
        <div className="mt-2 h-5 w-2/3 rounded-lg bg-gray-900" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-gray-700 p-8 shadow ${shimmer}`}>
      <div className="h-7 w-1/3 rounded-lg bg-gray-900 mb-4" />
      <table className="w-full">
        <thead>
          <tr>
            <th className="pb-4"><div className="h-6 w-full rounded-lg bg-gray-900" /></th>
            <th className="pb-4"><div className="h-6 w-full rounded-lg bg-gray-900" /></th>
            <th className="pb-4"><div className="h-6 w-full rounded-lg bg-gray-900" /></th>
            <th className="pb-4"><div className="h-6 w-full rounded-lg bg-gray-900" /></th>
            <th className="pb-4"><div className="h-6 w-full rounded-lg bg-gray-900" /></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b border-gray-500">
              <td className="py-4"><div className="h-5 w-full rounded-lg bg-gray-900" /></td>
              <td className="py-4"><div className="h-5 w-full rounded-lg bg-gray-900" /></td>
              <td className="py-4"><div className="h-5 w-full rounded-lg bg-gray-900" /></td>
              <td className="py-4"><div className="h-5 w-full rounded-lg bg-gray-900" /></td>
              <td className="py-4"><div className="h-5 w-full rounded-lg bg-gray-900" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
