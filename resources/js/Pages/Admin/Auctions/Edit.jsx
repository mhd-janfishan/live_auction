import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";

export default function Edit({ auth, product }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: product.name,
        description: product.description,
        image: null,
        starting_price: product.starting_price,
        current_price: product.current_price,
        status: product.status,
        auction_start_time: product.auction_start_time,
        auction_end_time: product.auction_end_time,
        time_extension_minutes: product.time_extension_minutes,
        _method: 'PUT'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("auctions.update", product.id));
    };

    const handleImageChange = (e) => {
        setData("image", e.target.files[0]);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Auction" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Edit Auction
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData("name", e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        rows="4"
                                        onChange={(e) => setData("description", e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="image" value="Product Image" />
                                    {product.image && (
                                        <div className="mt-2 mb-4">
                                            <img
                                                src={route('auctions.image', product.image)}
                                                alt={product.name}
                                                className="w-48 h-48 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}
                                    <input
                                        id="image"
                                        type="file"
                                        name="image"
                                        onChange={handleImageChange}
                                        className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        accept="image/*"
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Leave empty to keep the current image
                                    </p>
                                    <InputError message={errors.image} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="starting_price" value="Starting Price" />
                                        <TextInput
                                            id="starting_price"
                                            type="number"
                                            name="starting_price"
                                            value={data.starting_price}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData("starting_price", e.target.value)}
                                            required
                                            step="0.01"
                                            min="0"
                                        />
                                        <InputError message={errors.starting_price} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="current_price" value="Current Price" />
                                        <TextInput
                                            id="current_price"
                                            type="number"
                                            name="current_price"
                                            value={data.current_price}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData("current_price", e.target.value)}
                                            required
                                            step="0.01"
                                            min="0"
                                        />
                                        <InputError message={errors.current_price} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="auction_start_time" value="Auction Start Time" />
                                        <TextInput
                                            id="auction_start_time"
                                            type="datetime-local"
                                            name="auction_start_time"
                                            value={data.auction_start_time}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData("auction_start_time", e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.auction_start_time} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="auction_end_time" value="Auction End Time" />
                                        <TextInput
                                            id="auction_end_time"
                                            type="datetime-local"
                                            name="auction_end_time"
                                            value={data.auction_end_time}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData("auction_end_time", e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.auction_end_time} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="time_extension_minutes" value="Time Extension (minutes)" />
                                    <TextInput
                                        id="time_extension_minutes"
                                        type="number"
                                        name="time_extension_minutes"
                                        value={data.time_extension_minutes}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData("time_extension_minutes", e.target.value)}
                                        min="1"
                                        required
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Number of minutes to extend the auction when a bid is placed near the end
                                    </p>
                                    <InputError message={errors.time_extension_minutes} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Status" />
                                    <select
                                        id="status"
                                        name="status"
                                        value={data.status}
                                        className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        onChange={(e) => setData("status", e.target.value)}
                                        required
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="live">Live</option>
                                        <option value="ended">Ended</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <PrimaryButton className="ml-4" disabled={processing}>
                                        Update Auction
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
