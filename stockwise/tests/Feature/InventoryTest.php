<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_read_products(): void
    {
        $this->getJson('/api/products')->assertUnauthorized();
    }

    public function test_register_login_logout_and_product_crud_persist_in_mysql(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Jed Clerk',
            'email' => 'jed@stockwise.test',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertCreated()->assertJsonPath('user.email', 'jed@stockwise.test');

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['email' => 'jed@stockwise.test']);

        $created = $this->postJson('/api/products', [
            'name' => 'Printer ink',
            'sku' => 'INK-BK',
            'category' => 'Printing',
            'description' => 'Black cartridge',
            'quantity' => 2,
            'reorder_level' => 5,
            'unit_price' => 890,
        ])->assertCreated();

        $id = $created->json('product.id');
        $this->assertDatabaseHas('products', ['id' => $id, 'sku' => 'INK-BK', 'quantity' => 2]);

        $this->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('stats.products', 1)
            ->assertJsonPath('stats.low_stock', 1)
            ->assertJsonPath('stats.units', 2);

        $this->getJson('/api/products?q=ink')
            ->assertOk()
            ->assertJsonCount(1, 'products');

        $this->putJson("/api/products/{$id}", [
            'name' => 'Printer ink',
            'sku' => 'INK-BK',
            'category' => 'Printing',
            'description' => 'Black cartridge',
            'quantity' => 12,
            'reorder_level' => 5,
            'unit_price' => 900,
        ])->assertOk()->assertJsonPath('product.quantity', 12);

        $this->assertDatabaseHas('products', ['id' => $id, 'quantity' => 12]);

        $this->deleteJson("/api/products/{$id}")->assertOk();
        $this->assertDatabaseMissing('products', ['id' => $id]);

        $this->postJson('/api/logout')->assertOk();
        $this->assertGuest();
        $this->getJson('/api/user')->assertOk()->assertJsonPath('user', null);
        $this->getJson('/api/products')->assertUnauthorized();
    }

    public function test_login_rejects_a_wrong_password(): void
    {
        User::factory()->create(['email' => 'jed@stockwise.test']);

        $this->postJson('/api/login', [
            'email' => 'jed@stockwise.test',
            'password' => 'not-the-password',
        ])->assertStatus(422);
    }

    public function test_one_account_cannot_change_another_accounts_product(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $product = Product::query()->create([
            'user_id' => $owner->id,
            'name' => 'Folders',
            'sku' => 'FLD-1',
            'category' => 'Filing',
            'quantity' => 4,
            'reorder_level' => 2,
            'unit_price' => 8,
        ]);

        $this->actingAs($other)
            ->putJson("/api/products/{$product->id}", [
                'name' => 'Stolen',
                'sku' => 'FLD-1',
                'category' => 'Filing',
                'quantity' => 0,
                'reorder_level' => 2,
                'unit_price' => 8,
            ])
            ->assertNotFound();

        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Folders']);
    }

    public function test_refreshing_a_client_route_returns_the_react_shell(): void
    {
        $this->get('/dashboard')
            ->assertOk()
            ->assertSee('StockWise', false)
            ->assertSee('id="root"', false);
    }
}
