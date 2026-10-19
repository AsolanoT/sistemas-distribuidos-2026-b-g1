ALTER TABLE products_schema.stock_adjustment
    DROP CONSTRAINT ck_stock_adjustment_stock_after_non_negative;

ALTER TABLE products_schema.stock_adjustment
    DROP COLUMN stock_after;
