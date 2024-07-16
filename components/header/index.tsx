import Link from 'next/link';
import Image from 'next/image';
import AuthButton from '../auth-button';
import SheetMenu from '../sheet-menu';
import { SearchCommand } from '../search-command';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-6 bg-zinc-800 text-white">
      <div className="flex items-center ml-4 space-x-4">
        <SheetMenu />
        <Link href="/" className='mr-4'>
          <Image src="/images/logo.svg" alt="logo" width={180} height={60} priority />
        </Link>
        <AuthButton />
      </div>
      <div className="flex items-center mr-4">
        <SearchCommand />
      </div>
    </header>
  )
};

export default Header;