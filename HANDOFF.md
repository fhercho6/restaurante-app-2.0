# 🚀 Estado del Proyecto: Sistema ZZIF (Restaurante App)

## 📅 Fecha: 24 de Enero, 2026
**Tema Actual:** Sistema de Reservas & PWA Fullscreen 📅📱

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
    *   **Reimpresión Mejorada:** Los tickets de comisión reimpresos ahora se titulan **"RECIBO"** (en lugar de "VALE DE GASTO") e incluyen el desglose completo HTML (Ventas, Utilidad, %).
    *   **Adelantos:** Si el pago excede la comisión, se marca claramente como "ADELANTO" en rojo.

6.  **Recibos y Anulaciones:**
    *   **Tickets Anulados:** Al eliminar un pedido pendiente, se imprime automáticamente un ticket con marca de agua "ANULADO", título claro y total tachado para control de inventario.
    *   **Corrección Datos Z:** Se solucionó error donde los productos no aparecían en el detalle del Reporte Z (Carta y Térmico) buscando en la ubicación correcta (`stats.soldProducts`).

7.  **Estabilidad y Correcciones Críticas (Release 2.5):**
    *   **Doble Cobro de Comisiones:** Se corrigió el error en el Cierre de Caja donde las comisiones ya pagadas se descontaban nuevamente del efectivo final. Ahora el sistema detecta pagos previos y solo descuenta lo pendiente.
    *   **Pantalla Blanca en Menú:** Se añadió protección contra productos con datos incompletos que colgaban la app al entrar al Menú Digital.
    *   **Auto-Actualización:** El botón de "Inicio" ahora fuerza una recarga de la página para asegurar que el sistema siempre esté fresco.
    *   **Visibilidad de Servicios:** Se habilitó la categoría "Servicios" para los Garzones en el POS (antes estaba oculta por defecto).
    *   **Simplificación Apertura Caja:** Se eliminó la sección "Equipo Presente" al iniciar turno para agilizar el proceso, ya que no era utilizada.

8.  **Historial de Gastos Avanzado (Filtrado y Reportes):**
    *   **Filtro por Categoría:** Nuevo menú desplegable en el Historial de Gastos para filtrar por tipo (ej. Taxi, Insumos, Hielo).
    *   **Filtro por Personal:** Opción para ver pagos realizados a un garzón específico o gastos creados por él. Ideal para auditoría de sueldos/comisiones.
