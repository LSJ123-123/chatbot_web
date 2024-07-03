import Link from 'next/link';
import { CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandDialogTrigger } from '../ui/command';

const linkStyle = {
  marginRight: 15
};

const Header = () => (
  <div className="flex items-center justify-between p-6 bg-gray-800 text-white mb-8">
    <div className="flex items-center">
      <Link style={linkStyle} href="/">(로고) 시네마캐릭터</Link>
      <Link style={linkStyle} href="/login">login</Link>
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