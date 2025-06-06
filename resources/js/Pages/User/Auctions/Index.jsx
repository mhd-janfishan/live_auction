import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { format } from "date-fns";
import Pagination from "@/Components/Pagination";

export default function AuctionsIndex({ auth, auctions }) {
    const calculateTimeLeft = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;

        if (diff <= 0) return "Auction ended";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${days}d ${hours}h ${minutes}m`;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Available Auctions" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Available Auctions
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {auctions?.data?.length > 0 ? (
                                    auctions?.data?.map((auction) => (
                                        <div
                                            key={auction.id}
                                            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={route("auctions.image", auction.image)}
                                                    alt={auction.name}
                                                    className="h-48 w-full object-cover"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white">
                                                    <div className="text-sm font-semibold">
                                                        Time Left: {calculateTimeLeft(auction.auction_end_time)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {auction.name}
                                                </h3>
                                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                                    {auction.description}
                                                </p>
                                                <div className="mt-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm text-gray-600">
                                                            Current Price:
                                                            <span className="ml-1 font-semibold text-green-600">
                                                                ${auction.current_price}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                            auction.status === "live"
                                                                ? "bg-green-100 text-green-800"
                                                                : auction.status === "scheduled"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {auction.status}
                                                    </span>
                                                </div>

                                                {auction.status === "live" && (
                                                    <div className="mt-4">
                                                        <Link
                                                            href={route("user.auctions.show", auction.id)}
                                                            className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                        >
                                                            View Auction & Bid
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center text-gray-500">
                                        No auctions available at the moment.
                                    </div>
                                )}
                            </div>

                            <Pagination links={auctions.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
