# 🚀 Estado del Proyecto: Sistema ZZIF (Restaurante App)

## 📅 Fecha: 30 de Marzo, 2026
**Estado Actual:** Release 2.9.5 (Precisión Financiera & Multi-QR) 🚀🏦

---

## ✅ Últimos Cambios Realizados (Marzo 30)

1.  **Auditoría y Desglose Multi-QR (Precisión Bancaria):**
    *   **Objetivo:** Erradicar errores de conciliación donde los pagos múltiples por QR se mezclaban en un solo bloque.
    *   **Solución:** Se reconstruyó `PaymentModal.jsx` para inyectar transacciones hijas. El Reporte Z térmico ahora itera sobre `qrPayments` imprimiendo *cada* transferencia como una fila individual, calcando los extractos del banco.

2.  **Protección Anti-Errores en Caja (UX/UI):**
    *   **Bloqueo de Sobrepagos Digitales:** Se erradicó el error de tecleo al cobrar tarjetas o QRs validando estrictamente que `amountToAdd` no supere el saldo deudor. El sistema emite una alerta y auto-corrige el input al faltante real.
    *   **Máscara Inteligente de Tiempo:** El ingreso clásico de tiempo se reemplazó por un Regex en vivo: escribir '1435' formatea automáticamente a '14:35'.
    *   **Botón AHORA:** Atajo visual para que el cajero rellene la hora del dispositivo de inmediato.
    *   **Remoción de Spin Buttons:** Se cambió el input numérico central a `inputMode="decimal"` para destruir las flechas nativas del navegador causantes de descuadres accidentales.

3.  **Gestión de Inventario Robusta:**
    *   Se implementó `ImageWithLoader` en la tabla de inventario administrativo, previniendo visualmente íconos de imágenes rotas causados por URLs huérfanas o errores de carga PWA.

---

## 📌 Histórico de Versiones Anteriores

