from flask import Flask, render_template, request, jsonify
import os
from wumpus_logic import WumpusWorld, solve_wumpus

# Set up the proper template folder path
base_dir = os.path.abspath(os.path.dirname(__file__))
template_dir = os.path.join(base_dir, 'templates')
static_dir = os.path.join(base_dir, 'static')

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solver')
def solver():
    return render_template('solver.html')

@app.route('/api/solve', methods=['POST'])
def solve():
    data = request.json
    grid_size = int(data.get('gridSize', 4))
    wumpus_pos = data.get('wumpusPos', '2,1')
    gold_pos = data.get('goldPos', '1,3')
    pit_positions = data.get('pitPositions', '0,2,2,3')
    
    # Parse positions
    wumpus_x, wumpus_y = map(int, wumpus_pos.split(','))
    gold_x, gold_y = map(int, gold_pos.split(','))
    
    pit_pos_list = []
    if pit_positions:
        pit_coords = pit_positions.split(',')
        for i in range(0, len(pit_coords), 2):
            if i+1 < len(pit_coords):
                pit_pos_list.append((int(pit_coords[i]), int(pit_coords[i+1])))
    
    # Create the world
    world = WumpusWorld(grid_size, wumpus_pos=(wumpus_x, wumpus_y), 
                       gold_pos=(gold_x, gold_y), pit_positions=pit_pos_list)
    
    # Solve
    solution_path, states = solve_wumpus(world)
    
    return jsonify({
        'path': solution_path,
        'states': states
    })

if __name__ == '__main__':
    print(f"Templates directory: {template_dir}")
    print(f"Static directory: {static_dir}")
    app.run(debug=True) 