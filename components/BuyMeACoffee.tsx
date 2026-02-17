import Link from 'next/link';
import Image from 'next/image';

export const BuyMeACoffee = ({ className = "" }: { className?: string }) => (
    <Link
        href="https://www.buymeacoffee.com/Twinklet"
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FFDD00] text-black font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 ${className}`}
    >
        <div className="relative w-6 h-6">
            <Image
                src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                alt="Buy me a coffee"
                fill
                className="object-contain"
            />
        </div>
        <span>Buy me a coffee</span>
    </Link>
);
