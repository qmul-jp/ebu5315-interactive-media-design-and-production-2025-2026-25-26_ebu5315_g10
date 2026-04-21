/**
 * utils.js - Utility Functions
 * Helper functions, chord generation, game reset, math utilities
 * Depends on: config.js, i18n.js
 */

            const t = i18n[lang];
            // 根据当前模式高亮显示对应规则
            let highlight = (mode) => currentMode === mode ? 'style="background:rgba(255,170,51,0.15);border-left:4px solid #ffaa33;padding-left:8px;border-radius:4px;"' : '';
            let angleExtra = currentMode === 'angle' && t.ruleAngleDetail ? `<div ${highlight('angle')}>${t.ruleAngleDetail}</div><br>` : `<div ${highlight('angle')}><strong>${t.angle}</strong><br>${t.ruleAngle}</div><br>`;
            document.getElementById('rulesModalContent').innerHTML = `
                <div class="rule-section">
                    <div ${highlight('free')}><strong>${t.free}</strong><br>${t.ruleFree}</div><br>
                    <div ${highlight('reflect1')}><strong>${t.reflect1}</strong><br>${t.ruleReflect1}</div><br>
                    <div ${highlight('reflect2')}><strong>${t.reflect2}</strong><br>${t.ruleReflect2}</div><br>
                    <div ${highlight('tangent')}><strong>${t.tangent}</strong><br>${t.ruleTangent}</div><br>
                    ${angleExtra}
                    <div ${highlight('chord')}><strong>${t.chord}</strong><br>${t.ruleChord}</div><br>
                    <div ${highlight('lab')}><strong>${t.lab}</strong><br>${t.ruleLab}</div><br>
                    <span style="color:#d9534f;">${t.powerHint}</span>
                </div>
            `;
        }
        
        function updateAngleHistoryUI(){
            const t = i18n[lang];
            const list = document.getElementById('angleHistoryList');
            if(angleHistory.length === 0){
                list.innerHTML = `<li>${t.noCollision}</li>`;
                return;
            }
            list.innerHTML = angleHistory.map(h => `<li>${t.angleRecord.replace('{inc}', h.inc).replace('{ref}', h.ref)}</li>`).join('');
        }
        
        function updateModeSpecificInfo(){
            const t = i18n[lang];
            const infoDiv = document.getElementById('modeSpecificInfo');
            if(currentMode === 'angle'){
                infoDiv.innerHTML = `<span style="color:#ffaa33;">📐 ${t.modeAngleInfo}</span>`;
            } else if(currentMode === 'chord'){
                infoDiv.innerHTML = `<span style="color:#88ffaa;">📏 ${t.modeChordInfo}</span>`;
            } else if(currentMode === 'lab'){
                infoDiv.innerHTML = `<span style="color:#88ffaa;">🎯 ${t.modeLabInfo}</span>`;
            } else {
                infoDiv.innerHTML = '';
            }
        }
        
        // 辅助函数
        function clampInside(p, margin=ballR){
            let dx = p.x - circle.x, dy = p.y - circle.y, dist = Math.hypot(dx,dy);
            if(dist + margin > circle.r){
                let ang = Math.atan2(dy,dx);
                p.x = circle.x + (circle.r - margin) * Math.cos(ang);
                p.y = circle.y + (circle.r - margin) * Math.sin(ang);
            }
        }
        
        function saveState(){
            historyStack.push({
                white: { x: whiteBall.x, y: whiteBall.y, vx: whiteBall.vx, vy: whiteBall.vy },
                target: { x: targetBall.x, y: targetBall.y },
                score: score,
                collisions: currentCollisions
            });
            if(historyStack.length > 20) historyStack.shift();
        }
        
        function undo(){
            if(historyStack.length === 0) return;
            let state = historyStack.pop();
            whiteBall.x = state.white.x; whiteBall.y = state.white.y;
            whiteBall.vx = state.white.vx; whiteBall.vy = state.white.vy;
            targetBall.x = state.target.x; targetBall.y = state.target.y;
            score = state.score; currentCollisions = state.collisions;
            scoreSpan.innerText = score;
            isMoving = false;
            if(animFrame) cancelAnimationFrame(animFrame);
            playSound('undo');
            drawCanvas();
        }
        
        function generateChord(level){
            let theta, d, midX, midY, perpAng, halfLen, p1, p2;
            let isDiameter = true;
            let attempts = 0;
            while(isDiameter && attempts < 100){
                switch(level){
                    case 1: // 水平弦
                        theta = Math.PI/2;
                        d = R * (0.25 + Math.random() * 0.5);
                        if(Math.random() < 0.5) d = -d;
                        midX = circle.x + d * Math.cos(theta);
                        midY = circle.y + d * Math.sin(theta);
                        perpAng = theta + Math.PI/2;
                        break;
                    case 2: // 竖直弦
                        theta = 0;
                        d = R * (0.25 + Math.random() * 0.5);
                        if(Math.random() < 0.5) d = -d;
                        midX = circle.x + d * Math.cos(theta);
                        midY = circle.y + d * Math.sin(theta);
                        perpAng = theta + Math.PI/2;
                        break;
                    case 3: // 给定弦长计算垂距
                        {
                            let chordLen = R * (0.8 + Math.random() * 0.8);
                            d = Math.sqrt(Math.max(0, R*R - (chordLen/2)*(chordLen/2)));
                            theta = Math.random() * Math.PI * 2;
                            midX = circle.x + d * Math.cos(theta);
                            midY = circle.y + d * Math.sin(theta);
                            perpAng = theta + Math.PI/2;
                        }
                        break;
                    case 4: // 随机弦（连续三条模式用）
                    case 5: // 自由构造
                    default:
                        theta = Math.random() * Math.PI * 2;
                        d = R * (0.2 + Math.random() * 0.6);
                        midX = circle.x + d * Math.cos(theta);
                        midY = circle.y + d * Math.sin(theta);
                        perpAng = theta + Math.PI/2;
                }
                halfLen = Math.sqrt(Math.max(0, R*R - d*d));
                p1 = { x: midX + halfLen * Math.cos(perpAng), y: midY + halfLen * Math.sin(perpAng) };
                p2 = { x: midX - halfLen * Math.cos(perpAng), y: midY - halfLen * Math.sin(perpAng) };
                // 排除直径：中点到圆心距离应 > 5px
                isDiameter = Math.hypot(midX - circle.x, midY - circle.y) < 5;
                attempts++;
            }
            let len = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            return { p1, p2, mid: {x:midX,y:midY}, slope: perpAng, length: len, distToCenter: Math.hypot(midX - circle.x, midY - circle.y) };
        }
        
        function setChordLevel(lv){
            chordLevel = lv;
            chordComboCount = 0;
            chordShowAnswer = false;
            let ansBtn = document.getElementById('btnChordAnswer');
            if(ansBtn) ansBtn.innerText = lang === 'zh' ? '💡 显示答案' : '💡 Show Answer';
            document.getElementById('chordLevelLabel').innerText = lang === 'zh' ? `Level ${lv}` : `Level ${lv}`;
            chordRecords = [];
            updateChordRecordUI();
            resetGame();
            let msg = '';
            if(lv === 1) msg = lang === 'zh' ? '📏 Level 1: 水平弦 — 使白球路径垂直于弦并经过圆心' : '📏 Level 1: Horizontal chord — path ⊥ to chord through centre';
            else if(lv === 2) msg = lang === 'zh' ? '📏 Level 2: 竖直弦 — 使白球路径垂直于弦并经过圆心' : '📏 Level 2: Vertical chord — path ⊥ to chord through centre';
            else if(lv === 3) msg = lang === 'zh' ? '📏 Level 3: 计算验证 — 给定弦长，瞄准圆心到弦的垂线' : '📏 Level 3: Calculation — given chord length, aim along perpendicular from centre';
            else if(lv === 4) msg = lang === 'zh' ? '📏 Level 4: 连续挑战 — 连续验证三条弦' : '📏 Level 4: Combo — verify 3 consecutive chords';
            else if(lv === 5) msg = lang === 'zh' ? '📏 Level 5: 自由构造 — 拖拽弦端点，设计并验证' : '📏 Level 5: Free build — drag chord endpoints to design and verify';
            showTip(msg, 3000);
        }
        
        function resetGame(){
            saveState();
            isMoving = false;
            whiteBall.vx = 0; whiteBall.vy = 0;
            whiteBall.x = circle.x; whiteBall.y = circle.y - 70;
            clampInside(whiteBall, ballR);
            do{
                targetBall.x = circle.x + (Math.random()*2-1)*(R-35);
                targetBall.y = circle.y + (Math.random()*2-1)*(R-35);
            }while(Math.hypot(targetBall.x-whiteBall.x, targetBall.y-whiteBall.y) < 35 || Math.hypot(targetBall.x-circle.x,targetBall.y-circle.y)+targetBall.r > R-2);
            clampInside(targetBall, targetBall.r);
            currentCollisions = 0;
            collisionEffect.active = false;
            particles = [];
            if(currentMode === 'angle'){
                // 默认 explore 模式：A、B 放在边界上形成一段优弧
                let ang1 = 20 * Math.PI/180, ang2 = 140 * Math.PI/180;
                angleModePoints.A = { x: circle.x + R*Math.cos(ang1), y: circle.y + R*Math.sin(ang1) };
                angleModePoints.B = { x: circle.x + R*Math.cos(ang2), y: circle.y + R*Math.sin(ang2) };
                // 将红球（P）放在圆周上作为可拖拽顶点，避开A、B点附近
                let angA = Math.atan2(angleModePoints.A.y - circle.y, angleModePoints.A.x - circle.x);
                let angB = Math.atan2(angleModePoints.B.y - circle.y, angleModePoints.B.x - circle.x);
                let pAng;
                let attempts = 0;
                do {
                    pAng = Math.random() * Math.PI * 2;
                    attempts++;
                } while (attempts < 50 && (
                    Math.abs(((pAng - angA + Math.PI) % (2*Math.PI)) - Math.PI) < 0.26 ||
                    Math.abs(((pAng - angB + Math.PI) % (2*Math.PI)) - Math.PI) < 0.26
                ));
                targetBall.x = circle.x + (R - targetBall.r - 2) * Math.cos(pAng);
                targetBall.y = circle.y + (R - targetBall.r - 2) * Math.sin(pAng);
                angleModePoints.history = [];
                angleModePoints.multiP = [];
                angleModeRecords = [];
                proofStep = 0;
                updateAngleRecordUI();
            } else if(currentMode === 'chord'){
                chordForMode = generateChord(chordLevel);
                // 红球放在弦中点附近作为视觉提示，但不作为判定目标
                targetBall.x = chordForMode.mid.x;
                targetBall.y = chordForMode.mid.y;
                chordProofStep = 0;
            } else if(currentMode === 'lab'){
                setupLabLevel(labLevel);
            } else if(currentMode === 'tangent'){
                // 教学模式：将白球和红球放在经典切线位置
                targetBall.x = circle.x + R * 0.55;
                targetBall.y = circle.y;
                whiteBall.x = circle.x - R * 0.25;
                whiteBall.y = circle.y - R * 0.35;
                clampInside(whiteBall, ballR);
                clampInside(targetBall, targetBall.r);
                showTip(lang === 'zh' ? '📐 切线狙击：将瞄准方向对准青色虚线即可擦过红球' : '📐 Tangent Sniper: Aim along the cyan dashed lines to graze the red ball', 4000);
            }
            drawCanvas();
        }
        
        function recordFrame(){
            replayFrames.push({ white: { x: whiteBall.x, y: whiteBall.y }, target: { x: targetBall.x, y: targetBall.y }, collision: collisionEffect.active });
            if(replayFrames.length > 600) replayFrames.shift();
        }
        function startReplay(){
            if(replayFrames.length === 0) { showTip(lang === 'zh' ? "没有可回放的记录" : "No replay data", 1000); return; }
            isReplaying = true;
            // 保存当前状态，以便回放结束后恢复
            let savedState = {
                white: { x: whiteBall.x, y: whiteBall.y, vx: whiteBall.vx, vy: whiteBall.vy },
                target: { x: targetBall.x, y: targetBall.y },
                isMoving: isMoving,
                currentCollisions: currentCollisions
            };
            let idx = 0;
            function step(){
                if(!isReplaying) return; // 检查是否被中断
                if(idx >= replayFrames.length) { 
                    isReplaying = false; 
                    // 恢复原始状态
                    whiteBall.x = savedState.white.x; whiteBall.y = savedState.white.y;
                    whiteBall.vx = savedState.white.vx; whiteBall.vy = savedState.white.vy;
                    targetBall.x = savedState.target.x; targetBall.y = savedState.target.y;
                    isMoving = savedState.isMoving;
                    currentCollisions = savedState.currentCollisions;
                    drawCanvas(); 
                    return; 
                }
                let f = replayFrames[idx];
                whiteBall.x = f.white.x; whiteBall.y = f.white.y;
                targetBall.x = f.target.x; targetBall.y = f.target.y;
                // 显示碰撞效果
                if(f.collision){
                    collisionEffect.active = true;
                    // 使用最后一次碰撞的几何数据
                    if(lastCollisionGeom){
                        collisionEffect.point = lastCollisionGeom.point;
                        collisionEffect.normal = lastCollisionGeom.normal;
                        collisionEffect.tangent = lastCollisionGeom.tangent;
                        collisionEffect.timer = 180;
                        collisionEffect.incAngle = lastCollisionGeom.incAngle;
                        collisionEffect.refAngle = lastCollisionGeom.refAngle;
                    }
                }
                drawCanvas();
                idx++;
                setTimeout(step, 30 / speedFactor);
            }
            step();
        }
        
        function addParticles(x, y){
            if(!showParticles) return;
            for(let i=0;i<8;i++){
                particles.push({
                    x, y, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4, life: 20
                });
            }
        }
        function updateParticles(){
            for(let i=0;i<particles.length;i++){
                particles[i].x += particles[i].vx;
                particles[i].y += particles[i].vy;
                particles[i].life--;
                if(particles[i].life<=0) particles.splice(i,1), i--;
            }
        }
        

