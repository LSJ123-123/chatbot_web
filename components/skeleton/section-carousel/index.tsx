import SkeletonChatList from "../chat-list";

const SkeletonCarousel = () => (
    <div className="w-full max-w-screen container mx-auto p-5">
        <p className="text-2xl font-bold mb-2">Loading...</p>
        <div className="flex overflow-hidden">
            {[...Array(3)].map((_, index) => (
                <div key={index} className="md:basis-1/2 lg:basis-1/3 p-1">
                    <SkeletonChatList />
                </div>
            ))}
        </div>
    </div>
);

export default SkeletonCarousel;