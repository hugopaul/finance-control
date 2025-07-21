import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animated?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = false,
  animated = true,
}) => {
  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`
        bg-base-300 
        ${rounded ? 'rounded' : ''} 
        ${animated ? 'animate-pulse' : ''} 
        ${className}
      `}
      style={style}
    />
  );
};

// Predefined skeleton components
export const CardSkeleton: React.FC = () => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

export const TransactionSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4 border-b border-base-300">
    <div className="flex-1">
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="text-right">
      <Skeleton className="h-6 w-20 mb-1" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="overflow-x-auto">
    <table className="table w-full">
      <thead>
        <tr>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <tr key={index}>
            <td><Skeleton className="h-4 w-24" /></td>
            <td><Skeleton className="h-4 w-32" /></td>
            <td><Skeleton className="h-4 w-20" /></td>
            <td><Skeleton className="h-4 w-24" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="flex items-end justify-between h-32">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton
            key={index}
            className="w-8"
            height={`${Math.random() * 60 + 20}%`}
          />
        ))}
      </div>
    </div>
  </div>
);

export const SummaryCardSkeleton: React.FC = () => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);

export const ModalSkeleton: React.FC = () => (
  <div className="modal modal-open">
    <div className="modal-box max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="modal-action">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  </div>
);

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="card bg-base-100 shadow">
        <div className="card-body p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton; 