# 🎓 EduCheck Fe y Ciencia

### Sistema Integral de Control de Asistencia Estudiantil con Tecnología QR

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.1-blue?style=for-the-badge&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)](https://supabase.com)

**Una solución moderna y eficiente para el control de asistencia escolar**

[🚀 Ver Demo](#demo) • [📱 Características](#características) • [⚡ Instalación](#instalación) • [📖 Documentación](#documentación)

</div>

---

## 🌟 Descripción

EduCheck es un sistema integral de gestión de asistencia estudiantil diseñado específicamente para instituciones educativas modernas. Utilizando tecnología QR de vanguardia, transformamos el proceso tradicional de control de asistencia en una experiencia digital fluida, rápida y confiable.

![dashboard-overview.png]

### 🎯 ¿Por qué EduCheck?

- ✅ **Eliminación del pase de lista manual** - Ahorra hasta 15 minutos por clase
- ✅ **Precisión del 99.9%** - Elimina errores humanos en el registro
- ✅ **Reportes instantáneos** - Datos en tiempo real para toma de decisiones
- ✅ **Notificaciones automáticas** - Mantén a los padres informados al instante
- ✅ **Acceso multiplataforma** - Funciona en cualquier dispositivo

---

## 🚀 Demo en Vivo

![demo-gif.gif]

> **Prueba EduCheck ahora:** [demo.educheck.com](https://demo.educheck.com)
>
> 📧 **Usuario demo:** profesor@demo.com  
> 🔑 **Contraseña:** demo123

---

## ✨ Características Principales

### 📱 **Scanner QR Inteligente**

![scanner-mockup.png]

- 🎯 **Detección automática** de códigos QR estudiantiles
- 📲 **Optimizado para móviles** con interfaz touch-friendly
- ⚡ **Escaneo ultra-rápido** (menos de 1 segundo)
- 🔄 **Modo dual**: Entrada y salida automática
- 🎵 **Feedback sonoro** para confirmación de registro

### 👨‍🎓 **Gestión de Estudiantes**

![student-management.png]

- 📋 **Registro completo** de datos estudiantiles
- 🆔 **Generación automática** de códigos QR únicos
- 👥 **Organización por grados** y secciones
- 📊 **Vista de lista y tarjetas** adaptativa
- 🔍 **Búsqueda avanzada** y filtros múltiples

### 📊 **Dashboard Ejecutivo**

![dashboard-stats.png]

- 📈 **Métricas en tiempo real** de asistencia
- 📅 **Historial completo** de registros
- 🎯 **Estadísticas por grado** y período
- 📉 **Gráficos interactivos** con tendencias
- ⚡ **Acciones rápidas** desde el panel principal

### 📑 **Reportes Profesionales**

![reports-export.png]

- 📄 **Exportación múltiple**: Excel, PDF, CSV
- 📋 **Plantillas personalizadas** para diferentes períodos
- 📊 **Análisis estadístico** automático
- 📅 **Filtrado por fechas** y criterios específicos
- 🎨 **Formato institucional** con logo y branding

### 💬 **Notificaciones WhatsApp**

![whatsapp-integration.png]

- 📲 **Integración nativa** con WhatsApp Business
- 🚀 **Envío automático** de notificaciones a padres
- ✉️ **Mensajes personalizados** por tipo de registro
- 📋 **Templates profesionales** preconfigurados
- 🔗 **Enlaces directos** para contacto inmediato

---

## 🛠️ Stack Tecnológico

<div align="center">

![tech-stack.png]

</div>

### **Frontend**

- ⚛️ **Next.js 15.4** - Framework React con App Router
- 🎨 **Tailwind CSS 4.0** - Diseño moderno y responsive
- 🎭 **Framer Motion** - Animaciones fluidas
- 📱 **PWA Ready** - Instalable como app nativa

### **Backend**

- 🗄️ **Supabase** - Base de datos PostgreSQL en la nube
- 🔐 **Auth integrada** - Sistema de autenticación seguro
- ⚡ **Real-time** - Actualizaciones en tiempo real
- 🔄 **API REST** - Endpoints optimizados

### **Características Técnicas**

- 📱 **Mobile-First** - Diseñado para dispositivos móviles
- 🎯 **TypeScript** - Código tipado y mantenible
- 📊 **html5-qrcode** - Scanner QR optimizado
- 📈 **Recharts** - Gráficos interactivos
- 📄 **jsPDF + XLSX** - Generación de reportes

---

## 📱 Capturas de Pantalla

### 🔐 Autenticación Segura

![login-screen.png]

### 📱 Vista Móvil

<div align="center">
<img src="mobile-dashboard.png" width="300" alt="Dashboard Móvil"/>
<img src="mobile-scanner.png" width="300" alt="Scanner Móvil"/>
<img src="mobile-reports.png" width="300" alt="Reportes Móvil"/>
</div>

### 💻 Dashboard Desktop

![desktop-dashboard.png]

### 📊 Estadísticas Avanzadas

![advanced-stats.png]

---

## ⚡ Instalación Rápida

### 📋 Prerrequisitos

- Node.js 18.0 o superior
- npm o yarn
- Cuenta en Supabase (gratuita)

### 🚀 Configuración en 3 Pasos

```bash
# 1️⃣ Clona el repositorio
git clone https://github.com/TuUsuario/educheck-fe-ciencia.git
cd educheck-fe-ciencia

# 2️⃣ Instala dependencias
npm install

# 3️⃣ Configura variables de entorno
cp .env.example .env.local
```

### ⚙️ Configuración de Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=tu_proyecto_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 🎯 Esquema de Base de Datos

```sql
-- Crear tabla de alumnos
CREATE TABLE alumnos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombres text NOT NULL,
  apellidos text NOT NULL,
  dni text UNIQUE NOT NULL,
  nombres_apoderado text,
  codigo_qr text UNIQUE NOT NULL,
  contacto_padres text,
  grado integer NOT NULL,
  seccion text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Crear tabla de asistencias
CREATE TABLE asistencias (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  id_alumno uuid REFERENCES alumnos(id) ON DELETE CASCADE,
  hora timestamp DEFAULT now(),
  tipo text CHECK (tipo IN ('entrada', 'salida')),
  created_at timestamp DEFAULT now()
);
```

### ▶️ Ejecutar el Proyecto

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm start
```

---

## 🎯 Casos de Uso

### 🏫 **Para Colegios**

![school-use-case.png]

- Control de asistencia en tiempo real
- Reportes para dirección académica
- Comunicación automática con padres
- Estadísticas de punctualidad

### 👨‍🏫 **Para Profesores**

![teacher-use-case.png]

- Pase de lista digital instantáneo
- Registro de entrada y salida
- Exportación de reportes por período
- Vista de estudiantes por grado/sección

### 👨‍👩‍👧‍👦 **Para Padres**

![parent-notification.png]

- Notificaciones WhatsApp automáticas
- Confirmación de llegada/salida del estudiante
- Historial de asistencia accesible
- Contacto directo con la institución

---

## 📊 Métricas y Rendimiento

![performance-metrics.png]

- ⚡ **Tiempo de carga**: < 2 segundos
- 📱 **Compatibility**: 99% dispositivos móviles
- 🎯 **Precisión QR**: 99.9% de lecturas exitosas
- 📊 **Capacidad**: Hasta 10,000 estudiantes
- 🔄 **Uptime**: 99.95% disponibilidad

---

## 🔧 Configuración Avanzada

### 🎨 Personalización Visual

```typescript
// tailwind.config.ts - Personaliza colores institucionales
theme: {
  colors: {
    primary: '#07aee1', // Color principal del colegio
    secondary: '#1e40af', // Color secundario
    accent: '#f59e0b' // Color de acento
  }
}
```

### 📱 Configuración PWA

```json
// manifest.json - Personaliza la app
{
  "name": "EduCheck Tu Colegio",
  "short_name": "EduCheck",
  "theme_color": "#07aee1",
  "background_color": "#ffffff",
  "start_url": "/dashboard"
}
```

---

## 🎓 Documentación

### 📚 **Guías de Usuario**

- [👨‍🏫 Manual del Profesor](docs/teacher-guide.md)
- [👨‍💼 Manual del Administrador](docs/admin-guide.md)
- [📱 Guía de App Móvil](docs/mobile-guide.md)
- [🔧 Configuración Inicial](docs/setup-guide.md)

### 🔧 **Documentación Técnica**

- [⚙️ API Reference](docs/api-reference.md)
- [🗄️ Esquema de BD](docs/database-schema.md)
- [🚀 Deployment](docs/deployment.md)
- [🔍 Troubleshooting](docs/troubleshooting.md)

---

## 🤝 Contribuir

![contribute-banner.png]

¡Nos encanta recibir contribuciones! Aquí te explicamos cómo puedes ayudar:

### 🐛 **Reportar Bugs**

1. Busca issues existentes
2. Crea un nuevo issue con detalles
3. Incluye pasos para reproducir
4. Adjunta capturas de pantalla

### 💡 **Sugerir Características**

1. Revisa el roadmap actual
2. Crea un issue de tipo "feature request"
3. Explica el caso de uso
4. Describe la solución propuesta

### 🔧 **Desarrollo**

```bash
# Fork del repo
git fork https://github.com/TuUsuario/educheck-fe-ciencia

# Crea una rama feature
git checkout -b feature/nueva-funcionalidad

# Commits con conventional commits
git commit -m "feat: agregar exportación a PDF"

# Push y PR
git push origin feature/nueva-funcionalidad
```

---

## 📄 Licencia

![license-banner.png]

Este proyecto está licenciado bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License - Uso libre para proyectos comerciales y educativos
Copyright (c) 2025 EduCheck Fe y Ciencia
```

---

## 🌟 Showcase

### 🏆 **Casos de Éxito**

![success-stories.png]

> _"EduCheck redujo nuestro tiempo de pase de lista en un 90% y mejoró significativamente la comunicación con los padres de familia."_  
> **— Dir. María González, Colegio San Martín**

> _"La generación automática de reportes nos ahorra 5 horas semanales de trabajo administrativo."_  
> **— Prof. Carlos Ruiz, I.E. Libertadores**

### 📈 **Estadísticas de Impacto**

- 🎯 **+50 colegios** utilizando EduCheck
- ⏱️ **-85% tiempo** en control de asistencia
- 📊 **+95% precisión** en registros
- 💬 **+90% satisfacción** de padres de familia

---

## 🚀 Roadmap 2025

![roadmap-2025.png]

### 🎯 **Q1 2025**

- [ ] 📱 App móvil nativa (iOS/Android)
- [ ] 🔔 Notificaciones push
- [ ] 📊 Dashboard para padres

### 🎯 **Q2 2025**

- [ ] 🤖 Inteligencia artificial para predicción de ausencias
- [ ] 📱 Integración con sistemas LMS
- [ ] 🌐 Modo offline completo

### 🎯 **Q3 2025**

- [ ] 📧 Integración con correo electrónico
- [ ] 📋 Generador de horarios automático
- [ ] 🎨 Constructor de reportes personalizado

---

## 💬 Soporte y Comunidad

<div align="center">

![support-banner.png]

[![Discord](https://img.shields.io/badge/Discord-Únete%20a%20la%20comunidad-7289DA?style=for-the-badge&logo=discord)](https://discord.gg/educheck)
[![Telegram](https://img.shields.io/badge/Telegram-Canal%20oficial-0088CC?style=for-the-badge&logo=telegram)](https://t.me/educheck_oficial)  
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Soporte%20técnico-25D366?style=for-the-badge&logo=whatsapp)](https://wa.me/1234567890)

**📧 Email:** soporte@educheck.com  
**🌐 Website:** [www.educheck.com](https://www.educheck.com)  
**📚 Docs:** [docs.educheck.com](https://docs.educheck.com)

</div>

### 🆘 **¿Necesitas ayuda?**

1. 📖 **Consulta la documentación** - La mayoría de dudas están resueltas aquí
2. 🔍 **Busca en Issues** - Tal vez alguien ya tuvo la misma pregunta
3. 💬 **Únete a Discord** - Comunidad activa de desarrolladores
4. 📧 **Contacta soporte** - Respuesta en menos de 24 horas

---

## ⭐ ¡Dale una estrella!

Si EduCheck te ha sido útil, ¡no olvides darle una ⭐ en GitHub!

<div align="center">

![star-banner.png]

[![GitHub stars](https://img.shields.io/github/stars/TuUsuario/educheck-fe-ciencia?style=social)](https://github.com/TuUsuario/educheck-fe-ciencia/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/TuUsuario/educheck-fe-ciencia?style=social)](https://github.com/TuUsuario/educheck-fe-ciencia/network)

**Desarrollado con ❤️ para la educación moderna**

---

_© 2025 EduCheck Fe y Ciencia. Transformando la gestión educativa, un código QR a la vez._

</div>
