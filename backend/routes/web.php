<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => 'Adam Asmaca API',
    'version' => 'v1',
    'api' => '/api/v1/categories',
]));
