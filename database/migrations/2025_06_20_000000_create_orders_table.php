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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->bigInteger('woocommerce_order_id')->nullable()->unique();
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->string('order_status', 50)->nullable();
            $table->string('invoice_street', 255)->nullable();
            $table->string('invoice_postal_code', 20)->nullable();
            $table->string('invoice_house_number', 50)->nullable();
            $table->string('invoice_city', 100)->nullable();
            $table->string('invoice_country', 100)->nullable();
            $table->string('delivery_street', 255)->nullable();
            $table->string('delivery_postal_code', 20)->nullable();
            $table->string('delivery_house_number', 50)->nullable();
            $table->string('delivery_city', 100)->nullable();
            $table->string('delivery_country', 100)->nullable();
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
