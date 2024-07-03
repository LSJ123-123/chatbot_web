
import {
  CommandDialogTrigger,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import Link from 'next/link';

const leftlinkStyle = {
  marginLeft: 50
};

const rightlinkStyle = {
  marginRight: 50
};

const Header = () => (
  <div className="flex items-center justify-between p-6 bg-gray-800 text-white mb-8">
    <div className="flex items-center">
      <Link style={leftlinkStyle} href="/">(로고) 시네마캐릭터</Link>
      <Link style={rightlinkStyle} href="/login">login</Link>
    </div>
    <div className="flex items-center">
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
  </div>
);

export default Header;