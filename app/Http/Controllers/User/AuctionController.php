<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuctionController extends Controller
{
    public function index(Request $request)
    {
        $auctions = Product::orderBy('created_at', 'desc')->paginate(12);

        return Inertia::render('User/Auctions/Index', [
            'auctions' => $auctions
        ]);
    }


    public function show($id)
    {
        $user = Auth::user();
        $auction = Product::findOrFail($id);
        $bids = $auction->bids()->with('user')->orderBy('amount', 'desc')->paginate(10);
        $highestBid = $bids->first();
        $isHighestBidder = $highestBid ? $highestBid->user_id === $user->id : false;
        $params = [
            'auction' => $auction,
            'bid' => $bids,
            'isHighestBidder' => $isHighestBidder
        ];

        return Inertia::render('User/Auctions/Show', $params);
    }
}
