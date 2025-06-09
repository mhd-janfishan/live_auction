<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $primaryKey = 'id';
    protected $fillable = ['type', 'notifiable', 'data', 'read_at'];

    public function notifiable()
    {
        return $this->morphTo();
    }

}
