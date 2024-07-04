import { ChevronsRight } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
    isOpen: boolean | undefined;
    setIsOpen?: () => void;
}

const SidebarToggle = ({ isOpen, setIsOpen }: SidebarToggleProps) => {
    return (
        <div className="invisible lg:visible absolute top-[24px] -right-[16px] z-20">
            <Button
                onClick={() => setIsOpen?.()}
                className="rounded-md w-8 h-8"
                variant="outline"
                size="icon"
            >
                <ChevronsRight
                    className={cn(
                        "h-4 w-4 transition-transform ease-in-out duration-300",
                        isOpen === false ? "transform rotate-0" : "transform rotate-180"
                    )}
                />
            </Button>
        </div>
    );
}

export default SidebarToggle;