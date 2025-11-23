ALTER TABLE vacancies 
ADD COLUMN currency text NOT NULL DEFAULT 'USD' 
CHECK (currency IN ('USD', 'KZT', 'RUB', 'EUR'));