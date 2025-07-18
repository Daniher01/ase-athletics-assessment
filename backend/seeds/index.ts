import { PrismaClient } from '@prisma/client';

const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando siembra de datos...');

  try {
    // Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await prisma.scoutReport.deleteMany();
    await prisma.playerAttributes.deleteMany();
    await prisma.player.deleteMany();
    
    // Cargar datos de jugadores principales
    console.log('📊 Cargando jugadores principales...');
    await seedMainPlayers();
    
    // Cargar jugadores adicionales del archivo detallado
    console.log('📈 Cargando jugadores adicionales (archivo detallado)...');
    await seedDetailedPlayers();
    
    // Cargar reportes de scouting
    console.log('📋 Cargando reportes de scouting...');
    await seedScoutReports();
    
    console.log('✅ Siembra de datos completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la siembra:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedMainPlayers() {
  // Leer archivo JSON de jugadores principales
  const playersPath = path.join(process.cwd(), '.', 'data', 'players_Data_production.json');
  
  if (!fs.existsSync(playersPath)) {
    console.error(`❌ No se encontró el archivo: ${playersPath}`);
    return;
  }

  const playersData = JSON.parse(fs.readFileSync(playersPath, 'utf8'));
  
  if (!playersData.players || !Array.isArray(playersData.players)) {
    console.error('❌ Formato de datos inválido. Se esperaba un objeto con array "players"');
    return;
  }

  console.log(`📥 Procesando ${playersData.players.length} jugadores principales...`);

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
    }
  }
}

async function seedDetailedPlayers() {
  const statsPath = path.join(process.cwd(), '.', 'data', 'player_statistics_detailed.json');
  
  if (!fs.existsSync(statsPath)) {
    console.warn(`⚠️ No se encontró: ${statsPath}`);
    return;
  }

  const statsData = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  
  if (!statsData.playerDataSchema) {
    console.warn('⚠️ Formato de player_statistics_detailed.json no reconocido');
    return;
  }

  // Obtener todos los jugadores (excluir metadata)
  const playerKeys = Object.keys(statsData.playerDataSchema).filter(key => key !== 'metadata');
  console.log(`📥 Procesando ${playerKeys.length} jugadores del archivo detallado...`);

  for (const playerKey of playerKeys) {
    try {
      const playerDetailedData = statsData.playerDataSchema[playerKey];
      
      if (!playerDetailedData.basicInfo) continue;
      
      const basicInfo = playerDetailedData.basicInfo;
      const clubInfo = playerDetailedData.clubInfo || {};
      const contractInfo = playerDetailedData.contractInfo || {};
      const marketData = playerDetailedData.marketData || {};
      const seasonStats = playerDetailedData.seasonStats || {};
      const scoutingNotes = playerDetailedData.scoutingNotes || {};
      
      // Buscar si ya existe el jugador por nombre
      const existingPlayer = await prisma.player.findFirst({
        where: {
          name: {
            contains: basicInfo.name,
            mode: 'insensitive'
          }
        }
      });

      if (existingPlayer) {
        console.log(`📈 Jugador ya existe: ${basicInfo.name} - saltando`);
        continue;
      }

      // Generar ID único para nuevo jugador
      const maxId = await prisma.player.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true }
      });
      const newId = (maxId?.id || 0) + 1;
      
      // Crear nuevo jugador con mapeo completo
      const newPlayer = await prisma.player.create({
        data: {
          id: newId,
          name: basicInfo.name,
          position: clubInfo.position || 'Unknown',
          age: basicInfo.age || 25,
          team: clubInfo.currentTeam || 'Free Agent',
          nationality: basicInfo.nationality || 'Unknown',
          height: basicInfo.height || 180,
          weight: basicInfo.weight || 75,
          preferredFoot: basicInfo.preferredFoot || 'Right',
          jerseyNumber: clubInfo.jerseyNumber || null,
          
          // Estadísticas básicas del seasonStats
          appearances: seasonStats.basicStats?.appearances || 0,
          goals: seasonStats.basicStats?.goals || 0,
          assists: seasonStats.basicStats?.assists || 0,
          yellowCards: seasonStats.basicStats?.yellowCards || 0,
          redCards: seasonStats.basicStats?.redCards || 0,
          minutesPlayed: seasonStats.basicStats?.minutesPlayed || 0,
          
          // Estadísticas avanzadas si están disponibles
          shotsOnTarget: seasonStats.advancedStats?.shootingMetrics?.shotsOnTarget || null,
          totalShots: seasonStats.advancedStats?.shootingMetrics?.totalShots || null,
          passAccuracy: seasonStats.advancedStats?.passingMetrics?.passAccuracy || null,
          dribblesCompleted: seasonStats.advancedStats?.technicalMetrics?.dribbles || null,
          tacklesWon: seasonStats.advancedStats?.defensiveMetrics?.tacklesWon || null,
          aerialDuelsWon: seasonStats.advancedStats?.defensiveMetrics?.aerialDuels || null,
          
          // Información de contrato
          salary: contractInfo.salary?.weeklyWage || null,
          contractEnd: contractInfo.contractEnd || null,
          marketValue: marketData.currentMarketValue || null,
          
          // URL de imagen (generar desde displayName)
          imageUrl: basicInfo.displayName ? basicInfo.displayName.substring(0, 2).toUpperCase() : null
        }
      });

      // Crear atributos si están disponibles en scoutingNotes
      if (scoutingNotes.attributes) {
        const technical = scoutingNotes.attributes.technical || {};
        const detailed = scoutingNotes.attributes.detailed || {};
        
        await prisma.playerAttributes.create({
          data: {
            playerId: newPlayer.id,
            pace: technical.pace || 50,
            shooting: technical.shooting || 50,
            passing: technical.passing || 50,
            dribbling: technical.dribbling || 50,
            defending: technical.defending || 50,
            physical: technical.physical || 50,
            finishing: detailed.finishing || null,
            crossing: detailed.crossing || null,
            longShots: detailed.longShots || null,
            positioning: detailed.positioning || null,
            
            // Atributos de portero (no aplicables en este dataset)
            diving: null,
            handling: null,
            kicking: null,
            reflexes: null
          }
        });
      }
      
      console.log(`✅ ${basicInfo.name} agregado como nuevo jugador (ID: ${newId})`);
      
    } catch (error) {
      console.error(`❌ Error procesando jugador detallado ${playerKey}:`, error);
    }
  }
}