// ===== Functions moved from physics.js (geometry/math utilities) =====

function computeInscribedAngle(A, B, P){
            let angA = Math.atan2(A.y - P.y, A.x - P.x);
            let angB = Math.atan2(B.y - P.y, B.x - P.x);
            let diff = Math.abs(angA - angB);
            if(diff > Math.PI) diff = 2*Math.PI - diff;
            return diff * 180 / Math.PI;
        }

function computeCentralAngle(A, B){
            let angA = Math.atan2(A.y - circle.y, A.x - circle.x);
            let angB = Math.atan2(B.y - circle.y, B.x - circle.x);
            let diff = Math.abs(angA - angB);
            if(diff > Math.PI) diff = 2*Math.PI - diff;
            return diff * 180 / Math.PI;
        }

function findReflectAnswer(requiredBounces){
            let wb = whiteBall, tb = targetBall;
            function reflectError(cp, from, to){
                // 计算在cp点的反射误差：入射方向反射后应该指向to
                let nx = (cp.x - circle.x) / R, ny = (cp.y - circle.y) / R;
                let ix = from.x - cp.x, iy = from.y - cp.y;
                let ilen = Math.hypot(ix, iy); if(ilen < 1e-6) return 999; ix /= ilen; iy /= ilen;
                // 反射方向 r = i - 2(i·n)n
                let dot = ix*nx + iy*ny;
                let rx = ix - 2*dot*nx, ry = iy - 2*dot*ny;
                let ex = to.x - cp.x, ey = to.y - cp.y;
                let elen = Math.hypot(ex, ey); if(elen < 1e-6) return 999; ex /= elen; ey /= elen;
                return Math.hypot(rx - ex, ry - ey);
            }
            if(requiredBounces === 1){
                let best = null, bestErr = Infinity;
                for(let i = 0; i < 360; i++){
                    let ang = i * 2 * Math.PI / 360;
                    let cp = { x: circle.x + R * Math.cos(ang), y: circle.y + R * Math.sin(ang) };
                    let err = reflectError(cp, wb, tb);
                    if(err < bestErr){ bestErr = err; best = cp; }
                }
                return best ? [best] : null;
            } else if(requiredBounces === 2){
                let best = null, bestErr = Infinity;
                for(let i = 0; i < 180; i++){
                    let ang1 = i * 2 * Math.PI / 180;
                    let cp1 = { x: circle.x + R * Math.cos(ang1), y: circle.y + R * Math.sin(ang1) };
                    // 从cp1反射后，找第二个反射点
                    let nx = (cp1.x - circle.x) / R, ny = (cp1.y - circle.y) / R;
                    let ix = wb.x - cp1.x, iy = wb.y - cp1.y;
                    let ilen = Math.hypot(ix, iy); if(ilen < 1e-6) continue; ix /= ilen; iy /= ilen;
                    let dot = ix*nx + iy*ny;
                    let rx = ix - 2*dot*nx, ry = iy - 2*dot*ny;
                    // 从cp1沿反射方向找与圆边界的交点
                    for(let j = 0; j < 180; j++){
                        let ang2 = j * 2 * Math.PI / 180;
                        let cp2 = { x: circle.x + R * Math.cos(ang2), y: circle.y + R * Math.sin(ang2) };
                        let err = reflectError(cp2, cp1, tb);
                        // 还要检查cp1到cp2的方向是否接近反射方向
                        let dx = cp2.x - cp1.x, dy = cp2.y - cp1.y;
                        let dlen = Math.hypot(dx, dy); if(dlen < 1e-6) continue; dx /= dlen; dy /= dlen;
                        let dirErr = Math.hypot(dx - rx, dy - ry);
                        let totalErr = err + dirErr * 0.5;
                        if(totalErr < bestErr){ bestErr = totalErr; best = [cp1, cp2]; }
                    }
                }
                return best;
            }
            return null;
        }

