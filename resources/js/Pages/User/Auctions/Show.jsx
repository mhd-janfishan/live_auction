import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import Pagination from "@/Components/Pagination";
import Echo from "laravel-echo";

export default function Show({ auth, auction, bid, isHighestBidder }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: "",
    });

    const [timeLeft, setTimeLeft] = useState("");
    const [currentPrice, setCurrentPrice] = useState(auction.current_price);
    const [bids, setBids] = useState(bid);
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const [showBidHistory, setShowBidHistory] = useState(false);

    const calculateTimeLeft = (endTime) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end - now;

        if (diff <= 0) return "Auction ended";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(auction.auction_end_time));
        }, 1000);

        // Subscribe to the auction channel
        window.Echo?.channel(`auction.${auction.id}`).listen("NewBid", (e) => {
            // Update the current price
            setCurrentPrice(e.current_price);

            // Add the new bid to the list
            setBids((prevBids) => {
                const newBids = [e, ...prevBids];
                // Keep only the top 10 bids
                return newBids.slice(0, 10);
            });
        });

        return () => {
            clearInterval(timer);
            window.Echo?.leave(`auction.${auction.id}`);
        };
    }, [auction.auction_end_time, auction.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("auctions.bid", auction.id), {
            onSuccess: () => {
                reset("amount");
                setShowBidHistory(true);
            },
        });
    };

    const toggleImageZoom = () => {
        setIsImageZoomed(!isImageZoomed);
    };

    const getTimeLeftColor = () => {
        const end = new Date(auction.auction_end_time);
        const now = new Date();
        const hoursLeft = (end - now) / (1000 * 60 * 60);

        if (hoursLeft <= 1) return "text-red-500";
        if (hoursLeft <= 24) return "text-yellow-500";
        return "text-green-500";
    };


    const handleAmountChange = (e, auction) => {
        const input = e.target.value;
        if (input === "") {
            setData("amount", "");
            return;
        }
        const value = parseFloat(input);
        const minBid = Number(auction.current_price) + 0.01;
        setData("amount", value);
        if (isNaN(value)) {
            setData(
                "amount",
                value < minBid ? minBid.toFixed(2) : value.toFixed(2)
            );
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`${auction?.name} - Live Auction`} />

            <div className="py-12 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Auction Status Bar */}
                    <div className="mb-6 bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500">
                                    Auction Ends In
                                </span>
                                <span
                                    className={`text-lg font-semibold ${getTimeLeftColor()}`}
                                >
                                    {timeLeft}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500">
                                    Current Bid
                                </span>
                                <span className="text-lg font-semibold text-green-600">
                                    ${Number(currentPrice).toLocaleString()}
                                </span>
                            </div>
                            {isHighestBidder && (
                                <div className="mt-2 flex items-center text-green-600">
                                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium">You are the highest bidder</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-lg sm:rounded-xl">
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column - Image and Details */}
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <div
                                            className={`transition-all duration-300 ${
                                                isImageZoomed
                                                    ? "fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center cursor-zoom-out"
                                                    : "rounded-xl overflow-hidden cursor-zoom-in"
                                            }`}
                                            onClick={toggleImageZoom}
                                        >
                                            <img
                                                src={route(
                                                    "auctions.image",
                                                    auction?.image
                                                )}
                                                alt={auction?.name}
                                                className={`${
                                                    isImageZoomed
                                                        ? "max-h-screen max-w-full object-contain"
                                                        : "w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
                                                }`}
                                            />
                                            {!isImageZoomed && (
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="absolute bottom-4 left-4 right-4">
                                                        <p className="text-white text-sm mb-2">
                                                            Click to zoom
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                            Item Details
                                        </h2>
                                        <div className="prose prose-sm max-w-none text-gray-600">
                                            {auction?.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Bidding and History */}
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            {auction?.name}
                                        </h1>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm">
                                            <p className="text-sm text-gray-600 mb-2">
                                                Starting Price
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                $
                                                {Number(
                                                    auction?.starting_price
                                                ).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Posted{" "}
                                                {format(
                                                    new Date(
                                                        auction?.created_at
                                                    ),
                                                    "MMM d, yyyy"
                                                )}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm relative overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Current Price
                                                </p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    $
                                                    {Number(
                                                        currentPrice
                                                    ).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {bids?.data?.length || 0}{" "}
                                                    bids placed
                                                </p>
                                            </div>
                                            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-green-200/20 to-transparent"></div>
                                        </div>
                                    </div>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label
                                                    htmlFor="amount"
                                                    className="block text-lg font-semibold text-gray-900"
                                                >
                                                    Place Your Bid
                                                </label>
                                                <span className="text-sm text-gray-500">
                                                    Min. increment: $0.01
                                                </span>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                        $
                                                    </span>
                                                    <TextInput
                                                        id="amount"
                                                        type="number"
                                                        name="amount"
                                                        className="pl-8 w-full text-lg rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                        placeholder={`Minimum bid: $${(
                                                            Number(
                                                                currentPrice
                                                            ) + 0.01
                                                        ).toFixed(2)}`}
                                                        min={
                                                            Number(
                                                                currentPrice
                                                            ) + 0.01
                                                        }
                                                        step="0.01"
                                                        value={data.amount}
                                                        onChange={(e) =>
                                                            handleAmountChange(
                                                                e,
                                                                auction
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <PrimaryButton
                                                    type="submit"
                                                    disabled={processing || !data.amount || Number(data.amount) <= Number(currentPrice)}
                                                    className={`px-8 py-3 text-lg transition-all duration-200 ${
                                                        processing || !data.amount || Number(data.amount) <= Number(currentPrice)
                                                            ? "bg-gray-400"
                                                            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
                                                    }`}
                                                >
                                                    {processing ? (
                                                        <span className="flex items-center space-x-2">
                                                            <svg
                                                                className="animate-spin h-5 w-5"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <circle
                                                                    className="opacity-25"
                                                                    cx="12"
                                                                    cy="12"
                                                                    r="10"
                                                                    stroke="currentColor"
                                                                    strokeWidth="4"
                                                                    fill="none"
                                                                />
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                />
                                                            </svg>
                                                            <span>
                                                                Processing...
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        "Place Bid"
                                                    )}
                                                </PrimaryButton>
                                            </div>
                                            {errors.amount && (
                                                <p className="mt-2 text-sm text-red-600">
                                                    {errors.amount}
                                                </p>
                                            )}
                                        </div>
                                    </form>

                                    {/* Recent Bids */}
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() =>
                                                setShowBidHistory(
                                                    !showBidHistory
                                                )
                                            }
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium focus:outline-none"
                                        >
                                            {showBidHistory
                                                ? "Hide Bid History"
                                                : "Show Bid History"}
                                        </button>
                                    </div>
                                    <div
                                        className={`bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 ${
                                            showBidHistory
                                                ? "opacity-100"
                                                : "opacity-0 h-0 overflow-hidden"
                                        }`}
                                    >
                                        <div className="p-6 border-b border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    Bid History
                                                </h2>
                                                <span className="text-sm text-gray-500">
                                                    {bids?.data?.length || 0}{" "}
                                                    total bids
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            {bids?.data?.length > 0 ? (
                                                <div className="space-y-3">
                                                    {bids.data.map((bid) => (
                                                        <div
                                                            key={bid.id}
                                                            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm">
                                                                    <span className="text-blue-600 font-semibold text-lg">
                                                                        {bid.user.name.charAt(
                                                                            0
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-gray-900 font-medium">
                                                                        {
                                                                            bid
                                                                                .user
                                                                                .name
                                                                        }
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        {format(
                                                                            new Date(
                                                                                bid.created_at
                                                                            ),
                                                                            "MMM d, yyyy HH:mm"
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end">
                                                                <span className="font-bold text-green-600">
                                                                    $
                                                                    {Number(
                                                                        bid.amount
                                                                    ).toLocaleString()}
                                                                </span>
                                                                {bid.user.id ===
                                                                    auth.user
                                                                        .id && (
                                                                    <span className="text-xs text-blue-600 font-medium">
                                                                        Your bid
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <svg
                                                            className="w-8 h-8 text-gray-400"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <p className="text-gray-500 text-lg mb-2">
                                                        No bids yet
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        Be the first to place a
                                                        bid on this item!
                                                    </p>
                                                </div>
                                            )}
                                            <div className="mt-6">
                                                <Pagination
                                                    links={bids?.links}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
