fillGrid = function (reels, rows) {
  let grid = [];
  const syms = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  for (i = 0; i < reels; i++) {
    let row = "";
    for (j = 0; j < rows; j++) {
      let symObj = {};
      symObj.reel = i;
      symObj.row = j;
      symObj.type = syms[Math.floor(Math.random() * syms.length)];
      grid.push(symObj);
      row += symObj.type + " | ";
    }
    console.log(row);
  }
  return grid;
};
console.log("==================================================");
function dropSyms(rows, cols, symbols, options) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const maxClusterSize = options.maxClusterSize;
  const clusterProbabilities = options.clusterProbabilities;
  // Normalize probabilities into weighted list
  const clusterSizeKeys = Object.keys(clusterProbabilities).map(Number);
  const totalWeight = clusterSizeKeys.reduce(
    (sum, clusterSize) => sum + clusterProbabilities[clusterSize],
    0
  );
  const normalizedClusterWeights = clusterSizeKeys.map((clusterSize) => ({
    clusterSize,
    weight: clusterProbabilities[clusterSize] / totalWeight,
  }));
  // Choose a cluster size based on weighted random probability
  function chooseClusterSize() {
    const randomValue = Math.random();
    let weightAccumulator = 0;
    for (const { clusterSize, weight } of normalizedClusterWeights) {
      weightAccumulator += weight;
      if (randomValue <= weightAccumulator) return clusterSize;
    }
    return 2; // fallback cluster size
  }
  // Get a list of all currently empty cells in the grid
  function getEmptyCells() {
    const emptyCells = [];

    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < cols; column++) {
        if (grid[row][column] === null) {
          emptyCells.push([row, column]);
        }
      }
    }
    return emptyCells;
  }
  // Check if placing a cluster at these cells would be valid
  function isValidClusterPlacement(clusterCells, symbol) {
    // 1. Ensure cluster cells are within bounds and empty
    for (const [row, column] of clusterCells) {
      if (row < 0 || row >= rows || column < 0 || column >= cols) return false;
      if (grid[row][column] !== null) return false;
    }
    // 2. Simulate placement
    const tempGrid = grid.map((row) => row.slice());
    for (const [row, column] of clusterCells) {
      tempGrid[row][column] = symbol;
    }
    // 3. Flood-fill: check full connected cluster size from any new cluster cell
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    function dfs(row, column) {
      if (
        row < 0 ||
        row >= rows ||
        column < 0 ||
        column >= cols ||
        visited[row][column] ||
        tempGrid[row][column] !== symbol
      ) {
        return 0;
      }
      visited[row][column] = true;
      let connectedCount = 1;
      const directions = [
        [1, 0], // down
        [-1, 0], // up
        [0, 1], // right
        [0, -1], // left
      ];
      for (const [rowOffset, columnOffset] of directions) {
        connectedCount += dfs(row + rowOffset, column + columnOffset);
      }
      return connectedCount;
    }
    // 4. Pick just one of the cluster cells and count the connected cluster
    const [startRow, startCol] = clusterCells[0];
    const totalConnectedSize = dfs(startRow, startCol);

    // 5. Reject if the resulting connected size exceeds max allowed
    return totalConnectedSize <= maxClusterSize;
  }

  // Try to place a cluster of a given size and symbol
  function tryPlaceCluster(clusterSize, symbol) {
    const directions = [
      [1, 0], // down
      [0, 1], // right
      [-1, 0], // up
      [0, -1], // left
    ];
    const maxPlacementAttempts = 50;
    for (let attempt = 0; attempt < maxPlacementAttempts; attempt++) {
      const emptyCells = getEmptyCells();
      if (emptyCells.length === 0) return false;
      const [startRow, startColumn] =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const [rowDirection, columnDirection] =
        directions[Math.floor(Math.random() * directions.length)];
      // Construct the cluster cell positions based on direction
      const clusterCells = [];
      for (let offset = 0; offset < clusterSize; offset++) {
        const newRow = startRow + rowDirection * offset;
        const newColumn = startColumn + columnDirection * offset;
        clusterCells.push([newRow, newColumn]);
      }
      if (isValidClusterPlacement(clusterCells, symbol)) {
        for (const [row, column] of clusterCells) {
          grid[row][column] = symbol;
        }
        return true;
      }
    }
    return false; // Could not place this cluster
  }
  // 🌟 Main grid generation loop
  while (getEmptyCells().length > 0) {
    const clusterSize = chooseClusterSize();
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const clusterPlaced = tryPlaceCluster(clusterSize, symbol);
    if (!clusterPlaced) {
      // Fallback: place a single symbol in a random empty cell
      const emptyCells = getEmptyCells();
      if (emptyCells.length === 0) break;
      const [row, column] =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[row][column] = symbol;
    }
  }
  return grid;
}
// ===============================
// 🧪 Example Usage
// ===============================
const symbols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const options = {
  maxClusterSize: 4,
  clusterProbabilities: {
    2: 0.4,
    3: 0.1,
    4: 0.02,
  },
};
const resultGrid = dropSyms(6, 8, symbols, options);
// ️ Print the resulting grid
resultGrid.forEach((row) => {
  console.log(row.map((symbol) => symbol || ".").join(" "));
});
