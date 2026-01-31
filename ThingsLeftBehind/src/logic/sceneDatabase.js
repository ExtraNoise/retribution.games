// src/logic/sceneDatabase.js

/**
 * Represents a single scene definition.
 * This mirrors SceneData from C#.
 */
export class SceneData {
  constructor({
    description,
    affOwners = [],
    affVehicles = [],
    state = [],
    stateBias = {},
  }) {
    this.description = description;
    this.affOwners = affOwners;
    this.affVehicles = affVehicles;
    this.state = state;
    this.stateBias = stateBias;
  }
}

/**
 * Holds all scenes and provides selection helpers.
 */
export class SceneDatabase {
  /**
   * @param {Object<string, Object>} scenesRaw
   */
  constructor(scenesRaw) {
    this.scenes = {};

    for (const key in scenesRaw) {
      this.scenes[key] = new SceneData(scenesRaw[key]);
    }
  }

  /**
   * Returns a random scene.
   * Matches current C# behavior (uniform random).
   *
   * @returns {SceneData}
   */
  chooseRandomScene() {
    const keys = Object.keys(this.scenes);
    if (keys.length === 0) {
      throw new Error("SceneDatabase contains no scenes.");
    }

    const index = Math.floor(Math.random() * keys.length);
    return this.scenes[keys[index]];
  }
}
