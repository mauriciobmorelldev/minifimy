<?php
/**
 * Plugin Name: MiniFimy - Black Friday 2026
 * Description: Aplica 50% sobre el precio de lista por transferencia o efectivo durante la campaña.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Minifimy_Black_Friday_2026 {
    private const GATEWAYS = ['bacs', 'cod', 'cheque'];
    private static $payment_method = '';

    public static function init(): void {
        $now = time();
        if ($now < strtotime('2026-11-25T18:00:00-03:00') || $now >= strtotime('2026-11-30T00:00:00-03:00')) {
            return;
        }

        $previous_discount = ['Minifimy_Payment_Pricing', 'apply_payment_discount'];
        $priority = has_action('woocommerce_cart_calculate_fees', $previous_discount);
        if ($priority === false || !remove_action('woocommerce_cart_calculate_fees', $previous_discount, $priority)) {
            return;
        }
        add_action('woocommerce_cart_calculate_fees', [__CLASS__, 'discount_cart'], 20);
        add_filter('rest_request_before_callbacks', [__CLASS__, 'remember_checkout_method'], 10, 3);
        add_filter('woocommerce_rest_prepare_product_object', [__CLASS__, 'show_discount_in_api'], 30, 3);
        add_filter('woocommerce_rest_prepare_product_variation_object', [__CLASS__, 'show_discount_in_api'], 30, 3);
        add_filter('option_woocommerce_woo-mercado-pago-basic_settings', [__CLASS__, 'limit_installments']);
    }

    public static function limit_installments($settings) {
        if (is_array($settings)) {
            $settings['installments'] = '6';
        }
        return $settings;
    }

    public static function remember_checkout_method($response, $handler, WP_REST_Request $request) {
        if ($request->get_method() === 'POST' && $request->get_route() === '/wc/store/v1/checkout') {
            $method = $request->get_param('payment_method');
            self::$payment_method = is_string($method) ? sanitize_key($method) : '';
        }
        return $response;
    }

    private static function get_payment_method(): string {
        if (isset($_POST['payment_method']) && is_string($_POST['payment_method'])) {
            return sanitize_key(wp_unslash($_POST['payment_method']));
        }
        if (self::$payment_method !== '') {
            return self::$payment_method;
        }
        return WC()->session ? sanitize_key((string) WC()->session->get('chosen_payment_method')) : '';
    }

    private static function list_price(WC_Product $product): float {
        $stored = (float) $product->get_meta('_minifimy_list_price');
        if ($stored > 0) {
            return $stored;
        }
        $regular = (float) $product->get_regular_price();
        return $regular > 0 ? $regular : (float) $product->get_price();
    }

    private static function transfer_price(float $list): float {
        return round($list / 2, wc_get_price_decimals(), PHP_ROUND_HALF_UP);
    }

    public static function discount_cart(WC_Cart $cart): void {
        if (!in_array(self::get_payment_method(), self::GATEWAYS, true)) {
            return;
        }

        $discount = 0.0;
        foreach ($cart->get_cart() as $item) {
            $product = $item['data'] ?? null;
            if (!$product instanceof WC_Product) {
                continue;
            }
            $list = self::list_price($product);
            $charged = (float) $product->get_price();
            $discount += max(0, $charged - self::transfer_price($list)) * (int) $item['quantity'];
        }
        if ($discount > 0) {
            $cart->add_fee('Black Friday · 50% por transferencia/efectivo', -$discount, false);
        }
    }

    public static function show_discount_in_api($response, $product, $request) {
        if (!$product instanceof WC_Product || !$response instanceof WP_REST_Response) {
            return $response;
        }
        $list = self::list_price($product);
        if ($list > 0) {
            $transfer = self::transfer_price($list);
            $response->data['minifimy_prices'] = [
                'list_price' => $list,
                'discount_price' => $transfer,
                'discount_amount' => $list - $transfer,
                'discount_percent' => 50,
                'discount_gateway_ids' => self::GATEWAYS,
                'list_label' => 'Precio',
                'discount_label' => 'Transferencia o efectivo',
            ];
        }
        return $response;
    }
}

add_action('woocommerce_init', ['Minifimy_Black_Friday_2026', 'init']);
