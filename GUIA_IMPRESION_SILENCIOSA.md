# 🖨️ Guía de Impresión Rápida (Modo Silencioso)

Para que el sistema imprima los tickets **instantáneamente** sin preguntarte cada vez (sin que salga la ventana de "Imprimir"), debes configurar el acceso directo de la aplicación.

Esto se llama **"Kiosk Printing"** y es ideal para Puntos de Venta.

## Paso 1: Instalar la App
1. Abre el sistema en Chrome o Edge.
2. Instala la aplicación (Click en los 3 puntos > Instalar App).
3. Esto creará un icono en tu escritorio.

## Paso 2: Configurar el Acceso Directo

1. Ve al **Escritorio** de tu PC.
2. Haz **click derecho** sobre el icono de la App (ej. "Sistema Zzif").
3. Selecciona **Propiedades**.
4. Busca la casilla que dice **"Destino"** (Target).
   - Verás algo largo como: `"C:\Program Files\Google\Chrome\..." --app-id=...`
5. **AL FINAL** de ese texto, agrega un **espacio** y luego este comando:
   
   `--kiosk-printing`

   > **Ojo:** Debe haber un espacio antes de los dos guiones.

   Ejemplo de cómo debería quedar:
   `...chrome_proxy.exe" --app-id=jkedmml... --kiosk-printing`

6. Click en **Aplicar** y **Aceptar**.

## Paso 3: Probar (Importante)
1. **Cierra completamente** la aplicación si estaba abierta.
2. Ábrela usando el icono que acabas de modificar.
3. Intenta reimprimir un ticket.
4. **¡Debería salir directo!** ⚡

## ⚠️ ¿No funciona con "chrome_proxy.exe"? (Solución Definitiva)

Si al agregar el comando sigue saliendo la ventana de impresión, es porque Chrome Proxy ignora esa configuración.

**Solución: Crear Acceso Directo Manual**

1.  **Borra** el acceso directo que no funciona.
2.  Haz click derecho en el Escritorio > **Nuevo** > **Acceso directo**.
3.  En "Escriba la ubicación del elemento", pega esto (ajustando la ruta si es necesario):

    ```
    "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=https://restaurante-app-2-0.vercel.app --kiosk-printing
    ```

    *(Asegúrate de que la URL `https://...` sea la correcta de tu sistema).*

4.  Dale a **Siguiente**, ponle nombre "Caja Zzif" y **Finalizar**.
5.  ¡Listo! Este acceso directo obliga a Chrome a usar el modo silencioso.