function showTip(msg, duration){
            let tipDiv = document.getElementById('dynamicTip');
            if(!tipDiv){
                tipDiv = document.createElement('div');
                tipDiv.id = 'dynamicTip';
                tipDiv.style.position = 'fixed'; tipDiv.style.top = '20px'; tipDiv.style.left = '50%';
                tipDiv.style.transform = 'translateX(-50%)';
                tipDiv.style.background = 'rgba(40,40,45,0.92)'; tipDiv.style.color = 'white'; tipDiv.style.padding = '12px 24px';
                tipDiv.style.borderRadius = '30px'; tipDiv.style.zIndex = '1000'; tipDiv.style.fontSize = '1rem';
                tipDiv.style.backdropFilter = 'blur(8px)'; tipDiv.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                document.body.appendChild(tipDiv);
            }
            if(tipTimeout) clearTimeout(tipTimeout);
            tipDiv.innerText = msg;
            tipDiv.style.opacity = '1';
            tipTimeout = setTimeout(()=>{ tipDiv.style.opacity = '0'; }, duration);
        }

function showTangentTheoremCard(){
            let existing = document.getElementById('tangentTheoremCard');
            if(existing) existing.remove();
            let card = document.createElement('div');
            card.id = 'tangentTheoremCard';
            card.style.position = 'fixed';
            card.style.top = '20px';
            card.style.left = '50%';
            card.style.transform = 'translateX(-50%)';
            card.style.background = document.body.classList.contains('dark-mode') ? 'linear-gradient(135deg, #3a3a4a 0%, #2a2a2f 100%)' : 'linear-gradient(135deg, #3a6b4a 0%, #2a5a3a 100%)';
            card.style.color = '#f5e56b';
            card.style.padding = '16px 32px';
            card.style.borderRadius = '16px';
            card.style.border = '2px solid #f5e56b';
            card.style.boxShadow = '0 8px 32px rgba(245,229,107,0.3)';
            card.style.zIndex = '2500';
            card.style.fontSize = '1.2rem';
            card.style.fontWeight = 'bold';
            card.style.textAlign = 'center';
            card.style.animation = 'popupFadeIn 0.5s ease, popupScaleIn 0.5s ease';
            let check = window.lastTangentCheck || {};
            let detail = '';
            if(check.closestDist !== undefined){
                detail = `<br><span style="font-size:0.85rem;font-weight:normal;opacity:0.9;">
${lang === 'zh' ? '最近距离' : 'Closest dist'}: ${check.closestDist.toFixed(2)}px (${lang === 'zh' ? '目标' : 'target'}: ${check.targetDist.toFixed(2)}px)<br>
${lang === 'zh' ? '夹角' : 'Angle'}: ${check.angleDeg.toFixed(1)}° (${lang === 'zh' ? '目标' : 'target'}: 90°)
</span>`;
            }
            card.innerHTML = `📐 ${lang === 'zh' ? '半径 ⊥ 切线' : 'Radius ⟂ Tangent'}<br><span style="font-size:0.85rem;font-weight:normal;opacity:0.9;">${lang === 'zh' ? '（Radius Perpendicular to Tangent）' : '(Tangent is perpendicular to radius at point of contact)'}</span>${detail}`;
            document.body.appendChild(card);
            setTimeout(() => {
                card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateX(-50%) translateY(-30px)';
                setTimeout(() => card.remove(), 800);
            }, 5000);
        }

