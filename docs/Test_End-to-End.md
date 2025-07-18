# ASE Athletics - Testing Manual Rápido

## 🎯 **Objetivo: Probar que todo funciona en 30 minutos**

**Antes de empezar:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Usuario test: admin@test.com / admin123

---

## ✅ **TESTS BÁSICOS**

### **1. Login/Logout**
- [x] Login con credenciales correctas → va a dashboard
- [x] Login con password malo → muestra error
- [x] Logout → vuelve a login
- [x] Intentar ir a /players sin login → redirige a login

### **2. Dashboard**
- [x] Muestra Total Players (debería ser ~94)
- [x] Muestra Average Age
- [x] Gráfico de posiciones se ve
- [x] No errores en consola

### **3. Lista de Jugadores**
- [x] Carga lista de jugadores (mínimo 20)
- [x] Paginación funciona (Next/Previous)
- [x] Buscar "Kane" → encuentra a Harry Kane
- [x] Filtrar por posición "Forward" → filtra correctamente
- [x] Clear filters → muestra todos otra vez

### **4. CRUD Jugadores**
- [x] Crear jugador nuevo:
  - Name: "Test Player"
  - Position: Centre-Forward
  - Age: 25
  - Team: Test FC
- [x] Jugador aparece en la lista
- [x] Editar ese jugador → cambiar goals a 15
- [x] Ver detalle del jugador → muestra toda la info
- [x] Eliminar jugador → confirma y desaparece

### **5. Comparación de Jugadores**
- [x] Seleccionar 2-3 jugadores
- [x] Vista de comparación muestra estadísticas lado a lado
- [x] Gráfico radar se muestra

### **6. Reportes de Scouting**
- [x] Lista de reportes existentes carga
- [x] Crear nuevo reporte:
  - Seleccionar jugador
  - Rating: 8/10
  - Strengths: "Good passing"
  - Recommendation: TRACK
- [x] Reporte aparece en lista
- [x] Ver detalle del reporte

### **7. Responsive**
- [x] Cambiar a móvil (375px) → navegación colapsa
- [x] Dashboard se ve bien en móvil
- [x] Tabla de jugadores scrolleable
- [x] Formularios usables en móvil

---

## 🚀 **TESTS DE HUMO**

### **APIs funcionan:**
- [x] F12 → Network → hacer cualquier acción → requests exitosos (200)
- [x] No errores 500 en backend
- [x] Datos se guardan (crear jugador y refrescar página)

### **Performance básico:**
- [x] Dashboard carga en menos de 3 segundos
- [x] Búsquedas responden rápido
- [x] No se cuelga al navegar

---

### **Funcionalidades críticas:**
- [x] Login/Auth funciona
- [x] CRUD jugadores completo
- [x] Dashboard con métricas
- [x] Búsqueda y filtros
- [x] Responsive básico

### **Si algo falla:**
- Anotar qué no funciona
- Verificar que backend esté corriendo
- Verificar datos en BD

---

## 📝 **EVIDENCIA MÍNIMA**

**Para el README final:**
- ✅ Todos los tests core pasaron
- ✅ App funciona end-to-end
- ✅ CRUD completo operativo
- ✅ Responsive funcional
