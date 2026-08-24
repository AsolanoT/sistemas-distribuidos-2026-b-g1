# Mapa de Contextos (Context Map)
## Sistema de Gestión de Ventas — SynkroTech SAS

**Versión:** 1.0
**Fecha:** Agosto 2026

---

## Propósito

Antes de decidir el estilo de arquitectura (ver `adr/adr-001-architecture.md`), este documento identifica los **bounded contexts** (contextos delimitados) del negocio de SynkroTech SAS, en lenguaje de negocio — no a partir de tablas de base de datos — y evalúa, para cada uno, si debe convertirse en un servicio independiente o permanecer junto a otro contexto.

---

## 1. Contextos delimitados identificados

### 1.1 Autenticación y Usuarios

**Qué es:** Gestión de identidad de los usuarios internos del sistema (empleados de SynkroTech SAS: administradores, vendedores, personal de inventario), sus credenciales y sus roles/permisos.

**Por qué es un contexto distinto:** El concepto de "usuario que inicia sesión" no tiene relación de negocio con "cliente que compra". Son dos entidades distintas con ciclos de vida distintos: un usuario se crea al contratar un empleado; un cliente se crea cuando alguien compra por primera vez.

**¿Servicio independiente?** **Sí.**
**Justificación:** Es un contexto transversal — todos los demás contextos dependen de él para autorizar operaciones, pero él no depende de ninguno. Aislarlo evita que la lógica de seguridad se duplique o se acople al dominio de Clientes.

---

### 1.2 Clientes

**Qué es:** Información de los clientes de SynkroTech SAS: datos de contacto, historial de que existan como entidad para asociarlos a ventas.

**Por qué es un contexto distinto:** Su ciclo de vida y sus reglas de negocio (validar documento de identidad, evitar duplicados, desactivar en vez de eliminar) son propias, y no dependen de cómo se gestionan productos o ventas.

**¿Servicio independiente?** **Sí.**
**Justificación:** Bajo acoplamiento con Productos (no comparten reglas de negocio). Su único punto de contacto con Ventas es una consulta simple ("¿existe este cliente?"), lo cual se resuelve bien vía API sin necesidad de compartir modelo de datos.

---

### 1.3 Productos e Inventario

**Qué es:** Catálogo de productos, categorías y control de stock disponible.

**Por qué es un contexto distinto:** Tiene reglas de negocio propias y con más probabilidad de cambio frecuente (nuevas categorías, ajustes de stock, nuevos productos) que los otros contextos, y es consultado con alta frecuencia (cada venta necesita verificar stock).

**¿Servicio independiente?** **Sí.**
**Justificación:** Es el contexto con mayor necesidad de consulta frecuente y control de concurrencia (evitar vender un producto sin stock). Aislarlo permite optimizarlo o escalarlo de forma independiente si el catálogo sigue creciendo, sin afectar a Clientes o Ventas.

---

### 1.4 Ventas (incluye Reportes)

**Qué es:** Registro de transacciones comerciales (venta y su detalle), orquestación con Clientes y Productos al momento de vender, y generación de reportes (diarios, mensuales, productos más vendidos) a partir de esa misma información transaccional.

**¿Reportes es su propio contexto, o parte de Ventas?**
Se evaluó tratar Reportes como un contexto separado, pero **se decidió que Reportes es parte del mismo contexto de negocio que Ventas**, no un contexto aparte:
- Los reportes se calculan **exclusivamente** a partir de los datos que ya genera Ventas (no consume información de Clientes ni Productos directamente, solo de las transacciones que Ventas ya posee).
- No existe una regla de negocio de Reportes que sea independiente de las reglas de Ventas — es, en esencia, una vista agregada de la misma información transaccional.
- No hay necesidad de escalar Reportes de forma distinta a Ventas: ambos crecen al mismo ritmo (una venta nueva es, a la vez, un dato nuevo para los reportes).

**¿Servicio independiente?** **Sí** (Ventas, incluyendo Reportes, como un único servicio).
**Justificación:** Ventas es el contexto que más depende de los otros dos (Clientes y Productos), por lo que aislarlo permite que sea el único punto de orquestación entre ellos, sin que Clientes o Productos necesiten saber que existen ventas.

---

## 2. Resumen del mapa de contextos

| Contexto | ¿Servicio independiente? | Depende de | Del que dependen |
|---|---|---|---|
| Autenticación y Usuarios | Sí | — | Clientes, Productos, Ventas (validación de JWT) |
| Clientes | Sí | Auth (validación JWT) | Ventas (consulta de existencia) |
| Productos e Inventario | Sí | Auth (validación JWT) | Ventas (consulta de stock y precio) |
| Ventas (+ Reportes) | Sí | Auth, Clientes, Productos | — |

**Total: 4 contextos → 4 microservicios.** Ningún contexto quedó agrupado con otro salvo Reportes, que se integró como módulo interno de Ventas por ser parte del mismo contexto de negocio (no una simplificación por límite de repositorios, sino una decisión de dominio real).

---

## 3. Criterios usados para decidir "servicio vs. junto"

Para cada contexto se evaluó:

1. **Cambio independiente:** ¿este contexto cambia con una frecuencia y por razones distintas a los demás?
2. **Acoplamiento de negocio:** ¿comparte reglas de negocio o solo intercambia datos puntuales vía consulta?
3. **Necesidad de escalar distinto:** ¿este contexto podría necesitar más recursos o disponibilidad que los demás?
4. **Propiedad de los datos:** ¿quién es el dueño natural de esta información — puede identificarse un único contexto responsable?

Los 4 contextos identificados cumplen estos criterios de forma independiente entre sí, lo cual respalda la decisión de separarlos como servicios (formalizada en `adr/adr-001-architecture.md`). Reportes, en cambio, no cumple ninguno de los 4 criterios de forma distinta a Ventas, por lo que se mantiene junto.
