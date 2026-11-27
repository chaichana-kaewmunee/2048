import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BOARD_SIZE, type Board, type Direction, type MoveResult } from '@neonfusion/core';
import { formatNumber, translate, type Language } from '../i18n/messages';

const LOGICAL_SIZE = 640;
const PADDING = 18;
const GAP = 14;

function calculateCellSize(boardSize: number): number {
  return (LOGICAL_SIZE - PADDING * 2 - GAP * (boardSize - 1)) / boardSize;
}

interface CellView {
  container: Phaser.GameObjects.Container;
  graphics: Phaser.GameObjects.Graphics;
  label: Phaser.GameObjects.Text;
  value: number;
}

interface BoardBridge {
  getBoard: () => Board;
  getLastMove: () => MoveResult | null;
  getLanguage: () => Language;
  isDisabled: () => boolean;
  prefersReducedMotion: () => boolean;
  onMove: (direction: Direction) => void;
}

function tilePalette(value: number): { background: number; foreground: number; glow: number } {
  const palette: Record<number, { background: number; foreground: number; glow: number }> = {
    2: { background: 0x123043, foreground: 0x8ff7ff, glow: 0x28d7e7 },
    4: { background: 0x123556, foreground: 0xa9e8ff, glow: 0x3aa7ff },
    8: { background: 0x292054, foreground: 0xd8c4ff, glow: 0x936bff },
    16: { background: 0x451849, foreground: 0xffc3f4, glow: 0xe255c7 },
    32: { background: 0x512036, foreground: 0xffb5c8, glow: 0xff527d },
    64: { background: 0x55291e, foreground: 0xffd0a8, glow: 0xff874d },
    128: { background: 0x514316, foreground: 0xffeda1, glow: 0xffc238 },
    256: { background: 0x25452b, foreground: 0xc6ffd0, glow: 0x62e987 },
    512: { background: 0x0f4744, foreground: 0xa8fff0, glow: 0x31dfc2 },
    1024: { background: 0x4a293e, foreground: 0xffd7ec, glow: 0xff70b6 },
    2048: { background: 0x5b4815, foreground: 0xffffff, glow: 0xffe066 },
  };
  return palette[value] ?? { background: 0x1b2238, foreground: 0xffffff, glow: 0x9aa8ff };
}

class BoardScene extends Phaser.Scene {
  private cells: CellView[] = [];
  private currentBoardSize = 4;
  private ready = false;
  private pointerStart: { x: number; y: number } | null = null;

  constructor(private readonly bridge: () => BoardBridge) {
    super('BoardScene');
  }

