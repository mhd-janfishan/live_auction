<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BidController extends Controller
{




    public function store(Request $request, Product $product)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:' . ($product->current_price + 0.01),
            ]);

            $bid = $product->bids()->create([
                'user_id' => auth()->id(),
                'amount' => $validated['amount'],
            ]);

            // Update the product's current price
            $product->update([
                'current_price' => $validated['amount'],
                'latest_bidder_id' => auth()->id()
            ]);

            // Broadcast the new bid event
            event(new \App\Events\NewBid($bid));

            return redirect()->back()->with('success', 'Bid placed successfully');
        } catch (\Throwable $th) {
            Log::error($th);
            return redirect()->back()->with('error', 'Something Went Wrong');
        }
    }
}
