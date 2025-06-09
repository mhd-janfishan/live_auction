<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'image',
        'starting_price',
        'current_price',
        'status',
        'auction_start_time',
        'auction_end_time',
        'time_extension_minutes',
        'latest_bidder_id',
    ];

    protected $casts = [
        'auction_start_time' => 'datetime',
        'auction_end_time' => 'datetime',
        'time_extension_minutes' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bids()
    {
        return $this->hasMany(Bid::class);
    }


    public function chatMessages()
    {
        return $this->hasMany(Chat::class);
    }
}
