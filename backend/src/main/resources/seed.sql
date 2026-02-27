-- Seed data matching original Next.js/NestJS app
-- All passwords: password123 (bcrypt hash with 12 rounds)
-- pragma: allowlist secret

BEGIN;

-- Clear existing data in correct order
DELETE FROM application_notes;
DELETE FROM status_histories;
DELETE FROM documents;
DELETE FROM financial_infos;
DELETE FROM vehicles;
DELETE FROM addresses;
DELETE FROM api_keys;
DELETE FROM applications;
DELETE FROM jwt_denylists;
DELETE FROM security_audit_logs;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE applications_id_seq RESTART WITH 1;
ALTER SEQUENCE vehicles_id_seq RESTART WITH 1;
ALTER SEQUENCE addresses_id_seq RESTART WITH 1;
ALTER SEQUENCE financial_infos_id_seq RESTART WITH 1;

-- BCrypt hash of 'password123' with 12 rounds
-- $2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u

-- ============ USERS ============
-- Customers
INSERT INTO users (id, email, encrypted_password, first_name, last_name, phone, role, failed_attempts, sign_in_count, confirmed_at, created_at, updated_at) VALUES
(1,  'tiffany.chen@example.com',        '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Tiffany',   'Chen',       '714-555-1001', 'CUSTOMER', 0, 0, NOW(), NOW(), NOW()),
(2,  'joseph.nguyen@example.com',       '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Joseph',    'Nguyen',     '714-555-1002', 'CUSTOMER', 0, 0, NOW(), NOW(), NOW()),
(3,  'hai.pham@example.com',            '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Hai',       'Pham',       '714-555-1003', 'CUSTOMER', 0, 0, NOW(), NOW(), NOW()),
(4,  'vivian.nguyen@example.com',       '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Vivian',    'Nguyen',     '714-555-1004', 'CUSTOMER', 0, 0, NOW(), NOW(), NOW()),
(5,  'jason.hart@example.com',          '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Jason',     'Hart',       '714-555-1005', 'CUSTOMER', 0, 0, NOW(), NOW(), NOW()),
(6,  'ltphongssvn@gmail.com',           '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Phong',     'Le',         '714-555-9999', 'CUSTOMER', 0, 0, NOW(), NOW(), NOW()),
(7,  'dijali@gmail.com',                '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Dijali',    'Test',       '714-555-9998', 'CUSTOMER', 0, 0, NOW(), NOW(), NOW()),
(8,  'elena.bychenkova@gmail.com',      '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Elena',     'Bychenkova', '714-555-9997', 'CUSTOMER', 0, 0, NOW(), NOW(), NOW()),
(9,  'tuladhar.shuveksha@gmail.com',    '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Shuveksha', 'Tuladhar',   '714-555-9996', 'CUSTOMER', 0, 0, NOW(), NOW(), NOW()),
(10, 'verafes@gmail.com',               '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Vera',      'Fes',        '714-555-9995', 'CUSTOMER', 0, 0, NOW(), NOW(), NOW()),
(11, 'gabhalley@gmail.com',             '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Gab',       'Halley',     '714-555-9994', 'CUSTOMER', 0, 0, NOW(), NOW(), NOW()),
-- Staff
(12, 'officer@example.com',             '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Thuy',      'Nguyen',     '714-555-2001', 'LOAN_OFFICER', 0, 0, NOW(), NOW(), NOW()),
(13, 'underwriter@example.com',         '$2b$12$D2S/StgaUszDHyA2vDson.N0ep55TeFhyZDZfvv0efiQ2e9R7RV0u', 'Loi',       'Luu',        '714-555-3001', 'UNDERWRITER',  0, 0, NOW(), NOW(), NOW());

SELECT setval('users_id_seq', 13);

-- ============ APPLICATIONS ============
-- 1. Tiffany - Draft
INSERT INTO applications (id, user_id, status, current_step, application_number, dob, ssn_encrypted, created_at, updated_at) VALUES
(1, 1, 'DRAFT', 2, 'AL-0001', '1988-03-15', '123-45-6789', NOW(), NOW());

-- 2. Joseph - Submitted
INSERT INTO applications (id, user_id, status, current_step, application_number, dob, ssn_encrypted, loan_amount, down_payment, loan_term, interest_rate, monthly_payment, submitted_at, created_at, updated_at) VALUES
(2, 2, 'SUBMITTED', 5, 'AL-0002', '1985-07-22', '234-56-7890', 30000.00, 5000.00, 48, 5.90, 573.62, NOW(), NOW(), NOW());

-- 3. Hai - Under Review
INSERT INTO applications (id, user_id, status, current_step, application_number, dob, ssn_encrypted, loan_amount, down_payment, loan_term, interest_rate, monthly_payment, submitted_at, created_at, updated_at) VALUES
(3, 3, 'UNDER_REVIEW', 5, 'AL-0003', '1990-11-08', '345-67-8901', 42000.00, 6000.00, 60, 6.50, 702.35, NOW() - INTERVAL '2 days', NOW(), NOW());

