REVOKE products_writer FROM products_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA products_schema
  REVOKE SELECT, INSERT, UPDATE ON TABLES FROM products_writer;
REVOKE USAGE ON SCHEMA products_schema FROM products_writer;
