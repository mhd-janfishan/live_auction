<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Notifications\OutbidNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Events\NewBid;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class BidController extends Controller
{
    public function store(Request $request, Product $product)
    {
        try {
            $validated = $request->validate([
                'amount' => 'required|numeric|min:' . (intval($product->current_price) + 0.01),
            ]);

            DB::beginTransaction();

            try {
                // Get the previous highest bidder before placing the new bid
                $previousHighestBid = $product->bids()
                    ->with('user')
                    ->orderBy('amount', 'desc')
                    ->first();

                $bid = $product->bids()->create([
                    'user_id' => Auth::id(),
                    'amount' => $validated['amount'],
                ]);

                // Check if bid is placed in the last few minutes
                $now = Carbon::now();
                $auctionEnd = Carbon::parse($product->auction_end_time);
                $minutesLeft = $now->diffInMinutes($auctionEnd, false);

                // If bid is placed in the last few minutes, extend the auction
                if ($minutesLeft >= 0 && $minutesLeft <= $product->time_extension_minutes) {
                    $newEndTime = $auctionEnd->addMinutes($product->time_extension_minutes);
                    $product->auction_end_time = $newEndTime;
                }

                // Update the product's current price
                $product->update([
                    'current_price' => $validated['amount'],
                    'latest_bidder_id' => Auth::id(),
                    'auction_end_time' => $product->auction_end_time,
                ]);

                DB::commit();

                if ($previousHighestBid && $previousHighestBid->user_id !== Auth::id()) {
                    $previousHighestBid->user->notify(new OutbidNotification($bid));
                }

                try {
                    broadcast(new NewBid($bid))->toOthers();
                } catch (\Exception $e) {
                    Log::error('Broadcasting error', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    // Don't throw the broadcasting error, just log it
                    // The bid was successful, we just couldn't notify others
                }

                return redirect()->back()->with('success', 'Bid placed successfully');
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error during bid creation transaction', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        } catch (\Throwable $th) {
            Log::error('Error in bid placement', [
                'error' => $th->getMessage(),
                'trace' => $th->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Something went wrong while placing your bid. Please try again.');
        }
    }
}
