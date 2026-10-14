<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        Auth::login($user);
        $request->session()->regenerate();
        $user->record('registered', 'Opened a StockWise account.');

        return response()->json(['user' => $this->payload($user)], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, true)) {
            return response()->json([
                'message' => 'Those credentials do not match our records.',
                'errors' => [
                    'email' => ['Those credentials do not match our records.'],
                ],
            ], 422);
        }

        $request->session()->regenerate();
        $user = $request->user();
        $user->record('login', 'Signed in.');

        return response()->json(['user' => $this->payload($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $user?->record('logout', 'Signed out.');

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Signed out.']);
    }

    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => $user ? $this->payload($user) : null,
        ]);
    }

    private function payload(User $user): array
    {
        return $user->only(['id', 'name', 'email']);
    }
}
