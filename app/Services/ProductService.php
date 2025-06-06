<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    public function createProduct(array $data)
    {
        $product = new Product();
        $product->name = $data['name'];
        $product->description = $data['description'];
        $product->starting_price = $data['starting_price'];
        $product->current_price = $data['current_price'];
        $product->status = $data['status'];
        $product->auction_start_time = $data['auction_start_time'];
        $product->auction_end_time = $data['auction_end_time'];
        $product->image = $this->storeImage($data['image']);
        $product->save();
        return $product;
    }


    public function updateProduct(array $data, $id)
    {
        $product = Product::find($id);
        $product->name = $data['name'];
        $product->description = $data['description'];
        $product->starting_price = $data['starting_price'];
        $product->current_price = $data['current_price'];
        $product->status = $data['status'];
        $product->auction_start_time = $data['auction_start_time'];
        $product->auction_end_time = $data['auction_end_time'];
        if ($data['image']) {
            $product->image = $this->storeImage($data['image']);
        }
        $product->save();
        return $product;
    }

    public function storeImage($image)
    {

        $name = time() . rand(100, 1000) . '.' . $image->extension();
        Storage::disk('local')->putFileAs('products/', $image, $name);

        return $name;
    }
}
