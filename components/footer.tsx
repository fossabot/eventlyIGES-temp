import Link from "next/link";
import EventlyLogo from "./logo";

export default function Footer() {
  return (
    <footer className="border-t dark:border-t-black">
      <div className="wrapper flex flex-col items-center justify-between gap-4 p-5 text-center sm:flex-row">
        <Link href="/" className="w-36">
          <EventlyLogo />
        </Link>
        <p>&copy; 2025 Evently Italia</p>
      </div>
    </footer>
  );
}
