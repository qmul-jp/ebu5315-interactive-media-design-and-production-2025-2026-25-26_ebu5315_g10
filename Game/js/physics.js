/**
 * physics.js - Physics Engine
 * Collision detection, reflection calculation, ball movement
 * Depends on: config.js, utils.js
 */

        function handleCollision(){
            let dx = whiteBall.x - circle.x, dy = whiteBall.y - circle.y;
            let dist = Math.hypot(dx, dy);
            if(dist + ballR >= circle.r && dist > 1e-5){
                let nx = dx/dist, ny = dy/dist;
                whiteBall.x = circle.x + (circle.r - ballR) * nx;
                whiteBall.y = circle.y + (circle.r - ballR) * ny;
                let vmag = Math.hypot(whiteBall.vx, whiteBall.vy);
                let inc = 0;
                // 记录入射方向（碰撞前）
                let incDir = Math.atan2(whiteBall.vy, whiteBall.vx);
                if(vmag>0.05){
                    let dot = (whiteBall.vx*nx + whiteBall.vy*ny)/vmag;
                    inc = Math.acos(Math.min(1,Math.abs(dot))) * 180/Math.PI;
                }
                let vdotn = whiteBall.vx*nx + whiteBall.vy*ny;
                if(vdotn > 0){
                    whiteBall.vx -= 2*vdotn*nx;
                    whiteBall.vy -= 2*vdotn*ny;
                }
                // 记录反射方向（碰撞后）
                let outDir = Math.atan2(whiteBall.vy, whiteBall.vx);
                let cp = { x: circle.x + circle.r*nx, y: circle.y + circle.r*ny };
                // 切线方向
                let tx = -ny, ty = nx;
                // 延长碰撞效果的显示时间至3秒（180帧@60fps）
                collisionEffect = { active: true, point: cp, normal: {x:nx,y:ny}, tangent:{x:tx,y:ty}, timer: 180, incAngle: inc, refAngle: inc };
                lastCollisionGeom = collisionEffect;
                // 保存每一次碰撞的可视化数据
                collisionVisuals.push({
                    point: cp,
                    normal: {x:nx,y:ny},
                    tangent: {x:tx,y:ty},
                    incAngle: inc,
                    refAngle: inc,
                    incDir: incDir,
                    outDir: outDir,
                    timer: 180
                });
                angleHistory.unshift({ inc: inc.toFixed(1), ref: inc.toFixed(1) });
                if(angleHistory.length > 5) angleHistory.pop();
                updateAngleHistoryUI();
                playSound('collision');
                addParticles(cp.x, cp.y);
                if(isMoving && !lastCollisionFrame){
                    currentCollisions++;
                    lastCollisionFrame = true;
                    // 反射实验室：碰撞时立即检查是否击中目标
                    if(currentMode === 'lab'){
                        checkLabTargetHit(cp);
                    }
                }
                return true;
            }
            lastCollisionFrame = false;
            return false;
        }
        
        function checkLabTargetHit(cp){
            if(!labTargets || labTargets.length === 0) return;
            let hitAny = false;
            for(let t of labTargets){
                if(t.hit) continue;
                let dist = Math.hypot(cp.x - t.x, cp.y - t.y);
                if(dist < 25){
                    t.hit = true;
                    hitAny = true;
                    score += 5;
                    scoreSpan.innerText = score;
                    playSound('score');
                    showTip(lang === 'zh' ? `🎯 击中目标！得分 +5` : `🎯 Target hit! +5 pts`, 1500);
                    break;
                }
            }
            // 自动记录实验数据
            if(currentMode === 'lab' && lastCollisionGeom){
                let inc = lastCollisionGeom.incAngle;
                let ref = lastCollisionGeom.refAngle;
                let err = Math.abs(inc - ref);
                labRecords.push({
                    inc, ref, err,
                    level: labLevel,
                    targetHit: hitAny,
                    timestamp: new Date().toLocaleTimeString()
                });
                updateLabRecordUI();
                // 未击中时显示正确反射线提示
                if(!hitAny && labTargets.length > 0){
                    let target = labTargets.find(t => !t.hit);
                    if(target){
                        labMissEffect = { active: true, timer: 180, cp: lastCollisionGeom.point, normal: lastCollisionGeom.normal, target: target };
                    }
                }
            }
            let allHit = labTargets.every(t => t.hit);
            if(allHit){
                if(!achievements.labMaster) unlockAchievement('labMaster');
                if(labLevel < 5){
                    showTip(lang === 'zh' ? `🎉 Level ${labLevel} 完成！2秒后进入下一关` : `🎉 Level ${labLevel} complete! Next level in 2s`, 2500);
                    setTimeout(() => {
                        labLevel++;
                        setupLabLevel(labLevel);
                    }, 2000);
                } else {
                    showTip(lang === 'zh' ? '🏆 恭喜通关所有反射实验室关卡！' : '🏆 All Reflection Lab levels cleared!', 3000);
                }
            }
        }
        
        function checkScore(){
            let d = Math.hypot(whiteBall.x - targetBall.x, whiteBall.y - targetBall.y);
            if(d < ballR + targetBall.r){
                let success = false;
                if(currentMode === 'free') success = true;
                else if(currentMode === 'reflect1'){
                    if(currentCollisions === 1) success = true;
                    else {
                        showTip(lang==='zh' 
                            ? `❌ 只碰撞了${currentCollisions}次边界（需要1次）` 
                            : `❌ Only ${currentCollisions} bounces (need 1)`, 3000);
                    }
                }
                else if(currentMode === 'reflect2'){
                    if(currentCollisions === 2) success = true;
                    else {
                        showTip(lang==='zh' 
                            ? `❌ 只碰撞了${currentCollisions}次边界（需要2次）` 
                            : `❌ Only ${currentCollisions} bounces (need 2)`, 3000);
                    }
                }
                else if(currentMode === 'tangent'){
                    // 基于轨迹几何的切线判定：计算白球轨迹线段到红球中心的最近距离
                    let tx = targetBall.x, ty = targetBall.y;
                    let wx = whiteBall.x, wy = whiteBall.y;
                    let px = prevWhiteBall.x, py = prevWhiteBall.y;
                    // 线段到点最近距离
                    let segDx = wx - px, segDy = wy - py;
                    let segLen2 = segDx*segDx + segDy*segDy;
                    let closestDist;
                    if(segLen2 < 1e-6){
                        closestDist = Math.hypot(wx - tx, wy - ty);
                    } else {
                        let tProj = ((tx - px) * segDx + (ty - py) * segDy) / segLen2;
                        tProj = Math.max(0, Math.min(1, tProj));
                        let cx = px + tProj * segDx;
                        let cy = py + tProj * segDy;
                        closestDist = Math.hypot(cx - tx, cy - ty);
                    }
                    // 难度容差
                    const tangentTolerances = {
                        easy:   { dist: 8, angle: 10 },
                        medium: { dist: 3, angle: 5 },
                        hard:   { dist: 1, angle: 2 }
                    };
                    let tol = tangentTolerances[tangentDifficulty] || tangentTolerances.medium;
                    // 条件一：轨迹最近距离 ≈ 两球半径和（擦过）
                    let distDev = Math.abs(closestDist - (ballR + targetBall.r));
                    let distOK = distDev < tol.dist;
                    // 条件二：速度方向与红球半径垂直（切线定义）
                    let radiusDir = Math.atan2(whiteBall.y - targetBall.y, whiteBall.x - targetBall.x);
                    let velDir = Math.atan2(whiteBall.vy, whiteBall.vx);
                    let angleDiff = radiusDir - velDir;
                    while(angleDiff > Math.PI) angleDiff -= 2*Math.PI;
                    while(angleDiff < -Math.PI) angleDiff += 2*Math.PI;
                    let angleDeg = Math.abs(angleDiff) * 180 / Math.PI;
                    let angleDev = Math.abs(angleDeg - 90);
                    let perpOK = angleDev < tol.angle;
                    // ★ 保存诊断供失败时使用
                    window.lastTangentCheck = { closestDist, targetDist: ballR + targetBall.r, distDev, angleDeg, angleDev, distOK, perpOK, tol };
                    if(distOK && perpOK) success = true;
                    if(success && !achievements.perfectTangent) unlockAchievement('perfectTangent');
                }
                else if(currentMode === 'angle') success = true;
                else if(currentMode === 'chord'){
                    // 垂径定理双向判定
                    if(!chordForMode) { success = false; }
                    else {
                        // 条件1: 白球路径经过圆心 (允许±8px误差)
                        // 计算白球运动直线到圆心的距离
                        let x0 = whiteBall.x, y0 = whiteBall.y;
                        let dx = whiteBall.vx, dy = whiteBall.vy;
                        let vmag = Math.hypot(dx, dy);
                        let distToCenterLine = 999;
                        if(vmag > 0.01){
                            distToCenterLine = Math.abs(dx*(y0 - circle.y) - dy*(x0 - circle.x)) / vmag;
                        }
                        let throughCenter = distToCenterLine < 8;
                        
                        // 条件2: 白球路径与弦的夹角接近90° (允许±5°)
                        let chordDirX = chordForMode.p2.x - chordForMode.p1.x;
                        let chordDirY = chordForMode.p2.y - chordForMode.p1.y;
                        let chordLen = Math.hypot(chordDirX, chordDirY);
                        let velAngle = Math.atan2(dy, dx);
                        let chordAngle = Math.atan2(chordDirY, chordDirX);
                        let angleDiff = velAngle - chordAngle;
                        while(angleDiff > Math.PI) angleDiff -= 2*Math.PI;
                        while(angleDiff < -Math.PI) angleDiff += 2*Math.PI;
                        let angleDeg = Math.abs(angleDiff) * 180 / Math.PI;
                        let perpToChord = Math.abs(angleDeg - 90) < 5;
                        
                        // 条件3: 路径经过弦中点 (允许±10px) — 定理2的关键
                        let distToMidLine = 999;
                        if(vmag > 0.01){
                            distToMidLine = Math.abs(dx*(y0 - chordForMode.mid.y) - dy*(x0 - chordForMode.mid.x)) / vmag;
                        }
                        let throughMid = distToMidLine < 10;
                        
                        if(chordSubMode === 'perpendicular'){
                            // 定理1: 垂直于弦的直径平分弦 → 需过圆心 + 垂直于弦
                            if(throughCenter && perpToChord) success = true;
                        } else {
                            // 定理2: 平分弦的直径垂直于弦 → 需过中点 + 垂直于弦
                            if(throughMid && perpToChord) success = true;
                        }
                        
                        // 保存诊断数据供失败提示使用
                        window.lastChordCheck = { angleDev: Math.abs(angleDeg - 90), distToCenter: distToCenterLine, distToMid: distToMidLine, throughCenter, perpToChord, throughMid };
                        
                        // 记录本次尝试数据
                        let record = {
                            angleDev: Math.abs(angleDeg - 90),
                            distToCenter: distToCenterLine,
                            throughCenter,
                            perpToChord,
                            throughMid,
                            success,
                            subMode: chordSubMode,
                            level: chordLevel
                        };
                        chordRecords.push(record);
                        updateChordRecordUI();
                    }
                }
                else if(currentMode === 'lab') success = false; // boundary targets handled in handleCollision
                
                if(success){
                    let add, mult, distToCenter;
                    if(currentMode === 'tangent'){
                        add = 8;
                        mult = 1.5;
                        distToCenter = 0;
                    } else {
                        distToCenter = Math.hypot(whiteBall.x-circle.x, whiteBall.y-circle.y);
                        mult = 2.0 - 1.5 * (distToCenter / R);
                        mult = Math.min(2.0, Math.max(0.5, mult));
                        add = Math.max(0, Math.floor(1 + (mult-1)*10));
                    }
                    // 切线模式连击奖励
                    if(currentMode === 'tangent'){
                        tangentStreak++;
                        let bonus = Math.min(tangentStreak * 2, 10);
                        add += bonus;
                        showTip(lang==='zh' 
                            ? `✂️ 完美切线！连击 ${tangentStreak} 次，额外奖励 +${bonus}分` 
                            : `✂️ Perfect tangent! Streak ${tangentStreak}, bonus +${bonus}`, 2000);
                    } else {
                        tangentStreak = 0;
                    }
                    score += add;
                    scoreSpan.innerText = score;
                    playSound('score');
                    if(mult > 1.8 && !achievements.distanceKiller) unlockAchievement('distanceKiller');
                    consecutiveReflectSuccess++;
                    if(consecutiveReflectSuccess >= 3 && !achievements.reflectMaster) unlockAchievement('reflectMaster');
                    
                    // 角度猎人成就：收集特定角度
                    if(lastCollisionGeom){
                        let angle = lastCollisionGeom.incAngle;
                        // 检查是否接近30/45/60/90度
                        const targetAngles = [30, 45, 60, 90];
                        for(let target of targetAngles){
                            if(Math.abs(angle - target) < 2){
                                angleTypesCollected.add(target);
                                break;
                            }
                        }
                        if(angleTypesCollected.size >= 4 && !achievements.angleHunter){
                            unlockAchievement('angleHunter');
                        }
                    }
                    
                    // 定理验证成就
                    if(currentMode === 'angle'){
                        theoremsVerified.add('angle');
                    } else if(currentMode === 'chord'){
                        theoremsVerified.add('chord');
                    } else if(currentMode === 'lab'){
                        theoremsVerified.add('reflection');
                    }
                    if(theoremsVerified.size >= 3 && !achievements.euclidDescendant){
                        unlockAchievement('euclidDescendant');
                    }
                    
                    // 弦大师成就：垂径定理模式成功计数
                    if(currentMode === 'chord'){
                        if(!window.chordSuccessCount) window.chordSuccessCount = 0;
                        window.chordSuccessCount++;
                        if(window.chordSuccessCount >= 10 && !achievements.chordMaster){
                            unlockAchievement('chordMaster');
                        }
                        if(chordLevel >= 4 && !achievements.chordBuster) unlockAchievement('chordBuster');
                        if(chordLevel >= 5 && !achievements.perpendicularPro) unlockAchievement('perpendicularPro');
                    }
                    

                    const t = i18n[lang];
                    showTip(t.scoreMsg.replace('{add}', add).replace('{mult}', mult.toFixed(2)), 1500);
                    if(currentMode === 'angle' && angleModePoints.A && angleModePoints.B){
                        let P = { x: targetBall.x, y: targetBall.y };
                        let angleAPB = computeInscribedAngle(angleModePoints.A, angleModePoints.B, P);
                        let centerAngle = computeCentralAngle(angleModePoints.A, angleModePoints.B);
                        let ratio = centerAngle / angleAPB;
                        
                        // 信息卡弹窗
                        showAngleTheoremCard(angleAPB, centerAngle, ratio);
                        
                        // 自动记录角度
                        let pAngle = Math.atan2(P.y - circle.y, P.x - circle.x);
                        angleModeRecords.push({ pAngle, incAngle: angleAPB, centerAngle, ratio });
                        updateAngleRecordUI();
                        
                        // 圆周角模式成就检测
                        if(angleModeRecords.length >= 5 && !achievements.angleApprentice){
                            unlockAchievement('angleApprentice');
                        }
                        if(angleModeRecords.length >= 10){
                            let avgRatio = angleModeRecords.reduce((s, r) => s + r.ratio, 0) / angleModeRecords.length;
                            if(Math.abs(avgRatio - 2) < 0.1 && !achievements.angleMaster){
                                unlockAchievement('angleMaster');
                            }
                        }
                        
                        // 记录圆周角轨迹点（多P点验证）
                        if(!angleModePoints.history) angleModePoints.history = [];
                        angleModePoints.history.push({ x: targetBall.x, y: targetBall.y, id: angleModePoints.history.length + 1 });
                        // 最多保留8个历史P点
                        if(angleModePoints.history.length > 8) angleModePoints.history.shift();
                        
                        // 多P点验证：将当前击中位置加入 multiP
                        if(!angleModePoints.multiP) angleModePoints.multiP = [];
                        angleModePoints.multiP.push({ x: targetBall.x, y: targetBall.y, angle: angleAPB });
                        if(angleModePoints.multiP.length > 6) angleModePoints.multiP.shift();
                        
                        // 子模式提示
                        if(angleSubMode === 'explore'){
                            showTip(lang === 'zh' ? '🔍 结论：同弧所对的圆周角相等（无论顶点在何处）' : '🔍 Conclusion: Angles in the same segment are equal', 3000);
                            // 多P点相等验证提示
                            if(angleModePoints.multiP.length >= 3){
                                let angles = angleModePoints.multiP.map(p => p.angle);
                                let maxDiff = Math.max(...angles) - Math.min(...angles);
                                if(maxDiff < 3){
                                    showTip(lang === 'zh' ? `✅ 多P点验证：${angles.length}个点的圆周角几乎相等（最大偏差${maxDiff.toFixed(1)}°）` : `✅ Multi-P verified: ${angles.length} points have equal inscribed angles (max dev ${maxDiff.toFixed(1)}°)`, 3000);
                                }
                            }
                        } else if(angleSubMode === 'center'){
                            showTip(lang === 'zh' ? '🔍 结论：圆心角 = 2 × 圆周角' : '🔍 Conclusion: Central angle = 2 × inscribed angle', 3000);
                        }
                    }
                    if(currentMode === 'chord' && chordForMode){
                        const t = i18n[lang];
                        let diag = window.lastChordCheck || {};
                        if(chordSubMode === 'perpendicular'){
                            if(success) {
                                showTip(t.chordSuccessThm1, 2500);
                                showTip(`📜 ${t.chordTheorem1}`, 3500);
                            } else {
                                // 失败诊断：具体原因
                                let reasons = [];
                                if(!diag.perpToChord) reasons.push(t.chordFailNotPerp.replace('{deg}', diag.angleDev?.toFixed(1) || '?'));
                                if(!diag.throughCenter) reasons.push(t.chordFailNotCenter.replace('{dist}', diag.distToCenter?.toFixed(1) || '?'));
                                if(reasons.length === 0) showTip(t.chordFailThm1, 2500);
                                else showTip(reasons.join(' | '), 3000);
                            }
                        } else {
                            if(success) {
                                showTip(t.chordSuccessThm2, 2500);
                                showTip(`📜 ${t.chordTheorem2}`, 3500);
                            } else {
                                let reasons = [];
                                if(!diag.perpToChord) reasons.push(t.chordFailNotPerp.replace('{deg}', diag.angleDev?.toFixed(1) || '?'));
                                if(!diag.throughMid) reasons.push(t.chordFailNotMid.replace('{dist}', diag.distToMid?.toFixed(1) || '?'));
                                if(reasons.length === 0) showTip(t.chordFailThm2, 2500);
                                else showTip(reasons.join(' | '), 3000);
                            }
                        }
                        // 成功特效
                        if(success){
                            chordSuccessEffect = { active: true, timer: 120, mid: { x: chordForMode.mid.x, y: chordForMode.mid.y } };
                        }
                        // 关卡进度
                        if(success){
                            if(chordLevel === 4){
                                chordComboCount++;
                                showTip(t.chordComboProgress.replace('{count}', chordComboCount), 2000);
                                if(chordComboCount >= 3){
                                    showTip(t.chordComboComplete, 3000);
                                    setTimeout(() => {
                                        chordLevel = 5;
                                        setChordLevel(chordLevel);
                                    }, 2000);
                                } else {
                                    // 继续Level 4，生成新弦
                                    setTimeout(() => {
                                        chordForMode = generateChord(chordLevel);
                                        targetBall.x = chordForMode.mid.x;
                                        targetBall.y = chordForMode.mid.y;
                                        resetGame();
                                    }, 1500);
                                }
                            } else if(chordLevel < 5){
                                showTip(lang === 'zh' ? `🎉 Level ${chordLevel} 完成！2秒后进入下一关` : `🎉 Level ${chordLevel} complete! Next level in 2s`, 2000);
                                setTimeout(() => {
                                    chordLevel++;
                                    setChordLevel(chordLevel);
                                }, 2000);
                            } else if(chordLevel === 5){
                                showTip(lang === 'zh' ? '🏆 恭喜通关所有垂径定理关卡！' : '🏆 All Perpendicular Bisector levels cleared!', 3000);
                            }
                        } else {
                            // 失败：重置连击
                            if(chordLevel === 4) chordComboCount = 0;
                        }
                    }
                    // lab mode success handled in handleCollision via checkLabTargetHit
                    if(currentMode === 'tangent' && success){
                        let d = Math.hypot(whiteBall.x - targetBall.x, whiteBall.y - targetBall.y);
                        let cp = {
                            x: targetBall.x + targetBall.r * (whiteBall.x - targetBall.x) / d,
                            y: targetBall.y + targetBall.r * (whiteBall.y - targetBall.y) / d
                        };
                        tangentSuccessEffect = { active: true, timer: 120, point: cp, targetCenter: {x: targetBall.x, y: targetBall.y}, velDir: Math.atan2(whiteBall.vy, whiteBall.vx) };
                        showTangentTheoremCard();
                    }
                } else {
                    playSound('fail');
                    consecutiveReflectSuccess = 0;
                    if(currentMode === 'tangent') tangentStreak = 0;
                    showTip(i18n[lang].scoreMsg.replace('{add}', 0).replace('{mult}', '0.00'), 1500);
                    // 切线模式失败诊断
                    if(currentMode === 'tangent' && window.lastTangentCheck){
                        let check = window.lastTangentCheck;
                        let tips = [];
                        if(!check.distOK) tips.push(lang==='zh' 
                            ? `距离偏差 ${check.distDev.toFixed(1)}px（需<${check.tol.dist}px）` 
                            : `Distance dev ${check.distDev.toFixed(1)}px (need <${check.tol.dist})`);
                        if(!check.perpOK) tips.push(lang==='zh' 
                            ? `角度偏差 ${check.angleDev.toFixed(1)}°（需<${check.tol.angle}°）` 
                            : `Angle dev ${check.angleDev.toFixed(1)}° (need <${check.tol.angle}°)`);
                        if(tips.length > 0) showTip('❌ ' + tips.join(' | '), 3000);
                    }
                }
                // 重置红球
                if(currentMode === 'angle'){
                    // 圆周角模式：红球（P点）始终放在圆周上，支持自由拖拽探索，避开A、B点附近
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
                } else if(currentMode === 'tangent'){
                    // 切线模式：生成新的切线练习位置
                    let angle = Math.random() * Math.PI * 2;
                    let dist = R * (0.25 + Math.random() * 0.35);
                    targetBall.x = circle.x + dist * Math.cos(angle);
                    targetBall.y = circle.y + dist * Math.sin(angle);
                    whiteBall.x = circle.x + R * 0.3 * Math.cos(angle + Math.PI);
                    whiteBall.y = circle.y + R * 0.3 * Math.sin(angle + Math.PI);
                    clampInside(whiteBall, ballR);
                } else {
                    do{
                        targetBall.x = circle.x + (Math.random()*2-1)*(R-35);
                        targetBall.y = circle.y + (Math.random()*2-1)*(R-35);
                    }while(Math.hypot(targetBall.x-whiteBall.x, targetBall.y-whiteBall.y) < 35 || Math.hypot(targetBall.x-circle.x,targetBall.y-circle.y)+targetBall.r > R-2);
                }
                // 在垂径定理模式下，重置弦和红球位置
                if(currentMode === 'chord'){
                    chordForMode = generateChord(chordLevel);
                    targetBall.x = chordForMode.mid.x;
                    targetBall.y = chordForMode.mid.y;
                    chordProofStep = 0;
                }
                clampInside(targetBall, targetBall.r);
                currentCollisions = 0;
                return true;
            }
            return false;
        }
        
        
        
        
        // 反射模式答案计算：采样圆边界点，找到满足反射定律的路径
        
        
        let tipTimeout;
        
        
        
        
        function updatePhysics(){
            if(!isMoving) return;
            prevWhiteBall.x = whiteBall.x;
            prevWhiteBall.y = whiteBall.y;
            whiteBall.vx *= friction;
            whiteBall.vy *= friction;
            whiteBall.x += whiteBall.vx * speedFactor;
            whiteBall.y += whiteBall.vy * speedFactor;
            handleCollision();
            checkScore();
            if(Math.hypot(whiteBall.vx, whiteBall.vy) < 0.1){
                isMoving = false;
                whiteBall.vx = whiteBall.vy = 0;
                currentCollisions = 0;
            }
            if(collisionEffect.active){
                collisionEffect.timer--;
                if(collisionEffect.timer<=0) collisionEffect.active = false;
            }
            // 更新所有碰撞可视化数据的计时器
            for(let i = collisionVisuals.length - 1; i >= 0; i--){
                collisionVisuals[i].timer--;
                if(collisionVisuals[i].timer <= 0){
                    collisionVisuals.splice(i, 1);
                }
            }
            if(tangentSuccessEffect.active){
                tangentSuccessEffect.timer--;
                if(tangentSuccessEffect.timer <= 0) tangentSuccessEffect.active = false;
            }
            if(chordSuccessEffect.active){
                chordSuccessEffect.timer--;
                if(chordSuccessEffect.timer <= 0) chordSuccessEffect.active = false;
            }
            if(labMissEffect.active){
                labMissEffect.timer--;
                if(labMissEffect.timer <= 0) labMissEffect.active = false;
            }
            updateParticles();
            drawCanvas();
            recordFrame();
            if(isMoving && !isStepMode){
                animFrame = requestAnimationFrame(updatePhysics);
            }
        }
        
        function computePowerFromDrag(len){
            let ratio = Math.min(1, len / 80);
            let power = 16 * Math.pow(ratio, 1.5);
            return Math.min(16, power);
        }
        
        function shoot(vx, vy){
            if(isMoving) return;
            saveState();
            whiteBall.vx = vx;
            whiteBall.vy = vy;
            currentCollisions = 0;
            replayFrames = [];
            collisionVisuals = []; // 新 shot 时清空上一次的可视化
            isMoving = true;
            if(animFrame) cancelAnimationFrame(animFrame);
            animFrame = requestAnimationFrame(updatePhysics);
        }
        
        function predictPath(startX, startY, vx, vy, maxSteps=4){
            let points = [{x:startX, y:startY}];
            let reflections = [];
            let pos = {x:startX, y:startY};
            let vel = {x:vx, y:vy};
            let bounce = 0, iter = 0;
            while(iter < 400 && bounce <= maxSteps){
                let newX = pos.x + vel.x * 0.8;
                let newY = pos.y + vel.y * 0.8;
                let dx = newX - circle.x, dy = newY - circle.y;
                let dist = Math.hypot(dx, dy);
                if(dist + ballR >= circle.r && dist > 1e-5){
                    let nx = dx/dist, ny = dy/dist;
                    let dot = vel.x*nx + vel.y*ny;
                    if(dot < 0){
                        let incAngle = Math.acos(Math.abs(dot) / Math.hypot(vel.x, vel.y)) * 180/Math.PI;
                        // 保存入射方向
                        let dirX = vel.x / Math.hypot(vel.x, vel.y);
                        let dirY = vel.y / Math.hypot(vel.x, vel.y);
                        vel.x -= 2*dot*nx;
                        vel.y -= 2*dot*ny;
                        bounce++;
                        let cp = { x: circle.x + circle.r*nx, y: circle.y + circle.r*ny };
                        reflections.push({x:cp.x, y:cp.y, order: bounce, normal: {x:nx,y:ny}, dirX: dirX, dirY: dirY, incAngle: incAngle.toFixed(0)});
                        newX = circle.x + (circle.r - ballR - 1) * nx;
                        newY = circle.y + (circle.r - ballR - 1) * ny;
                    }
                }
                pos.x = newX; pos.y = newY;
                points.push({x:pos.x, y:pos.y});
                iter++;
                if(Math.hypot(vel.x, vel.y) < 0.05) break;
            }
            return { points, reflections };
        }
        
        // 辅助函数：绘制角度符号（已提升到 drawCanvas 外部）
