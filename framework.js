// ============================================================================
// PATHFINDER FRAMEWORK - Phase 1: Generic Data Loader
// ============================================================================

async function loadDataFile(config) {
  const { name, path, onSuccess } = config;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    // Store on window (convert to SCREAMING_SNAKE_CASE)
    const varName = name.toUpperCase().replace(/-/g, '_');
    window[varName] = data;

    // Mark as loaded
    window[`${varName}_LOADED`] = true;

    // Call optional success callback (for validation/logging)
    if (onSuccess) onSuccess(data);

    return true;
  } catch (error) {
    console.error(`✗ Failed to load ${name}:`, error.message);
    return false;
  }
}

// Export for use in pathfinders
window.loadDataFile = loadDataFile;
