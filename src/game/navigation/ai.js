import game from './../game';

export const WAY_LEFT = 'left';
export const WAY_RIGHT = 'right';
export const WAY_TOP = 'top';
export const WAY_BOTTOM = 'bottom';

export const STATUS_VISITED = 'visited';
export const STATUS_INVALID = 'invalid';
export const STATUS_VALID = 'valid';
export const STATUS_GOAL = 'goal';
export const STATUS_BLOCKED = 'blocked';

const locationStatus = (locationS, locationGrid) => {
  const gridSizeY = locationGrid.length;
  const gridSizeX = locationGrid[0].length;
  const dftS = locationS.distanceFromTop;
  const dflS = locationS.distanceFromLeft;

  if (locationS.distanceFromLeft < 0 || locationS.distanceFromLeft >= gridSizeX || locationS.distanceFromTop < 0 || locationS.distanceFromTop >= gridSizeY) {
    return STATUS_INVALID;
  } else if (locationGrid[dftS][dflS] === 99) {
    return STATUS_GOAL;
  } else if (locationGrid[dftS][dflS] !== 0) {
    return STATUS_BLOCKED;
  }
  return STATUS_VALID;
};

const exploreInDirection = (currentLocation, direction, directionGrid, debug = false) => {
  const newPath = currentLocation.path.slice();
  newPath.push(direction);

  let dft = currentLocation.distanceFromTop;
  let dfl = currentLocation.distanceFromLeft;

  if (direction === WAY_BOTTOM) {
    dft--;
  } else if (direction === WAY_RIGHT) {
    dfl++;
  } else if (direction === WAY_TOP) {
    dft++;
  } else if (direction === WAY_LEFT) {
    dfl--;
  }

  const newLocation = {distanceFromTop: dft, distanceFromLeft: dfl, path: newPath, status: 'Unknown'};
  newLocation.status = locationStatus(newLocation, directionGrid);

  if (newLocation.status === STATUS_VALID) {
    directionGrid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = STATUS_VISITED;

    if (debug) {
      const ctx = game.ctx;

      ctx.beginPath();
      // noinspection JSUndefinedPropertyAssignment
      ctx.lineWidth = 1;
      // noinspection JSUndefinedPropertyAssignment
      ctx.strokeStyle = '#0000ff';
      ctx.rect((newLocation.distanceFromLeft * game.spriteSize) + 1, (newLocation.distanceFromTop * game.spriteSize) + 1, game.spriteSize - 1, game.spriteSize - 1);
      ctx.stroke();
    }
  }

  return newLocation;
};

export const findShortestPath = (x, y, x2, y2, origGrid, debug = false) => {
  const distanceFromTop = x || 0;
  const distanceFromLeft = y || 0;

  const grid = JSON.parse(JSON.stringify(origGrid));

  grid[x2][y2] = 99;

  const location = {distanceFromTop, distanceFromLeft, path: [], status: 'Start'};

  const queue = [location, location];

  while (queue.length > 0) {
    const currentLocation = queue.shift();

    // Explore top
    let newLocation = exploreInDirection(currentLocation, WAY_TOP, grid, debug);
    if (newLocation.status === STATUS_GOAL) {
      return newLocation.path;
    } else if (newLocation.status === STATUS_VALID) {
      queue.push(newLocation);
    }

    // Explore right
    newLocation = exploreInDirection(currentLocation, WAY_RIGHT, grid, debug);
    if (newLocation.status === STATUS_GOAL) {
      return newLocation.path;
    } else if (newLocation.status === STATUS_VALID) {
      queue.push(newLocation);
    }

    // Explore bottom
    newLocation = exploreInDirection(currentLocation, WAY_BOTTOM, grid, debug);
    if (newLocation.status === STATUS_GOAL) {
      return newLocation.path;
    } else if (newLocation.status === STATUS_VALID) {
      queue.push(newLocation);
    }

    // Explore left
    newLocation = exploreInDirection(currentLocation, WAY_LEFT, grid, debug);
    if (newLocation.status === STATUS_GOAL) {
      return newLocation.path;
    } else if (newLocation.status === STATUS_VALID) {
      queue.push(newLocation);
    }
  }

  return false;
};
