<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Bid;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $activeAuctions = Product::where('status', 'live')
            ->where('auction_end_time', '>', now())
            ->with(['bids' => function ($query) {
                $query->orderBy('amount', 'desc');
            }])
            ->latest()
            ->take(3)
            ->get();

        $userBids = Bid::where('user_id', Auth::id())
            ->with(['product' => function ($query) {
                $query->where('auction_end_time', '>', now());
            }])
            ->whereHas('product', function ($query) {
                $query->where('auction_end_time', '>', now());
            })
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('User/Dashboard', [
            'activeAuctions' => $activeAuctions,
            'userBids' => $userBids,
        ]);
    }
}
