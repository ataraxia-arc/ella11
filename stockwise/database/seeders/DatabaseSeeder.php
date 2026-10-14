<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Optional demo stockroom. Not run during deploy.
     * Login: clerk@stockwise.test / password
     */
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'clerk@stockwise.test'],
            ['name' => 'Amina Clerk', 'password' => 'password'],
        );

        $rows = [
            ['Bond paper, A4', 'PAP-A4', 'Paper', 42, 20, 185.00, 'Ream, 80gsm.'],
            ['Ballpoint pens, black', 'PEN-BLK', 'Writing', 8, 24, 12.50, 'Box is almost empty.'],
            ['Manila folders', 'FLD-MNL', 'Filing', 120, 30, 8.00, null],
            ['Stapler, desktop', 'STL-01', 'Tools', 6, 4, 240.00, null],
            ['Printer ink, black', 'INK-BK', 'Printing', 2, 5, 890.00, 'Reorder before exams week.'],
            ['Whiteboard marker', 'MRK-WB', 'Writing', 15, 12, 35.00, null],
        ];

        foreach ($rows as [$name, $sku, $category, $quantity, $reorder, $price, $description]) {
            Product::query()->updateOrCreate(
                ['user_id' => $user->id, 'sku' => $sku],
                [
                    'name' => $name,
                    'category' => $category,
                    'description' => $description,
                    'quantity' => $quantity,
                    'reorder_level' => $reorder,
                    'unit_price' => $price,
                ],
            );
        }

        if ($user->activityLogs()->doesntExist()) {
            $user->record('registered', 'Opened a StockWise account.');
            $user->record('created', 'Loaded the sample stockroom.', 'Sample stock');
        }
    }
}
