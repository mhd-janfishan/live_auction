<?php

namespace App\Events;

use App\Models\Bid;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class NewBid implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $bid;

    public function __construct(Bid $bid)
    {
        Log::info('NewBid event triggered');
        $this->bid = $bid->load('user:id,name');
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('auction.'.$this->bid->product_id),
        ];
    }

    public function broadcastWith(): array
    {
        Log::info('broadcastWith');
        return [
            'id' => $this->bid->id,
            'amount' => $this->bid->amount,
            'user' => [
                'id' => $this->bid->user->id,
                'name' => $this->bid->user->name,
            ],
            'created_at' => $this->bid->created_at,
            'current_price' => $this->bid->product->current_price,
        ];
    }
}
