import { useEffect, useRef, useState } from 'react';
import './BrickBreaker.css';

export default function BrickBreaker() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('credible_brick_breaker_highscore') || '0', 10);
  });
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    
    // Game constants
    const ballRadius = 8;
    const paddleHeight = 10;
    const paddleWidth = 75;
    
    const brickRowCount = 3;
    const brickColumnCount = 6;
    const brickWidth = 65;
    const brickHeight = 15;
    const brickPadding = 8;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 25;

    // Game variables
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let baseSpeed = 2;
    let dx = baseSpeed;
    let dy = -baseSpeed;
    let paddleX = (canvas.width - paddleWidth) / 2;
    
    let rightPressed = false;
    let leftPressed = false;
    
    let currentScore = 0;
    let currentHighScore = highScore;

    // Initialize bricks
    let bricks = [];
    function resetBricks() {
      bricks = [];
      for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
          bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
      }
    }
    resetBricks();

    // Event handlers
    function keyDownHandler(e) {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
      }
    }

    function keyUpHandler(e) {
      if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
      }
    }

    function mouseMoveHandler(e) {
      const relativeX = e.clientX - canvas.getBoundingClientRect().left;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
      }
    }

    function touchMoveHandler(e) {
      if (e.touches && e.touches[0]) {
        const relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        if (relativeX > 0 && relativeX < canvas.width) {
          paddleX = relativeX - paddleWidth / 2;
        }
      }
    }

    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    document.addEventListener('mousemove', mouseMoveHandler, false);
    canvas.addEventListener('touchmove', touchMoveHandler, { passive: true });

    // Collision detection
    function collisionDetection() {
      let activeBricks = 0;
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            activeBricks++;
            if (
              x > b.x &&
              x < b.x + brickWidth &&
              y > b.y &&
              y < b.y + brickHeight
            ) {
              dy = -dy;
              b.status = 0;
              currentScore += 10;
              setScore(currentScore);
              
              if (currentScore > currentHighScore) {
                currentHighScore = currentScore;
                setHighScore(currentHighScore);
                localStorage.setItem('credible_brick_breaker_highscore', currentHighScore.toString());
              }
            }
          }
        }
      }

      // If all bricks are broken, reset bricks and speed up ball
      if (activeBricks === 0) {
        baseSpeed += 0.5;
        dx = dx > 0 ? baseSpeed : -baseSpeed;
        dy = dy > 0 ? baseSpeed : -baseSpeed;
        resetBricks();
        x = canvas.width / 2;
        y = canvas.height - 30;
      }
    }

    // Draw functions
    function drawBall() {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1'; // Indigo-500 matching modern styling
      ctx.fill();
      ctx.closePath();
    }

    function drawPaddle() {
      ctx.beginPath();
      ctx.rect(paddleX, canvas.height - paddleHeight - 2, paddleWidth, paddleHeight);
      ctx.fillStyle = '#4f46e5'; // Indigo-600
      ctx.fill();
      ctx.closePath();
    }

    function drawBricks() {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            
            // Harmonious gradient colors based on row
            if (r === 0) ctx.fillStyle = '#ec4899'; // Pink-500
            else if (r === 1) ctx.fillStyle = '#a855f7'; // Purple-500
            else ctx.fillStyle = '#3b82f6'; // Blue-500
            
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      // Bounce off walls
      if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
      }
      
      // Bounce off ceiling
      if (y + dy < ballRadius) {
        dy = -dy;
      } else if (y + dy > canvas.height - ballRadius - paddleHeight - 2) {
        // Check if hitting paddle
        if (x > paddleX && x < paddleX + paddleWidth) {
          dy = -dy;
        } else {
          // Ball fell out of bounds
          setGameOver(true);
          return;
        }
      }

      // Move paddle
      if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 5;
      } else if (leftPressed && paddleX > 0) {
        paddleX -= 5;
      }

      x += dx;
      y += dy;
      animationId = requestAnimationFrame(draw);
    }

    // Start drawing
    draw();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      document.removeEventListener('mousemove', mouseMoveHandler);
    };
  }, [gameOver]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="brick-breaker-wrapper">
      <div className="brick-breaker-header">
        <div className="score-badge">
          <span>Score:</span> <strong id="brick-breaker-score">{score}</strong>
        </div>
        <div className="score-badge">
          <span>High Score:</span> <strong id="brick-breaker-highscore">{highScore}</strong>
        </div>
      </div>

      <div className="canvas-container">
        <canvas ref={canvasRef} width="480" height="320" />
        
        {gameOver && (
          <div className="game-over-overlay animate-fade-in">
            <h3>Game Over</h3>
            <p>You scored {score} points!</p>
            <button className="btn btn-primary btn-sm" onClick={resetGame}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
