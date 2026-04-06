CREATE TYPE cash_status AS ENUM (
  'DriverCollected',
  'CustomerCollected',
  'PaidDueByDriver'
);

ALTER TABLE orders ADD COLUMN cash_status cash_status;
