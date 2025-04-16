document.addEventListener('DOMContentLoaded', function() {
    // Game state
    let gameActive = false;
    let currentPosition = [0, 0]; // [x, y]
    let score = 0;
    let goldFound = false;
    let gridSize = 4;
    
    // DOM elements
    const startNewGameBtn = document.getElementById('startNewGame');
    const showAISolutionBtn = document.getElementById('showAISolution');
    const moveUpBtn = document.getElementById('moveUp');
    const moveDownBtn = document.getElementById('moveDown');
    const moveLeftBtn = document.getElementById('moveLeft');
    const moveRightBtn = document.getElementById('moveRight');
    const positionDisplay = document.getElementById('position');
    const perceptsDisplay = document.getElementById('percepts');
    const scoreDisplay = document.getElementById('score');
    const goldDisplay = document.getElementById('gold');
    const solutionPathDisplay = document.getElementById('solutionPath');
    
    // Event listeners
    startNewGameBtn.addEventListener('click', startNewGame);
    showAISolutionBtn.addEventListener('click', showAISolution);
    moveUpBtn.addEventListener('click', () => move('up'));
    moveDownBtn.addEventListener('click', () => move('down'));
    moveLeftBtn.addEventListener('click', () => move('left'));
    moveRightBtn.addEventListener('click', () => move('right'));
    
    // Keyboard controls
    document.addEventListener('keydown', function(event) {
        if (!gameActive) return;
        
        switch(event.key) {
            case 'ArrowUp':
                move('up');
                break;
            case 'ArrowDown':
                move('down');
                break;
            case 'ArrowLeft':
                move('left');
                break;
            case 'ArrowRight':
                move('right');
                break;
        }
    });
    
    // Start new game
    function startNewGame() {
        gridSize = parseInt(document.getElementById('gridSize').value);
        const wumpusPos = document.getElementById('wumpusPos').value;
        const goldPos = document.getElementById('goldPos').value;
        const pitPositions = document.getElementById('pitPositions').value;
        
        // Reset game state
        gameActive = true;
        currentPosition = [0, 0];
        score = 0;
        goldFound = false;
        
        // Update display
        updateGameStatus();
        solutionPathDisplay.textContent = '';
    }
    
    // Show AI solution
    function showAISolution() {
        gridSize = parseInt(document.getElementById('gridSize').value);
        const wumpusPos = document.getElementById('wumpusPos').value;
        const goldPos = document.getElementById('goldPos').value;
        const pitPositions = document.getElementById('pitPositions').value;
        
        // Call the API to get the solution
        fetch('/api/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gridSize: gridSize,
                wumpusPos: wumpusPos,
                goldPos: goldPos,
                pitPositions: pitPositions
            })
        })
        .then(response => response.json())
        .then(data => {
            displaySolution(data);
        })
        .catch(error => {
            console.error('Error getting AI solution:', error);
            solutionPathDisplay.textContent = 'Error getting AI solution. Please try again.';
        });
    }
    
    // Display the AI solution
    function displaySolution(data) {
        const path = data.path;
        const states = data.states;
        
        let solutionHTML = '<h3>Solution Path:</h3>';
        solutionHTML += '<ol>';
        
        for (let i = 0; i < path.length; i++) {
            const [x, y] = path[i];
            const state = states[i];
            solutionHTML += `<li>Move to (${x}, ${y}) - Percepts: ${state}</li>`;
        }
        
        solutionHTML += '</ol>';
        solutionPathDisplay.innerHTML = solutionHTML;
    }
    
    // Move the agent
    function move(direction) {
        if (!gameActive) return;
        
        const [x, y] = currentPosition;
        
        // Update position based on direction
        switch(direction) {
            case 'up':
                if (y < gridSize - 1) currentPosition = [x, y + 1];
                break;
            case 'down':
                if (y > 0) currentPosition = [x, y - 1];
                break;
            case 'left':
                if (x > 0) currentPosition = [x - 1, y];
                break;
            case 'right':
                if (x < gridSize - 1) currentPosition = [x + 1, y];
                break;
        }
        
        // Decrease score for each move
        score -= 1;
        
        // Check for gold
        const goldPos = document.getElementById('goldPos').value.split(',');
        const goldX = parseInt(goldPos[0]);
        const goldY = parseInt(goldPos[1]);
        
        if (currentPosition[0] === goldX && currentPosition[1] === goldY && !goldFound) {
            goldFound = true;
            score += 1000; // Reward for finding gold
            goldDisplay.textContent = 'Gold: Found!';
        }
        
        // Check for wumpus
        const wumpusPos = document.getElementById('wumpusPos').value.split(',');
        const wumpusX = parseInt(wumpusPos[0]);
        const wumpusY = parseInt(wumpusPos[1]);
        
        if (currentPosition[0] === wumpusX && currentPosition[1] === wumpusY) {
            gameOver('Eaten by the Wumpus!');
            return;
        }
        
        // Check for pits
        const pitPositions = document.getElementById('pitPositions').value.split(',');
        for (let i = 0; i < pitPositions.length; i += 2) {
            if (i + 1 < pitPositions.length) {
                const pitX = parseInt(pitPositions[i]);
                const pitY = parseInt(pitPositions[i + 1]);
                
                if (currentPosition[0] === pitX && currentPosition[1] === pitY) {
                    gameOver('Fell into a pit!');
                    return;
                }
            }
        }
        
        // Update game status
        updateGameStatus();
    }
    
    // Update game status display
    function updateGameStatus() {
        const [x, y] = currentPosition;
        
        // Update position display
        positionDisplay.textContent = `Position: (${x}, ${y})`;
        
        // Update score display
        scoreDisplay.textContent = `Score: ${score}`;
        
        // Check percepts
        let percepts = [];
        
        // Check for breeze (near a pit)
        const pitPositions = document.getElementById('pitPositions').value.split(',');
        for (let i = 0; i < pitPositions.length; i += 2) {
            if (i + 1 < pitPositions.length) {
                const pitX = parseInt(pitPositions[i]);
                const pitY = parseInt(pitPositions[i + 1]);
                
                if (isAdjacent(x, y, pitX, pitY)) {
                    percepts.push('Breeze');
                    break;
                }
            }
        }
        
        // Check for stench (near the wumpus)
        const wumpusPos = document.getElementById('wumpusPos').value.split(',');
        const wumpusX = parseInt(wumpusPos[0]);
        const wumpusY = parseInt(wumpusPos[1]);
        
        if (isAdjacent(x, y, wumpusX, wumpusY)) {
            percepts.push('Stench');
        }
        
        // Check for glitter (gold in the same room)
        const goldPos = document.getElementById('goldPos').value.split(',');
        const goldX = parseInt(goldPos[0]);
        const goldY = parseInt(goldPos[1]);
        
        if (x === goldX && y === goldY) {
            percepts.push('Glitter');
        }
        
        // Update percepts display
        perceptsDisplay.textContent = `Percepts: ${percepts.length > 0 ? percepts.join(', ') : 'None'}`;
    }
    
    // Check if two positions are adjacent
    function isAdjacent(x1, y1, x2, y2) {
        return (
            (x1 === x2 && Math.abs(y1 - y2) === 1) ||
            (y1 === y2 && Math.abs(x1 - x2) === 1)
        );
    }
    
    // Game over
    function gameOver(reason) {
        gameActive = false;
        alert(`Game Over: ${reason}`);
    }
}); 
