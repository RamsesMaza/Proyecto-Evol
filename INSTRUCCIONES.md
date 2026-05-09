# 🚀 Guía de Inicio - Pro Evol

Esta guía contiene los comandos necesarios para configurar y ejecutar el proyecto por primera vez.

## 📋 Prerrequisitos
*   **Node.js** instalado.
*   **MySQL** instalado y en ejecución.
*   Base de datos creada (por defecto: `pro_evol`).

---

## 🛠️ Configuración Inicial

### 1. Backend
Navega a la carpeta del servidor y prepara el entorno:

```powershell
cd backend
npm install
npx prisma generate
npx prisma db push
```

### 2. Frontend
Navega a la carpeta de la interfaz:

```powershell
cd ../front
npm install
```

---

## 🏃‍♂️ Ejecución en Desarrollo

Para trabajar en el proyecto, debes tener **dos terminales** abiertas simultáneamente:

### Terminal 1: Backend
```powershell
cd backend
npm run dev
```
*El servidor estará disponible en [http://localhost:3000](http://localhost:3000)*

### Terminal 2: Frontend
```powershell
cd front
npm run dev
```
*La aplicación web estará disponible en la URL que indique Vite (usualmente [http://localhost:5173](http://localhost:5173))*

---

## 🔍 Comandos Útiles de Base de Datos
Dentro de la carpeta `backend`:

*   `npx prisma studio`: Abre una interfaz web para ver y editar los datos de la DB.
*   `npx prisma db push`: Sincroniza cambios en el archivo `schema.prisma` con la base de datos.
