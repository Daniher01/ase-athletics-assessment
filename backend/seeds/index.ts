import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando siembra de datos...');

  try {
    // Limpiar datos existentes (opcional)
    console.log('🧹 Limpiando datos existentes...');
    await prisma.scoutReport.deleteMany();
    await prisma.playerAttributes.deleteMany();
    await prisma.player.deleteMany();
    
    // Cargar datos de jugadores
    console.log('📊 Cargando datos de jugadores...');
    await seedPlayers();
    
    console.log('✅ Siembra de datos completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la siembra:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedPlayers() {
  // Leer archivo JSON de jugadores
  const playersPath = path.join(process.cwd(), '..', 'data', 'players_Data_production.json');
  
  if (!fs.existsSync(playersPath)) {
    console.error(`❌ No se encontró el archivo: ${playersPath}`);
    console.log('📁 Verifica que el archivo esté en la carpeta /data/');
    return;
  }

  const playersData = JSON.parse(fs.readFileSync(playersPath, 'utf8'));
  
  if (!playersData.players || !Array.isArray(playersData.players)) {
    console.error('❌ Formato de datos inválido. Se esperaba un objeto con array "players"');
    return;
  }

  console.log(`📥 Procesando ${playersData.players.length} jugadores...`);

  for (const playerData of playersData.players) {
    try {
      // Crear jugador principal
      const player = await prisma.player.create({
        data: {
          id: playerData.id,
          name: playerData.name,
          position: playerData.position,
          age: playerData.age,
          team: playerData.team,
          nationality: playerData.nationality,
          height: playerData.height,
          weight: playerData.weight,
          preferredFoot: playerData.preferredFoot,
          jerseyNumber: playerData.jerseyNumber,
          
          // Estadísticas básicas
          appearances: playerData.stats?.appearances || 0,
          goals: playerData.stats?.goals || 0,
          assists: playerData.stats?.assists || 0,
          yellowCards: playerData.stats?.yellowCards || 0,
          redCards: playerData.stats?.redCards || 0,
          minutesPlayed: playerData.stats?.minutesPlayed || 0,
          
          // Estadísticas específicas para porteros
          saves: playerData.stats?.saves || null,
          cleanSheets: playerData.stats?.cleanSheets || null,
          goalsConceded: playerData.stats?.goalsConceded || null,
          
          // Estadísticas generales
          shotsOnTarget: playerData.stats?.shotsOnTarget || null,
          totalShots: playerData.stats?.totalShots || null,
          passAccuracy: playerData.stats?.passAccuracy || null,
          dribblesCompleted: playerData.stats?.dribblesCompleted || null,
          tacklesWon: playerData.stats?.tacklesWon || null,
          aerialDuelsWon: playerData.stats?.aerialDuelsWon || null,
          
          // Información de contrato
          salary: playerData.contract?.salary || null,
          contractEnd: playerData.contract?.contractEnd || null,
          marketValue: calculateMarketValue(playerData),
          
          // URL de imagen
          imageUrl: playerData.imageUrl || null
        }
      });

      // Crear atributos del jugador
      if (playerData.attributes) {
        await prisma.playerAttributes.create({
          data: {
            playerId: player.id,
            pace: playerData.attributes.pace || 50,
            shooting: playerData.attributes.shooting || 50,
            passing: playerData.attributes.passing || 50,
            dribbling: playerData.attributes.dribbling || 50,
            defending: playerData.attributes.defending || 50,
            physical: playerData.attributes.physical || 50,
            finishing: playerData.attributes.finishing || null,
            crossing: playerData.attributes.crossing || null,
            longShots: playerData.attributes.longShots || null,
            positioning: playerData.attributes.positioning || null,
            
            // Atributos específicos de portero
            diving: playerData.attributes.diving || null,
            handling: playerData.attributes.handling || null,
            kicking: playerData.attributes.kicking || null,
            reflexes: playerData.attributes.reflexes || null
          }
        });
      }

      console.log(`✅ ${playerData.name} agregado exitosamente`);
      
    } catch (error) {
      console.error(`❌ Error procesando jugador ${playerData.name}:`, error);
      // Continuar con el siguiente jugador
    }
  }
}

// Función para calcular valor de mercado si no está presente
function calculateMarketValue(playerData: any): number | null {
  if (playerData.contract?.salary) {
    // Estimación simple: valor de mercado = salario anual * factor de edad
    const annualSalary = playerData.contract.salary * 52; // salario semanal * 52 semanas
    const ageFactor = playerData.age <= 25 ? 3 : playerData.age <= 30 ? 2 : 1;
    return Math.round(annualSalary * ageFactor);
  }
  return null;
}

// Ejecutar script
main()
  .catch((e) => {
    console.error('💥 Error fatal:', e);
    process.exit(1);
  });