4.  **Integración de Lector de Códigos de Barras (Staff Login):**
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
    
    16. **Sesión: 23 de Febrero 2026 (Seguridad Crítica de Base de Datos - Opción 2):**
        *   **Vulnerabilidad Resuelta:** Se detectó y parcheó una vulnerabilidad crítica donde la autenticación anónima (`signInAnonymously`) permitía a cualquier persona con el link web (o extraños al restaurante) leer y escribir en todas las colecciones de ventas, gastos y empleados, ignorando la protección visual del PIN.
        *   **Seguridad por Terminal Autorizada:** Se modificaron radicalmente `firestore.rules` y `storage.rules`. Ahora, la base de datos a nivel servidor exige que el dispositivo que intenta leer/escribir datos confidenciales (Ventas, Gastos, Recibos) debe existir en una colección llamada `allowed_terminals`.
        *   **Integración Web:** El botón del "Candadito" (Login) fue modificado para enviar el ID del navegador a la colección `allowed_terminals` si se ingresa el Código Maestro (`ZZIF2026`). Si un usuario de caja o administrador intenta ingresar sin que su terminal esté autorizada, Firebase bloquea el acceso en seco (Data Protection Server-Side).
        *   **Menú Digital Protegido:** Se agregó una excepción expresa en las reglas para permitir que cualquier dispositivo acceda libremente **solo en modo lectura** a las colecciones `menuItems`, `settings`, y `staffMembers`, garantizando que los clientes sigan viendo el QR y los empleados puedan ver sus fotos para el login.
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
        *   **Fix Visibilidad QR:** Se corrigió un error donde el modal del QR no se abría desde la pantalla de inicio porque el componente estaba oculto en esa vista. Se movió a un alcance global.

    23. **Sesión: 02 de Febrero 2026 (Formalización Recibos & Wizard):**
        *   **Cambio de Título:** El ticket de pago de comisiones ahora se titula **"RECIBO"** en lugar de "VALE DE GASTO".
        *   **Glosa Estándar:** Se añadió la leyenda automática **"POR CONCEPTO DE PAGO DE COMISIONES"**.
        *   **Impresión de Protocolo y Nómina:**
            *   **Checklist de Seguridad (Paso 1):** Nuevo botón de impresora en el encabezado. Imprime la lista de tareas (luces, gas, etc.) con casillas para verificación manual y firma.
            *   **Nómina Pendiente (Paso 2):** Botón de impresora en el resumen financiero. Imprime el detalle de sueldos y comisiones para respaldo antes del pago.

    24. **Sesión: 02 de Febrero 2026 (Gestor de Reservas):**
        *   **Agrupación por Fecha:** Las reservas ahora se muestran agrupadas visualmente por fecha.
        *   **Campo Ubicación:** Se añadió el campo **"Ubicación / Mesa"** en el formulario, tarjetas y tickets.
        *   **Campo Adelanto (A cuenta):** Nuevo campo monetario para registrar pagos anticipados.
        *   **Impresión de Lista Diaria:** Botón de impresión por día que incluye la columna de **Ubicación**.
            *   Permite enviar **Recordatorios de WhatsApp** con un clic (mensaje pre-cargado).
            *   Botón **"COPIAR LISTA"** para llevar los números a otra herramienta masiva si es necesario.

    25. **Sesión: 09 de Febrero 2026 (Seguridad & Robustez):**
        *   **Seguridad BD (Critico):** Se restringieron las reglas de Firestore. Ahora TODO es privado excepto `menuItems` y `settings`.
        *   **Pagos de Comisiones Robustos:** Se implementó sistema de Metadatos. Ya no depende del texto del recibo.
        *   **Optimización:** El modal de comisiones reutiliza los datos descargados por la Caja, eliminando lecturas redundantes.
        *   **Historial de Ventas:** Se añadió desglose de totales por medio de pago (QR, Tarjeta, Efectivo) en la cabecera.
        *   **Reservas Mejoradas:**
            *   Ordenamiento cronológico inverso (más recientes primero).
            *   **Orden Manual para Impresión:** Nuevo modal para organizar la lista diaria antes de imprimir.
            *   **Numeración:** Se añadió columna '#' en la lista impresa.
        *   **Módulo de Ahorros (Alcancía):** 
            *   Nuevo panel en Admin para gestionar fondos de reserva de manera visual.
            *   **Formato Inteligente:** Las cifras grandes se abrevian (ej. "40k") para discreción.
            *   **Seguridad:** Acceso restringido exclusivamente a Administradores (oculto para Cajeros).
            *   **Independencia:** Datos aislados que no afectan el Cierre de Caja.
        *   **Corrección UI:**
            *   Se eliminó la pestaña duplicada de "Reservas" que aparecía dos veces en la barra de navegación del Administrador.

    26. **Sesión: 24 de Febrero 2026 (Reporte QR, Conciliación Bancaria y Mejoras de Caja):**
        *   **Registro de Hora Obligatorio (Auditoría):** Al seleccionar el método de pago 'QR', el campo "Referencia" es ahora estrictamente obligatorio. El cajero debe ingresar la hora visible en el comprobante del cliente (ej. `14:35`). Esto previene el auto-rellenado con la hora actual que generaba desfases, mejorando drásticamente la exactitud de la auditoría.
        *   **Soporte para Pagos Múltiples:** La interfaz instruye al cajero a separar con comas las referencias si un solo pedido es pagado con más de un QR (ej. `14:35, 14:40`).
        *   **Nueva Herramienta de Caja "Resumen QR":** Se integró un nuevo botón en el panel de control del Cajero (`CashierView`) diseñado específicamente para agilizar la revisión del banco.
        *   **Ticket de Conciliación:** Al presionar "Resumen QR", el sistema localiza todas las transacciones del turno activo, extrae sub-pagos marcados como `QR` y genera un listado en formato térmico optimizado. Muestra en 3 columnas: la Referencia (hora), el Número de Comanda (`orderId`) y el Monto exacto ingresado, facilitando el chequeo uno a uno en la app del banco.
        *   **Limpieza Automática de Comandas (Hotfix):** El proceso de "Cerrar Caja" ahora escanea y purga la colección `pending_orders` automáticamente de la base de datos al finalizar el día. Esto resuelve un bug donde las comandas no cobradas o abandonadas de un turno anterior reaparecían al abrir un turno nuevo al día siguiente.
        *   **Persistencia de Autorización de Terminal (Hotfix):** Se modificó la función de deslogueo en `AuthContext.jsx`. Anteriormente, apretar "Salir" destruía la sesión de Firebase anónima (`signOut`), lo que causaba que el sistema "olvidara" la autorización de la computadora y volviera a pedir el Código Maestro (`ZZIF2026`). Ahora solo se limpia la sesión del personal, manteniendo la autorización de hardware intacta.
        *   **Glosa de Apertura de Caja Obligatoria y Visible:** Se modificó la vista de Control de Caja (`RegisterControlView.jsx`) para que el campo "Glosa / Observación" sea estrictamente obligatorio al iniciar un turno (ideal para exigir la fecha, ej. "Turno Mañana 27/02/2026"). Además, esta glosa se mantiene permanentemente visible en el panel superior izquierdo de la caja mientras dure el turno.
        *   **Glosa en Reporte Z (Corte de Caja):** Se actualizó el formato de impresión principal (`Receipt.jsx`). La Glosa de Apertura ahora se adjunta directamente al nombre de la 'JORNADA' en la cabecera (ej: `JORNADA: TURNO MAÑANA 27/02/2026 - 27/2/2026 al 27/2/2026`), asegurando un registro físico de cómo se recibió el turno para auditorías físicas.

    27. **Sesión: 11 de Marzo 2026 (Correcciones Estructurales y Puesta en Producción):**
        *   **Gestión de Stock en Combos:** El POS y la Vista Web Pública (Menú Digital) ahora leen correctamente la disponibilidad de Combos sin mostrar erróneamente el letrero 'Agotado'.
        *   **Obligatoriedad de Glosa en Caja:** Se hizo obligatorio registrar un detalle/nota al abrir turno para llevar bitácora estricta de incidencias, y esta observación ahora es visible persistentemente en el panel de Caja.
        *   **Prioridad en Ventas por Zona:** Se optimizó `processSale` para que en 'Ventas Rápidas' la ganancia se asigne automáticamente a la zona configurada del cajero/mesero conectado si no hay mesa física designada.
        *   **Fix Crítico: Crash al Cerrar Caja (Firebase Limit):** Se eliminó permanentemente el arreglo expansivo `sessionStats.allSales` del comando de Cierre de Caja para evitar que turnos mayores a 1 o 2 días excedan el límite físico de documentos de Firebase de 1MB, curando el pantallazo blanco y el reporte ciego.
        *   **Recuperación "Sueldo Base 0.00" al Pagar Nóminas:** El motor de cálculo en `ClosingWizard` ahora purga las asistencias múltiples de un mismo turno y extrae el salario de cada garzón interrogando a la matriz maestra `staff` en Tiempo Real para prevenir el pago en 0 a trabajadores históricos y respetar siempre el *salaryEnabled*.
        *   **Flexibilización de Permisos en Alcancía/Ahorros:** Se destituyó el control riguroso de propiedad (Dueños Autentificados) en favor de una validación semántica del Panel, permitiendo a cualquier "Administrador" (por PIN temporal o acceso fijo) revertir las transacciones y re-abonar la caja ahorros sin obstrucción.

    28. **Sesión: 17 de Marzo 2026 (Mejoras en Resumen QR y Prevención de Duplicados):**
        *   **Control de "Doble Clic":** Se bloqueó estructuralmente el doble-envío de pagos en el Modal de Pagos introduciendo estados de carga (`isSubmitting`) tanto para los botones de enviar como para la lectura de teclas rápidas (`Enter`). Esto erradica el bug crítico que duplicaba ingresos en las cuentas cuando la red estaba lenta.
        *   **Validación Estricta de Horarios (QR):** Para contrarrestar errores humanos en conciliación bancaria, el input de Referencia de QR ahora rechaza preventivamente cualquier carácter no numérico y audita de forma rigurosa la coherencia aritmética (solo formato de 24hs Ej: `14:35`), bloqueando el cobro en horas irreales e incitando a la inserción de múltiples horas separadas por comas.
        *   **Rediseño de Reporte Térmico QR:** Se reconstruyó el comprobante fiscal 'Resumen QR' del Cajero. Los pagos han sido re-estructurados algorítmicamente para visualizarse en **orden descendente** (de montos mayores a menores) y ahora adjuntan la fecha original exacta de la orden (Día/Mes), agilizando brutalmente el emparejamiento manual con el estado de cuenta bancario al priorizar remesas fuertes.

    29. **Sesión: 18 de Marzo 2026 (Optimización de Impresión & Seguridad de Sesión):**
        *   **Eco-Print Memory (Anti-Lag):** Se desacopló la creación del pedido de la interfaz de impresión en el POS. Ahora, al presionar 'ENVIAR', el sistema guarda la comanda e inmediatamente libera al garzón retornando a la pantalla de inicio, mientras la impresión se procesa asíncronamente en segundo plano. Esto elimina la espera de 3-5 segundos que ocurría al procesar carritos grandes.
        *   **Modo de Impresión Rápido (China/Epson):** Nuevo switch en 'Configuración de Terminal'. Al activarse, el sistema utiliza un motor de renderizado ultra-ligero (HTML Puro sin CSS complejo) optimizado para procesadores limitados de impresoras térmicas chinas o Epson TM-T20ii, garantizando una salida de papel instantánea.
        *   **Carga de Datos Minimalista:** Se optimizó el objeto de datos enviado al recibo. En lugar de procesar todo el historial, el ticket ahora recibe solo los campos estrictamente necesarios para el papel, reduciendo el overhead de memoria del navegador.
        *   **Seguridad de Acceso (Auto-Lock):** Se implementó un sistema de bloqueo automático por inactividad. Si la caja o terminal no detecta movimiento durante 5 minutos, la pantalla se bloquea exigiendo el PIN nuevamente. Esto protege las sesiones compartidas en tablets y computadoras principales.
        *   **Hardening Anti-Crash:** Se añadieron límites y validaciones en los sumarios de turno para prevenir el error de 1MB de Firebase, asegurando que la app no colapse en días de altísima demanda.

---

## 🎯 Próximos Pasos & Nuevas Prioridades
1. **Auditoría de Stock en Tiempo Real**: Sincronización más agresiva de inventario entre terminales.
2. **Dashboard de Analíticas**: Gráficos de ventas por hora para optimizar personal.
3. **Integración de Pagos Externos**: Explorar API de bancos locales para conciliación automática.

---

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
