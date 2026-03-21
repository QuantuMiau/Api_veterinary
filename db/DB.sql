-- ============================================================
-- UNIFIED DATABASE — Veterinary clinic + E-commerce (mobile)
-- ============================================================
-- Notas de arquitectura:
--   • Citas y visitas clínicas se manejan en MongoDB (NoSQL)
--   • patient_id y employee_id son las llaves de integración
--     entre SQL y los documentos MongoDB
-- ============================================================

-- ============================================================
-- 1. TYPES (ENUMS) & TABLES
-- ============================================================

CREATE TYPE employee_role  AS ENUM ('Admin', 'Empleado');
CREATE TYPE order_status   AS ENUM ('Cancelado', 'En Progreso', 'Listo', 'Entregado');
CREATE TYPE payment_method AS ENUM ('Efectivo', 'Credito', 'Transferencia', 'Stripe');
CREATE TYPE sex            AS ENUM ('Macho', 'Hembra');

CREATE TABLE "Categories" (
    category_id  SERIAL PRIMARY KEY,
    name         VARCHAR(20) NOT NULL
);

CREATE TABLE "Subcategories" (
    subcategory_id SERIAL PRIMARY KEY,
    category_id    INT REFERENCES "Categories"(category_id),
    name           VARCHAR(40) NOT NULL
);

CREATE TABLE "Concepts" (
    concept_id SERIAL PRIMARY KEY,
    name       VARCHAR(40) NOT NULL,
    category   VARCHAR(20) NOT NULL,
    cost       NUMERIC(8,2) NOT NULL,
    price      NUMERIC(8,2) NOT NULL
);

CREATE TABLE "Users" (
    user_id     SERIAL PRIMARY KEY,
    first_name  VARCHAR(20),
    last_name   VARCHAR(25),
    mother_name VARCHAR(25),
    email       TEXT UNIQUE,
    phone       VARCHAR(10),
    password    TEXT,
    status      BOOLEAN DEFAULT TRUE
);

CREATE TABLE "Employees" (
    employee_id SERIAL PRIMARY KEY,
    first_name  VARCHAR(20),
    last_name   VARCHAR(25),
    mother_name VARCHAR(25),
    email       TEXT UNIQUE,
    phone       VARCHAR(10),
    password    TEXT,
    role        employee_role DEFAULT 'Empleado' NOT NULL,
    status      BOOLEAN DEFAULT TRUE
);

CREATE TABLE "Clients" (
    client_id   SERIAL PRIMARY KEY,
    first_name  VARCHAR(40) NOT NULL,
    last_name   VARCHAR(30) NOT NULL,
    mother_name VARCHAR(30),
    phone       VARCHAR(10) NOT NULL,
    address     VARCHAR(70),
    city        VARCHAR(30)
);

CREATE TABLE "Species" (
    species_id SERIAL PRIMARY KEY,
    name       VARCHAR(20) NOT NULL
);

CREATE TABLE "Patients" (
    patient_id SERIAL PRIMARY KEY,
    client_id  INT REFERENCES "Clients"(client_id),
    species_id INT REFERENCES "Species"(species_id),
    name       VARCHAR(50) NOT NULL,
    color      VARCHAR(50) NOT NULL,
    breed      VARCHAR(40) NOT NULL,
    sex        sex NOT NULL
);

