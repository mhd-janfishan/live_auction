<?php

namespace App\Notifications;

use App\Models\Bid;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OutbidNotification extends Notification 
{
    use Queueable;

    private $bid;

    public function __construct(Bid $bid)
    {
        $this->bid = $bid;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('You have been outbid!')
            ->line('Someone has placed a higher bid on ' . $this->bid->product->name)
            ->line('New highest bid: $' . number_format($this->bid->amount, 2))
            ->action('View Auction', route('auctions.show', $this->bid->product_id))
            ->line('Don\'t miss out - place a new bid now!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'bid_id' => $this->bid->id,
            'product_id' => $this->bid->product_id,
            'product_name' => $this->bid->product->name,
            'amount' => $this->bid->amount,
            'bidder_name' => $this->bid->user->name,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'bid_id' => $this->bid->id,
            'product_id' => $this->bid->product_id,
            'product_name' => $this->bid->product->name,
            'amount' => $this->bid->amount,
            'bidder_name' => $this->bid->user->name,
            'message' => 'You have been outbid on ' . $this->bid->product->name,
        ]);
    }
}
