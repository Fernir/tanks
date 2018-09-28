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

const locationStatus = (locationS, locationGrid, size) => {
  const gridSizeY = size;
  const gridSizeX = size;
  const dftS = locationS.distanceFromTop;
  const dflS = locationS.distanceFromLeft;

  if (locationS.distanceFromLeft < 0 || locationS.distanceFromLeft >= gridSizeX || locationS.distanceFromTop < 0 || locationS.distanceFromTop >= gridSizeY) {
    return STATUS_INVALID;
  } else if (locationGrid[dftS * size + dflS] === 99) {
    return STATUS_GOAL;
  } else if (locationGrid[dftS * size + dflS] !== 0) {
    return STATUS_BLOCKED;
  }
  return STATUS_VALID;
};

const exploreInDirection = (currentLocation, direction, directionGrid, size) => {
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
  newLocation.status = locationStatus(newLocation, directionGrid, size);

  if (newLocation.status === STATUS_VALID) {
    directionGrid[newLocation.distanceFromTop * size + newLocation.distanceFromLeft] = STATUS_VISITED;
  }

  return newLocation;
};

export const findShortestPath = (x, y, x2, y2, origGrid, size) => {
  const distanceFromTop = x || 0;
  const distanceFromLeft = y || 0;

  const grid = origGrid.slice();

  grid[x2 * size + y2] = 99;

  const location = {distanceFromTop, distanceFromLeft, path: [], status: 'Start'};

  const queue = [location, location];

  while (queue.length > 0) {
    const currentLocation = queue.shift();

    // Explore top
    let newLocation = exploreInDirection(currentLocation, WAY_TOP, grid, size);
    if (newLocation.status === STATUS_GOAL) {
      return newLocation.path;
    } else if (newLocation.status === STATUS_VALID) {
      queue.push(newLocation);
    }

    // Explore right
    newLocation = exploreInDirection(currentLocation, WAY_RIGHT, grid, size);
    if (newLocation.status === STATUS_GOAL) {
      return newLocation.path;
    } else if (newLocation.status === STATUS_VALID) {
      queue.push(newLocation);
    }

    // Explore bottom
    newLocation = exploreInDirection(currentLocation, WAY_BOTTOM, grid, size);
    if (newLocation.status === STATUS_GOAL) {
      return newLocation.path;
    } else if (newLocation.status === STATUS_VALID) {
      queue.push(newLocation);
    }

    // Explore left
    newLocation = exploreInDirection(currentLocation, WAY_LEFT, grid, size);
    if (newLocation.status === STATUS_GOAL) {
      return newLocation.path;
    } else if (newLocation.status === STATUS_VALID) {
      queue.push(newLocation);
    }
  }

  return false;
};