-- 4. Vivian - Under Review
INSERT INTO applications (id, user_id, status, current_step, application_number, dob, ssn_encrypted, loan_amount, down_payment, loan_term, interest_rate, monthly_payment, submitted_at, created_at, updated_at) VALUES
(4, 4, 'UNDER_REVIEW', 5, 'AL-0004', '1995-04-12', '456-78-9012', 25000.00, 3000.00, 60, 7.90, 449.18, NOW() - INTERVAL '1 day', NOW(), NOW());

-- 5. Jason - Under Review
INSERT INTO applications (id, user_id, status, current_step, application_number, dob, ssn_encrypted, loan_amount, down_payment, loan_term, interest_rate, monthly_payment, submitted_at, created_at, updated_at) VALUES
(5, 5, 'UNDER_REVIEW', 5, 'AL-0005', '1992-09-30', '567-89-0123', 38000.00, 4000.00, 60, 7.50, 693.21, NOW() - INTERVAL '3 days', NOW(), NOW());

-- 6. Joseph - Pending Documents
INSERT INTO applications (id, user_id, status, current_step, application_number, dob, ssn_encrypted, loan_amount, down_payment, loan_term, interest_rate, monthly_payment, submitted_at, created_at, updated_at) VALUES
(6, 2, 'PENDING_DOCUMENTS', 5, 'AL-0006', '1985-07-22', '234-56-7890', 45000.00, 7000.00, 48, 6.90, 913.18, NOW() - INTERVAL '5 days', NOW(), NOW());

-- 7. Hai - Approved
INSERT INTO applications (id, user_id, status, current_step, application_number, dob, ssn_encrypted, loan_amount, down_payment, loan_term, interest_rate, monthly_payment, submitted_at, decided_at, created_at, updated_at) VALUES
(7, 3, 'APPROVED', 5, 'AL-0007', '1990-11-08', '345-67-8901', 32000.00, 6000.00, 60, 6.50, 508.44, NOW() - INTERVAL '7 days', NOW() - INTERVAL '4 days', NOW(), NOW());

-- 8. Tiffany - Approved
INSERT INTO applications (id, user_id, status, current_step, application_number, dob, ssn_encrypted, loan_amount, down_payment, loan_term, interest_rate, monthly_payment, submitted_at, decided_at, created_at, updated_at) VALUES
(8, 1, 'APPROVED', 5, 'AL-0008', '1988-03-15', '123-45-6789', 45000.00, 7000.00, 48, 5.90, 871.25, NOW() - INTERVAL '6 days', NOW() - INTERVAL '3 days', NOW(), NOW());

-- 9. Phong (test user) - Draft
INSERT INTO applications (id, user_id, status, current_step, application_number, dob, ssn_encrypted, created_at, updated_at) VALUES
(9, 6, 'DRAFT', 1, 'AL-0009', '1990-01-15', '999-88-7777', NOW(), NOW());

SELECT setval('applications_id_seq', 9);

-- ============ ADDRESSES ============
INSERT INTO addresses (id, application_id, address_type, street_address, city, state, zip_code, years_at_address, months_at_address, created_at, updated_at) VALUES
(1, 1, 'residential', '15464 Goldenwest St',           'Westminster', 'CA', '92683', 5, 3, NOW(), NOW()),
(2, 2, 'residential', '14571 Magnolia St, Suite 105',  'Westminster', 'CA', '92683', 4, 6, NOW(), NOW()),
(3, 3, 'residential', '9600 Bolsa Ave',                'Westminster', 'CA', '92683', 2, 9, NOW(), NOW()),
(4, 4, 'residential', '8419 Westminster Blvd',         'Westminster', 'CA', '92683', 1, 6, NOW(), NOW()),
(5, 5, 'residential', '15464 Goldenwest St',           'Westminster', 'CA', '92683', 3, 0, NOW(), NOW()),
(6, 6, 'residential', '14571 Magnolia St, Suite 105',  'Westminster', 'CA', '92683', 4, 6, NOW(), NOW()),
(7, 7, 'residential', '9600 Bolsa Ave',                'Westminster', 'CA', '92683', 2, 9, NOW(), NOW()),
(8, 8, 'residential', '15464 Goldenwest St',           'Westminster', 'CA', '92683', 5, 3, NOW(), NOW()),
(9, 9, 'residential', '10000 Bolsa Ave',               'Westminster', 'CA', '92683', 2, 0, NOW(), NOW());

SELECT setval('addresses_id_seq', 9);

