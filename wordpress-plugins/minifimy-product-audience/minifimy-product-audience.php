<?php
/**
 * Plugin Name: Minifimy - Público de producto
 * Description: Permite indicar si un producto se muestra en Bebés, Niñas y/o Niños sin cambiar sus categorias de WooCommerce.
 * Version: 1.0.0
 * Author: Minifimy
 * Text Domain: minifimy-product-audience
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Minifimy_Product_Audience {
    private const META_KEY = '_minifimy_audiences';
    private const ALLOWED = [
        'bebes' => 'Bebés',
        'ninas' => 'Niñas',
        'ninos' => 'Niños',
    ];

    public static function init(): void {
        add_action('plugins_loaded', [__CLASS__, 'bootstrap']);
    }

    public static function bootstrap(): void {
        if (!class_exists('WooCommerce')) {
            return;
        }

        add_action('woocommerce_product_options_general_product_data', [__CLASS__, 'render_fields']);
        add_action('woocommerce_admin_process_product_object', [__CLASS__, 'save_fields']);
        add_filter('manage_edit-product_columns', [__CLASS__, 'add_product_column'], 30);
        add_action('manage_product_posts_custom_column', [__CLASS__, 'render_product_column'], 10, 2);
    }

    private static function get_audiences(int $product_id): array {
        $saved = get_post_meta($product_id, self::META_KEY, true);
        if (!is_array($saved)) {
            return [];
        }

        return array_values(array_intersect(array_keys(self::ALLOWED), array_map('sanitize_key', $saved)));
    }

    public static function render_fields(): void {
        global $post;
        if (!$post instanceof WP_Post) {
            return;
        }

        $selected = self::get_audiences((int) $post->ID);
        echo '<div class="options_group">';
        echo '<p class="form-field"><label>Público MiniFimy</label><span class="wrap">';
        foreach (self::ALLOWED as $value => $label) {
            printf(
                '<label style="display:inline-block;margin:0 16px 6px 0"><input type="checkbox" name="minifimy_audiences[]" value="%1$s" %2$s /> %3$s</label>',
                esc_attr($value),
                checked(in_array($value, $selected, true), true, false),
                esc_html($label)
            );
        }
        echo '<span class="description" style="display:block;margin-top:4px">Sirve para separar productos que comparten categoría. Podés marcar mas de una opcion. Si no marcas ninguna, el producto conserva el comportamiento anterior segun sus talles.</span>';
        echo '</span></p></div>';
    }

    public static function save_fields($product): void {
        if (!$product instanceof WC_Product || !current_user_can('edit_product', $product->get_id())) {
            return;
        }

        $posted = isset($_POST['minifimy_audiences']) && is_array($_POST['minifimy_audiences'])
            ? array_map('sanitize_key', wp_unslash($_POST['minifimy_audiences']))
            : [];
        $audiences = array_values(array_intersect(array_keys(self::ALLOWED), $posted));

        if ($audiences) {
            $product->update_meta_data(self::META_KEY, $audiences);
        } else {
            $product->delete_meta_data(self::META_KEY);
        }
    }

    public static function add_product_column(array $columns): array {
        $columns['minifimy_audience'] = 'Público MiniFimy';
        return $columns;
    }

    public static function render_product_column(string $column, int $product_id): void {
        if ($column !== 'minifimy_audience') {
            return;
        }

        $labels = array_map(
            static fn(string $value): string => self::ALLOWED[$value] ?? $value,
            self::get_audiences($product_id)
        );
        echo $labels ? esc_html(implode(', ', $labels)) : '<span aria-label="Sin restricción">Todas</span>';
    }
}

Minifimy_Product_Audience::init();
