import { Skeleton } from "@/components/ui/skeleton";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import SkeletonChatList from "../chat-list";


const SkeletonCategoryButton = () => (
    <Skeleton className="h-10 w-24 rounded-md" />
);

const SkeletonCategorySection = () => (
    <div className="w-full max-w-screen container mx-auto p-5">
        <Skeleton className="h-8 w-48 mb-4" /> {/* 챗봇 카테고리 제목 */}
        <div className="flex overflow-x-auto space-x-2 mb-4">
            {[...Array(5)].map((_, index) => (
                <SkeletonCategoryButton key={index} />
            ))}
        </div>
        <Carousel
            opts={{
                align: "start",
            }}
            className="w-full"
        >
            <CarouselContent className="flex">
                {[...Array(3)].map((_, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <SkeletonChatList />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="bg-gray-200 p-2 rounded-full absolute top-1/2 left-4 transform -translate-y-1/2 -translate-x-1/2" />
            <CarouselNext className="bg-gray-200 p-2 rounded-full absolute top-1/2 right-4 transform -translate-y-1/2 translate-x-1/2" />
        </Carousel>
    </div>
);

export default SkeletonCategorySection;