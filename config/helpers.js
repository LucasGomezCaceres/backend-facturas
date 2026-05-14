function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""));
}

function cleanFacturaPayload(body) {
  return {
    factura: String(body.factura || "").trim(),
    fecha: body.fecha || null,
    proveedor: String(body.proveedor || "").trim(),
    rut: String(body.rut || "").trim(),
    pedido_compra: String(body.pedido_compra || "").trim(),
    recepcion_sap: String(body.recepcion_sap || "").trim(),
    salida_sap: String(body.salida_sap || "").trim(),
    orden_compra: String(body.orden_compra || "").trim(),
    fecha_entrega: body.fecha_entrega || null,
    destino: String(body.destino || "").trim(),
    observacion: String(body.observacion || "").trim()
  };
}

function validateFacturaPayload(data) {
  const errors = [];
  if (!data.factura) errors.push("Debe ingresar la factura.");
  if (!data.fecha) errors.push("Debe ingresar la fecha.");
  if (!data.proveedor) errors.push("Debe ingresar el proveedor.");
  if (!data.rut) errors.push("Debe ingresar el RUT.");
  if (!data.destino) errors.push("Debe ingresar el destino.");
  return errors;
}

module.exports = { normalizeEmail, validateEmail, cleanFacturaPayload, validateFacturaPayload };