CREATE TABLE "Products" (
    concept_id     INT PRIMARY KEY REFERENCES "Concepts"(concept_id),
    product_id     VARCHAR(50) UNIQUE NOT NULL,
    description    TEXT,
    category_id    INT REFERENCES "Categories"(category_id),
    subcategory_id INT REFERENCES "Subcategories"(subcategory_id),
    stock          INT DEFAULT 0 NOT NULL,
    image_url      TEXT,
    active         BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE "Services" (
    concept_id   INT PRIMARY KEY REFERENCES "Concepts"(concept_id),
    duration     INTERVAL NOT NULL,
    active       BOOLEAN DEFAULT TRUE NOT NULL,
    service_type VARCHAR(20)
);

CREATE TABLE "Supplies" (
    concept_id INT PRIMARY KEY REFERENCES "Concepts"(concept_id),
    inventory  INT NOT NULL,
    active     BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE "Carts" (
    cart_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES "Users"(user_id)
);

CREATE TABLE "Cart_Details" (
    cart_detail_id SERIAL PRIMARY KEY,
    cart_id        INT REFERENCES "Carts"(cart_id),
    concept_id     INT REFERENCES "Concepts"(concept_id),
    product_id     VARCHAR(50),
    quantity       INT NOT NULL
);

CREATE TABLE "Sales" (
    sale_id        SERIAL PRIMARY KEY,
    employee_id    INT REFERENCES "Employees"(employee_id),
    date           TIMESTAMP DEFAULT NOW() NOT NULL,
    amount         NUMERIC(8,2) NOT NULL,
    payment_method payment_method NOT NULL
);

CREATE TABLE "Sale_Details" (
    sale_detail_id SERIAL PRIMARY KEY,
    sale_id        INT REFERENCES "Sales"(sale_id),
    concept_id     INT REFERENCES "Concepts"(concept_id),
    quantity       INT NOT NULL,
    price          NUMERIC(8,2) NOT NULL
);

CREATE TABLE "Orders" (
    order_id       SERIAL PRIMARY KEY,
    user_id        INT REFERENCES "Users"(user_id),
    order_status   order_status,
    date           TIMESTAMP DEFAULT NOW(),
    total          NUMERIC(10,2),
    payment_method payment_method
);

CREATE TABLE "Order_Details" (
    order_detail_id SERIAL PRIMARY KEY,
    order_id        INT REFERENCES "Orders"(order_id),
    concept_id      INT REFERENCES "Concepts"(concept_id),
    product_id      VARCHAR(50),
    name            TEXT,
    price           NUMERIC(10,2),
    quantity        INT NOT NULL
);

CREATE TABLE "Credits" (
    credit_id SERIAL PRIMARY KEY,
    client_id INT REFERENCES "Clients"(client_id),
    sale_id   INT REFERENCES "Sales"(sale_id),
    date      TIMESTAMP DEFAULT NOW() NOT NULL,
    concept   TEXT NOT NULL,
    balance   NUMERIC(8,2) NOT NULL,
    paid      BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE "Credit_Payments" (
    payment_id SERIAL PRIMARY KEY,
    credit_id  INT REFERENCES "Credits"(credit_id),
    date       TIMESTAMP DEFAULT NOW() NOT NULL,
    amount     NUMERIC(8,2) NOT NULL
);

CREATE TABLE "Stock_Alerts" (
    alert_id   SERIAL PRIMARY KEY,
    concept_id INT REFERENCES "Concepts"(concept_id),
    stock      INT NOT NULL,
    alerted_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 2. FUNCTIONS & PROCEDURES (LOGIC)
-- ============================================================

-- ── General Concepts ────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_new_concept(
    p_name     varchar,
    p_category varchar,
    p_cost     numeric,
    p_price    numeric
) RETURNS INT
LANGUAGE plpgsql AS $$
DECLARE v_id INT;
BEGIN
    INSERT INTO "Concepts" (name, category, cost, price)
    VALUES (p_name, p_category, p_cost, p_price)
    RETURNING concept_id INTO v_id;
    RETURN v_id;
END;
$$;

-- ── Users ──────────────────────────────────────────────────

CREATE OR REPLACE PROCEDURE sp_new_user(
    p_first_name  varchar,
    p_last_name   varchar,
    p_mother_name varchar,
    p_email       text,
    p_phone       varchar,
    p_password    text
)
LANGUAGE plpgsql AS $$
DECLARE v_user_id INT;
BEGIN
    IF EXISTS (SELECT 1 FROM "Users" WHERE email = p_email) THEN
        RAISE EXCEPTION 'El email ya está registrado';
    END IF;
    IF EXISTS (SELECT 1 FROM "Users" WHERE phone = p_phone) THEN
        RAISE EXCEPTION 'El teléfono ya está registrado';
    END IF;
    INSERT INTO "Users" (first_name, last_name, mother_name, email, phone, password)
    VALUES (p_first_name, p_last_name, p_mother_name, p_email, p_phone, p_password)
    RETURNING user_id INTO v_user_id;
    INSERT INTO "Carts" (user_id) VALUES (v_user_id);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_user(
    p_user_id     INT,
    p_first_name  VARCHAR,
    p_last_name   VARCHAR,
    p_mother_name VARCHAR,
    p_email       TEXT,
    p_phone       VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Users" WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'El usuario no existe' USING ERRCODE = 'P0001';
    END IF;
    IF EXISTS (SELECT 1 FROM "Users" WHERE email = p_email AND user_id <> p_user_id) THEN
        RAISE EXCEPTION 'El email ya está registrado' USING ERRCODE = 'P0002';
    END IF;
    IF EXISTS (SELECT 1 FROM "Users" WHERE phone = p_phone AND user_id <> p_user_id) THEN
        RAISE EXCEPTION 'El teléfono ya está registrado' USING ERRCODE = 'P0003';
    END IF;
    UPDATE "Users"
    SET first_name = p_first_name, last_name = p_last_name, mother_name = p_mother_name,
        email = p_email, phone = p_phone
    WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_user_password(p_user_id INT, p_password TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Users" WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'El usuario no existe' USING ERRCODE = 'P0001';
    END IF;
    UPDATE "Users" SET password = p_password WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_delete_user(p_user_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Users" SET status = false WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_login_user(p_email text, p_password text)
RETURNS TABLE(user_id INT, cart_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT u.user_id, ca.cart_id
    FROM "Users" u
    JOIN "Carts" ca ON u.user_id = ca.user_id
    WHERE u.email = p_email AND u.password = p_password AND u.status = true;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_user_by_id(p_user_id INT)
RETURNS TABLE(user_id INT, first_name varchar(20), last_name varchar(25),
              mother_name varchar(25), email text, phone varchar(10), status boolean)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT u.user_id, u.first_name, u.last_name, u.mother_name, u.email, u.phone, u.status
    FROM "Users" u WHERE u.user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_user_by_email(p_email text)
RETURNS TABLE(user_id INT, first_name varchar(20), last_name varchar(25),
              mother_name varchar(25), email text, phone varchar(10), status boolean)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT u.user_id, u.first_name, u.last_name, u.mother_name, u.email, u.phone, u.status
    FROM "Users" u WHERE u.email = p_email;
END;
$$;

-- ── Employees ──────────────────────────────────────────────

CREATE OR REPLACE PROCEDURE sp_new_employee(
    p_first_name  varchar,
    p_last_name   varchar,
    p_mother_name varchar,
    p_email       text,
    p_phone       varchar,
    p_password    text,
    p_role        employee_role DEFAULT 'Empleado'
)
LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Employees" WHERE email = p_email) THEN
        RAISE EXCEPTION 'El email ya está registrado' USING ERRCODE = 'P0001';
    END IF;
    IF EXISTS (SELECT 1 FROM "Employees" WHERE phone = p_phone) THEN
        RAISE EXCEPTION 'El teléfono ya está registrado' USING ERRCODE = 'P0002';
    END IF;
    INSERT INTO "Employees" (first_name, last_name, mother_name, email, phone, password, role)
    VALUES (p_first_name, p_last_name, p_mother_name, p_email, p_phone, p_password, p_role);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_employee(
    p_employee_id INT,
    p_first_name  VARCHAR,
    p_last_name   VARCHAR,
    p_mother_name VARCHAR,
    p_email       TEXT,
    p_phone       VARCHAR,
    p_role        employee_role
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Employees" WHERE employee_id = p_employee_id) THEN
        RAISE EXCEPTION 'El empleado no existe' USING ERRCODE = 'P0001';
    END IF;
    IF EXISTS (SELECT 1 FROM "Employees" WHERE email = p_email AND employee_id <> p_employee_id) THEN
        RAISE EXCEPTION 'El email ya está registrado' USING ERRCODE = 'P0002';
    END IF;
    IF EXISTS (SELECT 1 FROM "Employees" WHERE phone = p_phone AND employee_id <> p_employee_id) THEN
        RAISE EXCEPTION 'El teléfono ya está registrado' USING ERRCODE = 'P0003';
    END IF;
    UPDATE "Employees"
    SET first_name = p_first_name, last_name = p_last_name, mother_name = p_mother_name,
        email = p_email, phone = p_phone, role = p_role
    WHERE employee_id = p_employee_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_employee_password(p_employee_id INT, p_password TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Employees" WHERE employee_id = p_employee_id) THEN
        RAISE EXCEPTION 'El empleado no existe' USING ERRCODE = 'P0001';
    END IF;
    UPDATE "Employees" SET password = p_password WHERE employee_id = p_employee_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_delete_employee(p_employee_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Employees" SET status = false WHERE employee_id = p_employee_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_active_employee(p_employee_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Employees" SET status = true WHERE employee_id = p_employee_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_employee_by_id(p_employee_id INT)
RETURNS TABLE(employee_id INT, first_name varchar(20), last_name varchar(25),
              mother_name varchar(25), email text, phone varchar(10),
              role employee_role, status boolean)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT e.employee_id, e.first_name, e.last_name, e.mother_name,
           e.email, e.phone, e.role, e.status
    FROM "Employees" e WHERE e.employee_id = p_employee_id;
END;
$$;

-- ── Categories & Subcategories ─────────────────────────────

CREATE OR REPLACE PROCEDURE sp_new_category(p_name varchar)
LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Categories" WHERE LOWER(name) = LOWER(p_name)) THEN
        RAISE EXCEPTION 'La categoría ya existe';
    END IF;
    INSERT INTO "Categories" (name) VALUES (p_name);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_new_subcategory(p_category_id INT, p_name varchar)
LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "Subcategories"
        WHERE category_id = p_category_id AND LOWER(name) = LOWER(p_name)
    ) THEN
        RAISE EXCEPTION 'La subcategoría ya existe en esta categoría';
    END IF;
    INSERT INTO "Subcategories" (category_id, name) VALUES (p_category_id, p_name);
END;
$$;

-- ── Products ───────────────────────────────────────────────

CREATE OR REPLACE PROCEDURE sp_new_product(
    p_product_id     varchar,
    p_name           varchar,
    p_description    text,
    p_cost           numeric,
    p_price          numeric,
    p_category_id    INT,
    p_subcategory_id INT,
    p_stock          INT,
    p_image_url      text
)
LANGUAGE plpgsql AS $$
DECLARE v_id INT;
BEGIN
    IF EXISTS (SELECT 1 FROM "Products" WHERE product_id = p_product_id) THEN
        RAISE EXCEPTION 'El product_id ya existe';
    END IF;
    IF EXISTS (SELECT 1 FROM "Concepts" WHERE LOWER(name) = LOWER(p_name)) THEN
        RAISE EXCEPTION 'El nombre de producto ya está registrado';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM "Categories" WHERE category_id = p_category_id) THEN
        RAISE EXCEPTION 'La categoría no existe';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM "Subcategories" WHERE subcategory_id = p_subcategory_id) THEN
        RAISE EXCEPTION 'La subcategoría no existe';
    END IF;
    v_id := fn_new_concept(p_name, 'Product', p_cost, p_price);
    INSERT INTO "Products" (concept_id, product_id, description, category_id, subcategory_id, stock, image_url)
    VALUES (v_id, p_product_id, p_description, p_category_id, p_subcategory_id, p_stock, p_image_url);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_product(
    p_concept_id     INT,
    p_name           TEXT,
    p_description    TEXT,
    p_cost           NUMERIC,
    p_price          NUMERIC,
    p_category_id    INT,
    p_subcategory_id INT,
    p_stock          INT,
    p_image_url      TEXT,
    p_active         BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Concepts"
    SET name = p_name, cost = p_cost, price = p_price
    WHERE concept_id = p_concept_id;
    UPDATE "Products"
    SET description = p_description, category_id = p_category_id,
        subcategory_id = p_subcategory_id, stock = p_stock,
        image_url = p_image_url, active = p_active
    WHERE concept_id = p_concept_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_delete_product(p_concept_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Products" SET active = false WHERE concept_id = p_concept_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_activate_product(p_concept_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Products" SET active = true WHERE concept_id = p_concept_id;
END;
$$;

-- ── Services ───────────────────────────────────────────────

CREATE OR REPLACE PROCEDURE sp_new_service(
    p_name         varchar,
    p_cost         numeric,
    p_price        numeric,
    p_duration     interval,
    p_service_type varchar
)
LANGUAGE plpgsql AS $$
DECLARE v_id INT;
BEGIN
    IF EXISTS (SELECT 1 FROM "Concepts" WHERE LOWER(name) = LOWER(p_name)) THEN
        RAISE EXCEPTION 'El nombre de servicio ya está registrado';
    END IF;
    v_id := fn_new_concept(p_name, 'Service', p_cost, p_price);
    INSERT INTO "Services" (concept_id, duration, service_type) VALUES (v_id, p_duration, p_service_type);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_service(
    p_concept_id   INT,
    p_name         TEXT,
    p_cost         NUMERIC,
    p_price        NUMERIC,
    p_duration     INTERVAL,
    p_active       BOOLEAN,
    p_service_type VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Concepts"
    SET name = p_name, cost = p_cost, price = p_price
    WHERE concept_id = p_concept_id;
    UPDATE "Services"
    SET duration = p_duration, active = p_active, service_type = p_service_type
    WHERE concept_id = p_concept_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_delete_service(p_concept_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Services" SET active = false WHERE concept_id = p_concept_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_activate_service(p_concept_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Services" SET active = true WHERE concept_id = p_concept_id;
END;
$$;

-- ── Supplies ───────────────────────────────────────────────

CREATE OR REPLACE PROCEDURE sp_new_supply(
    p_name      varchar,
    p_cost      numeric,
    p_price     numeric,
    p_inventory INT
)
LANGUAGE plpgsql AS $$
DECLARE v_id INT;
BEGIN
    IF EXISTS (SELECT 1 FROM "Concepts" WHERE LOWER(name) = LOWER(p_name)) THEN
        RAISE EXCEPTION 'El nombre de insumo ya está registrado';
    END IF;
    v_id := fn_new_concept(p_name, 'Supply', p_cost, p_price);
    INSERT INTO "Supplies" (concept_id, inventory) VALUES (v_id, p_inventory);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_supply(
    p_concept_id INT,
    p_name       TEXT,
    p_cost       NUMERIC,
    p_price      NUMERIC,
    p_inventory  INT,
    p_active     BOOLEAN
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Concepts"
    SET name = p_name, cost = p_cost, price = p_price
    WHERE concept_id = p_concept_id;
    UPDATE "Supplies"
    SET inventory = p_inventory, active = p_active
    WHERE concept_id = p_concept_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_delete_supply(p_concept_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Supplies" SET active = false WHERE concept_id = p_concept_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_activate_supply(p_concept_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE "Supplies" SET active = true WHERE concept_id = p_concept_id;
END;
$$;

-- ── Clients & Patients ─────────────────────────────────────

CREATE OR REPLACE PROCEDURE sp_new_client(
    p_first_name  varchar,
    p_last_name   varchar,
    p_mother_name varchar,
    p_phone       varchar,
    p_address     varchar,
    p_city        varchar
)
LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Clients" WHERE phone = p_phone) THEN
        RAISE EXCEPTION 'El teléfono ya está registrado';
    END IF;
    INSERT INTO "Clients" (first_name, last_name, mother_name, phone, address, city)
    VALUES (p_first_name, p_last_name, p_mother_name, p_phone, p_address, p_city);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_client(
    p_client_id   INT,
    p_first_name  varchar,
    p_last_name   varchar,
    p_mother_name varchar,
    p_phone       varchar,
    p_address     varchar,
    p_city        varchar
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Clients" WHERE client_id = p_client_id) THEN
        RAISE EXCEPTION 'El cliente no existe';
    END IF;
    IF EXISTS (SELECT 1 FROM "Clients" WHERE phone = p_phone AND client_id <> p_client_id) THEN
        RAISE EXCEPTION 'El teléfono ya está registrado';
    END IF;
    UPDATE "Clients"
    SET first_name = p_first_name, last_name = p_last_name, mother_name = p_mother_name,
        phone = p_phone, address = p_address, city = p_city
    WHERE client_id = p_client_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_client_by_id(p_client_id INT)
RETURNS TABLE(client_id INT, first_name varchar(40), last_name varchar(30),
              mother_name varchar(30), phone varchar(10), address varchar(70), city varchar(30))
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT cl.client_id, cl.first_name, cl.last_name, cl.mother_name,
           cl.phone, cl.address, cl.city
    FROM "Clients" cl WHERE cl.client_id = p_client_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_new_patient(
    p_client_id  INT,
    p_species_id INT,
    p_name       varchar,
    p_color      varchar,
    p_breed      varchar,
    p_sex        sex
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Clients" WHERE client_id = p_client_id) THEN
        RAISE EXCEPTION 'El cliente no existe';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM "Species" WHERE species_id = p_species_id) THEN
        RAISE EXCEPTION 'La especie no existe';
    END IF;
    INSERT INTO "Patients" (client_id, species_id, name, color, breed, sex)
    VALUES (p_client_id, p_species_id, p_name, p_color, p_breed, p_sex);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_patient(
    p_patient_id INT,
    p_client_id  INT,
    p_species_id INT,
    p_name       varchar,
    p_color      varchar,
    p_breed      varchar,
    p_sex        sex
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Patients" WHERE patient_id = p_patient_id) THEN
        RAISE EXCEPTION 'El paciente no existe';
    END IF;
    UPDATE "Patients"
    SET client_id = p_client_id, species_id = p_species_id, name = p_name,
        color = p_color, breed = p_breed, sex = p_sex
    WHERE patient_id = p_patient_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_patients_by_client(p_client_id INT)
RETURNS TABLE(patient_id INT, patient_name varchar(20), breed varchar(30),
              color varchar(20), sex sex, species varchar(20))
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT p.patient_id, p.name, p.breed, p.color, p.sex, sp.name
    FROM "Patients" p
    JOIN "Species" sp ON sp.species_id = p.species_id
    WHERE p.client_id = p_client_id
    ORDER BY p.patient_id;
END;
$$;

-- ── Carts & Orders ─────────────────────────────────────────

CREATE OR REPLACE PROCEDURE sp_add_to_cart(
    p_cart_id    INT,
    p_concept_id INT,
    p_quantity   INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_stock       INT;
    v_current_qty INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Carts" WHERE cart_id = p_cart_id) THEN
        RAISE EXCEPTION 'El carrito no existe';
    END IF;
    SELECT stock INTO v_stock FROM "Products" WHERE concept_id = p_concept_id;
    IF v_stock IS NULL THEN
        RAISE EXCEPTION 'El producto no existe o no está disponible para venta';
    END IF;
    SELECT quantity INTO v_current_qty
    FROM "Cart_Details" WHERE cart_id = p_cart_id AND concept_id = p_concept_id;
    v_current_qty := COALESCE(v_current_qty, 0);
    IF v_current_qty + p_quantity > v_stock THEN
        RAISE EXCEPTION 'No hay suficiente stock para este producto';
    END IF;
    IF v_current_qty = 0 THEN
        INSERT INTO "Cart_Details" (cart_id, concept_id, product_id, quantity)
        SELECT p_cart_id, p_concept_id, pr.product_id, p_quantity
        FROM "Products" pr WHERE pr.concept_id = p_concept_id;
    ELSE
        UPDATE "Cart_Details"
        SET quantity = quantity + p_quantity
        WHERE cart_id = p_cart_id AND concept_id = p_concept_id;
    END IF;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_remove_from_cart(p_cart_id INT, p_concept_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM "Cart_Details" WHERE cart_id = p_cart_id AND concept_id = p_concept_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_cart_quantity(
    p_cart_id    INT,
    p_concept_id INT,
    p_quantity   INT
)
LANGUAGE plpgsql AS $$
DECLARE v_stock INT;
BEGIN
    SELECT stock INTO v_stock FROM "Products" WHERE concept_id = p_concept_id;
    IF v_stock IS NULL THEN
        RAISE EXCEPTION 'El producto no existe';
    END IF;
    IF p_quantity > v_stock THEN
        RAISE EXCEPTION 'No hay suficiente stock';
    END IF;
    IF p_quantity <= 0 THEN
        DELETE FROM "Cart_Details" WHERE cart_id = p_cart_id AND concept_id = p_concept_id;
    ELSE
        UPDATE "Cart_Details" SET quantity = p_quantity
        WHERE cart_id = p_cart_id AND concept_id = p_concept_id;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_user_cart(p_user_id INT)
RETURNS TABLE(
    cart_id    INT,
    concept_id INT,
    product_id varchar(50),
    name       varchar(40),
    image_url  TEXT,
    price      NUMERIC,
    quantity   INT,
    subtotal   NUMERIC
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Users" WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'El usuario no existe';
    END IF;
    RETURN QUERY
        SELECT cd.cart_id, cd.concept_id, pr.product_id, c.name,
               pr.image_url, c.price, cd.quantity, (c.price * cd.quantity) AS subtotal
        FROM "Cart_Details" cd
        JOIN "Carts"    ca ON ca.cart_id    = cd.cart_id
        JOIN "Concepts"  c ON c.concept_id  = cd.concept_id
        JOIN "Products" pr ON pr.concept_id = cd.concept_id
        WHERE ca.user_id = p_user_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_create_order(
    p_user_id        INT,
    p_payment_method payment_method
)
LANGUAGE plpgsql AS $$
DECLARE
    v_cart_id  INT;
    v_total    NUMERIC;
    v_order_id INT;
BEGIN
    IF p_payment_method = 'Credito' THEN
        RAISE EXCEPTION 'El método de pago Crédito no está disponible en órdenes mobile';
    END IF;
    SELECT cart_id INTO v_cart_id FROM "Carts" WHERE user_id = p_user_id;
    IF v_cart_id IS NULL THEN
        RAISE EXCEPTION 'El usuario no tiene carrito';
    END IF;
    IF EXISTS (
        SELECT 1
        FROM "Cart_Details" cd
        JOIN "Products" pr ON pr.concept_id = cd.concept_id
        WHERE cd.cart_id = v_cart_id AND cd.quantity > pr.stock
        FOR UPDATE
    ) THEN
        RAISE EXCEPTION 'Uno o más productos no tienen stock suficiente';
    END IF;
    SELECT SUM(c.price * cd.quantity) INTO v_total
    FROM "Cart_Details" cd
    JOIN "Concepts" c ON c.concept_id = cd.concept_id
    WHERE cd.cart_id = v_cart_id;
    IF v_total IS NULL THEN
        RAISE EXCEPTION 'El carrito está vacío';
    END IF;
    INSERT INTO "Orders" (user_id, order_status, date, total, payment_method)
    VALUES (p_user_id, 'En Progreso', NOW(), v_total, p_payment_method)
    RETURNING order_id INTO v_order_id;
    INSERT INTO "Order_Details" (order_id, concept_id, product_id, name, price, quantity)
    SELECT v_order_id, c.concept_id, pr.product_id, c.name, c.price, cd.quantity
    FROM "Cart_Details" cd
    JOIN "Concepts"  c  ON c.concept_id  = cd.concept_id
    JOIN "Products"  pr ON pr.concept_id = cd.concept_id
    WHERE cd.cart_id = v_cart_id;
    UPDATE "Products" pr
    SET stock = stock - cd.quantity
    FROM "Cart_Details" cd
    WHERE cd.cart_id = v_cart_id AND pr.concept_id = cd.concept_id;
    DELETE FROM "Cart_Details" WHERE cart_id = v_cart_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_update_order_status(p_order_id INT, p_status order_status)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Orders" WHERE order_id = p_order_id) THEN
        RAISE EXCEPTION 'La orden no existe';
    END IF;
    UPDATE "Orders" SET order_status = p_status WHERE order_id = p_order_id;
END;
$$;

-- ── Sales & Credits ────────────────────────────────────────

CREATE OR REPLACE PROCEDURE sp_new_sale(
    p_employee_id    INT,
    p_client_id      INT,
    p_payment_method payment_method,
    p_items          JSON
)
LANGUAGE plpgsql AS $$
DECLARE
    v_sale_id INT;
    v_total   NUMERIC := 0;
BEGIN
    IF p_payment_method = 'Credito' AND p_client_id IS NULL THEN
        RAISE EXCEPTION 'Se requiere un cliente registrado para ventas a crédito';
    END IF;
    IF p_employee_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM "Employees" WHERE employee_id = p_employee_id AND status = true
    ) THEN
        RAISE EXCEPTION 'El empleado no existe o está inactivo';
    END IF;
    IF p_client_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM "Clients" WHERE client_id = p_client_id
    ) THEN
        RAISE EXCEPTION 'El cliente no existe';
    END IF;
    IF EXISTS (
        SELECT 1
        FROM json_array_elements(p_items) AS item
        JOIN "Products" pr ON pr.concept_id = (item->>'concept_id')::int
        WHERE pr.stock < (item->>'quantity')::int
    ) THEN
        RAISE EXCEPTION 'Uno o más productos no tienen stock suficiente';
    END IF;
    SELECT SUM((item->>'price')::numeric * (item->>'quantity')::int)
    INTO v_total
    FROM json_array_elements(p_items) AS item;
    INSERT INTO "Sales" (employee_id, date, amount, payment_method)
    VALUES (p_employee_id, NOW(), v_total, p_payment_method)
    RETURNING sale_id INTO v_sale_id;
    INSERT INTO "Sale_Details" (sale_id, concept_id, quantity, price)
    SELECT v_sale_id,
           (item->>'concept_id')::int,
           (item->>'quantity')::int,
           (item->>'price')::numeric
    FROM json_array_elements(p_items) AS item;
    UPDATE "Products" pr
    SET stock = stock - (item->>'quantity')::int
    FROM json_array_elements(p_items) AS item
    WHERE pr.concept_id = (item->>'concept_id')::int;
    IF p_payment_method = 'Credito' THEN
        INSERT INTO "Credits" (client_id, sale_id, date, concept, balance, paid)
        SELECT p_client_id, v_sale_id, NOW(),
               STRING_AGG(c.name, ' + ' ORDER BY c.concept_id),
               v_total, false
        FROM json_array_elements(p_items) AS item
        JOIN "Concepts" c ON c.concept_id = (item->>'concept_id')::int;
    END IF;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_add_credit_payment(
    p_credit_id INT,
    p_amount    numeric
)
LANGUAGE plpgsql AS $$
DECLARE
    v_remaining NUMERIC;
BEGIN
    SELECT cr.balance - COALESCE(SUM(cp.amount), 0)
    INTO v_remaining
    FROM "Credits" cr
    LEFT JOIN "Credit_Payments" cp ON cp.credit_id = cr.credit_id
    WHERE cr.credit_id = p_credit_id
    GROUP BY cr.balance;
    IF v_remaining IS NULL THEN
        RAISE EXCEPTION 'El crédito no existe';
    END IF;
    IF v_remaining = 0 THEN
        RAISE EXCEPTION 'Este crédito ya está completamente pagado';
    END IF;
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'El monto del abono debe ser mayor a cero';
    END IF;
    IF p_amount > v_remaining THEN
        RAISE EXCEPTION 'El abono (%) supera el saldo pendiente (%)', p_amount, v_remaining;
    END IF;
    INSERT INTO "Credit_Payments" (credit_id, date, amount)
    VALUES (p_credit_id, NOW(), p_amount);
END;
$$;

-- ============================================================
-- 3. TRIGGERS
-- ============================================================

-- ── Credit Auto-Close ──────────────────────────────────────

CREATE OR REPLACE FUNCTION trg_auto_close_credit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_balance    NUMERIC;
    v_total_paid NUMERIC;
BEGIN
    SELECT balance INTO v_balance FROM "Credits" WHERE credit_id = NEW.credit_id;
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM "Credit_Payments" WHERE credit_id = NEW.credit_id;
    IF v_total_paid >= v_balance THEN
        UPDATE "Credits" SET paid = true WHERE credit_id = NEW.credit_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_credit_payments_auto_close
AFTER INSERT ON "Credit_Payments"
FOR EACH ROW EXECUTE FUNCTION trg_auto_close_credit();

-- ── Subcategory Validation ─────────────────────────────────

CREATE OR REPLACE FUNCTION trg_validate_subcategory()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.category_id IS NOT NULL AND NEW.subcategory_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM "Subcategories"
            WHERE subcategory_id = NEW.subcategory_id
              AND category_id    = NEW.category_id
        ) THEN
            RAISE EXCEPTION 'La subcategoría % no pertenece a la categoría %',
                NEW.subcategory_id, NEW.category_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_validate_subcategory
BEFORE INSERT OR UPDATE OF category_id, subcategory_id ON "Products"
FOR EACH ROW EXECUTE FUNCTION trg_validate_subcategory();

-- ── Stock Management ───────────────────────────────────────

CREATE OR REPLACE FUNCTION trg_prevent_negative_stock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.stock < 0 THEN
        RAISE EXCEPTION 'El stock no puede ser negativo (concept_id %)', NEW.concept_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_no_negative_stock
BEFORE UPDATE OF stock ON "Products"
FOR EACH ROW EXECUTE FUNCTION trg_prevent_negative_stock();

CREATE OR REPLACE FUNCTION trg_low_stock_alert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.stock < 5 AND OLD.stock >= 5 THEN
        INSERT INTO "Stock_Alerts" (concept_id, stock) VALUES (NEW.concept_id, NEW.stock);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_low_stock
AFTER UPDATE OF stock ON "Products"
FOR EACH ROW EXECUTE FUNCTION trg_low_stock_alert();

CREATE OR REPLACE FUNCTION trg_check_stock()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_stock INT;
BEGIN
    SELECT stock INTO v_stock FROM "Products" WHERE concept_id = NEW.concept_id;
    IF NEW.quantity > v_stock THEN
        RAISE EXCEPTION 'Stock insuficiente para concept_id %', NEW.concept_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cart_check_stock
BEFORE INSERT OR UPDATE ON "Cart_Details"
FOR EACH ROW EXECUTE FUNCTION trg_check_stock();

-- ============================================================
-- 4. VIEWS
-- ============================================================

CREATE OR REPLACE VIEW vw_user_data AS
SELECT user_id, first_name, last_name, mother_name, email, phone, status FROM "Users";

CREATE OR REPLACE VIEW vw_employees AS
SELECT employee_id, first_name, last_name, mother_name, email, phone, role, status
FROM "Employees" ORDER BY employee_id;

CREATE OR REPLACE VIEW vw_clients AS
SELECT client_id, first_name, last_name, mother_name, phone, address, city
FROM "Clients" ORDER BY client_id;

CREATE OR REPLACE VIEW vw_patients AS
SELECT p.patient_id, p.name AS patient_name, p.breed, p.color, p.sex,
       sp.name AS species, p.client_id,
       cl.first_name || ' ' || cl.last_name AS owner_name, cl.phone AS owner_phone
FROM "Patients" p
JOIN "Species" sp ON sp.species_id = p.species_id
JOIN "Clients" cl ON cl.client_id  = p.client_id
ORDER BY p.patient_id;

CREATE OR REPLACE VIEW vw_patient_details AS
SELECT
    p.patient_id,
    p.name       AS name,
    p.breed,
    p.color,
    p.sex,
    sp.name      AS species,
    c.client_id,
    TRIM(CONCAT(c.first_name, ' ', c.last_name, ' ', COALESCE(c.mother_name, ''))) AS full_name,
    c.phone,
    c.address,
    c.city
FROM "Patients"  p
JOIN "Clients"   c  ON c.client_id   = p.client_id
JOIN "Species"   sp ON sp.species_id = p.species_id;

CREATE OR REPLACE VIEW vw_products_active AS
SELECT c.concept_id, pr.product_id, c.name, pr.description,
       c.price, pr.stock, pr.image_url, pr.category_id, cat.name AS category
FROM "Products" pr
JOIN "Concepts"        c   ON c.concept_id    = pr.concept_id
LEFT JOIN "Categories" cat ON cat.category_id = pr.category_id
WHERE pr.stock > 0 AND pr.active = true;

CREATE OR REPLACE VIEW vw_product_details AS
SELECT c.concept_id, pr.product_id, c.name, pr.description,
       c.price, c.cost, pr.stock,
       cat.name AS category, sub.name AS subcategory,
       pr.image_url, pr.active, pr.category_id
FROM "Products" pr
JOIN "Concepts"           c   ON c.concept_id       = pr.concept_id
LEFT JOIN "Categories"    cat ON cat.category_id    = pr.category_id
LEFT JOIN "Subcategories" sub ON sub.subcategory_id = pr.subcategory_id;

CREATE OR REPLACE VIEW vw_catalog AS
SELECT
    c.concept_id,
    c.name,
    c.category,
    c.price,
    CASE
        WHEN sv.concept_id IS NOT NULL THEN 'Service'
        WHEN pr.concept_id IS NOT NULL THEN 'Product'
    END AS type,
    sv.duration,
    pr.stock,
    COALESCE(sv.active, pr.active) AS active
FROM "Concepts" c
LEFT JOIN "Services" sv ON sv.concept_id = c.concept_id
LEFT JOIN "Products" pr ON pr.concept_id = c.concept_id
WHERE sv.concept_id IS NOT NULL OR pr.concept_id IS NOT NULL;

CREATE OR REPLACE VIEW vw_services AS
SELECT c.concept_id, c.name, c.cost, c.price, sv.duration, sv.active, sv.service_type
FROM "Services" sv
JOIN "Concepts" c ON c.concept_id = sv.concept_id
ORDER BY c.concept_id;

CREATE OR REPLACE VIEW vw_supplies AS
SELECT c.concept_id, c.name, c.cost, c.price, su.inventory, su.active
FROM "Supplies" su
JOIN "Concepts" c ON c.concept_id = su.concept_id
ORDER BY c.concept_id;

CREATE OR REPLACE VIEW vw_user_orders AS
SELECT DISTINCT ON (o.order_id)
    CONCAT_WS(' ', u.first_name, u.last_name, u.mother_name) AS full_name,
    o.order_id, o.date, o.total, o.order_status, pr.image_url
FROM "Orders" o
JOIN "Order_Details" od ON o.order_id    = od.order_id
JOIN "Users" u ON  o.user_id = u.user_id
LEFT JOIN "Products" pr ON od.concept_id = pr.concept_id
ORDER BY o.order_id DESC;

CREATE OR REPLACE VIEW vw_orders_basic AS
SELECT DISTINCT ON (o.order_id)
    o.user_id,
    o.order_id,
    o.date,
    o.total,
    o.order_status,
    pr.image_url
FROM "Orders" o
JOIN "Order_Details" od ON o.order_id = od.order_id
LEFT JOIN "Products" pr ON od.concept_id = pr.concept_id
ORDER BY o.order_id, o.date DESC;

CREATE OR REPLACE VIEW vw_order_details AS
SELECT o.order_id, o.user_id, 
       CONCAT_WS(' ', u.first_name, u.last_name, u.mother_name) AS full_name,
       o.date, o.order_status, o.payment_method,
       od.order_detail_id, od.concept_id, od.product_id,
       od.name AS product_name, od.price AS product_price,
       od.quantity, (od.price * od.quantity) AS line_total, o.total AS order_total,
       pr.image_url
FROM "Orders" o
JOIN "Order_Details" od ON od.order_id = o.order_id
JOIN "Users" u ON u.user_id = o.user_id
LEFT JOIN "Products" pr ON pr.concept_id = od.concept_id;

CREATE OR REPLACE VIEW vw_sales AS
SELECT s.sale_id, s.employee_id,
       CASE
           WHEN e.employee_id IS NULL THEN 'Sistema'
           ELSE e.first_name || ' ' || e.last_name
       END AS employee_name,
       s.date, s.amount, s.payment_method
FROM "Sales" s
LEFT JOIN "Employees" e ON e.employee_id = s.employee_id
ORDER BY s.sale_id;

CREATE OR REPLACE VIEW vw_sales_by_employee AS
SELECT s.sale_id, s.employee_id,
       e.first_name || ' ' || e.last_name AS employee_name,
       s.date, s.amount, s.payment_method
FROM "Sales" s
JOIN "Employees" e ON e.employee_id = s.employee_id
ORDER BY s.date DESC;

CREATE OR REPLACE VIEW vw_sale_detail AS
SELECT s.sale_id, s.employee_id,
       CASE
           WHEN e.employee_id IS NULL THEN 'Sistema'
           ELSE e.first_name || ' ' || e.last_name
       END AS employee_name,
       s.date, s.amount, s.payment_method,
       sd.sale_detail_id, c.concept_id, c.name AS concept_name,
       sd.quantity, sd.price, (sd.quantity * sd.price) AS subtotal
FROM "Sales" s
LEFT JOIN "Employees"  e  ON e.employee_id = s.employee_id
JOIN "Sale_Details"    sd ON sd.sale_id    = s.sale_id
JOIN "Concepts"         c ON c.concept_id  = sd.concept_id
ORDER BY sd.sale_detail_id;

CREATE OR REPLACE VIEW vw_pending_credits AS
SELECT cr.credit_id, cr.client_id,
       cl.first_name || ' ' || cl.last_name AS client_name,
       cr.sale_id, cr.date, cr.concept,
       cr.balance                               AS original_balance,
       COALESCE(SUM(cp.amount), 0)              AS total_paid,
       cr.balance - COALESCE(SUM(cp.amount), 0) AS remaining,
       cr.paid
FROM "Credits" cr
JOIN "Clients" cl ON cl.client_id = cr.client_id
LEFT JOIN "Credit_Payments" cp ON cp.credit_id = cr.credit_id
GROUP BY cr.credit_id, cl.first_name, cl.last_name;

CREATE OR REPLACE VIEW vw_credit_detail AS
SELECT cr.credit_id, cr.client_id,
       cl.first_name || ' ' || cl.last_name AS client_name,
       cr.sale_id, cr.concept,
       cr.balance AS original_balance,
       COALESCE(SUM(cp.amount) OVER (PARTITION BY cr.credit_id), 0) AS total_paid,
       cr.balance - COALESCE(SUM(cp.amount) OVER (PARTITION BY cr.credit_id), 0) AS remaining,
       cr.paid,
       cp.payment_id, cp.date AS payment_date, cp.amount AS payment_amount
FROM "Credits" cr
JOIN "Clients" cl ON cl.client_id = cr.client_id
LEFT JOIN "Credit_Payments" cp ON cp.credit_id = cr.credit_id
ORDER BY cr.credit_id, cp.date;

CREATE OR REPLACE VIEW vw_credit_payments AS
SELECT cp.payment_id, cp.credit_id, cp.date, cp.amount
FROM "Credit_Payments" cp;

-- ============================================================
-- 5. SEED DATA
-- ============================================================

INSERT INTO "Species" (name) VALUES ('Perro'), ('Gato'), ('Conejo'), ('Ave');

CALL sp_new_category('Alimento');
CALL sp_new_category('Medicina');
CALL sp_new_category('Juguete');
CALL sp_new_category('Accesorios');

CALL sp_new_subcategory(1, 'Húmedo');
CALL sp_new_subcategory(1, 'Seco');
CALL sp_new_subcategory(2, 'Desparasitante');
CALL sp_new_subcategory(2, 'Vitaminas');
CALL sp_new_subcategory(3, 'Pelotas');
CALL sp_new_subcategory(3, 'Interactivos');
CALL sp_new_subcategory(4, 'Collares');
CALL sp_new_subcategory(4, 'Ropa');

CALL sp_new_product('ROU011', 'Royal Canin Urinary 100g',
    'Alimento húmedo premium para gatos pequeños', 570, 950, 1, 2, 30,
    'https://res.cloudinary.com/dwz8hazeu/image/upload/v1773959710/dltbo2ff8wi66ikczueh.jpg');

CALL sp_new_product('MED001', 'Desparasitante Nextgard 7.5kg',
    'Amplio espectro', 72, 120, 2, 3, 50,
    'https://petpaw.mx/cdn/shop/files/MED.jpg?v=1754072797');

CALL sp_new_product('TOY001', 'Pelota Rebotona XLL',
    'Pelota grande resistente', 48, 80, 3, 5, 100,
    'https://res.cloudinary.com/dwz8hazeu/image/upload/v1773958225/gomceeeggbk8agtn3jh7.jpg');

CALL sp_new_service('Consulta general',  120, 250, '00:30:00', 'consulta');
CALL sp_new_service('Baño y corte',      150, 350, '01:30:00', 'estetica');
CALL sp_new_service('Vacunación anual',   80, 180, '00:15:00', 'vacuna');

CALL sp_new_service('Radiografía de Tórax', 400, 800, '00:45:00', 'RX');
CALL sp_new_service('Análisis de Sangre', 300, 600, '00:20:00', 'lab');

CALL sp_new_supply('Guantes de latex (caja)', 45, 0, 20);
CALL sp_new_supply('Jeringa 5ml',             12, 0, 200);

-- pass admin123
INSERT INTO "Employees" (first_name, last_name, mother_name, email, phone, password, role, status)
VALUES ('Admin', 'Sistema', 'General', 'admin@example.com', '0000000000', '$2b$10$i1bBwUxMmlHs3m4OsVuwkehXUziNMclXMuq4DMFy2sJFm6E4IhCU2', 'Administrador', TRUE);
