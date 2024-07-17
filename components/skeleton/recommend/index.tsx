import { Skeleton } from "@/components/ui/skeleton";

const SkeletonRecommendation = () => {
  return (
    <div className="bg-gray-100 p-10 rounded-lg shadow-lg mt-5 mx-24 mb-6">
      <Skeleton className="h-10 w-3/4 mb-6 bg-gray-200 animate-pulse" />
      <div className="flex flex-col md:flex-row justify-between items-start min-h-[356px]">
        <div className="w-full md:w-1/2 pr-4">
          <Skeleton className="h-8 w-full mb-4 bg-gray-200 animate-pulse" />
          <Skeleton className="h-20 w-full bg-gray-200 animate-pulse" />
        </div>
        <div className="w-full md:w-1/2 mt-4 md:mt-0">
          <Skeleton className="h-40 w-full mb-4 bg-gray-200 animate-pulse" />
          <Skeleton className="h-40 w-full bg-gray-200 animate-pulse" />
        </div>
      </div>
      <Skeleton className="h-10 w-32 mt-6 bg-gray-200 animate-pulse" />
      <Skeleton className="h-1 w-full mt-8 bg-gray-200 animate-pulse" />
    </div>
  );
};

export default SkeletonRecommendation;