<?php

namespace App\Http\Controllers\User;

use App\Events\NewChatMessage;
use App\Http\Controllers\Controller;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{


    public function getMessages($auctionId)
    {
        $chats = Chat::where('product_id', $auctionId)
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->reverse()
            ->values();

        return $chats;

    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500'
        ]);

        $message = Chat::create([
            'product_id' => $request->auction_id,
            'user_id' => Auth::id(),
            'message' => $request->message
        ]);


        broadcast(new NewChatMessage($message))->toOthers();

        return response()->json(['success' => true]);
    }


}