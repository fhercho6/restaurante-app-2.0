# 🚀 Estado del Proyecto: Sistema ZZIF (Restaurante App)

## 📅 Fecha: 05 de Enero, 2026
**Tema Actual:** Correcciones de Reportes y Comisiones 🧾💰

---

## ✅ Últimos Cambios Realizados

1.  **Integración de Lector de Códigos de Barras (Staff Login):**
    *   **Objetivo:** Permitir login inmediato escaneando la credencial con lector láser (no QR).
    *   **Solución:** Code 128, 6 caracteres, ancho de barra 1.2 "Anti-Sangrado ID".

2.  **Arreglo de Subida de Imágenes y Listas:**
    *   Corrección de `storageBucket`.
    *   Fotos en lista de productos y personal.

3.  **Control de Asistencia y Temática:**
    *   Gestión manual de marcas y eliminación de errores.
    *   Temática Año Nuevo 2026 (Dorado/Negro).

4.  **Corrección Reporte Z y Tickets:**
    *   **Detalle de Productos:** Se arregló la visualización de productos vendidos en el Corte Z (antes salía vacío o solo totales), corrigiendo el mapeo de `qty` vs `qtySold`.
    *   **Nombre de Cajero:** Ahora muestra el nombre real del usuario (ej. "Tania Campos") en lugar de un genérico "Caja".
    *   **Formato Térmico:** Se limpiaron tags HTML malformados que causaban que el ticket saliera como código fuente.
    *   **Vista Previa:** Ajustada al 90% y alineada arriba (`items-start`) para evitar que el encabezado se corte en pantallas de laptop.

5.  **Sistema de Pago de Comisiones (Optimizado):**
    *   **Lógica Anti-Duplicados:** El sistema ahora verifica en la base de datos (gastos del turno) cuánto se ha pagado ya a cada mesero.
        *   Si ya se pagó todo: El botón dice "AL DÍA" (Verde).
        *   Si falta pagar: El botón dice "PAGAR [Monto Restante]".
    *   **Reactividad:** La ventana de comisiones se actualiza en tiempo real si ocurren ventas nuevas mientras está abierta.
    *   **Recibo Detallado:** El ticket de pago de comisión ahora incluye:
        *   Nombre del Garzón ("Atiende").
        *   Ventas Totales del Garzón.
        *   Utilidad Base calculada.
        *   Porcentaje de Comisión aplicado.
        *   Fecha y Cajero Responsable.
    *   **Reimpresión:** Se añadió la opción de reimprimir tickets de pago de comisión desde el historial del turno actual.
    *   **Adelantos:** Si el pago excede la comisión, se marca claramente como "ADELANTO" en rojo.

6.  **Recibos y Anulaciones:**
    *   **Tickets Anulados:** Al eliminar un pedido pendiente, se imprime automáticamente un ticket con marca de agua "ANULADO", título claro y total tachado para control de inventario.
    *   **Corrección Datos Z:** Se solucionó error donde los productos no aparecían en el detalle del Reporte Z (Carta y Térmico) buscando en la ubicación correcta (`stats.soldProducts`).

7.  **Estabilidad y Correcciones Críticas (Release 2.5):**
    *   **Doble Cobro de Comisiones:** Se corrigió el error en el Cierre de Caja donde las comisiones ya pagadas se descontaban nuevamente del efectivo final. Ahora el sistema detecta pagos previos y solo descuenta lo pendiente.
    *   **Pantalla Blanca en Menú:** Se añadió protección contra productos con datos incompletos que colgaban la app al entrar al Menú Digital.
    *   **Auto-Actualización:** El botón de "Inicio" ahora fuerza una recarga de la página para asegurar que el sistema siempre esté fresco.
    *   **Visibilidad de Servicios:** Se habilitó la categoría "Servicios" para los Garzones en el POS (antes estaba oculta por defecto).

---

## 🛠️ Instrucciones para la Nueva PC
(Mantener igual que versiones anteriores)
1. Instalar Node.js v18+.
2. `npm install`
3. `npm run dev`

## 📝 Notas para el Asistente (IA)
*   **Reportes:** La lógica de reportes Z es delicada en `RegisterContext.jsx` y `Receipt.jsx`. Usar `qtySold` para ventas consolidadas. Verificar siempre `stats.soldProducts` o `data.soldProducts`.
*   **Comisiones:** Dependen de `sessionStats.expensesList` para calcular saldos pendientes. NO usar estado local para trackear pagos.
*   **Impresión:** Usar siempre `window.open` con parámetros sin espacios (`height=600,width=400`). El modo "Void" usa estilos específicos en `Receipt.jsx`.

## 🛡️ Workflow de Desarrollo Recomendado (Anti-Roturas)
Para evitar errores en producción ("en vivo"), sigue este flujo:

1.  **NUNCA editar `main` directamente.** `main` es sagrado.
2.  **Crear RAMA para cada cambio:**
    *   `git checkout -b feature/nueva-cosa`
3.  **Probar en Local:** Hacer los cambios y probar que todo funcione.
4.  **Fusionar a Main:** Solo cuando estés 100% seguro.
    *   `git checkout main`
    *   `git merge feature/nueva-cosa`
    *   `git push origin main`
5.  **Desplegar:** Ir a la PC de Caja y hacer `git pull`.
