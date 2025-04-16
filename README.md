# AI Solvers - Wumpus World Web Application

A web-based implementation of the Wumpus World game with an AI solver, built using Flask.

## Features

* Interactive Wumpus World game interface
* AI solver that demonstrates knowledge-based reasoning
* Real-time game state updates
* Responsive web design

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/wumpus_ai.git
cd wumpus_ai
```

2. Create a virtual environment (recommended):
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```
pip install -r requirements.txt
```

## Running the Application

1. Start the Flask server:
```
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

## Project Structure

* `app.py` - Main Flask application
* `wumpus_logic.py` - Core game logic
* `templates/` - HTML templates
  * `index.html` - Main game interface
  * `solver.html` - AI solver explanation
* `static/` - Static assets
  * `style.css` - Stylesheets
  * `wumpus.js` - JavaScript files

## How to Play

1. Start a new game by clicking "Start New Game"
2. Use the arrow keys or click buttons to move the agent
3. Collect gold and avoid the Wumpus and pits
4. Try the AI solver to see how an intelligent agent would play

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

This application is configured for deployment on Render using the provided `render.yaml` file. 