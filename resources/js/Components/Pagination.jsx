import { Link } from "@inertiajs/react";

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="mt-6">
            <div className="flex flex-wrap justify-center gap-1">
                {links.map((link, key) =>
                    link.url ? (
                        <Link
                            key={key}
                            href={link.url}
                            className={`px-4 py-2 text-sm border rounded-md ${
                                link.active
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                        />
                    ) : (
                        <span
                            key={key}
                            className="px-4 py-2 text-sm border rounded-md text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed"
                            dangerouslySetInnerHTML={{
                                __html: link.label,
                            }}
                        />
                    )
                )}
            </div>
        </div>
    );
}
