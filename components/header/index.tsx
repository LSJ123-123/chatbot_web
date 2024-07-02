import Link from 'next/link';

const linkStyle = {
  marginRight: 15
};
/* 헤더 css처리 해야함 */
const Header = () => (
  <div>
    시네마챗봇(로고)
    <Link style={linkStyle} href="/">시네마챗봇</Link>
    css로 중간에 띄기
    <Link style={linkStyle} href="/chatBot-page">ChatBot</Link>
    <Link style={linkStyle} href="/my-profile">My profile</Link>
    <Link style={linkStyle} href="/login">login</Link>
  </div>
);

export default Header;