-- ============ VEHICLES ============
INSERT INTO vehicles (id, application_id, make, model, vehicle_year, vin, vehicle_condition, estimated_value, mileage, created_at, updated_at) VALUES
(1, 1, 'Toyota', 'Camry',    2024, '4T1BF1FK5GU123456', 'new',       32000.00, 0,     NOW(), NOW()),
(2, 2, 'Honda',  'Accord',   2024, '1HGCV1F34PA012345', 'new',       34000.00, 0,     NOW(), NOW()),
(3, 3, 'Ford',   'F-150',    2024, '1FTFW1E50PFA98765', 'new',       48000.00, 0,     NOW(), NOW()),
(4, 4, 'Honda',  'Civic',    2024, '2HGFC2F59PH567890', 'new',       28000.00, 0,     NOW(), NOW()),
(5, 5, 'Tesla',  'Model 3',  2024, '5YJ3E1EA5PF234567', 'new',       42000.00, 0,     NOW(), NOW()),
(6, 6, 'BMW',    'X3',       2023, '5UXTY5C05N9B12345', 'certified', 52000.00, 0,     NOW(), NOW()),
(7, 7, 'Toyota', 'Tacoma',   2024, '3TMCZ5AN5PM123456', 'new',       38000.00, 0,     NOW(), NOW()),
(8, 8, 'Lexus',  'RX 350',   2024, '2T2HZMDA5PC123456', 'new',       52000.00, 0,     NOW(), NOW()),
(9, 9, 'Honda',  'CR-V',     2024, '7FARW2H59PE000001', 'new',       35000.00, 0,     NOW(), NOW());

SELECT setval('vehicles_id_seq', 9);

-- ============ FINANCIAL INFOS ============
-- App 2: Joseph - Pharmacist
INSERT INTO financial_infos (id, application_id, income_type, employer_name, job_title, employment_status, years_employed, months_employed, annual_income, monthly_income, monthly_expenses, credit_score, other_income, created_at, updated_at) VALUES
(1, 2, 'primary', 'Kindred Hospital Westminster',             'Pharmacist',                   'full_time', 6, 8, 125000.00, 10416.67, 3500.00, 780, 0.00, NOW(), NOW());

-- App 3: Hai - Police Officer
INSERT INTO financial_infos (id, application_id, income_type, employer_name, job_title, employment_status, years_employed, months_employed, annual_income, monthly_income, monthly_expenses, credit_score, other_income, created_at, updated_at) VALUES
(2, 3, 'primary', 'Westminster Police Department',            'Police Officer I',             'full_time', 4, 3, 102000.00, 8500.00,  2800.00, 745, 0.00, NOW(), NOW());

-- App 4: Vivian - CNA
INSERT INTO financial_infos (id, application_id, income_type, employer_name, job_title, employment_status, years_employed, months_employed, annual_income, monthly_income, monthly_expenses, credit_score, other_income, created_at, updated_at) VALUES
(3, 4, 'primary', 'Extended Care Hospital of Westminster',    'Certified Nursing Assistant',  'full_time', 2, 4, 48000.00,  4000.00,  1800.00, 680, 0.00, NOW(), NOW());

-- App 5: Jason - Substitute Teacher
INSERT INTO financial_infos (id, application_id, income_type, employer_name, job_title, employment_status, years_employed, months_employed, annual_income, monthly_income, monthly_expenses, credit_score, other_income, created_at, updated_at) VALUES
(4, 5, 'primary', 'Westminster School District',              'Substitute Teacher',           'part_time', 3, 2, 42000.00,  3500.00,  2000.00, 710, 0.00, NOW(), NOW());

-- App 6: Joseph - Pharmacist (2nd app)
INSERT INTO financial_infos (id, application_id, income_type, employer_name, job_title, employment_status, years_employed, months_employed, annual_income, monthly_income, monthly_expenses, credit_score, other_income, created_at, updated_at) VALUES
(5, 6, 'primary', 'Kindred Hospital Westminster',             'Pharmacist',                   'full_time', 6, 8, 125000.00, 10416.67, 3500.00, 780, 0.00, NOW(), NOW());

-- App 7: Hai - Police Officer (2nd app)
INSERT INTO financial_infos (id, application_id, income_type, employer_name, job_title, employment_status, years_employed, months_employed, annual_income, monthly_income, monthly_expenses, credit_score, other_income, created_at, updated_at) VALUES
(6, 7, 'primary', 'Westminster Police Department',            'Police Officer I',             'full_time', 4, 3, 102000.00, 8500.00,  2800.00, 745, 0.00, NOW(), NOW());

-- App 8: Tiffany - Registered Nurse
INSERT INTO financial_infos (id, application_id, income_type, employer_name, job_title, employment_status, years_employed, months_employed, annual_income, monthly_income, monthly_expenses, credit_score, other_income, created_at, updated_at) VALUES
(7, 8, 'primary', 'Extended Care Hospital of Westminster',    'Registered Nurse',             'full_time', 5, 7, 95000.00,  7916.67,  3200.00, 760, 0.00, NOW(), NOW());

SELECT setval('financial_infos_id_seq', 7);

COMMIT;
