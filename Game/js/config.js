/**
 * config.js - Game Configuration & Global State
 * All constants, game state variables, and data structures
 * Must be loaded first (other modules depend on these globals)
 */


    (function(){
        // Canvas roundRect polyfill for older browsers
        if (!CanvasRenderingContext2D.prototype.roundRect) {
            CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
                if (typeof r === 'number') r = [r, r, r, r];
                const radii = Array.isArray(r) ? r : [0,0,0,0];
                let tl = radii[0] || 0, tr = radii[1] || 0, br = radii[2] || 0, bl = radii[3] || 0;
                if (w < 2 * tl) tl = w / 2; if (w < 2 * tr) tr = w / 2; if (w < 2 * br) br = w / 2; if (w < 2 * bl) bl = w / 2;
                if (h < 2 * tl) tl = h / 2; if (h < 2 * tr) tr = h / 2; if (h < 2 * br) br = h / 2; if (h < 2 * bl) bl = h / 2;
                this.moveTo(x + tl, y);
                this.lineTo(x + w - tr, y);
                this.arcTo(x + w, y, x + w, y + h, tr);
                this.lineTo(x + w, y + h - br);
                this.arcTo(x + w, y + h, x, y + h, br);
                this.lineTo(x + bl, y + h);
                this.arcTo(x, y + h, x, y, bl);
                this.lineTo(x, y + tl);
                this.arcTo(x, y, x + w, y, tl);
                this.closePath();
                return this;
            };
        }
        // ---------- 画布与物理参数 ----------
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const powerRingCanvas = document.getElementById('powerRing');
        const ringCtx = powerRingCanvas.getContext('2d');
        const width = canvas.width, height = canvas.height;
        const center = { x: width/2, y: height/2 };
        const R = Math.min(width, height) * 0.4;
        const circle = { x: center.x, y: center.y, r: R };
        const ballR = 10;
        let whiteBall = { x: circle.x, y: circle.y - 70, vx: 0, vy: 0 };
        let targetBall = { x: circle.x + 60, y: circle.y + 40, r: 9 };
        
        // 游戏状态
        let score = 0;
        let isAiming = false;
        let aimEnd = { x: 0, y: 0 };
        let isMoving = false;
        let isStepMode = false;
        let prevWhiteBall = { x: 0, y: 0 };
        let friction = 0.985;
        let animFrame = null;
        let speedFactor = 1.0;
        let currentMode = 'free';   
        let currentCollisions = 0;
        let lastCollisionFrame = false;
        // 关卡挑战已移除，currentLevel 不再使用
        
        // 历史记录 & 回放
        let historyStack = [];
        let replayFrames = [];
        let isReplaying = false;
        
        // 几何特效
        let collisionEffect = { active: false, point: null, normal: null, tangent: null, timer: 0, incAngle: 0, refAngle: 0 };
        let lastCollisionGeom = null;
        let angleHistory = [];
        let collisionVisuals = []; // 存储每一次碰撞的可视化数据
        let tangentSuccessEffect = { active: false, timer: 0, point: null, targetCenter: null, velDir: 0 };
        let tangentDifficulty = 'medium'; // 'easy' | 'medium' | 'hard'
        let tangentStreak = 0;
        let tangentShowAnswer = false;
        let tangentProofStep = 0; // 0..3
        let reflectShowAnswer = false; // 反射模式显示答案
        
        // 圆周角模式数据
        let angleModePoints = { A: null, B: null, multiP: [] };
        let angleSubMode = 'explore'; // 'explore' | 'center' | 'semicircle'
        let angleModeRecords = [];
        let proofStep = 0; // 0..3
        let isDraggingTarget = false;
        // 垂径模式弦 (重构后)
        let chordForMode = null; // {p1, p2, mid, slope, length, distToCenter}
        let chordSubMode = 'perpendicular'; // 'perpendicular' (定理1) | 'bisector' (定理2)
        let chordLevel = 1; // 1..5
        let chordRecords = [];
        let chordProofStep = 0; // 0..3
        let chordSnapAssist = false;
        let chordDragWhich = null; // 'C' | 'D' | null
        let chordComboCount = 0; // Level 4 连续成功计数
        let chordShowAnswer = false; // 显示答案路径
        let chordSuccessEffect = { active: false, timer: 0, mid: null }; // 成功特效
        // 反射实验室模式: 可拖拽目标点 + 关卡 + 数据记录
        let labTargets = [];
        let labLevel = 1; // 1..5
        let labRecords = [];
        let labProofMode = false; // 镜像证明模式
        let labMissEffect = { active: false, timer: 0, cp: null, normal: null, target: null };
        
        // 几何标尺功能：用户添加的点
        let userPoints = [];
        let isAddingPoint = false;
        
        // UI 开关
        let showGrid = true, showCartesian = true, showRuler = true, showPredict = true, showParticles = true;
        let particles = [];
        let proofMode = false; // 证明模式
        
        // 音效系统
        let audioCtx = null;
        let soundEnabled = true;
