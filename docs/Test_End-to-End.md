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
- [ ] Muestra Total Players (debería ser ~94)
- [ ] Muestra Average Age
- [ ] Gráfico de posiciones se ve
- [ ] No errores en consola

### **3. Lista de Jugadores**
- [ ] Carga lista de jugadores (mínimo 20)
- [ ] Paginación funciona (Next/Previous)
- [ ] Buscar "Messi" → encuentra a Lionel Messi
- [ ] Filtrar por posición "Centre-Forward" → filtra correctamente
- [ ] Clear filters → muestra todos otra vez

### **4. CRUD Jugadores**
- [ ] Crear jugador nuevo:
  - Name: "Test Player"
  - Position: Centre-Forward
  - Age: 25
  - Team: Test FC
- [ ] Jugador aparece en la lista
- [ ] Editar ese jugador → cambiar goals a 15
- [ ] Ver detalle del jugador → muestra toda la info
- [ ] Eliminar jugador → confirma y desaparece

### **5. Comparación de Jugadores**
- [ ] Seleccionar 2-3 jugadores
- [ ] Vista de comparación muestra estadísticas lado a lado
- [ ] Gráfico radar se muestra

### **6. Reportes de Scouting**
- [ ] Lista de reportes existentes carga
- [ ] Crear nuevo reporte:
  - Seleccionar jugador
  - Rating: 8/10
  - Strengths: "Good passing"
  - Recommendation: TRACK
- [ ] Reporte aparece en lista
- [ ] Ver detalle del reporte

### **7. Responsive**
- [ ] Cambiar a móvil (375px) → navegación colapsa
- [ ] Dashboard se ve bien en móvil
- [ ] Tabla de jugadores scrolleable
- [ ] Formularios usables en móvil

---

## 🚀 **TESTS DE HUMO (5 min extra)**

### **APIs funcionan:**
- [ ] F12 → Network → hacer cualquier acción → requests exitosos (200)
- [ ] No errores 500 en backend
- [ ] Datos se guardan (crear jugador y refrescar página)

### **Performance básico:**
- [ ] Dashboard carga en menos de 3 segundos
- [ ] Búsquedas responden rápido
- [ ] No se cuelga al navegar

---

## ✅ **CHECKLIST FINAL**

```
Total Tests: 25
Completados: ___/25
Tiempo: ___minutos
Bugs encontrados: ___
```

### **Funcionalidades críticas:**
- [ ] Login/Auth funciona
- [ ] CRUD jugadores completo
- [ ] Dashboard con métricas
- [ ] Búsqueda y filtros
- [ ] Responsive básico

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

**Tiempo total: ~30 minutos**