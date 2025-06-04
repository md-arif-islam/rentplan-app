<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_variations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->bigInteger('woocommerce_variation_id')->nullable()->unique();
            $table->string('variant_name', 255)->nullable();
            $table->string('sku', 100)->nullable()->unique();
            $table->decimal('price', 10, 2)->nullable();
            $table->text('image_url')->nullable();
            $table->text('specifications')->nullable();
            $table->integer('stock')->nullable();
            $table->text('attributes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variations');
    }
};
