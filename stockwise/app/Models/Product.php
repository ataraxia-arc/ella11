<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'sku',
        'category',
        'description',
        'quantity',
        'reorder_level',
        'unit_price',
    ];

    protected $appends = [
        'low_stock',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'reorder_level' => 'integer',
            'unit_price' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getLowStockAttribute(): bool
    {
        return $this->quantity <= $this->reorder_level;
    }
}
