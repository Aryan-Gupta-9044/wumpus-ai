class WumpusWorld:
    def __init__(self, size=4, wumpus_pos=(2, 1), gold_pos=(1, 3), pit_positions=[(0, 2), (2, 3)]):
        self.size = size
        self.wumpus_pos = wumpus_pos
        self.gold_pos = gold_pos
        self.pit_positions = pit_positions
        
        # Knowledge base will store what we know about each cell
        self.kb = {}
        for x in range(size):
            for y in range(size):
                self.kb[(x, y)] = {
                    'visited': False,
                    'safe': None,  # True, False, or None (unknown)
                    'wumpus': None,
                    'pit': None,
                    'gold': None,
                    'breeze': None,
                    'stench': None,
                    'glitter': None
                }
        
        # Start position is (0, 0) and is safe
        self.kb[(0, 0)]['safe'] = True
        self.kb[(0, 0)]['wumpus'] = False
        self.kb[(0, 0)]['pit'] = False
        
        # Gold position has glitter
        self.kb[gold_pos]['gold'] = True
        self.kb[gold_pos]['glitter'] = True
        
        # Set up percepts
        # Breeze near pits
        for pit_pos in pit_positions:
            for adj_pos in self._get_adjacent_positions(pit_pos):
                if 0 <= adj_pos[0] < size and 0 <= adj_pos[1] < size:
                    self.kb[adj_pos]['breeze'] = True
        
        # Stench near wumpus
        for adj_pos in self._get_adjacent_positions(wumpus_pos):
            if 0 <= adj_pos[0] < size and 0 <= adj_pos[1] < size:
                self.kb[adj_pos]['stench'] = True
    
    def _get_adjacent_positions(self, pos):
        x, y = pos
        return [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
    
    def get_percepts(self, pos):
        percepts = []
        if pos in self.kb:
            if self.kb[pos]['breeze']:
                percepts.append('Breeze')
            if self.kb[pos]['stench']:
                percepts.append('Stench')
            if self.kb[pos]['glitter']:
                percepts.append('Glitter')
        return percepts
    
    def is_safe(self, pos):
        if pos[0] < 0 or pos[0] >= self.size or pos[1] < 0 or pos[1] >= self.size:
            return False
        
        if pos == self.wumpus_pos or pos in self.pit_positions:
            return False
        
        return True

def solve_wumpus(world):
    """
    Solve the Wumpus World using logic-based inference.
    
    Args:
        world: WumpusWorld instance
        
    Returns:
        tuple: (path, states) where path is a list of positions and states is a list of percepts
    """
    # Start at (0, 0)
    current_pos = (0, 0)
    visited = {current_pos}
    path = [current_pos]
    states = [world.get_percepts(current_pos)]
    
    # Knowledge base to track safe cells
    safe_cells = {current_pos}
    
    # Mark starting cell as visited in knowledge base
    world.kb[current_pos]['visited'] = True
    
    # If no percepts at starting position, mark adjacent cells as safe
    if not world.get_percepts(current_pos):
        for adj_pos in world._get_adjacent_positions(current_pos):
            if 0 <= adj_pos[0] < world.size and 0 <= adj_pos[1] < world.size:
                safe_cells.add(adj_pos)
                world.kb[adj_pos]['safe'] = True
                world.kb[adj_pos]['wumpus'] = False
                world.kb[adj_pos]['pit'] = False
    
    # Main search loop
    while current_pos != world.gold_pos:
        # Update knowledge based on current percepts
        percepts = world.get_percepts(current_pos)
        
        # If we're at gold, break
        if 'Glitter' in percepts:
            break
        
        # Update knowledge about adjacent cells
        for adj_pos in world._get_adjacent_positions(current_pos):
            if 0 <= adj_pos[0] < world.size and 0 <= adj_pos[1] < world.size:
                if 'Breeze' not in percepts and 'Stench' not in percepts:
                    # If no breeze or stench, adjacent cells are safe
                    safe_cells.add(adj_pos)
                    world.kb[adj_pos]['safe'] = True
                    world.kb[adj_pos]['wumpus'] = False
                    world.kb[adj_pos]['pit'] = False
        
        # Choose next position (BFS to find closest safe unvisited cell)
        queue = [current_pos]
        came_from = {current_pos: None}
        found_target = None
        
        while queue and not found_target:
            pos = queue.pop(0)
            
            # Check adjacent cells
            for adj_pos in world._get_adjacent_positions(pos):
                if 0 <= adj_pos[0] < world.size and 0 <= adj_pos[1] < world.size:
                    # If this position is in safe_cells but not visited, it's our target
                    if adj_pos in safe_cells and adj_pos not in visited:
                        came_from[adj_pos] = pos
                        found_target = adj_pos
                        break
                    
                    # If position is in safe_cells and not already in came_from, add to queue
                    if adj_pos in safe_cells and adj_pos not in came_from:
                        queue.append(adj_pos)
                        came_from[adj_pos] = pos
        
        # If we couldn't find a safe unvisited cell, we're stuck or finished
        if not found_target:
            break
        
        # Reconstruct path to target
        target_path = []
        current = found_target
        while current != current_pos:
            target_path.append(current)
            current = came_from[current]
        target_path.reverse()
        
        # Move along path to target
        for next_pos in target_path:
            current_pos = next_pos
            visited.add(current_pos)
            path.append(current_pos)
            states.append(world.get_percepts(current_pos))
            world.kb[current_pos]['visited'] = True
    
    # If we found gold, return to start (simplified for demo)
    if current_pos == world.gold_pos:
        # Add a simple path back to start (0,0) for demonstration
        path.append((0, 0))
        states.append([])
    
    return path, states 