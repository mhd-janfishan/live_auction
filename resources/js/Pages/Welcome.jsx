import { Head, Link } from "@inertiajs/react";

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Live Auction Platform" />
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
                {/* Navigation */}
                <nav className="fixed w-full bg-slate-900/90 backdrop-blur-sm z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <span className="text-2xl font-bold text-blue-400">LiveBid</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <>
                                        <Link
                                            href={route("dashboard")}
                                            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-semibold"
                                        >
                                            Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={route("login")}
                                            className="px-4 py-2 rounded-lg border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route("register")}
                                            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-semibold"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative pt-32 pb-20 sm:pt-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                            Live Auctions Made Simple
                        </h1>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Join the most exciting live auction platform. Bid in real-time, win unique items, and experience the thrill of live bidding from anywhere.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link
                                href={route("register")}
                                className="px-8 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-semibold text-lg"
                            >
                                Start Bidding
                            </Link>
                            <a
                                href="#how-it-works"
                                className="px-8 py-3 rounded-lg border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors text-lg"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-20 bg-slate-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center p-6 bg-slate-800 rounded-lg shadow-lg">
                                <div className="text-blue-400 text-4xl mb-4">⚡️</div>
                                <h3 className="text-xl font-semibold mb-2">Live Bidding</h3>
                                <p className="text-slate-400">Experience the excitement of real-time auctions with instant updates and notifications.</p>
                            </div>
                            <div className="text-center p-6 bg-slate-800 rounded-lg shadow-lg">
                                <div className="text-blue-400 text-4xl mb-4">🔒</div>
                                <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
                                <p className="text-slate-400">Your bids and transactions are protected with state-of-the-art security measures.</p>
                            </div>
                            <div className="text-center p-6 bg-slate-800 rounded-lg shadow-lg">
                                <div className="text-blue-400 text-4xl mb-4">🌐</div>
                                <h3 className="text-xl font-semibold mb-2">Global Access</h3>
                                <p className="text-slate-400">Participate in auctions from anywhere in the world, at any time.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-8 text-center text-sm text-slate-400">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <p>&copy; 2024 LiveBid. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
