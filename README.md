# 🎓 Brittany Group - Landing Page de Captura de Leads

![Estado](https://img.shields.io/badge/estado-en%20desarrollo-green)
![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![CSS Modules](https://img.shields.io/badge/CSS-Modules-1572B6?logo=css3)

Landing page profesional para **Brittany Group**, diseñada para capturar leads de estudiantes interesados en programas de inglés. Implementada con arquitectura MVC y Clean Architecture siguiendo las mejores prácticas de desarrollo.

## 🎨 Características

- ✅ **Diseño Responsivo**: Optimizado para mobile, tablet y desktop
- ✅ **Formulario de Captura**: Validación completa de datos de leads
- ✅ **Arquitectura MVC**: Separación clara de Modelo, Vista y Controlador
- ✅ **Colores de Marca**: Azul (#235bcc) y Naranja (#ff8e15)
- ✅ **Tipografía Profesional**: Barlow de Google Fonts
- ✅ **Efectos Hover**: Transiciones suaves y feedback visual
- ✅ **SEO Optimizado**: Meta tags y estructura semántica
- ✅ **9 Secciones Completas**: Header, Hero, Social Proof, Why Brittany, Programs, Testimonials, FAQ, CTA, Footer

## 🚀 Tecnologías

- **Framework**: Next.js 15.5.9 con App Router
- **UI Library**: React 19.1.0
- **Lenguaje**: TypeScript 5.x
- **Estilos**: CSS Modules + CSS Variables
- **Fuentes**: Google Fonts (Barlow)
- **Optimización**: Next.js Image y Turbopack

## 📋 Requisitos Previos

- Node.js 18.x o superior
- npm, yarn, pnpm o bun

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd sga_brittany
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
# o
pnpm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

## 📦 Scripts Disponibles

```bash
# Desarrollo con Turbopack (más rápido)
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm run start
```

## 🏗️ Arquitectura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Estilos globales y variables CSS
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React (Vista)
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── LeadForm.tsx
│   ├── SocialProof.tsx
│   ├── WhyBrittany.tsx
│   ├── Programs.tsx
│   ├── Testimonials.tsx
│   ├── FAQ.tsx
│   ├── CTAFinal.tsx
│   └── Footer.tsx
├── models/                # Modelos de dominio
│   └── Lead.ts
├── controllers/           # Lógica de negocio
│   └── LeadController.ts
└── styles/                # Estilos compartidos
    └── animations.css
```

### Patrón MVC Implementado

- **Modelo** (`models/Lead.ts`): Define la estructura de datos de los leads
- **Vista** (`components/*.tsx`): Componentes React para la UI
- **Controlador** (`controllers/LeadController.ts`): Lógica de validación y envío

## 🎨 Sistema de Diseño

### Colores de Marca

```css
--color-blue-primary: #235bcc;   /* Azul principal */
--color-orange-primary: #ff8e15;  /* Naranja principal */
```

### Tipografía

- **Fuente principal**: Barlow (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700

### Componentes Reutilizables

- `.btn-primary`: Botón naranja con efectos hover
- `.btn-secondary`: Botón con borde azul
- `.container`: Contenedor con max-width responsive

## 📝 Secciones de la Landing Page

1. **Header**: Logo, navegación y botón WhatsApp
2. **Hero + Formulario**: Título principal con formulario de captura
3. **Social Proof**: Estadísticas de confianza
4. **¿Por qué Brittany?**: 5 razones principales
5. **Programas**: Pre Kids, Kids, Teens, Adultos
6. **Testimonios**: Reseñas de estudiantes
7. **FAQ**: 5 preguntas frecuentes con accordion
8. **CTA Final**: Llamado a la acción
9. **Footer**: Información de contacto y sedes

## 🔧 Configuración

### Variables de Entorno (Futuro)

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.brittanygroup.com
NEXT_PUBLIC_WHATSAPP_NUMBER=51999999999
```

### Personalización de Colores

Editar `src/app/globals.css`:

```css
:root {
  --color-blue-primary: #235bcc;
  --color-orange-primary: #ff8e15;
}
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conectar repositorio en [Vercel](https://vercel.com)
2. Configurar variables de entorno
3. Deploy automático en cada push

### Build Manual

```bash
npm run build
npm run start
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1023px
- **Desktop**: ≥ 1024px

## 🔜 Próximas Funcionalidades

- [ ] Integración con API backend para guardar leads
- [ ] Animaciones avanzadas con Framer Motion
- [ ] Google Analytics y Facebook Pixel
- [ ] Integración con WhatsApp Business API
- [ ] Sistema de notificaciones por email
- [ ] Panel de administración de leads
- [ ] Tests unitarios y de integración

## 👥 Equipo de Desarrollo

Desarrollado para **Brittany Group** - El verdadero INGLÉS

## 📄 Estructura de Datos

### Lead Model

```typescript
interface Lead {
  id?: string;
  nombreCompleto: string;
  edad: number;
  telefono: string;
  modalidad: 'Virtual' | 'Presencial';
  sede: string;
  medioContacto: string;
  aceptaContacto: boolean;
  fechaRegistro?: Date;
}
```

## 🐛 Solución de Problemas

### El servidor no inicia

```bash
# Limpiar cache y reinstalar
rm -rf node_modules .next
npm install
npm run dev
```

### Errores de TypeScript

```bash
# Verificar versión de TypeScript
npx tsc --version

# Reinstalar tipos
npm install --save-dev @types/react @types/node
```

## 📞 Contacto

Para consultas sobre el proyecto, contactar al equipo de desarrollo de Brittany Group.

---

**Versión**: 0.1.0  
**Última actualización**: Diciembre 2025