9.  **Reingeniería del Sistema de Comisiones y Reportes Z (Híbrido):**
    *   **Lógica Híbrida de Comisiones:**
        *   **Combos (8%):** Se detectan automáticamente (búsqueda robusta de "combo") y pagan un 8% fijo sobre la utilidad.
        *   **Estándar (Escalonado):** El resto de productos sigue la tabla de comisiones normal (5% - 8% según meta).
    *   **Corrección de Pagos:** Se solucionó el error donde el bono "Pasaje" se descontaba de la deuda de comisión. Ahora se registran por separado para mantener el saldo de comisiones real.
    *   **Reporte Z (Formato Carta):** Se reestructuró para separar claramente "Gastos Operativos" de "Comisiones y Nómina", facilitando el análisis financiero.
    *   **Vista Previa Mejorada:** Se restauró la vista previa completa en el modal antes de imprimir y se optimizó su tamaño para pantallas grandes.
    *   **Actualización en Tiempo Real:** La ventana de comisiones ahora escucha las ventas al instante (`onSnapshot`), sin necesidad de cerrar y abrir para ver nuevos cálculos.
    *   **Stock Infinito en Combos:** Se corrigió el cálculo de disponibilidad para Combos. Ahora los ingredientes con categoría "Servicios" (ej. Invitación Digital, Decoración) se tratan como stock infinito y no bloquean la venta del combo.
    *   **Seguridad de Dispositivo (Nivel 1):** Se implementó un bloqueo de terminal para Cajeros.
        *   Los cajeros solo pueden ingresar si el dispositivo ha sido "Autorizado" previamente por un Admin (desde Configuración de Impresora).
        *   **Código Maestro:** Se añadió un botón de candado en el Login para autorizar remotamente usando el código `ZZIF2026`.
        *   Esto previene accesos no autorizados desde celulares personales fuera de turno.
    *   **Asistencia Obligatoria (Nivel 2):**
        *   Nueva opción en Configuración para **exigir** que el personal marque entrada antes de poder vender.
        *   Si se activa, el login se bloquea si no hay un registro de asistencia activo para el turno actual.
    *   **Glosa de Apertura:**
        *   Campo opcional al "Iniciar Turno" para dejar notas o observaciones iniciales (ej. falta de cambio, novedades).
        *   Esta nota se imprime y visualiza en el **Reporte Z** (Carta y Térmico).
    *   **Botón de Actualización (Modo Kiosko):**
        *   Botón discreto en esquina superior izquierda para forzar recarga de la app.
        *   Útil para tablets en modo pantalla completa sin acceso a controles del navegador.
    *   **Lógica de Combos Extendida:**
        *   Las categorías "Baldes" y "Paquetes de Cumple" ahora soportan gestión de ingredientes y stock virtual, igual que los "Combos".
    10. **Mejoras Rápidas (Stock y Historial):**
        *   **Stock Infinito en Servicios:** Los productos de categoría "Servicios" (ej. decoración) ahora siempre muestran stock 999 en el POS.
        *   **Glosa en Historial:** La nota de apertura de caja ahora se visualiza en la tabla de "Historial de Turnos" bajo el responsable.
    11. **Modo Público (Web Separada):**
        *   **Parámetro URL:** Al agregar `?mode=public` al final de la URL, la app entra en modo "Solo Clientes".
        *   **Restricciones:** Oculta botones de "Personal" y "Admin", y la barra de estado superior. Ideal para compartir el link en redes sociales.
    12. **Generador de QR Integrado:**
        *   **Nuevo Botón:** En la barra superior (ícono de escaner), permite generar e imprimir un código QR que lleva directamente al modo público del menú.
    13. **Optimización de Carga (Modo Público):**
        *   **Carga Selectiva:** Detecta si el usuario es un cliente (`mode=public`) y evita descargar datos innecesarios (personal, ventas, etc.), reduciendo drásticamente el tiempo de carga y consumo de datos.

    14. **Optimización y Diseño Neón (Web App):**
        *   **Identidad Visual:** Nuevo logo y portada estilo "Cyberpunk/Neón" para modernizar la marca.
        *   **PWA Instalable:** La web ahora permite instalación nativa ("Agregar a Inicio") en Android/iOS con icono personalizado.
        *   **Tailwind Local:** Eliminada dependencia de CDN. Ahora los estilos cargan instantáneamente sin internet.
        *   **SEO Social:** Al compartir el link en WhatsApp/Facebook, aparece una tarjeta profesional con la nueva imagen de portada.

    15. **Sesión: 23 de Enero 2026 (Fixes Críticos & Optimización):**
        *   **Corrección Pago Comisiones:** Se solucionó el `ReferenceError` que impedía pagar comisiones. Ahora el desglose se genera antes de la transacción.
        *   **App Nativa (Standalone):** Se configuró el manifiesto PWA (`display: standalone`) para ocultar la barra de navegación del navegador al instalar la app.
        *   **Seguridad Firebase:** Se implementaron reglas persistentes (`storage.rules` y `firestore.rules`) para proteger la base de datos y evitar el bloqueo de imágenes por caducidad del modo prueba.
        *   **Impresión Instantánea:** Se redujeron los tiempos de espera en `Receipt.jsx` (0.3s -> 0.1s) para impresión ultra-rápida. Se documentó el modo Kiosko en `GUIA_IMPRESION_SILENCIOSA.md`.
        *   **Optimización Imágenes:** Implementación de `ImageWithLoader` con lazy loading y esqueletos de carga (pulse) para evitar que la interfaz se congele al entrar al menú. Pre-conexión a servidores de Google.

    16. **Sesión: 24 de Enero 2026 (Reservas y PWA):**
        *   **Gestión de Reservas:** Nueva pestaña completa para administrar reservas.
            *   **Impresión de Tickets:** Botón en cada reserva para imprimir ticket físico (80mm/58mm) con detalles para la comanda.
            *   **Acceso Global:** Botón de "Reservas" en la barra superior (visible para todo el personal autorizado).
        *   **Botón de Reservas (Landing Page):**
            *   Se añadió un acceso directo discreto en la pantalla de bienvenida (ícono de calendario).
            *   **Protección con PIN:** Al hacer clic, pide la clave `1234` para evitar accesos de clientes curiosos.
        *   **Refinamiento PWA (Pantalla Completa):**
            *   **Modo Fullscreen:** Se activó `display: fullscreen` para ocultar la barra de navegación de Android/Windows Taskbar.
            *   **Botón Toggle:** Se añadió un botón manual (flechas verdes ⤢) en la pantalla de bienvenida para forzar el modo pantalla completa si el navegador no lo hace automáticamente.
            *   **Estética:** Se mantuvo el borde naranja (`theme-color: #f97316`) por preferencia del usuario.
        *   **Corrección Bug Admin:**
            *   **Edición Rápida de Stock:** Se arregló el fallo donde al editar el stock desde la tabla principal no se guardaba o no refrescaba la vista. Ahora usa inputs controlados y feedback de guardado (icono diskette).

    17. **Sesión: 25 de Enero 2026 (Comisiones y Sueldos):**
        *   **Sueldo Base + Comisión:** Se implementó un modelo híbrido para días con baja venta.
            *   **Configuración:** Nuevo toggle "Habilitar Sueldo Base" en la ficha de Personal (Off por defecto).
            *   **Lógica:** Si está activo, el sistema suma `Comisión + Sueldo Diario` al total a pagar.
        *   **Recibos de Comisión Detallados:**
            *   Ahora el ticket de pago incluye una tabla compacta con el **Detalle de Productos Vendidos** por el garzón.
            *   Formato optimizado para impresora térmica (Cant | Prod | Tot).
        *   **Transparencia:** El garzón puede ver exactamente qué vendió y de dónde sale su comisión.

    18. **Sesión: 26 de Enero 2026 (Corrección Comisiones & Tickets):**
        *   **Selector de Garzón en Caja:**
            *   **Problema:** Las "Ventas Rápidas" en Caja se asignaban al Cajero, haciendo que los garzones perdieran su comisión si dictaban el pedido.
            *   **Solución:** Se añadió un menú desplegable **"Atendido Por"** en la ventana de Cobro. Ahora la Cajera puede asignar la venta a "Yoly" (o cualquier otro) antes de cobrar.
        *   **Títulos de Tickets Claros:**
            *   **COMANDA:** Para pedidos enviados a cocina/barra (sin cobrar).
            *   **PAGADO:** Para tickets finales entregados al cliente tras el cobro.
            *   Se eliminó el nombre del negocio del título para dar prioridad al estado del documento.

    19. **Sesión: 26 de Enero 2026 (Separación de Ambientes - Salón/Licobar):**
        *   **Zonificación de Ingresos:**
            *   **Configuración:** En "Gestionar Mesas" ahora se puede asignar cada mesa a una **Zona** ('Salón' o 'Licobar').
            *   **Automático:** Al seleccionar una mesa en el POS, la venta se vincula internamente a esa zona.
        *   **Punto de Venta (POS):**
            *   **Selector Obligatorio:** Se añadió un dropdown de "Mesa" en la comanda. Esto previene ventas "huérfanas" y asegura que todo ingreso tenga una zona asignada.
        *   **Reporte Z Detallado:**
            *   **Desglose por Ambientes:** El cierre de caja ahora incluye una nueva sección **"VENTAS POR ZONA"** que separa cuánto se vendió en Salón vs Licobar.
            *   **Multi-formato:** Disponible tanto en el reporte impreso (térmico) como en la vista previa (carta).
        *   **Corrección de Bugs:**
            *   **ReferenceError:** Se solucionó el error crítico `tableZones is not defined` que impedía cargar la app tras la actualización.
        *   **Glosa de Apertura:**
            *   Ahora se puede ingresar un "Detalle/Nota" (ej: "Lluvia", "Evento") al abrir la caja. Se muestra en el Reporte Z.
        *   **Selección de Zona (Login Meseros):**
            *   Al ingresar con PIN, si el usuario es Mesero/Garzón, el sistema pregunta: **"¿Dónde trabajarás?"** (Salón o Licobar).
            *   El POS filtra automáticamente las mesas para mostrar solo las de esa zona.

    20. **Sesión: 28 de Enero 2026 (Gamificación y Coherencia Financiera):**
        *   **Gamificación de Ventas:**
            *   **Barra de Progreso (Garzón):** Nueva barra amarilla en la parte superior del POS que muestra al garzón cuánto le falta vender para subir de nivel de comisión.
            *   **Monitor en Caja:** El cajero ahora ve esa misma barra de progreso en la lista de "Asistencia", permitiendo monitorear qué tan cerca está cada garzón de su meta.
            *   **Estrella Dorada ⭐:** Icono visual en el menú para productos de alta utilidad (>15Bs ganancia) o Combos, incentivando su venta.
        *   **Sincronización Crítica de Comisiones:**
            *   **Problema:** El Reporte Z calculaba comisiones usando solo porcentajes variables (4-8%), ignorando que los Combos pagan fijo el 8%. Esto subestimaba la deuda real.
            *   **Solución:** Se unificó la lógica matemática entre el Reporte Z y el Módulo de Pagos. Ahora ambos sistemas respetan la regla: **Combos = 8% Fijo** | **Otros = % Variable según Utilidad**.
        *   **Mejoras de Estabilidad (Cajero):**
            *   **Acceso a Historial:** Se habilitaron las pestañas "Historial" y "Gastos" para el perfil Cajero (antes salían en blanco).
            *   **Corrección de Crashes:** Se arreglaron errores `ReferenceError` que cerraban la app al entrar como Cajero o Garzón debido a imports faltantes.
        *   **Zonificación Robusta:**
            *   **Inyección de Zona:** El sistema ahora asegura que la zona operativa del garzón se guarde en `sales` y `z-reports`, arreglando discrepancias en el "Reporte por Ambientes".

    21. **Sesión: 29 de Enero 2026 (Protocolo de Cierre & Asistente):**
        *   **Asistente de Cierre (Closing Wizard):**
            *   **Checklist Obligatorio:** Se delegó la responsabilidad al sistema. Al cerrar caja, aparece un modal con pasos obligatorios (ej. "Apagar Luces", "Alarma"). Solo se puede continuar si se marcan todos.
            *   **Reporte WhatsApp Automático:** Al finalizar el cierre, se genera un link directo a WhatsApp con un resumen financiero formateado (Ventas, Gastos, Efectivo en Mano).
        *   **Refactorización de Configuración:**
            *   **Diseño por Pestañas:** El `BrandingModal` se dividió en "General" y "Checklist Cierre" para mantener el orden.
            *   **Explicaciones Claras:** Se añadieron textos de ayuda (ej. explicar qué hace el "Cierre Automático").
        *   **Correcciones:**
            *   **Borrado de Pagos:** Se arregló el bug donde no se podían eliminar pagos parciales (Efectivo/Tarjeta) en el modal de cobro debido a un ID incorrecto.
            *   **Referencias:** Se solucionaron errores de referencia (`addCategory` vs `handleAddCategory`) introducidos durante refactorizaciones.

    22. **Sesión: 30 de Enero 2026 (Fix Menu Error):**
        *   **Corrección Crítica Menú:** Se solucionó el error de pantalla blanca `ReferenceError: menuItems is not defined` al entrar al Menú Digital.
        *   **Causa:** Referencia a una variable obsoleta tras la refactorización de filtros.
        *   **Solución:** Se reemplazó `menuItems` por `filteredItems` para asegurar que el menú respete la categoría seleccionada y cargue correctamente.
        *   **Refinamiento Menú:** Se ocultaron los items "Invitación Digital" y "Decoración con Globos" de la vista pública (Menú Digital) ya que no se venden por separado.
        *   **Compartir Menú:** Nuevo botón **"COPIAR LINK"** en la ventana de Código QR para compartir fácilmente el enlace del menú público.
        *   **Acceso QR (Landing):** Se añadió el botón de Código QR (Icono Escáner) directamente en la Pantalla de Inicio (Landing Page) para facilitar el acceso rápido sin entrar al sistema.


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
