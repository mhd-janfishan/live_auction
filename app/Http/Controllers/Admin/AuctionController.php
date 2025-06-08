<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AuctionController extends Controller
{
    public function index()
    {
        $products = Product::orderBy('created_at', 'desc')->paginate(10);
        return Inertia::render('Admin/Auctions/Index', [
            'products' => $products,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Auctions/Create');
    }


    public function show($id)
    {
        //
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
                'starting_price' => 'required|numeric|min:0',
                'current_price' => 'required|numeric|min:0',
                'status' => 'required|in:draft,scheduled,live,ended',
                'auction_start_time' => 'required|date',
                'auction_end_time' => 'required|date|after:auction_start_time',
                'time_extension_minutes' => 'required|integer|min:1',
            ]);

            $productService = new ProductService();
            $product = $productService->createProduct($validated);

            return redirect()->route('auctions.index')->with('success', 'Auction created successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Throwable $th) {
            Log::error($th);
            return redirect()->back()
                ->with('error', 'Something went wrong.')
                ->withInput();
        }
    }

    public function edit($id)
    {
        $product = Product::find($id);
        return Inertia::render('Admin/Auctions/Edit', [
            'product' => $product,
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'starting_price' => 'required|numeric|min:0',
                'current_price' => 'required|numeric|min:0',
                'status' => 'required|in:draft,scheduled,live,ended',
                'auction_start_time' => 'required|date',
                'auction_end_time' => 'required|date|after:auction_start_time',
                'time_extension_minutes' => 'required|integer|min:1',
            ]);

            $productService = new ProductService();
            $product = $productService->updateProduct($validated, $id);

            return redirect()->route('auctions.index')->with('success', 'Auction updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Throwable $th) {
            Log::error($th);
            return redirect()->back()
                ->with('error', 'Something went wrong.')
                ->withInput();
        }
    }

    public function destroy($id)
    {
        try {
            $product = Product::find($id);
            $product->delete();
            return redirect()->route('auctions.index')->with('success', 'Auction deleted successfully.');
        } catch (\Throwable $th) {
            Log::error($th);
            return redirect()->back()->with('error', 'Something went wrong.');
        }
    }


    public function showImage($filename)
    {
        Log::info($filename);
        $path = storage_path('app/private/products/' . $filename);

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path);
    }
}
