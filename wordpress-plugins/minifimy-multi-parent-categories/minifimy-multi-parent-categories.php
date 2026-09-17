<?php
/**
 * Plugin Name: Minifimy - Padres adicionales de categorías
 * Description: Permite mostrar una subcategoría debajo de dos o más categorías principales sin duplicarla en WooCommerce.
 * Version: 1.0.0
 * Author: Minifimy
 * Text Domain: minifimy-multi-parent-categories
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Minifimy_Multi_Parent_Categories {
    private const META_KEY = '_minifimy_menu_parent_ids';
    private const NONCE_ACTION = 'minifimy_save_menu_parents';
    private const NONCE_FIELD = 'minifimy_menu_parents_nonce';

    public static function init(): void {
        add_action('plugins_loaded', [__CLASS__, 'bootstrap']);
    }

    public static function bootstrap(): void {
        if (!class_exists('WooCommerce')) {
            return;
        }

        add_action('product_cat_add_form_fields', [__CLASS__, 'render_add_field']);
        add_action('product_cat_edit_form_fields', [__CLASS__, 'render_edit_field'], 10, 2);
        add_action('created_product_cat', [__CLASS__, 'save_fields']);
        add_action('edited_product_cat', [__CLASS__, 'save_fields']);

        add_filter('manage_edit-product_cat_columns', [__CLASS__, 'add_category_column']);
        add_filter('manage_product_cat_custom_column', [__CLASS__, 'render_category_column'], 10, 3);

        add_filter('woocommerce_rest_prepare_product_cat', [__CLASS__, 'add_rest_data'], 10, 3);
    }

    private static function get_parent_ids(int $term_id): array {
        $saved = get_term_meta($term_id, self::META_KEY, true);
        if (!is_array($saved)) {
            return [];
        }

        return array_values(array_unique(array_filter(array_map('absint', $saved))));
    }

    private static function get_parent_terms(int $term_id): array {
        $parent_ids = self::get_parent_ids($term_id);
        if (!$parent_ids) {
            return [];
        }

        $terms = get_terms([
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
            'include' => $parent_ids,
            'orderby' => 'include',
        ]);

        return is_wp_error($terms) ? [] : $terms;
    }

    private static function get_available_parents(int $exclude_id = 0, int $canonical_parent_id = 0): array {
        $exclude = array_values(array_filter([$exclude_id, $canonical_parent_id]));
        $terms = get_terms([
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
            'parent' => 0,
            'exclude' => $exclude,
            'orderby' => 'name',
            'order' => 'ASC',
        ]);

        return is_wp_error($terms) ? [] : $terms;
    }

    private static function render_checkboxes(array $terms, array $selected): void {
        if (!$terms) {
            echo '<span class="description">Primero creá las categorías principales que quieras usar.</span>';
            return;
        }

        foreach ($terms as $term) {
            printf(
                '<label style="display:block;margin:0 0 7px"><input type="checkbox" name="minifimy_menu_parent_ids[]" value="%1$d" %2$s /> %3$s</label>',
                (int) $term->term_id,
                checked(in_array((int) $term->term_id, $selected, true), true, false),
                esc_html($term->name)
            );
        }

        echo '<p class="description">La categoría conserva su padre de WooCommerce y también aparecerá dentro de las secciones elegidas. Podés marcar más de una.</p>';
    }

    public static function render_add_field(): void {
        wp_nonce_field(self::NONCE_ACTION, self::NONCE_FIELD);
        echo '<div class="form-field term-minifimy-menu-parents-wrap">';
        echo '<label>Secciones padre adicionales</label>';
        self::render_checkboxes(self::get_available_parents(), []);
        echo '</div>';
    }

    public static function render_edit_field(WP_Term $term): void {
        wp_nonce_field(self::NONCE_ACTION, self::NONCE_FIELD);
        echo '<tr class="form-field term-minifimy-menu-parents-wrap">';
        echo '<th scope="row"><label>Secciones padre adicionales</label></th><td>';
        self::render_checkboxes(
            self::get_available_parents((int) $term->term_id, (int) $term->parent),
            self::get_parent_ids((int) $term->term_id)
        );
        echo '</td></tr>';
    }

    public static function save_fields(int $term_id): void {
        if (
            !current_user_can('manage_product_terms') ||
            !isset($_POST[self::NONCE_FIELD]) ||
            !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST[self::NONCE_FIELD])), self::NONCE_ACTION)
        ) {
            return;
        }

        $posted = isset($_POST['minifimy_menu_parent_ids']) && is_array($_POST['minifimy_menu_parent_ids'])
            ? array_values(array_unique(array_filter(array_map('absint', wp_unslash($_POST['minifimy_menu_parent_ids'])))))
            : [];

        $valid_ids = [];
        if ($posted) {
            $terms = get_terms([
                'taxonomy' => 'product_cat',
                'hide_empty' => false,
                'parent' => 0,
                'include' => $posted,
                'fields' => 'ids',
            ]);
            if (!is_wp_error($terms)) {
                $valid_ids = array_values(array_filter(array_map('absint', $terms), static fn(int $id): bool => $id !== $term_id));
            }
        }

        if ($valid_ids) {
            update_term_meta($term_id, self::META_KEY, $valid_ids);
        } else {
            delete_term_meta($term_id, self::META_KEY);
        }
    }

    public static function add_category_column(array $columns): array {
        $columns['minifimy_menu_parents'] = 'Padres adicionales';
        return $columns;
    }

    public static function render_category_column(string $content, string $column, int $term_id): string {
        if ($column !== 'minifimy_menu_parents') {
            return $content;
        }

        $names = array_map(static fn(WP_Term $term): string => $term->name, self::get_parent_terms($term_id));
        return $names ? esc_html(implode(', ', $names)) : '—';
    }

    public static function add_rest_data($response, WP_Term $term, $request) {
        if (!$response instanceof WP_REST_Response) {
            return $response;
        }

        $data = $response->get_data();
        $parents = self::get_parent_terms((int) $term->term_id);
        $data['minifimy_parent_slugs'] = array_values(array_map(
            static fn(WP_Term $parent): string => $parent->slug,
            $parents
        ));
        $response->set_data($data);

        return $response;
    }
}

Minifimy_Multi_Parent_Categories::init();
