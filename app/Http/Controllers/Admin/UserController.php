<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::role('bidder')->paginate(10);
        return Inertia::render('Admin/Users', [
            'users' => $users
        ]);
    }
}
