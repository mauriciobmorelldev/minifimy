<?php
/**
 * Plugin Name: MiniFimy - Retorno de Mercado Pago
 * Description: Devuelve al cliente al carrito de MiniFimy después de salir del pago en Mercado Pago.
 * Version: 1.0.0
 * Author: MiniFimy
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Minifimy_Mercado_Pago_Return {
    private const CART_URL = 'https://minifimy.com/carrito';

    public static function prepare_cancel_redirect(): void {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET'
            || ($_GET['cancel_order'] ?? '') !== 'true'
            || !is_string($_GET['preference_id'] ?? null)
            || $_GET['preference_id'] === ''
            || !is_string($_GET['order'] ?? null)
            || !is_string($_GET['order_id'] ?? null)
            || !ctype_digit($_GET['order_id'])
            || !is_string($_GET['_wpnonce'] ?? null)
            || !function_exists('wc_get_order')) {
            return;
        }

        $order_id = (int) $_GET['order_id'];
        if (($_GET['external_reference'] ?? '') !== 'WC-' . $order_id) {
            return;
        }

        $order = wc_get_order($order_id);
        if (!$order instanceof WC_Order
            || !in_array($order->get_payment_method(), ['woo-mercado-pago-basic', 'woo-mercado-pago-credits'], true)
            || !hash_equals($order->get_order_key(), wp_unslash($_GET['order']))) {
            return;
        }

        // WooCommerce handles the nonce, permissions and order status at priority 20.
        $_GET['redirect'] = self::CART_URL;
        add_filter('allowed_redirect_hosts', [__CLASS__, 'allow_storefront_host']);
        nocache_headers();
        header('Referrer-Policy: no-referrer');

        // An expired nonce can skip WooCommerce's redirect without changing the order.
        add_action('wp_loaded', [__CLASS__, 'redirect_to_cart'], 21);
    }

    public static function allow_storefront_host(array $hosts): array {
        $hosts[] = 'minifimy.com';
        return $hosts;
    }

    public static function redirect_to_cart(): void {
        if (wp_safe_redirect(self::CART_URL, 302, 'MiniFimy')) {
            exit;
        }
    }
}

add_action('wp_loaded', [Minifimy_Mercado_Pago_Return::class, 'prepare_cancel_redirect'], 19);
