import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center pt-6 sm:justify-center sm:pt-0">

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-xl sm:max-w-md sm:rounded-lg border border-slate-200">
                {children}
            </div>
        </div>
    );
}