function showAngleTheoremCard(incAngle, centerAngle, ratio){
            let existing = document.getElementById('angleTheoremCard');
            if(existing) existing.remove();
            let card = document.createElement('div');
            card.id = 'angleTheoremCard';
            card.style.position = 'fixed';
            card.style.top = '20px';
            card.style.left = '50%';
            card.style.transform = 'translateX(-50%)';
            card.style.background = document.body.classList.contains('dark-mode') ? 'linear-gradient(135deg, #3a3a4a 0%, #2a2a2f 100%)' : 'linear-gradient(135deg, #3a6b4a 0%, #2a5a3a 100%)';
            card.style.color = '#f5e56b';
            card.style.padding = '18px 36px';
            card.style.borderRadius = '16px';
            card.style.border = '2px solid #f5e56b';
            card.style.boxShadow = '0 8px 32px rgba(245,229,107,0.3)';
            card.style.zIndex = '2500';
            card.style.fontSize = '1.1rem';
            card.style.fontWeight = 'bold';
            card.style.textAlign = 'center';
            card.style.animation = 'popupFadeIn 0.5s ease, popupScaleIn 0.5s ease';
            let ok = Math.abs(ratio - 2) < 0.1 ? '✅' : '⚠️';
            let title = lang === 'zh' ? '圆周角定理 (Angle at the Circumference)' : 'Angle at the Circumference Theorem';
            let desc = lang === 'zh' ? '同弧所对的圆心角等于圆周角的两倍' : 'The angle subtended by an arc at the centre is twice the angle subtended at the circumference';
            card.innerHTML = `<div style="margin-bottom:8px;">📐 ${title}</div><div style="font-size:0.9rem;font-weight:normal;margin-bottom:10px;">${desc}</div><div style="font-family:monospace;font-size:1rem;">∠APB = ${incAngle.toFixed(1)}° | ∠AOB = ${centerAngle.toFixed(1)}°<br>Ratio = ${ratio.toFixed(2)} ${ok}</div>`;
            document.body.appendChild(card);
            setTimeout(() => {
                card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateX(-50%) translateY(-30px)';
                setTimeout(() => card.remove(), 800);
            }, 5000);
        }

function drawAngle(centerX, centerY, p1X, p1Y, p2X, p2Y, color, label){
            let angle1 = Math.atan2(p1Y - centerY, p1X - centerX);
            let angle2 = Math.atan2(p2Y - centerY, p2X - centerX);
            // 处理跨越 -π/π 边界的情况
            let diff = angle2 - angle1;
            while(diff > Math.PI) diff -= 2*Math.PI;
            while(diff < -Math.PI) diff += 2*Math.PI;
            let startAngle = angle1;
            let endAngle = angle1 + diff;
            let radius = 20;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle, diff < 0);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            let midAngle = startAngle + diff/2;
            let textX = centerX + (radius + 10) * Math.cos(midAngle);
            let textY = centerY + (radius + 10) * Math.sin(midAngle);
            ctx.fillStyle = color;
            ctx.font = 'bold 14px';
            ctx.fillText(label, textX-5, textY+5);
        }

