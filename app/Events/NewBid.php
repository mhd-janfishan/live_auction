<?php

namespace App\Events;

use App\Models\Bid;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NewBid implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $bid;

    public function __construct(Bid $bid)
    {

        $this->bid = $bid->load(['user:id,name', 'product']);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channel = 'auction.'.$this->bid->product_id;
        return [
            new Channel($channel),
        ];
    }

    /**
     * Get the broadcast event name.
     */
    public function broadcastAs(): string
    {
        return 'NewBid';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        try {
            $data = [
                'id' => (int)$this->bid->getKey(),
                'amount' => (float)$this->bid->amount,
                'user' => [
                    'id' => (int)$this->bid->user->getKey(),
                    'name' => $this->bid->user->name,
                ],
                'created_at' => $this->bid->created_at->toISOString(),
                'current_price' => (float)$this->bid->product->current_price,
                'auction_end_time' => $this->bid->product->auction_end_time,
            ];

            Log::info('NewBid broadcasting data', $data);
            return $data;
        } catch (\Exception $e) {
            Log::error('Error preparing broadcast data', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
