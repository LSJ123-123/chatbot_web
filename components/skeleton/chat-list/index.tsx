import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const SkeletonChatList = () => (
  <Card className="max-w-3xl mx-auto my-5">
    <CardContent className="flex items-center p-6">
      <Skeleton className="h-24 w-24 rounded-full mr-6" />
      <div className="flex-1">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    </CardContent>
  </Card>
);

export default SkeletonChatList;