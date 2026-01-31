// src/main.js

import { WorldTime, TimeUnit } from "./logic/worldTime.js";
import { SceneDatabase } from "./logic/sceneDatabase.js";
import { VehicleGenerator } from "./logic/vehicleGenerator.js";

/**
 * Utility function to load JSON files.
 */
async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

async function main() {
  // -----------------------------
  // LOAD DATA
  // -----------------------------

  const itemDbRaw = await loadJSON("./data/items.json");
  const vehicleDbRaw = await loadJSON("./data/vehicles.json");
  const sceneDbRaw = await loadJSON("./data/scenes.json");

  // Normalize databases to match generator expectations
  const itemDb = itemDbRaw.items ?? itemDbRaw;
  const vehicleDb = vehicleDbRaw.vehicles ?? vehicleDbRaw;

  const sceneDb = new SceneDatabase(
    sceneDbRaw.scenes ?? sceneDbRaw
  );

  // -----------------------------
  // WORLD TIME
  // -----------------------------

  const worldTime = new WorldTime(
    1997,          // apocalypse year
    5,             // elapsed amount
    TimeUnit.YEARS // elapsed unit
  );

  // -----------------------------
  // GENERATOR
  // -----------------------------

  const generator = new VehicleGenerator({
    itemDb,
    vehicleDb,
    sceneDb,
    worldTime,
  });

  const generatedVehicle = generator.generateSingleVehicle();

  console.log("=== GENERATED VEHICLE ===");
  console.log(generatedVehicle);
}

main().catch(err => {
  console.error("Generator error:", err);
});