async function seedScoutReports() {
  const reportsPath = path.join(process.cwd(), '.', 'data', 'scout_report.json');
  
  if (!fs.existsSync(reportsPath)) {
    console.warn(`⚠️ No se encontró: ${reportsPath}`);
    return;
  }

  const reportsData = JSON.parse(fs.readFileSync(reportsPath, 'utf8'));
  
  if (!reportsData.scoutingReports || !Array.isArray(reportsData.scoutingReports)) {
    console.warn('⚠️ Formato de scout_report.json no reconocido');
    return;
  }

  const reports = reportsData.scoutingReports;
  console.log(`📥 Procesando ${reports.length} reportes de scouting...`);

  // Crear un scout de demostración si no existe
  let demoScout = await prisma.user.findUnique({
    where: { email: 'scout@demo.com' }
  });

  if (!demoScout) {
    demoScout = await prisma.user.create({
      data: {
        email: 'scout@demo.com',
        password: 'placeholder',
        name: 'Scout Demo',
        role: 'scout'
      }
    });
  }

  for (const report of reports) {
    try {
      // Buscar el jugador por ID o por nombre
      const player = await prisma.player.findFirst({
        where: {
          OR: [
            { id: report.playerId },
            { name: { contains: report.playerName || '', mode: 'insensitive' } }
          ]
        }
      });

      if (player) {
        // Calcular rating general promedio
        const ratings = report.ratings || {};
        const ratingValues = Object.values(ratings).filter(val => typeof val === 'number') as number[];
        const overallRating = ratingValues.length > 0 
          ? ratingValues.reduce((sum, val) => sum + val, 0) / ratingValues.length 
          : 7.0;

        await prisma.scoutReport.create({
          data: {
            playerId: player.id,
            scoutId: demoScout.id,
            matchDate: new Date(report.date || new Date()),
            competition: report.matchDetails?.competition || 'Liga Demo',
            opponent: report.matchDetails?.opponent || 'Oponente Demo',
            overallRating: overallRating,
            strengths: report.strengths || ['Buen rendimiento técnico', 'Fuerte físicamente'],
            weaknesses: report.weaknesses || ['Puede mejorar la precisión', 'Necesita mejor comunicación'],
            recommendation: report.recommendation || 'monitorear',
            notes: report.summary || report.notes || `Reporte de ${report.scoutName || 'Scout Demo'} - ${report.matchDetails?.result || 'Partido completo'}`
          }
        });
        
        console.log(`📋 Reporte creado para ${player.name} (Rating: ${overallRating.toFixed(1)})`);
      } else {
        console.log(`⚠️ No se encontró jugador para ID ${report.playerId} (${report.playerName})`);
      }
      
    } catch (error) {
      console.error(`❌ Error creando reporte para ${report.playerName}:`, error);
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