  create(): void {
    const background = this.add.graphics();
    background.fillStyle(0x080d1c, 0.96);
    background.fillRoundedRect(0, 0, LOGICAL_SIZE, LOGICAL_SIZE, 28);
    background.lineStyle(2, 0x2a3d61, 0.9);
    background.strokeRoundedRect(1, 1, LOGICAL_SIZE - 2, LOGICAL_SIZE - 2, 28);

    const initialBoard = this.bridge().getBoard();
    this.setupCells(initialBoard.length || 4);

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (this.bridge().isDisabled()) {
        return;
      }
      const directions: Record<string, Direction> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowUp: 'up',
        ArrowDown: 'down',
        a: 'left',
        d: 'right',
        w: 'up',
        s: 'down',
      };
      const direction = directions[event.key] ?? directions[event.key.toLowerCase()];
      if (direction) {
        event.preventDefault();
        this.bridge().onMove(direction);
      }
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerStart = { x: pointer.x, y: pointer.y };
    });
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.pointerStart || this.bridge().isDisabled()) {
        this.pointerStart = null;
        return;
      }
      const dx = pointer.x - this.pointerStart.x;
      const dy = pointer.y - this.pointerStart.y;
      this.pointerStart = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) {
        return;
      }
      this.bridge().onMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
    });

    this.ready = true;
    this.renderBoard(this.bridge().getBoard(), null);
  }

  private setupCells(size: number): void {
    this.cells.forEach((cell) => cell.container.destroy());
    this.cells = [];
    this.currentBoardSize = size;
    const cellSize = calculateCellSize(size);

    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const x = PADDING + col * (cellSize + GAP) + cellSize / 2;
        const y = PADDING + row * (cellSize + GAP) + cellSize / 2;
        const container = this.add.container(x, y);
        const graphics = this.add.graphics();
        const label = this.add
          .text(0, 0, '', {
            fontFamily: 'Inter, "Noto Sans Thai", system-ui, sans-serif',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
          })
          .setOrigin(0.5);
        container.add([graphics, label]);
        this.cells.push({ container, graphics, label, value: 0 });
      }
    }
  }

  updateBoard(board: Board, lastMove: MoveResult | null): void {
    if (this.ready) {
      this.renderBoard(board, lastMove);
    }
  }

  private renderBoard(board: Board, lastMove: MoveResult | null): void {
    const size = board.length;
    if (this.currentBoardSize !== size || this.cells.length !== size * size) {
      this.setupCells(size);
    }

    const language = this.bridge().getLanguage();
    const reduceMotion = this.bridge().prefersReducedMotion();
    const cellSize = calculateCellSize(size);
    const half = cellSize / 2;
    const fontMultiplier = size >= 5 ? 0.78 : 1.0;

    board.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const cell = this.cells[rowIndex * size + colIndex];
        if (!cell) {
          return;
        }
        cell.value = value;
        const palette = tilePalette(value);
        cell.graphics.clear();
        cell.graphics.fillStyle(palette.background, value === 0 ? 0.72 : 1);
        cell.graphics.fillRoundedRect(-half, -half, cellSize, cellSize, size >= 5 ? 12 : 16);
        cell.graphics.lineStyle(value >= 2048 ? 3 : 1.5, palette.glow, value === 0 ? 0.18 : 0.72);
        cell.graphics.strokeRoundedRect(-half, -half, cellSize, cellSize, size >= 5 ? 12 : 16);

        const digits = String(value).length;
        const baseSize = digits >= 5 ? 34 : digits === 4 ? 42 : digits === 3 ? 50 : 62;
        cell.label
          .setText(value === 0 ? '' : formatNumber(value, language))
          .setColor(`#${palette.foreground.toString(16).padStart(6, '0')}`)
          .setFontSize(Math.round(baseSize * fontMultiplier));

        const merged = lastMove?.merged.some((position) => position.row === rowIndex && position.col === colIndex);
        const spawned = lastMove?.spawned?.row === rowIndex && lastMove.spawned.col === colIndex;
        if (!reduceMotion && (merged || spawned)) {
          cell.container.setScale(spawned ? 0.72 : 0.88);
          this.tweens.add({
            targets: cell.container,
            scale: 1,
            duration: spawned ? 220 : 160,
            ease: 'Back.Out',
          });
        } else {
          cell.container.setScale(1);
        }
      });
    });
  }
}

interface GameBoardProps {
  board: Board;
  lastMove: MoveResult | null;
  language: Language;
  disabled: boolean;
  onMove: (direction: Direction) => void;
}

export function GameBoard({ board, lastMove, language, disabled, onMove }: GameBoardProps): React.JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BoardScene | null>(null);
  const bridgeRef = useRef<BoardBridge>({
    getBoard: () => board,
    getLastMove: () => lastMove,
    getLanguage: () => language,
    isDisabled: () => disabled,
    prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    onMove,
  });
  bridgeRef.current = {
    getBoard: () => board,
    getLastMove: () => lastMove,
    getLanguage: () => language,
    isDisabled: () => disabled,
    prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    onMove,
  };

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }
    const scene = new BoardScene(() => bridgeRef.current);
    sceneRef.current = scene;
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: LOGICAL_SIZE,
      height: LOGICAL_SIZE,
      transparent: true,
      scene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: true,
        roundPixels: false,
      },
      input: {
        keyboard: true,
        mouse: true,
        touch: true,
      },
      audio: {
        noAudio: true,
      },
      banner: false,
    });

    const canvas = game.canvas;
    canvas?.setAttribute('aria-hidden', 'true');

    return () => {
      sceneRef.current = null;
      game.destroy(true);
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.updateBoard(board, lastMove);
  }, [board, lastMove, language]);

  const summary = board.map((row) => row.map((tile) => tile || '—').join(', ')).join('; ');

  return (
    <div
      className="board-shell"
      role="group"
      tabIndex={0}
      aria-label={translate(language, 'boardLabel')}
      aria-describedby="board-summary"
      data-testid="game-board"
    >
      <div ref={hostRef} className="board-host" />
      <p id="board-summary" className="sr-only">
        {translate(language, 'boardSummary')}: {summary}
      </p>
    </div>
  );
}
