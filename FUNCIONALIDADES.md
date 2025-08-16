# 🎓 Fe y Ciencia Check - Sistema de Control de Acceso QR

Un sistema completo de gestión de asistencia escolar mediante códigos QR, optimizado para dispositivos móviles y diseñado específicamente para el Colegio Fe y Ciencia.

## ✨ Características Implementadas

### 📱 **Optimizado para Móviles**

- Interfaz completamente responsiva
- PWA (Progressive Web App) para instalación en dispositivos móviles
- Soporte para cámaras de dispositivos móviles y escritorio
- Funcionalidad touch-friendly

### 🔍 **Escáner QR Avanzado**

- **Cámara automática**: Detección y selección de cámara trasera en móviles
- **Múltiples cámaras**: Capacidad de cambiar entre cámaras disponibles
- **Auto-registro**: Registra automáticamente entrada/salida basado en el último registro
- **Historial en tiempo real**: Muestra los últimos 5 registros del día
- **Detección inteligente**: Evita registros duplicados en corto tiempo
- **Notificaciones**: Confirmación visual de cada escaneo exitoso

### 👥 **Gestión de Alumnos**

- **Registro completo**: Formulario optimizado para móviles
- **Generación QR automática**: Códigos únicos por alumno
- **Validación de datos**: Email/teléfono, nombres, grados y secciones
- **Detección de duplicados**: Previene registro de estudiantes existentes
- **Vista previa de existentes**: Muestra estudiantes ya registrados
- **Descarga/Impresión**: QR codes listos para imprimir

### 📊 **Dashboard Intuitivo**

- **Estadísticas en tiempo real**: Total de alumnos, presentes, ausentes
- **Múltiples pestañas**: Resumen, Alumnos, Asistencia, Estadísticas
- **Filtros avanzados**: Por grado, sección, fecha, tipo de registro
- **Acciones rápidas**: Botones para escanear QR y registrar alumnos
- **Exportación de datos**: Descarga de reportes en diferentes formatos

### 🎨 **Diseño y UX**

- **Colores institucionales**: Paleta del Colegio Fe y Ciencia
- **Modo claro optimizado**: Eliminación del modo oscuro problemático
- **Contraste mejorado**: Texto legible en todos los componentes
- **Animaciones fluidas**: Transiciones suaves con Framer Motion
- **Iconografía consistente**: Lucide React icons en toda la aplicación

### 🔐 **Seguridad y Autenticación**

- **Supabase Auth**: Sistema de autenticación seguro
- **Sesiones persistentes**: Mantiene usuario logueado
- **Protección de rutas**: Redirección automática si no autenticado
- **Validación en tiempo real**: Verificación de datos en frontend y backend

## 🚀 Rutas Implementadas

### Principales

- `/` - Página de login
- `/dashboard` - Panel principal con todas las funcionalidades
- `/scan` - Página dedicada para escanear QR (optimizada móvil)
- `/register` - Página para registrar nuevos alumnos

### API/Base de Datos

- Tabla `alumnos`: Información completa de estudiantes
- Tabla `asistencias`: Registros de entrada y salida
- Relaciones automáticas y consultas optimizadas

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 15.4.6 con Turbopack
- **Base de datos**: Supabase (PostgreSQL)
- **Estilos**: Tailwind CSS v4
- **Iconos**: Lucide React
- **Animaciones**: Framer Motion
- **QR**: html5-qrcode + qrcode (generación)
- **Notificaciones**: React Hot Toast
- **TypeScript**: Tipado completo

## 📋 Cómo Usar

### Para Administradores:

1. **Login** en la página principal
2. **Dashboard** - Ver estadísticas generales
3. **Registrar alumno** - Desde cualquier pestaña con el botón "+"
4. **Ver alumnos** - Gestión completa en la pestaña "Alumnos"
5. **Revisar asistencia** - Historial detallado en "Asistencia"
6. **Análisis** - Estadísticas avanzadas en "Estadísticas"

### Para Escanear Asistencia:

1. **Abrir `/scan`** desde el botón "Escanear QR" (se puede abrir en nueva ventana)
2. **Permitir cámara** cuando el navegador lo solicite
3. **Enfocar el QR** del alumno - se detecta automáticamente
4. **Confirmar tipo** (entrada/salida) si es necesario
5. **Registro automático** - confirmación visual instantánea

### Para Registrar Alumnos:

1. **Abrir `/register`** desde cualquier botón "Registrar/Nuevo Alumno"
2. **Llenar formulario** - nombres, apellidos, grado, sección, contacto
3. **Generar QR** - código único automático
4. **Descargar/Imprimir** QR para entregar al alumno

## 🔧 Instalación y Desarrollo

```bash
# Clonar repositorio
git clone [tu-repo]
cd qr-cole

# Instalar dependencias
npm install

# Configurar variables de entorno (.env.local)
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Ejecutar en desarrollo
npm run dev
```

## 📱 Como PWA (Aplicación Móvil)

La aplicación se puede instalar como una app nativa en dispositivos móviles:

1. **Android**: Abrir en Chrome → Menú → "Agregar a pantalla de inicio"
2. **iOS**: Abrir en Safari → Compartir → "Agregar a pantalla de inicio"

## 🎯 Optimizaciones Móviles Específicas

- **Viewport** configurado para evitar zoom involuntario
- **Manifest.json** para PWA completa
- **Cámara trasera** por defecto en móviles
- **Botones grandes** para fácil interacción táctil
- **Navegación intuitiva** con botones "Volver"
- **Carga rápida** con componentes optimizados

## 🚨 Notas Importantes

1. **Permisos de cámara**: La app requiere acceso a la cámara para escanear QR
2. **Conexión**: Necesita internet para sincronizar con la base de datos
3. **Navegadores**: Recomendado Chrome/Safari para mejor compatibilidad
4. **QR únicos**: Cada alumno tiene un código único e irrepetible
5. **Backup**: Todos los datos se almacenan seguramente en Supabase

## 🐛 Problemas Resueltos

- ✅ **CSS fixed**: Eliminado modo dark problemático
- ✅ **Contraste mejorado**: Texto legible en todos los componentes
- ✅ **Responsive**: Funciona perfectamente en todos los tamaños
- ✅ **Cámara móvil**: Soporte completo para dispositivos móviles
- ✅ **Validaciones**: Prevención de datos duplicados/inválidos
- ✅ **Performance**: Carga rápida con optimizaciones de Next.js

## 📞 Soporte

Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo del Colegio Fe y Ciencia.

---

**🎓 Desarrollado especialmente para el Colegio Fe y Ciencia**
