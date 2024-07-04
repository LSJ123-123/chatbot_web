import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import SidebarToggle from "../sidebar-toggle";

const Sidebar = () => {
    const sidebar = useStore(useSidebarToggle, (state) => state);

    if (!sidebar) return null;

    return (
        <aside className={cn(
            "fixed top-0 left-0 z-20 h-screen transition-transform ease-in-out duration-300",
            sidebar?.isOpen ? "translate-x-0 w-72" : "-translate-x-72 w-72",
            "lg:block hidden"
        )}>
            <div className="relative h-full">
                <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
                <nav className={cn(
                    "h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800 transition-opacity duration-300",
                    sidebar?.isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}>
                    <ul>
                        <li>
                            <a href="/about">About</a>
                        </li>
                        <li>
                            <a href="/contact">Contact</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
