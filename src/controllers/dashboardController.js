import pool from "../config/db.js";

export const getStats = async (req, res) => {
  try {
    // 1. Especies (Pie Chart)
    const speciesQuery = `
      SELECT s.name as category, COUNT(p.patient_id)::int as value
      FROM "Patients" p
      JOIN "Species" s ON s.species_id = p.species_id
      GROUP BY s.name
    `;
    const speciesResult = await pool.query(speciesQuery);

    // 2. Ventas Mensuales (Outer Pie)
    const monthlySalesQuery = `
      SELECT TO_CHAR(date, 'Month') as category, SUM(amount)::float as value
      FROM "Sales"
      GROUP BY TO_CHAR(date, 'Month'), EXTRACT(MONTH FROM date)
      ORDER BY EXTRACT(MONTH FROM date)
    `;
    const monthlySalesResult = await pool.query(monthlySalesQuery);

    // 3. Ventas por Origen (Inner Pie: Sucursal vs Online)
    // Sales = Sucursal, Orders = Online
    const sucursalTotalQuery = 'SELECT COALESCE(SUM(amount), 0)::float as value FROM "Sales"';
    const onlineTotalQuery = 'SELECT COALESCE(SUM(total), 0)::float as value FROM "Orders"';
    
    const sucursalRes = await pool.query(sucursalTotalQuery);
    const onlineRes = await pool.query(onlineTotalQuery);

    const sourceSales = [
      { category: "Sucursal", value: sucursalRes.rows[0].value },
      { category: "Online", value: onlineRes.rows[0].value }
    ];

    // 4. Top Productos (XY Chart / Candlestick)
    // Usaremos Conceptos (price, cost) y Sales para determinar movimiento
    const productsQuery = `
      SELECT 
        c.name as product, 
        c.cost::float as open, 
        c.price::float as close,
        (c.cost * 0.95)::float as low,
        (c.price * 1.05)::float as high
      FROM "Concepts" c
      JOIN "Products" p ON p.concept_id = c.concept_id
      WHERE p.active = true
      LIMIT 10
    `;
    const productsResult = await pool.query(productsQuery);

    // 5. Métricas Generales (Cards)
    const todaySalesQuery = 'SELECT COALESCE(SUM(amount), 0)::float as value FROM "Sales" WHERE date::date = CURRENT_DATE';
    const totalClientsQuery = 'SELECT COUNT(*)::int as value FROM "Clients"';
    const totalPatientsQuery = 'SELECT COUNT(*)::int as value FROM "Patients"';

    const [todaySalesRes, totalClientsRes, totalPatientsRes] = await Promise.all([
      pool.query(todaySalesQuery),
      pool.query(totalClientsQuery),
      pool.query(totalPatientsQuery)
    ]);

    res.json({
      species: speciesResult.rows,
      monthlySales: monthlySalesResult.rows,
      sourceSales: sourceSales,
      topProducts: productsResult.rows,
      metrics: {
        todaySales: todaySalesRes.rows[0].value,
        totalClients: totalClientsRes.rows[0].value,
        totalPatients: totalPatientsRes.rows[0].value
      }
    });
  } catch (error) {
    console.error("Error in getStats:", error);
    res.status(500).json({ error: "Error al obtener estadísticas del dashboard" });
  }
};
