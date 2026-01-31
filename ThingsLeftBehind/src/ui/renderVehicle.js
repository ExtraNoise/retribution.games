// src/ui/renderVehicle.js

/**
 * Renders a GeneratedVehicle into readable plain text.
 *
 * @param {Object} vehicle
 * @returns {string}
 */

function groupItems(items) {
  const map = new Map();

  for (const item of items) {
    const key = item.isBundle
      ? `BUNDLE|${item.displayName}|${item.state}|${item.bundleMode}`
      : `${item.displayName}|${item.state}`;

    if (!map.has(key)) {
      map.set(key, {
        displayName: item.displayName,
        state: item.state,
        count: 0,
        isBundle: item.isBundle === true,
        bundleMode: item.bundleMode ?? null,
      });
    }

    map.get(key).count++;
  }

  return Array.from(map.values());
}

function pluralize(name, count) {
  if (count === 1) return name;

  // naive pluralization for now
  if (name.endsWith("y")) return name.slice(0, -1) + "ies";
  if (name.endsWith("s")) return name + "es";
  return name + "s";
}

const AN_EXCEPTIONS = [
  "honest"
];

const A_EXCEPTIONS = [
  "used"
];

function getIndefiniteArticle(phrase) {
  if (!phrase) return "a";

  const firstWord = phrase.trim().toLowerCase().split(/\s+/)[0];

  if (AN_EXCEPTIONS.includes(firstWord)) return "an";
  if (A_EXCEPTIONS.includes(firstWord)) return "a";

  return /^[aeiou]/i.test(firstWord) ? "an" : "a";
}

function describeGroup(group) {
  const { displayName, state, count, isBundle, bundleMode } = group;

  const isPairLike =
    bundleMode === "pair" ||
    bundleMode === "set";

  // Single Items
  if (count === 1) {
    const article = getIndefiniteArticle(`${state} ${displayName}`);
    return `${article} ${state} ${displayName}`;
  }

  // Multiple Non-Bundled Items
  if (!isBundle || !bundleMode) {
    return `${count} ${state} ${pluralize(displayName, count)}`;
  }

  // Pairs / Sets
  if (isPairLike) {
    const article = getIndefiniteArticle(bundleMode);
    return `${article} ${bundleMode} of ${state} ${pluralize(displayName, count)}`;
  }

  // Attempted Bundled Items
  if (count <= 2) {
    return `${count} ${state} ${pluralize(displayName, count)}`;
  }

  // Bundled Items
  const article = getIndefiniteArticle(bundleMode);
  return `${article} ${bundleMode} of ${state} ${pluralize(displayName, count)} (${count} in total)`;
}

function joinWithCommasAndAnd(parts) {
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;

  return (
    parts.slice(0, -1).join(", ") +
    ", and " +
    parts[parts.length - 1]
  );
}

function humanizeLocation(key, vehicleLabels) {
  if (vehicleLabels[key]?.label) {
    return vehicleLabels[key].label;
  }

  // Fallback: crude humanization
  return key
    .replace(/^stor/, "")
    .replace(/^seat/, "seat ")
    .replace(/^hang/, "")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .toLowerCase();
}

export function renderVehicle(vehicle, vehicleLabels = {}) {
  if (!vehicle) {
    return "No vehicle generated.";
  }

  const lines = [];

  const v = vehicle.vehicleData;

  // Vehicle Afar
  lines.push(
    `<div class="vehicle">The ${vehicle.state} vehicle is a ${vehicle.color} ${vehicle.year} ${v.make} ${v.model}` +
    (vehicle.trim ? ` ${vehicle.trim}` : "") +
    `.</div>`
  );

  // Vehicle Inside
  const contents = vehicle.contents;

  if (!contents || Object.keys(contents).length === 0) {
    lines.push("No items found in vehicle.");
    return lines.join("\n");
  }

  for (const location of Object.keys(contents)) {
    const items = contents[location];
    const groups = groupItems(items).sort((a, b) => {
      return (b.isBundle === true) - (a.isBundle === true);
    });

    let body;

    if (groups.length === 0) {
      body = `<em>Empty.</em>`;
    } else {
      const descriptions = groups.map(describeGroup);
      body = joinWithCommasAndAnd(descriptions);
    }

    lines.push(
      `<div class="location ${location}" data-location="${location}">` +
        `<div class="locationName">${humanizeLocation(location, vehicleLabels)}:</div>` +
        `<div class="locationItems">${body}</div>` +
      `</div>`
    );
  }

  return lines.join("\n");
}
