<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use App\Models\Bid;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {

        $totalAuctions = Product::count();
        $activeAuctions = Product::where('status', 'active')->count();
        $totalUsers = User::role('bidder')->count();
        $recentAuctions = Product::latest()
            ->take(5)
            ->get();

        $params = [
            'totalAuctions' => $totalAuctions,
            'activeAuctions' => $activeAuctions,
            'totalUsers' => $totalUsers,
            'recentAuctions' => $recentAuctions,
        ];

        return Inertia::render('Admin/Dashboard', $params);
    }
}
