import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { useState, useEffect, useCallback } from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";

export default function Dashboard({ auth, activeAuctions: initialActiveAuctions, userBids: initialUserBids }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeAuctions, setActiveAuctions] = useState(initialActiveAuctions);
    const [userBids, setUserBids] = useState(initialUserBids);
    const { data, setData, post, processing, reset, errors } = useForm({
        amount: "",
    });

    // Handle bid updates
    const handleBidUpdate = useCallback((auctionId, newBidData) => {
        console.log('Received bid update:', { auctionId, newBidData });

        setActiveAuctions(prevAuctions =>
            prevAuctions.map(auction =>
                auction.id === parseInt(auctionId)
                    ? { ...auction, current_price: newBidData.current_price }
                    : auction
            )
        );

        setUserBids(prevBids =>
            prevBids.map(bid =>
                bid.product.id === parseInt(auctionId)
                    ? { ...bid, product: { ...bid.product, current_price: newBidData.current_price } }
                    : bid
            )
        );
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        const subscriptions = activeAuctions?.map(auction => {
            console.log('Subscribing to channel:', `auction.${auction.id}`);

            const channel = window.Echo.channel(`auction.${auction.id}`);

            channel.listen('.NewBid', (e) => {
                console.log('Received NewBid event on channel:', `auction.${auction.id}`, e);
                handleBidUpdate(auction.id, e);
            });

            // Add subscription success/error handlers
            channel.subscribed(() => {
                console.log(`Successfully subscribed to channel: auction.${auction.id}`);
            });

            channel.error((error) => {
                console.error(`Error on channel auction.${auction.id}:`, error);
            });

            return channel;
        }) || [];

        return () => {
            clearInterval(timer);
            // Cleanup Echo listeners
            subscriptions.forEach(channel => {
                if (channel) {
                    window.Echo.leaveChannel(channel.name);
                }
            });
        };
    }, [activeAuctions, handleBidUpdate]);

    const calculateTimeLeft = (endTime) => {
        const end = new Date(endTime);
        const difference = end - currentTime;

        if (difference <= 0) {
            return "Auction ended";
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const handleSubmit = (e, auctionId) => {
        e.preventDefault();
        post(route("auctions.bid", auctionId), {
            onSuccess: () => {
                reset("amount");
                // Update the local state immediately after successful bid
                const newAmount = parseFloat(data.amount);
                handleBidUpdate(auctionId, {
                    current_price: newAmount,
                    user: {
                        id: auth.user.id,
                        name: auth.user.name
                    },
                    amount: newAmount,
                    created_at: new Date().toISOString()
                });
            },
        });
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
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Active Auctions Section */}
                    <div className="mb-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-white p-6">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Active Auctions
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {activeAuctions?.length > 0 ? (
                                    activeAuctions?.map((auction) => (
                                        <div
                                            key={auction.id}
                                            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={route(
                                                        "auctions.image",
                                                        auction.image
                                                    )}
                                                    alt={auction.name}
                                                    className="h-48 w-full object-cover"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white">
                                                    <div className="text-sm font-semibold">
                                                        Time Left:{" "}
                                                        {calculateTimeLeft(
                                                            auction.auction_end_time
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                                    {auction.name}
                                                </h3>
                                                <p className="mb-4 text-sm text-gray-600">
                                                    {auction.description}
                                                </p>
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">
                                                            Current Bid:
                                                        </span>
                                                        <span className="font-semibold text-green-600">
                                                            $
                                                            {
                                                                auction.current_price
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-500">
                                                            Starting Price:
                                                        </span>
                                                        <span className="text-gray-600">
                                                            $
                                                            {
                                                                auction.starting_price
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                                <form
                                                    onSubmit={(e) =>
                                                        handleSubmit(
                                                            e,
                                                            auction.id
                                                        )
                                                    }
                                                    className="mt-4 flex gap-2"
                                                >
                                                    <TextInput
                                                        type="number"
                                                        className="w-full"
                                                        placeholder={`Minimum bid: $${(
                                                            Number(
                                                                auction.current_price
                                                            ) + 0.01
                                                        ).toFixed(2)}`}
                                                        min={(
                                                            Number(
                                                                auction.current_price
                                                            ) + 0.01
                                                        ).toFixed(2)}
                                                        step="0.01"
                                                        value={data.amount}
                                                        onChange={(e) =>
                                                            handleAmountChange(
                                                                e,
                                                                auction
                                                            )
                                                        }
                                                        aria-label="Bid amount"
                                                    />
                                                    <PrimaryButton
                                                        type="submit"
                                                        disabled={
                                                            processing ||
                                                            !data.amount ||
                                                            Number(
                                                                data.amount
                                                            ) <=
                                                                Number(
                                                                    auction.current_price
                                                                )
                                                        }
                                                    >
                                                        Place Bid
                                                    </PrimaryButton>
                                                </form>
                                                {errors.amount && (
                                                    <div className="mt-2 text-sm text-red-600">
                                                        {errors.amount}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500">
                                        No active auctions found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* User's Bids Section */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-white p-6">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                Your Active Bids
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Auction
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Your Bid
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Current Highest
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Time Left
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {userBids?.map((bid) => (
                                            <tr key={bid.id}>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={route(
                                                                    "auctions.image",
                                                                    bid.product
                                                                        .image
                                                                )}
                                                                alt=""
                                                            />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {
                                                                    bid.product
                                                                        .name
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    ${bid.amount}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    ${bid.product.current_price}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                            bid.amount >=
                                                            bid.product
                                                                .current_price
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {bid.amount >=
                                                        bid.product
                                                            .current_price
                                                            ? "Highest Bid"
                                                            : "Outbid"}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                    {calculateTimeLeft(
                                                        bid.product
                                                            .auction_end_time
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
