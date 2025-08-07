let selectedNum = null;
        let selectedTile = null;
        let errors = 0;
        let board = [];
        let solution = [];
        let notesMode = false;
        let difficulty = 'beginner';
        let timer = null;
        let seconds = 0;
        let gameActive = true;
        let tileNotes = {};

        const difficultyLevels = {
            'beginner': 26,
            'easy': 38,
            'normal': 44,
            'hard': 58,
            'expert': 68
        };

        function generateSolution() {
            const sol = Array(9).fill().map(() => Array(9).fill(0));
            
            for (let box = 0; box < 9; box += 3) {
                fillBox(sol, box, box);
            }
            
            solveSudoku(sol);
            return sol.map(row => row.join(''));
        }

        function fillBox(grid, row, col) {
            const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            shuffle(nums);
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    grid[row + i][col + j] = nums.pop();
                }
            }
        }

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        function isValid(grid, row, col, num) {

            for (let x = 0; x < 9; x++) {
                if (grid[row][x] === num) return false;
            }

            for (let x = 0; x < 9; x++) {
                if (grid[x][col] === num) return false;
            }

            const startRow = row - row % 3;
            const startCol = col - col % 3;
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (grid[i + startRow][j + startCol] === num) return false;
                }
            }
            
            return true;
        }

        function solveSudoku(grid) {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (grid[row][col] === 0) {
                        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                        shuffle(nums);
                        
                        for (let num of nums) {
                            if (isValid(grid, row, col, num)) {
                                grid[row][col] = num;
                                
                                if (solveSudoku(grid)) {
                                    return true;
                                }
                                
                                grid[row][col] = 0;
                            }
                        }
                        
                        return false;
                    }
                }
            }
            
            return true;
        }

        function generatePuzzle(solution, difficultyLevel) {
            const puzzle = solution.map(row => row.split(''));
            let cellsToRemove = difficultyLevels[difficultyLevel];
            
            while (cellsToRemove > 0) {
                const row = Math.floor(Math.random() * 9);
                const col = Math.floor(Math.random() * 9);
                
                if (puzzle[row][col] !== '-') {
                    puzzle[row][col] = '-';
                    cellsToRemove--;
                }
            }
            
            return puzzle.map(row => row.join(''));
        }

        function initGame() {
            if (timer) {
                clearInterval(timer);
            }
            
            solution = generateSolution();
            board = generatePuzzle(solution, difficulty);
            errors = 0;
            seconds = 0;
            gameActive = true;
            tileNotes = {};

            document.getElementById("errors").innerText = "Errors: " + errors;
            document.getElementById("timer").innerText = "Time: " + formatTime(seconds);
            document.getElementById("message").style.display = "none";

            document.getElementById("board").innerHTML = "";
            document.getElementById("digits").innerHTML = "";
            
            timer = setInterval(updateTimer, 1000);
            
            setGame();
        }

        function formatTime(totalSeconds) {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function updateTimer() {
            if (gameActive) {
                seconds++;
                document.getElementById("timer").innerText = "Time: " + formatTime(seconds);
            }
        }

        function checkWin() {
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    const tile = document.getElementById(r + "-" + c);
                    const value = tile.querySelector('.tile-value').innerText;
                    if (value === "" || value !== solution[r][c]) {
                        return false;
                    }
                }
            }
            
            gameActive = false;
            clearInterval(timer);
            document.getElementById("message").style.display = "block";
            return true;
        }

        window.onload = function() {

            document.getElementById("new-game-btn").addEventListener("click", initGame);
            document.getElementById("notes-btn").addEventListener("click", toggleNotesMode);

            document.querySelectorAll(".difficulty-btn").forEach(btn => {
                btn.addEventListener("click", function() {
                    document.querySelectorAll(".difficulty-btn").forEach(b => b.classList.remove("active"));
                    this.classList.add("active");

                    difficulty = this.dataset.level;
                    initGame();
                });
            });

            initGame();
        }

        function setGame() {

            for (let i = 1; i <= 9; i++) {
                let number = document.createElement("div");
                number.id = i;
                number.innerText = i;
                number.addEventListener("click", selectNumber);
                number.classList.add("number");
                document.getElementById("digits").appendChild(number);
            }

            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    let tile = document.createElement("div");
                    tile.id = r.toString() + "-" + c.toString();
                    
                    let tileContent = document.createElement("div");
                    tileContent.classList.add("tile-content");
                    
                    let tileValue = document.createElement("div");
                    tileValue.classList.add("tile-value");
                    
                    let tileNotesContainer = document.createElement("div");
                    tileNotesContainer.classList.add("tile-notes");
                    
                    for (let i = 1; i <= 9; i++) {
                        let note = document.createElement("div");
                        note.classList.add("note");
                        note.dataset.note = i;
                        tileNotesContainer.appendChild(note);
                    }
                    
                    tileContent.appendChild(tileValue);
                    tileContent.appendChild(tileNotesContainer);
                    tile.appendChild(tileContent);
                    
                    if (board[r][c] !== "-") {
                        tileValue.innerText = board[r][c];
                        tile.classList.add("tile-start");
                    }
                    
                    if (r % 3 === 0) tile.classList.add("border-top-bold");
                    if (c % 3 === 0) tile.classList.add("border-left-bold");
                    if (r === 8) tile.classList.add("border-bottom-bold");
                    if (c === 8) tile.classList.add("border-right-bold");
                    
                    tile.addEventListener("click", selectTile);
                    tile.classList.add("tile");
                    document.getElementById("board").append(tile);
                }
            }
        }

        function selectNumber() {
            if (selectedNum != null) {
                selectedNum.classList.remove("number-selected");
            }
            selectedNum = this;
            selectedNum.classList.add("number-selected");
            clearInvalidHighlights();
        }

        function selectTile() {
            clearHighlights();
            
            if (selectedTile) {
                selectedTile.classList.remove("tile-selected");
            }
            
            this.classList.add("tile-selected");
            selectedTile = this;
            
            let tileValue = this.querySelector('.tile-value').innerText;
            
            if (tileValue !== "") {
                highlightSameNumbers(tileValue);
            }
            
            if (tileValue !== "") {
                let coords = this.id.split("-");
                let r = parseInt(coords[0]);
                let c = parseInt(coords[1]);
                highlightInvalidPositions(r, c, tileValue);
            }
            
            if (notesMode && selectedNum) {
                if (this.classList.contains("tile-start")) {
                    return;
                }
                
                let coords = this.id.split("-");
                let r = parseInt(coords[0]);
                let c = parseInt(coords[1]);
                let tileId = r + "-" + c;
                
                if (!tileNotes[tileId]) {
                    tileNotes[tileId] = [];
                }
                
                let noteValue = selectedNum.id;
                let noteElement = this.querySelector(`.note[data-note="${noteValue}"]`);
                
                if (tileNotes[tileId].includes(noteValue)) {

                    tileNotes[tileId] = tileNotes[tileId].filter(n => n !== noteValue);
                    noteElement.innerText = "";
                } else {

                    tileNotes[tileId].push(noteValue);
                    noteElement.innerText = noteValue;
                }
                
                return;
            }
            
            if (selectedNum) {
                if (this.classList.contains("tile-start")) {
                    return;
                }
                
                let coords = this.id.split("-");
                let r = parseInt(coords[0]);
                let c = parseInt(coords[1]);
                let tileValueElement = this.querySelector('.tile-value');

                let tileId = r + "-" + c;
                if (tileNotes[tileId]) {
                    tileNotes[tileId] = [];
                    this.querySelectorAll('.note').forEach(note => {
                        note.innerText = "";
                    });
                }
                
                if (solution[r][c] == selectedNum.id) {
                    tileValueElement.innerText = selectedNum.id;
                    this.classList.add("tile-correct");
                    
                    checkWin();
                } else {
                    errors += 1;
                    document.getElementById("errors").innerText = "Errors: " + errors;
                }
            }
        }

        function toggleNotesMode() {
            notesMode = !notesMode;
            document.getElementById("notes-btn").classList.toggle("active");
            
            if (notesMode) {
                document.getElementById("notes-btn").innerText = "Exit Notes";
            } else {
                document.getElementById("notes-btn").innerText = "Notes Mode";
            }
            
            if (selectedNum) {
                selectedNum.classList.remove("number-selected");
                selectedNum = null;
            }
        }

        function clearHighlights() {
            document.querySelectorAll('.tile-invalid').forEach(tile => {
                tile.classList.remove('tile-invalid');
            });
            document.querySelectorAll('.tile-highlight').forEach(tile => {
                tile.classList.remove('tile-highlight');
            });
        }

        function clearInvalidHighlights() {
            document.querySelectorAll('.tile-invalid').forEach(tile => {
                tile.classList.remove('tile-invalid');
            });
        }

        function highlightSameNumbers(number) {
            document.querySelectorAll('.tile').forEach(tile => {
                let tileValue = tile.querySelector('.tile-value').innerText;
                if (tileValue === number) {
                    tile.classList.add("tile-highlight");
                }
            });
        }

        function highlightInvalidPositions(row, col, num) {

            let boxRowStart = Math.floor(row / 3) * 3;
            let boxColStart = Math.floor(col / 3) * 3;
            
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (r === row && c === col) continue;
                    
                    if (r === row || c === col || 
                        (r >= boxRowStart && r < boxRowStart + 3 && 
                         c >= boxColStart && c < boxColStart + 3)) {
                        
                        let tile = document.getElementById(r + "-" + c);
                        let tileValue = tile.querySelector('.tile-value').innerText;
                        if (tileValue === "" || tileValue !== num) {
                            tile.classList.add("tile-invalid");
                        }
                    }
                }
            }
        }