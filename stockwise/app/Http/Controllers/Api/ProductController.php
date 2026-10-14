<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));
        $like = '%'.addcslashes($search, '%_\\').'%';

        $products = Product::query()
            ->where('user_id', $request->user()->id)
            ->when($search !== '', function ($query) use ($like) {
                $query->where(function ($inner) use ($like) {
                    $inner->where('name', 'like', $like)
                        ->orWhere('sku', 'like', $like)
                        ->orWhere('category', 'like', $like);
                });
            })
            ->orderBy('name')
            ->get();

        return response()->json(['products' => $products]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $product = $request->user()->products()->create($data);
        $request->user()->record(
            'created',
            "Added {$product->name} ({$product->sku}) with {$product->quantity} on hand.",
            $product->name,
        );

        return response()->json(['product' => $product], 201);
    }

    public function show(Request $request, int $product): JsonResponse
    {
        return response()->json(['product' => $this->owned($request, $product)]);
    }

    public function update(Request $request, int $product): JsonResponse
    {
        $record = $this->owned($request, $product);
        $data = $this->validated($request, $record->id);
        $record->update($data);
        $request->user()->record(
            'updated',
            "Updated {$record->name} ({$record->sku}). Quantity is now {$record->quantity}.",
            $record->name,
        );

        return response()->json(['product' => $record->fresh()]);
    }

    public function destroy(Request $request, int $product): JsonResponse
    {
        $record = $this->owned($request, $product);
        $name = $record->name;
        $sku = $record->sku;
        $record->delete();
        $request->user()->record('deleted', "Removed {$name} ({$sku}) from inventory.", $name);

        return response()->json(['message' => 'Product deleted.']);
    }

    private function owned(Request $request, int $id): Product
    {
        return Product::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'sku' => [
                'required',
                'string',
                'max:64',
                Rule::unique('products', 'sku')
                    ->where(fn ($query) => $query->where('user_id', $request->user()->id))
                    ->ignore($ignoreId),
            ],
            'category' => ['required', 'string', 'max:80'],
            'description' => ['nullable', 'string', 'max:1000'],
            'quantity' => ['required', 'integer', 'min:0', 'max:1000000'],
            'reorder_level' => ['required', 'integer', 'min:0', 'max:1000000'],
            'unit_price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
        ]);
    }
}
