# MASVS List

Una plataforma web para la evaluación de seguridad de aplicaciones móviles basada en el estándar MASVS (Mobile Application Security Verification Standard). [1](#0-0) 

## 🏗️ Arquitectura del Sistema

El proyecto implementa una arquitectura de tres capas con separación clara de responsabilidades: <cite/>

- **Frontend**: Aplicación web construida con Astro y TypeScript [2](#0-1) 
- **Backend**: API REST desarrollada en Node.js con Express [3](#0-2) 
- **Base de Datos**: MySQL para persistencia de datos [4](#0-3) 

## 🚀 Tecnologías Principales

### Frontend (masvs-list-web)
- **Astro**: Framework principal para SSR y generación de sitios estáticos
- **TypeScript**: Tipado estático y desarrollo mejorado
- **Tailwind CSS**: Framework CSS utility-first
- **Axios**: Cliente HTTP para comunicación con la API
- **ECharts**: Visualización de datos y gráficos de reportes

### Backend (masvs-list-api)
- **Node.js + Express**: Servidor API REST
- **Sequelize**: ORM para manejo de base de datos
- **JWT**: Autenticación basada en tokens
- **Multer**: Manejo de carga de archivos
- **Express Rate Limit**: Limitación de velocidad de requests

## 🔧 Configuración y Despliegue

### Usando Docker Compose

El proyecto incluye configuración completa de Docker para despliegue fácil: [5](#0-4) 

```bash
# Clonar el repositorio
git clone https://github.com/Yovin001/MASVS_List.git
cd MASVS_List

# Levantar todos los servicios
docker-compose up -d
```

### Servicios Disponibles

- **Frontend**: http://localhost (Puerto 80) [6](#0-5) 
- **Backend API**: http://localhost:3000 [7](#0-6) 
- **Base de Datos**: MySQL en puerto interno (no expuesto)

## 🔐 Características de Seguridad

### Autenticación y Autorización
- Sistema de autenticación JWT con cookies HTTP-only
- Control de acceso basado en roles (RBAC)
- Middleware de autenticación para protección de rutas [8](#0-7) 

### Análisis de Seguridad Estático (SAST)
- Integración con CodeQL para análisis de seguridad
- ESLint para calidad de código
- Pipeline automatizado de seguridad en CI/CD [9](#0-8) 

### Medidas de Protección
- Rate limiting para prevenir ataques de fuerza bruta
- Validación de entrada con express-validator
- Carga segura de archivos con restricciones de tipo y tamaño [10](#0-9) 

## 📊 Funcionalidades Principales

### Gestión de Proyectos
- Creación y administración de proyectos de evaluación de seguridad
- Asignación de cuestionarios MASVS a proyectos [11](#0-10) 

### Evaluación de Seguridad
- Cuestionarios interactivos basados en estándares MASVS
- Seguimiento del estado de evaluación por categorías
- Interfaz intuitiva para completar assessments [12](#0-11) 

### Reportes y Analytics
- Generación de reportes de evaluación
- Visualización de datos con gráficos interactivos
- Exportación de resultados

## 🛠️ Desarrollo Local

### Requisitos Previos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo sin Docker)
- MySQL 8.0+ (para desarrollo sin Docker)

### Variables de Entorno
El proyecto utiliza las siguientes variables de entorno principales: [13](#0-12) 

```env
NODE_ENV=development
DB_HOST=db
DB_USER=desarrollo
DB_PASSWORD=desarrollo
DB_NAME=masvs_list_db
```

## 📝 Estructura del Proyecto

```
MASVS_List/
├── masvs-list-web/          # Frontend Astro
│   ├── src/
│   │   ├── pages/           # Páginas de la aplicación
│   │   ├── components/      # Componentes reutilizables
│   │   ├── layouts/         # Layouts base
│   │   └── utiles/          # Utilidades y hooks
├── masvs-list-api/          # Backend Express
│   ├── controls/            # Controladores de negocio
│   ├── routes/              # Definición de rutas
│   ├── models/              # Modelos de Sequelize
│   └── config/              # Configuración de BD
├── .github/workflows/       # CI/CD y SAST
└── docker-compose.yml       # Orquestación de contenedores
```

## 🤝 Contribución

Este proyecto implementa estándares de seguridad y calidad de código mediante:
- Análisis estático de seguridad automatizado
- Revisión de código obligatoria
- Tests de integración y seguridad

## 📄 Licencia

Proyecto enfocado en la creación de una lista de verificación de seguridad móvil para aplicaciones móviles. [1](#0-0) 

---

Para más información sobre la arquitectura específica, consulta la documentación técnica en el wiki del proyecto.

## Notes

Este README se basa en el análisis del codebase actual del proyecto MASVS_List. El proyecto implementa una plataforma completa de evaluación de seguridad móvil con arquitectura moderna, medidas de seguridad robustas y despliegue containerizado. La estructura modular y las herramientas de CI/CD integradas facilitan el desarrollo y mantenimiento del sistema.

Wiki pages you might want to explore:
- [Architecture (Yovin001/MASVS_List)](/wiki/Yovin001/MASVS_List#2)
- [Authentication & Security (Yovin001/MASVS_List)](/wiki/Yovin001/MASVS_List#2.1)
- [Frontend Application (masvs-list-web) (Yovin001/MASVS_List)](/wiki/Yovin001/MASVS_List#3)
