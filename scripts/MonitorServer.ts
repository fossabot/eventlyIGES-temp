import os from "os";
import fs from "fs";
import path from "path";
import { db } from "../lib/db";
import { Prisma } from "@prisma/client";

interface QueryStats {
  total: number;
  durationSum: number;
}

let queryStats: QueryStats = { total: 0, durationSum: 0 };

// Intercetta query Prisma per misurare tempi
(db as any).$on("query", (e: any) => {
  queryStats.total += 1;
  queryStats.durationSum += e.duration;
});


function getCPUUsage() {
  const cpus = os.cpus();
  const user = cpus.reduce((acc, cpu) => acc + cpu.times.user, 0);
  const nice = cpus.reduce((acc, cpu) => acc + cpu.times.nice, 0);
  const sys = cpus.reduce((acc, cpu) => acc + cpu.times.sys, 0);
  const idle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const irq = cpus.reduce((acc, cpu) => acc + cpu.times.irq, 0);

  const total = user + nice + sys + idle + irq;
  return ((total - idle) / total) * 100;
}

// utilizzo RAM
function getRAMUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  return ((total - free) / total) * 100;
}

const csvFile = path.join(__dirname, "server_monitor.csv");

if (!fs.existsSync(csvFile)) {
  fs.writeFileSync(csvFile, "timestamp,cpu_usage,ram_usage,total_queries,avg_query_duration\n");
}

function logStats() {
  const avgQueryTime =
    queryStats.total > 0 ? queryStats.durationSum / queryStats.total : 0;

  const timestamp = new Date().toISOString();
  const cpu = getCPUUsage().toFixed(2);
  const ram = getRAMUsage().toFixed(2);
  const totalQueries = queryStats.total;
  const avgQuery = avgQueryTime.toFixed(2);

  // Console log
  console.clear();
  console.log("📊 Server Monitoring:");
  console.log(`Timestamp: ${timestamp}`);
  console.log(`CPU Usage: ${cpu}%`);
  console.log(`RAM Usage: ${ram}%`);
  console.log(`Executed Queries: ${totalQueries}`);
  console.log(`Avg Query Duration: ${avgQuery} ms`);

  const line = `${timestamp},${cpu},${ram},${totalQueries},${avgQuery}\n`;
  fs.appendFileSync(csvFile, line);
}

setInterval(logStats, 2000);

console.log("🚀 Monitoring started. Data will be saved to server_monitor.csv. Press CTRL+C to stop.");
