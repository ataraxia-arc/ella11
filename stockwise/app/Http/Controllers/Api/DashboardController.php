<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $totals = Product::query()
            ->where('user_id', $userId)
            ->selectRaw('COUNT(*) as products')
            ->selectRaw('COALESCE(SUM(quantity), 0) as units')
            ->selectRaw('COALESCE(SUM(quantity * unit_price), 0) as inventory_value')
            ->first();

        $lowStockCount = Product::query()
            ->where('user_id', $userId)
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->count();

        $lowStock = Product::query()
            ->where('user_id', $userId)
            ->whereColumn('quantity', '<=', 'reorder_level')
            ->orderBy('quantity')
            ->orderBy('name')
            ->limit(8)
            ->get();

        $activity = ActivityLog::query()
            ->where('user_id', $userId)
            ->latest()
            ->limit(8)
            ->get(['id', 'action', 'subject', 'description', 'created_at']);

        return response()->json([
            'stats' => [
                'products' => (int) $totals->products,
                'units' => (int) $totals->units,
                'low_stock' => $lowStockCount,
                'inventory_value' => number_format((float) $totals->inventory_value, 2, '.', ''),
            ],
            'low_stock' => $lowStock,
            'activity' => $activity,
        ]);
    }
}
