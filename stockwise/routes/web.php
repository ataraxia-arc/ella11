<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
| The React app is a single compiled page. Any non-API path, including a
| refresh of /dashboard or /products, must return that page so the client
| router can take over. Missing /api routes stay JSON.
*/
Route::fallback(function (Request $request) {
    if ($request->is('api/*')) {
        return response()->json(['message' => 'Not found.'], 404);
    }

    return view('app');
});
