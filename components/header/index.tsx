import Link from 'next/link';
import Image from 'next/image';
import { MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandDialogTrigger } from '../ui/command';
import AuthButton from '../auth-button';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-6 bg-zinc-800 text-white">
      <div className="flex items-center ml-4 space-x-0 lg:space-x-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="h-8 mr-4" variant="secondary" size="icon">
              <MenuIcon size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
            <nav>
              <ul>
                <li>
                  <a href="/about">About</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
              </ul>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className='mr-4'>
          <Image src="/images/logo.svg" alt="logo" width={180} height={60} />
        </Link>
        <AuthButton />
      </div>
      <div className="flex items-center mr-4">
        <CommandDialogTrigger>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialogTrigger>
      </div>
    </header>
  )
};

export default Header;