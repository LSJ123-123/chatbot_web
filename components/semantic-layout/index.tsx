"use client";

import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";

const SemnaticLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;

  return (
    <>
      <Sidebar />
      <main
        className={cn(
          "min-h-[calc(100vh-92px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          sidebar?.isOpen === false ? "lg:ml-[0px]" : "lg:ml-72"
        )}
      >
        <Header />
        {children}
      </main>
      <footer
        className={cn(
          "transition-[margin-left] ease-in-out duration-300",
          sidebar?.isOpen === false ? "lg:ml-[0px]" : "lg:ml-72"
        )}
      >
        <Footer />
      </footer>
    </>
  );
}

export default SemnaticLayout;