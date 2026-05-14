const ExcelJS = require("exceljs");
const { pool } = require("../models/db");

async function exportCsv(req, res) {
  const result = await pool.query("SELECT * FROM facturas ORDER BY fecha_registro DESC");
  const headers = ["Factura","Fecha","Proveedor","RUT","Pedido compra","Recepcion SAP","Salida SAP","Orden de Compra","Fecha de entrega","Destino","Observacion","Usuario","Fecha Registro","Ultima Modificacion","Modificado Por"];
  const rows = [
    headers.join(";"),
    ...result.rows.map(r => [r.factura,r.fecha,r.proveedor,r.rut,r.pedido_compra,r.recepcion_sap,r.salida_sap,r.orden_compra,r.fecha_entrega,r.destino,r.observacion,r.usuario_correo,r.fecha_registro,r.ultima_modificacion,r.modificado_por]
      .map(v => `"${String(v || "").replace(/"/g, '""')}"`).join(";"))
  ];
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=registros_facturas.csv");
  res.send(rows.join("\n"));
}

async function exportExcel(req, res) {
  const result = await pool.query("SELECT * FROM facturas ORDER BY fecha_registro DESC");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Registros");
  sheet.columns = [
    { header:"Factura", key:"factura", width:18 }, { header:"Fecha", key:"fecha", width:14 },
    { header:"Proveedor", key:"proveedor", width:28 }, { header:"RUT", key:"rut", width:16 },
    { header:"Pedido compra", key:"pedido_compra", width:18 }, { header:"Recepcion SAP", key:"recepcion_sap", width:18 },
    { header:"Salida SAP", key:"salida_sap", width:18 }, { header:"Orden de Compra", key:"orden_compra", width:20 },
    { header:"Fecha entrega", key:"fecha_entrega", width:16 }, { header:"Destino", key:"destino", width:20 },
    { header:"Observacion", key:"observacion", width:30 }, { header:"Usuario", key:"usuario_correo", width:28 },
    { header:"Fecha Registro", key:"fecha_registro", width:22 }, { header:"Ultima Modificacion", key:"ultima_modificacion", width:22 },
    { header:"Modificado Por", key:"modificado_por", width:28 }
  ];
  result.rows.forEach(row => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=registros_facturas.xlsx");
  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { exportCsv, exportExcel };
