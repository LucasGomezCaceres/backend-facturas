const { pool } = require("../models/db");
const { cleanFacturaPayload, validateFacturaPayload } = require("../config/helpers");

async function createFactura(req, res) {
  try {
    const data = cleanFacturaPayload(req.body);
    const errors = validateFacturaPayload(data);

    if (errors.length) {
      return res.status(400).json({ error: errors.join(" ") });
    }

    await pool.query(
      `INSERT INTO facturas (
        factura,
        fecha,
        proveedor,
        rut,
        pedido_compra,
        recepcion_sap,
        salida_sap,
        orden_compra,
        fecha_entrega,
        destino,
        observacion,
        usuario_id,
        usuario_correo
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      )`,
      [
        data.factura,
        data.fecha,
        data.proveedor,
        data.rut,
        data.pedido_compra,
        data.recepcion_sap,
        data.salida_sap,
        data.orden_compra,
        data.fecha_entrega,
        data.destino,
        data.observacion,
        req.user.id,
        req.user.correo
      ]
    );

    res.status(201).json({ ok: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar factura." });
  }
}

async function getFacturas(req, res) {
  try {
    const q = String(req.query.q || "").trim();
    const params = [];
    let where = "";

    if (q) {
      params.push(`%${q.toLowerCase()}%`);

      const qIndex = params.length;

      const searchClause = `
        LOWER(CONCAT_WS(
          ' ',
          factura,
          fecha,
          proveedor,
          rut,
          pedido_compra,
          recepcion_sap,
          salida_sap,
          orden_compra,
          fecha_entrega,
          destino,
          observacion,
          usuario_correo
        )) LIKE $${qIndex}
      `;

      where = `WHERE ${searchClause}`;
    }

    const result = await pool.query(
      `SELECT * FROM facturas ${where} ORDER BY fecha_registro DESC`,
      params
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al buscar facturas."
    });
  }
}

async function getFacturaById(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM facturas WHERE id = $1",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Registro no encontrado."
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al obtener factura."
    });
  }
}

async function updateFactura(req, res) {
  try {
    const current = await pool.query(
      "SELECT * FROM facturas WHERE id = $1",
      [req.params.id]
    );

    if (current.rowCount === 0) {
      return res.status(404).json({
        error: "Registro no encontrado."
      });
    }

    const record = current.rows[0];

    if (
      req.user.rol !== "ADMIN" &&
      record.usuario_id !== req.user.id
    ) {
      return res.status(403).json({
        error: "No tiene permiso para modificar este registro."
      });
    }

    const data = cleanFacturaPayload(req.body);
    const errors = validateFacturaPayload(data);

    if (errors.length) {
      return res.status(400).json({
        error: errors.join(" ")
      });
    }

    await pool.query(
      `UPDATE facturas SET
        factura=$1,
        fecha=$2,
        proveedor=$3,
        rut=$4,
        pedido_compra=$5,
        recepcion_sap=$6,
        salida_sap=$7,
        orden_compra=$8,
        fecha_entrega=$9,
        destino=$10,
        observacion=$11,
        ultima_modificacion=NOW(),
        modificado_por=$12
      WHERE id=$13`,
      [
        data.factura,
        data.fecha,
        data.proveedor,
        data.rut,
        data.pedido_compra,
        data.recepcion_sap,
        data.salida_sap,
        data.orden_compra,
        data.fecha_entrega,
        data.destino,
        data.observacion,
        req.user.correo,
        req.params.id
      ]
    );

    res.json({ ok: true });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al modificar factura."
    });
  }
}

async function deleteFactura(req, res) {
  try {
    await pool.query(
      "DELETE FROM facturas WHERE id = $1",
      [req.params.id]
    );

    res.json({ ok: true });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al eliminar factura."
    });
  }
}

module.exports = {
  createFactura,
  getFacturas,
  getFacturaById,
  updateFactura,
  deleteFactura
};