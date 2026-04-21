/**
 * renderer.js - Canvas Renderer
 * All drawing operations for the game canvas
 * Depends on: config.js, utils.js, physics.js
 */

        function drawCanvas(){
            ctx.clearRect(0,0,width,height);
            const isDarkMode = document.body.classList.contains('dark-mode');
            ctx.fillStyle = isDarkMode ? '#0a1a10' : '#3a6b4a';
            ctx.fillRect(0,0,width,height);
            ctx.save();
            ctx.beginPath(); ctx.arc(circle.x, circle.y, circle.r, 0, 2*Math.PI); ctx.clip();
            // 圆盘内部背景 - 深色模式明显亮于画布背景，形成清晰层次
            ctx.fillStyle = isDarkMode ? '#3d7a56' : '#2b5e3b';
            ctx.fillRect(circle.x - R, circle.y - R, 2*R, 2*R);
            
            if(showGrid){
                ctx.strokeStyle = isDarkMode ? 'rgba(170, 240, 200, 0.6)' : '#cceecc';
                ctx.lineWidth = isDarkMode ? 1.2 : 0.8;
                for(let r=30; r<=R; r+=30){ ctx.beginPath(); ctx.arc(circle.x, circle.y, r, 0, 2*Math.PI); ctx.stroke(); }
                for(let ang=0; ang<360; ang+=15){
                    let rad = ang*Math.PI/180;
                    let x2 = circle.x + R*Math.cos(rad), y2 = circle.y + R*Math.sin(rad);
                    ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(x2, y2); ctx.stroke();
                }
            }
            
            if(showCartesian){
                ctx.strokeStyle = isDarkMode ? 'rgba(240, 180, 180, 0.7)' : '#eecccc';
                ctx.lineWidth = 1;
                // 绘制x轴和y轴
                ctx.beginPath(); ctx.moveTo(0, circle.y); ctx.lineTo(width, circle.y); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(circle.x, 0); ctx.lineTo(circle.x, height); ctx.stroke();
                // 绘制刻度
                let step = 30;
                for(let x=circle.x; x<=width; x+=step){ ctx.beginPath(); ctx.moveTo(x, circle.y-5); ctx.lineTo(x, circle.y+5); ctx.stroke(); }
                for(let x=circle.x; x>=0; x-=step){ ctx.beginPath(); ctx.moveTo(x, circle.y-5); ctx.lineTo(x, circle.y+5); ctx.stroke(); }
                for(let y=circle.y; y<=height; y+=step){ ctx.beginPath(); ctx.moveTo(circle.x-5, y); ctx.lineTo(circle.x+5, y); ctx.stroke(); }
                for(let y=circle.y; y>=0; y-=step){ ctx.beginPath(); ctx.moveTo(circle.x-5, y); ctx.lineTo(circle.x+5, y); ctx.stroke(); }
                // 绘制坐标轴标签
                ctx.fillStyle = 'yellow'; ctx.font = "12px monospace";
                ctx.fillText('x', width-15, circle.y-5);
                ctx.fillText('y', circle.x+5, 15);
                ctx.fillText('0', circle.x-10, circle.y+15);
            }
            
            if(showRuler){
                let d = Math.hypot(whiteBall.x-circle.x, whiteBall.y-circle.y);
                ctx.font = "12px monospace"; ctx.fillStyle = 'yellow';
                ctx.fillText(`d = ${d.toFixed(1)} / R = ${R.toFixed(1)}`, circle.x-40, circle.y-R-5);
                let chordLen = 2 * Math.sqrt(Math.max(0, R*R - d*d));
                ctx.fillText(`${lang === 'zh' ? '弦长' : 'Chord'} ≈ ${chordLen.toFixed(1)}`, circle.x-40, circle.y-R-20);
                
                // 显示圆的方程
                let eqn = lang === 'zh' ? `圆的方程: x² + y² = ${(R*R).toFixed(0)}` : `Circle equation: x² + y² = ${(R*R).toFixed(0)}`;
                ctx.fillText(eqn, circle.x-60, circle.y-R-35);
                
                // 显示白球的笛卡尔坐标
                let relX = (whiteBall.x - circle.x).toFixed(1);
                let relY = (circle.y - whiteBall.y).toFixed(1); // 翻转y轴，使上方为正
                ctx.fillText(`白球坐标: (${relX}, ${relY})`, circle.x-60, circle.y-R-50);
            }
            
            // 模式特殊绘制
            if(currentMode === 'angle' && angleModePoints.A && angleModePoints.B){
                let P = { x: targetBall.x, y: targetBall.y };
                let angleAPB = computeInscribedAngle(angleModePoints.A, angleModePoints.B, P);
                let centerAngle = computeCentralAngle(angleModePoints.A, angleModePoints.B);
                
                // 绘制弧AB高亮（半透明色带）
                let arcStart = Math.atan2(angleModePoints.A.y - circle.y, angleModePoints.A.x - circle.x);
                let arcEnd = Math.atan2(angleModePoints.B.y - circle.y, angleModePoints.B.x - circle.x);
                let arcDiff = arcEnd - arcStart;
                while(arcDiff > Math.PI) arcDiff -= 2*Math.PI;
                while(arcDiff < -Math.PI) arcDiff += 2*Math.PI;
                ctx.beginPath();
                ctx.moveTo(circle.x, circle.y);
                ctx.arc(circle.x, circle.y, R, arcStart, arcEnd, arcDiff < 0);
                ctx.closePath();
                ctx.fillStyle = 'rgba(255, 170, 51, 0.12)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 170, 51, 0.5)';
                ctx.lineWidth = 2; ctx.stroke();
                
                // 半圆模式下绘制直径AB为粗虚线
                if(angleSubMode === 'semicircle'){
                    ctx.beginPath(); ctx.moveTo(angleModePoints.A.x, angleModePoints.A.y); ctx.lineTo(angleModePoints.B.x, angleModePoints.B.y);
                    ctx.strokeStyle = '#ff8888'; ctx.lineWidth = 3; ctx.setLineDash([8, 4]); ctx.stroke(); ctx.setLineDash([]);
                }
                
                // 绘制A、B点标记
                ctx.beginPath(); ctx.arc(angleModePoints.A.x, angleModePoints.A.y, 6, 0, 2*Math.PI);
                ctx.fillStyle = '#ff8888'; ctx.fill();
                ctx.beginPath(); ctx.arc(angleModePoints.B.x, angleModePoints.B.y, 6, 0, 2*Math.PI);
                ctx.fill();
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.beginPath(); ctx.roundRect(angleModePoints.A.x-8, angleModePoints.A.y-18, 14, 14, 3); ctx.fill();
                ctx.beginPath(); ctx.roundRect(angleModePoints.B.x-8, angleModePoints.B.y-18, 14, 14, 3); ctx.fill();
                ctx.fillStyle = 'white'; ctx.font = 'bold 14px sans-serif';
                ctx.fillText('A', angleModePoints.A.x-4, angleModePoints.A.y-8);
                ctx.fillText('B', angleModePoints.B.x-4, angleModePoints.B.y-8);
                
                // 绘制PA、PB射线
                ctx.beginPath(); ctx.moveTo(angleModePoints.A.x, angleModePoints.A.y); ctx.lineTo(P.x, P.y); ctx.lineTo(angleModePoints.B.x, angleModePoints.B.y);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
                
                // 绘制圆周角弧线（顶点P处）
                let angA = Math.atan2(angleModePoints.A.y - P.y, angleModePoints.A.x - P.x);
                let angB = Math.atan2(angleModePoints.B.y - P.y, angleModePoints.B.x - P.x);
                let pDiff = angB - angA;
                while(pDiff > Math.PI) pDiff -= 2*Math.PI;
                while(pDiff < -Math.PI) pDiff += 2*Math.PI;
                ctx.beginPath();
                ctx.arc(P.x, P.y, 25, angA, angB, pDiff < 0);
                ctx.strokeStyle = '#ffaa33'; ctx.lineWidth = 3; ctx.stroke();
                
                // 绘制圆心角弧线（圆心O处）
                let oA = Math.atan2(angleModePoints.A.y - circle.y, angleModePoints.A.x - circle.x);
                let oB = Math.atan2(angleModePoints.B.y - circle.y, angleModePoints.B.x - circle.x);
                let oDiff = oB - oA;
                while(oDiff > Math.PI) oDiff -= 2*Math.PI;
                while(oDiff < -Math.PI) oDiff += 2*Math.PI;
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, 35, oA, oB, oDiff < 0);
                ctx.strokeStyle = '#33ffaa'; ctx.lineWidth = 3; ctx.stroke();
                
                // 半圆模式：直角符号
                if(angleSubMode === 'semicircle'){
                    let rightDirA = Math.atan2(angleModePoints.A.y - P.y, angleModePoints.A.x - P.x);
                    let rightDirB = Math.atan2(angleModePoints.B.y - P.y, angleModePoints.B.x - P.x);
                    ctx.beginPath();
                    ctx.moveTo(P.x + Math.cos(rightDirA)*18, P.y + Math.sin(rightDirA)*18);
                    ctx.lineTo(P.x + Math.cos(rightDirA)*18 + Math.cos(rightDirB)*18, P.y + Math.sin(rightDirA)*18 + Math.sin(rightDirB)*18);
                    ctx.lineTo(P.x + Math.cos(rightDirB)*18, P.y + Math.sin(rightDirB)*18);
                    ctx.strokeStyle = '#ff7777'; ctx.lineWidth = 2.5; ctx.stroke();
                }
                
                // 实时数据显示（屏幕上方）
                ctx.save();
                let infoText = `∠APB = ${angleAPB.toFixed(1)}°   ∠AOB = ${centerAngle.toFixed(1)}°   Ratio = ${(centerAngle/angleAPB).toFixed(2)}`;
                let infoWidth = ctx.measureText(infoText).width;
                ctx.fillStyle = 'rgba(0,0,0,0.55)';
                ctx.beginPath();
                ctx.roundRect(12, 10, infoWidth + 16, 26, 8);
                ctx.fill();
                ctx.fillStyle = '#ffaa33'; ctx.font = 'bold 16px monospace';
                ctx.fillText(infoText, 20, 30);
                ctx.restore();
                
                // 绘制历史轨迹点
                if(angleModePoints.history && angleModePoints.history.length > 0){
                    for(let i=0; i<angleModePoints.history.length; i++){
                        let hP = angleModePoints.history[i];
                        ctx.beginPath(); ctx.arc(hP.x, hP.y, 4, 0, 2*Math.PI);
                        ctx.fillStyle = `rgba(255, 170, 51, ${1 - i*0.2})`; ctx.fill();
                    }
                }
                
                // 绘制多P点验证（同弧所对圆周角相等）
                if(angleModePoints.multiP && angleModePoints.multiP.length > 0){
                    for(let i=0; i<angleModePoints.multiP.length; i++){
                        let mp = angleModePoints.multiP[i];
                        // 绘制P点位置（小圆点，不同颜色）
                        ctx.beginPath(); ctx.arc(mp.x, mp.y, 5, 0, 2*Math.PI);
                        ctx.fillStyle = `hsl(${180 + i*40}, 80%, 60%)`; ctx.fill();
                        ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5; ctx.stroke();
                        // 编号
                        ctx.fillStyle = 'white'; ctx.font = 'bold 11px sans-serif';
                        ctx.fillText(`P${i+1}`, mp.x + 8, mp.y - 8);
                        // 绘制PA、PB连线（半透明）
                        ctx.beginPath();
                        ctx.moveTo(angleModePoints.A.x, angleModePoints.A.y); ctx.lineTo(mp.x, mp.y); ctx.lineTo(angleModePoints.B.x, angleModePoints.B.y);
                        ctx.strokeStyle = `hsla(${180 + i*40}, 80%, 60%, 0.3)`; ctx.lineWidth = 1; ctx.stroke();
                        // 在该P点处绘制小圆周角弧线
                        let aA = Math.atan2(angleModePoints.A.y - mp.y, angleModePoints.A.x - mp.x);
                        let aB = Math.atan2(angleModePoints.B.y - mp.y, angleModePoints.B.x - mp.x);
                        let aDiff = aB - aA;
                        while(aDiff > Math.PI) aDiff -= 2*Math.PI;
                        while(aDiff < -Math.PI) aDiff += 2*Math.PI;
                        ctx.beginPath();
                        ctx.arc(mp.x, mp.y, 18, aA, aB, aDiff < 0);
                        ctx.strokeStyle = `hsl(${180 + i*40}, 80%, 60%)`; ctx.lineWidth = 2; ctx.stroke();
                        // 角度值
                        let midAng = aA + aDiff/2;
                        let angleLabelText = `${mp.angle.toFixed(1)}°`;
                        ctx.font = '10px sans-serif';
                        let labelW = ctx.measureText(angleLabelText).width;
                        let labelX = mp.x + Math.cos(midAng)*22 - 10;
                        let labelY = mp.y + Math.sin(midAng)*22;
                        ctx.fillStyle = 'rgba(0,0,0,0.5)';
                        ctx.beginPath();
                        ctx.roundRect(labelX - 3, labelY - 10, labelW + 6, 14, 4);
                        ctx.fill();
                        ctx.fillStyle = `hsl(${180 + i*40}, 80%, 70%)`;
                        ctx.fillText(angleLabelText, labelX, labelY);
                    }
                }
                
                // 证明模式：分步可视化
                if(proofMode){
                    // 步骤0：高亮半径 OA, OB, OP
                    if(proofStep >= 0){
                        ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(angleModePoints.A.x, angleModePoints.A.y);
                        ctx.strokeStyle = '#ffff00'; ctx.lineWidth = 2; ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(angleModePoints.B.x, angleModePoints.B.y);
                        ctx.strokeStyle = '#ffff00'; ctx.lineWidth = 2; ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(P.x, P.y);
                        ctx.strokeStyle = '#ffff00'; ctx.lineWidth = 2; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
                        ctx.fillStyle = '#ffff00'; ctx.font = '12px monospace';
                        ctx.fillText('O', circle.x-4, circle.y-4);
                        ctx.fillText('P', P.x-4, P.y-4);
                    }
                    
                    // 步骤1：同时显示等腰三角形 OAP 和 OBP 的底角 α 和 β（不同颜色静态标注）
                    if(proofStep >= 1){
                        drawAngle(circle.x, circle.y, angleModePoints.A.x, angleModePoints.A.y, P.x, P.y, '#ffff00', 'α');
                        drawAngle(circle.x, circle.y, angleModePoints.B.x, angleModePoints.B.y, P.x, P.y, '#00ffff', 'β');
                    }
                    
                    // 步骤2：推导外角关系
                    if(proofStep >= 2){
                        drawAngle(circle.x, circle.y, angleModePoints.A.x, angleModePoints.A.y, P.x, P.y, '#ffff00', 'α');
                        drawAngle(circle.x, circle.y, angleModePoints.B.x, angleModePoints.B.y, P.x, P.y, '#00ffff', 'β');
                        drawAngle(P.x, P.y, angleModePoints.A.x, angleModePoints.A.y, angleModePoints.B.x, angleModePoints.B.y, '#ffaa33', 'θ');
                        drawAngle(circle.x, circle.y, angleModePoints.A.x, angleModePoints.A.y, angleModePoints.B.x, angleModePoints.B.y, '#33ffaa', '2θ');
                    }
                    
                    // 步骤3：完整推导文字（绘制在画布下方安全区域）
                    if(proofStep >= 3){
                        let py = height - 100;
                        ctx.fillStyle = 'rgba(0,0,0,0.6)';
                        ctx.beginPath(); ctx.roundRect(12, py-18, width-180, 105, 10); ctx.fill();
                        ctx.fillStyle = 'white'; ctx.font = '14px monospace';
                        ctx.fillText(`${lang === 'zh' ? '证明步骤:' : 'Proof steps:'}`, 20, py);
                        ctx.fillText(`1) OA = OP = OB (${lang === 'zh' ? '半径' : 'radii'})`, 20, py+20);
                        ctx.fillText(`2) ∠OAP = ∠OPA = α,  ∠OBP = ∠OPB = β`, 20, py+40);
                        ctx.fillText(`3) ∠AOP = 2α,  ∠BOP = 2β (${lang === 'zh' ? '外角定理' : 'ext. angle'})`, 20, py+60);
                        ctx.fillText(`4) ∠AOB = 2α + 2β = 2(α+β) = 2∠APB  ✅`, 20, py+80);
                    }
                }
            }
            if(currentMode === 'chord' && chordForMode){
                let c = chordForMode;
                // 弦：粗蓝线 + 端点 C, D
                ctx.beginPath(); ctx.moveTo(c.p1.x, c.p1.y); ctx.lineTo(c.p2.x, c.p2.y);
                ctx.strokeStyle = '#3399ff'; ctx.lineWidth = 4; ctx.stroke();
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.beginPath(); ctx.roundRect(c.p1.x - 10, c.p1.y - 16, 14, 14, 3); ctx.fill();
                ctx.beginPath(); ctx.roundRect(c.p2.x - 10, c.p2.y - 16, 14, 14, 3); ctx.fill();
                ctx.fillStyle = '#66bbff'; ctx.font = 'bold 13px sans-serif';
                ctx.fillText('C', c.p1.x - 6, c.p1.y - 6);
                ctx.fillText('D', c.p2.x - 6, c.p2.y - 6);
                
                // 端点高亮
                ctx.beginPath(); ctx.arc(c.p1.x, c.p1.y, 5, 0, 2*Math.PI); ctx.fillStyle = '#66bbff'; ctx.fill();
                ctx.beginPath(); ctx.arc(c.p2.x, c.p2.y, 5, 0, 2*Math.PI); ctx.fillStyle = '#66bbff'; ctx.fill();
                
                // 中点 M：金色圆点
                ctx.beginPath(); ctx.arc(c.mid.x, c.mid.y, 7, 0, 2*Math.PI);
                ctx.fillStyle = '#ffcc00'; ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.beginPath(); ctx.roundRect(c.mid.x + 7, c.mid.y - 10, 16, 16, 3); ctx.fill();
                ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 13px sans-serif';
                ctx.fillText('M', c.mid.x + 10, c.mid.y + 4);
                
                // 圆心到弦中点的连线（虚线）
                ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(c.mid.x, c.mid.y);
                ctx.strokeStyle = '#ffaa33'; ctx.lineWidth = 2; ctx.setLineDash([6,4]); ctx.stroke(); ctx.setLineDash([]);
                
                // 实时测量数据（屏幕上方）
                ctx.save();
                ctx.shadowColor = 'black'; ctx.shadowBlur = 4;
                ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 14px monospace';
                let halfLen = (c.length/2).toFixed(1);
                let dCenter = c.distToCenter.toFixed(1);
                let info = lang === 'zh' 
                    ? `弦长 |CD|=${c.length.toFixed(1)}  CM=MD=${halfLen}  d(O,CD)=${dCenter}`
                    : `|CD|=${c.length.toFixed(1)}  CM=MD=${halfLen}  d(O,CD)=${dCenter}`;
                ctx.fillText(info, 20, 28);
                ctx.restore();
                
                // Snap Assist 视觉引导：黄色虚线沿垂直平分线方向
                if(chordSnapAssist && !isMoving){
                    let perpDir = c.slope + Math.PI/2;
                    let lineLen = R * 1.2;
                    ctx.save();
                    ctx.shadowColor = 'black'; ctx.shadowBlur = 4;
                    ctx.beginPath();
                    ctx.moveTo(whiteBall.x - Math.cos(perpDir)*lineLen, whiteBall.y - Math.sin(perpDir)*lineLen);
                    ctx.lineTo(whiteBall.x + Math.cos(perpDir)*lineLen, whiteBall.y + Math.sin(perpDir)*lineLen);
                    ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 2; ctx.setLineDash([8,6]); ctx.stroke(); ctx.setLineDash([]);
                    // 端点箭头
                    ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 12px sans-serif';
                    ctx.fillText('⊥', whiteBall.x + Math.cos(perpDir)*lineLen - 6, whiteBall.y + Math.sin(perpDir)*lineLen - 6);
                    ctx.fillText('⊥', whiteBall.x - Math.cos(perpDir)*lineLen - 6, whiteBall.y - Math.sin(perpDir)*lineLen - 6);
                    ctx.restore();
                }
                
                // 显示答案：金色虚线路径
                if(chordShowAnswer && !isMoving){
                    let ansDir = c.slope + Math.PI/2;
                    let ansLen = R * 1.2;
                    ctx.save();
                    ctx.shadowColor = 'black'; ctx.shadowBlur = 4;
                    ctx.beginPath();
                    ctx.moveTo(whiteBall.x - Math.cos(ansDir)*ansLen, whiteBall.y - Math.sin(ansDir)*ansLen);
                    ctx.lineTo(whiteBall.x + Math.cos(ansDir)*ansLen, whiteBall.y + Math.sin(ansDir)*ansLen);
                    ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 3; ctx.setLineDash([10,5]); ctx.stroke(); ctx.setLineDash([]);
                    ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 13px sans-serif';
                    let ansLabel = lang === 'zh' ? '答案路径' : 'Correct path';
                    ctx.fillText(ansLabel, whiteBall.x + Math.cos(ansDir)*ansLen + 8, whiteBall.y + Math.sin(ansDir)*ansLen);
                    ctx.restore();
                }
                
                // 证明模式：垂径定理 4 步可视化
                if(proofMode){
                    // 步骤0/1: 连接圆心与弦端点 OC, OD，标注等长
                    if(chordProofStep >= 0){
                        ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(c.p1.x, c.p1.y);
                        ctx.strokeStyle = '#ff66ff'; ctx.lineWidth = 2.5; ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(c.p2.x, c.p2.y);
                        ctx.strokeStyle = '#ff66ff'; ctx.lineWidth = 2.5; ctx.stroke();
                        ctx.fillStyle = '#ff66ff'; ctx.font = 'bold 12px sans-serif';
                        ctx.fillText('O', circle.x-6, circle.y-8);
                        ctx.fillText('C', c.p1.x-6, c.p1.y-8);
                        ctx.fillText('D', c.p2.x-6, c.p2.y-8);
                        // 半径等长标注
                        ctx.fillStyle = '#ffaa88'; ctx.font = '11px sans-serif';
                        let ocMid = {x:(circle.x+c.p1.x)/2, y:(circle.y+c.p1.y)/2};
                        let odMid = {x:(circle.x+c.p2.x)/2, y:(circle.y+c.p2.y)/2};
                        ctx.fillText('R', ocMid.x-4, ocMid.y-4);
                        ctx.fillText('R', odMid.x-4, odMid.y-4);
                    }
                    // 步骤1: 高亮中点 M，连接 OM
                    if(chordProofStep >= 1){
                        ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(c.mid.x, c.mid.y);
                        ctx.strokeStyle = '#00ffdd'; ctx.lineWidth = 2.5; ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
                        ctx.fillStyle = '#00ffdd'; ctx.font = 'bold 12px sans-serif';
                        ctx.fillText('M', c.mid.x + 10, c.mid.y - 6);
                    }
                    // 步骤2: 显示三角形 OCM 和 ODM，标注 SSS
                    if(chordProofStep >= 2){
                        // 三角形填充（半透明）
                        ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(c.p1.x, c.p1.y); ctx.lineTo(c.mid.x, c.mid.y); ctx.closePath();
                        ctx.fillStyle = 'rgba(255, 100, 255, 0.12)'; ctx.fill();
                        ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(c.p2.x, c.p2.y); ctx.lineTo(c.mid.x, c.mid.y); ctx.closePath();
                        ctx.fillStyle = 'rgba(100, 255, 200, 0.12)'; ctx.fill();
                        // 边标注
                        ctx.fillStyle = '#ffcc88'; ctx.font = '11px sans-serif';
                        let cmMid = {x:(c.p1.x+c.mid.x)/2, y:(c.p1.y+c.mid.y)/2};
                        let dmMid = {x:(c.p2.x+c.mid.x)/2, y:(c.p2.y+c.mid.y)/2};
                        ctx.fillText('a', cmMid.x-4, cmMid.y-4);
                        ctx.fillText('a', dmMid.x-4, dmMid.y-4);
                        ctx.fillText('b', (circle.x+c.mid.x)/2-4, (circle.y+c.mid.y)/2-4);
                    }
                    // 步骤3: 直角符号 + 结论
                    if(chordProofStep >= 3){
                        // 直角符号在 M 处
                        let toO = Math.atan2(circle.y - c.mid.y, circle.x - c.mid.x);
                        let toC = Math.atan2(c.p1.y - c.mid.y, c.p1.x - c.mid.x);
                        let toD = Math.atan2(c.p2.y - c.mid.y, c.p2.x - c.mid.x);
                        ctx.beginPath();
                        ctx.moveTo(c.mid.x + Math.cos(toO)*14, c.mid.y + Math.sin(toO)*14);
                        ctx.lineTo(c.mid.x + Math.cos(toO)*14 + Math.cos(toC)*14, c.mid.y + Math.sin(toO)*14 + Math.sin(toC)*14);
                        ctx.lineTo(c.mid.x + Math.cos(toC)*14, c.mid.y + Math.sin(toC)*14);
                        ctx.strokeStyle = '#ff7777'; ctx.lineWidth = 3; ctx.stroke();
                        // 结论文字
                        ctx.fillStyle = '#ff7777'; ctx.font = 'bold 14px sans-serif';
                        let conclusion = lang === 'zh' ? '∴ ∠OMC = ∠OMD = 90°' : '∴ ∠OMC = ∠OMD = 90°';
                        ctx.fillText(conclusion, c.mid.x + 20, c.mid.y + 30);
                    }
                    // 推理文字面板（右下角）
                    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(width-280, height-140, 270, 130);
                    ctx.fillStyle = '#fff'; ctx.font = '13px monospace';
                    let proofTexts = lang === 'zh' ? [
                        ['Step 0', '连接 OC, OD (半径相等)'],
                        ['Step 1', 'M 是 CD 中点, 连接 OM'],
                        ['Step 2', '△OCM ≌ △ODM (SSS)'],
                        ['Step 3', '∴ ∠OMC = ∠OMD = 90°']
                    ] : [
                        ['Step 0', 'Connect OC, OD (radii equal)'],
                        ['Step 1', 'M is midpoint of CD, join OM'],
                        ['Step 2', '△OCM ≌ △ODM (SSS)'],
                        ['Step 3', '∴ ∠OMC = ∠OMD = 90°']
                    ];
                    for(let i=0; i<=chordProofStep && i<4; i++){
                        let color = (i===chordProofStep) ? '#ffcc00' : '#aaa';
                        ctx.fillStyle = color;
                        ctx.fillText(`${proofTexts[i][0]}: ${proofTexts[i][1]}`, width-270, height-120 + i*22);
                    }
                }
                
                // 直角符号：若白球运动方向接近垂直，在交点预绘制
                if(!isMoving && chordForMode && whiteBall.vx === 0 && whiteBall.vy === 0){
                    // 静止时根据瞄准方向判断
                }
            }
            
            // drawAngle 已提升到 drawCanvas 外部
            
            // 红球/白球 - 深色模式添加发光
            if(isDarkMode){
                ctx.shadowColor = 'rgba(255, 68, 102, 0.5)'; ctx.shadowBlur = 8;
            }
            ctx.beginPath(); ctx.arc(targetBall.x, targetBall.y, targetBall.r, 0, 2*Math.PI);
            ctx.fillStyle = isDarkMode ? '#ff4466' : '#e63946'; ctx.fill();
            ctx.shadowBlur = 0;
            if(isDarkMode){
                ctx.shadowColor = 'rgba(255, 255, 255, 0.6)'; ctx.shadowBlur = 10;
            }
            ctx.beginPath(); ctx.arc(whiteBall.x, whiteBall.y, ballR, 0, 2*Math.PI);
            ctx.fillStyle = 'white'; ctx.fill(); ctx.stroke();
            ctx.shadowBlur = 0;
            
            // 绘制用户添加的点和连线
            if(showRuler && userPoints.length > 0){
                // 绘制连线
                ctx.beginPath(); ctx.strokeStyle = '#ffaa33'; ctx.lineWidth = 2; ctx.setLineDash([5, 3]);
                for(let i=0; i<userPoints.length-1; i++){
                    ctx.beginPath(); ctx.moveTo(userPoints[i].x, userPoints[i].y); ctx.lineTo(userPoints[i+1].x, userPoints[i+1].y); ctx.stroke();
                }
                ctx.setLineDash([]);
                
                // 绘制点
                for(let i=0; i<userPoints.length; i++){
                    let p = userPoints[i];
                    ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 2*Math.PI);
                    ctx.fillStyle = '#ffaa33'; ctx.fill();
                    ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
                    ctx.fillStyle = 'white'; ctx.font = 'bold 14px'; ctx.fillText(String.fromCharCode(65 + i), p.x-4, p.y+5);
                }
                
                // 测量功能：显示所有可形成线的距离
                for(let i=0; i<userPoints.length-1; i++){
                    let p1 = userPoints[i], p2 = userPoints[i+1];
                    let distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                    let midX = (p1.x + p2.x)/2, midY = (p1.y + p2.y)/2;
                    ctx.fillStyle = 'yellow'; ctx.font = '12px monospace';
                    let distanceLabel = lang === 'zh' ? `距离: ${distance.toFixed(1)}` : `Distance: ${distance.toFixed(1)}`;
                    ctx.font = '12px monospace';
                    let dW = ctx.measureText(distanceLabel).width;
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.beginPath(); ctx.roundRect(midX - 3, midY - 22, dW + 6, 16, 4); ctx.fill();
                    ctx.fillStyle = 'yellow';
                    ctx.fillText(distanceLabel, midX, midY-10);
                }
                
                // 测量功能：显示所有角的角度
                for(let i=1; i<userPoints.length-1; i++){
                    let p1 = userPoints[i-1], p2 = userPoints[i], p3 = userPoints[i+1];
                    let angle = computeInscribedAngle(p1, p3, p2);
                    ctx.fillStyle = 'yellow'; ctx.font = '12px monospace';
                    let angleLabel = lang === 'zh' ? `角度: ${angle.toFixed(1)}°` : `Angle: ${angle.toFixed(1)}°`;
                    ctx.font = '12px monospace';
                    let aW = ctx.measureText(angleLabel).width;
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.beginPath(); ctx.roundRect(p2.x - 3, p2.y - 22, aW + 6, 16, 4); ctx.fill();
                    ctx.fillStyle = 'yellow';
                    ctx.fillText(angleLabel, p2.x, p2.y-10);
                }
            }
            
            // 瞄准预测
            if(isAiming && aimEnd && showPredict){
                let dx = aimEnd.x - whiteBall.x, dy = aimEnd.y - whiteBall.y;
                let len = Math.hypot(dx, dy);
                if(len > 2){
                    let power = computePowerFromDrag(len);
                    let vx = dx/len * power, vy = dy/len * power;
                    // 根据力度调整预测的碰撞次数，力度越大，预测次数越多
                    let maxCollisions = Math.min(6, Math.floor(2 + power / 20));
                    let { points, reflections } = predictPath(whiteBall.x, whiteBall.y, vx, vy, maxCollisions);
                    
                    // 绘制完整预测路径：入射段 + 所有反射段
                    for(let i = 0; i < points.length - 1; i++){
                        ctx.beginPath();
                        ctx.moveTo(points[i].x, points[i].y);
                        ctx.lineTo(points[i+1].x, points[i+1].y);
                        // 入射段：绿色实线 | 反射段：橙色虚线
                        if(i === 0){
                            ctx.strokeStyle = '#4ade80'; ctx.setLineDash([]);
                        } else {
                            ctx.strokeStyle = '#ffaa33'; ctx.setLineDash([6, 4]);
                        }
                        ctx.lineWidth = 2.5;
                        ctx.shadowColor = ctx.strokeStyle;
                        ctx.shadowBlur = 6;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                    ctx.setLineDash([]);
                    
                    // 绘制碰撞点及法线/角度（所有模式）
                    for(let rp of reflections){
                        ctx.beginPath(); ctx.arc(rp.x, rp.y, 7, 0, 2*Math.PI);
                        ctx.fillStyle = '#ffaa33cc'; ctx.fill();
                        ctx.fillStyle = 'white'; ctx.font = 'bold 14px';
                        ctx.fillText(rp.order, rp.x-4, rp.y+5);
                        
                        // 法线（红色虚线）
                        ctx.beginPath();
                        ctx.moveTo(rp.x - rp.normal.x * 30, rp.y - rp.normal.y * 30);
                        ctx.lineTo(rp.x + rp.normal.x * 40, rp.y + rp.normal.y * 40);
                        ctx.strokeStyle = '#ff8888'; ctx.lineWidth = 2;
                        ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
                        
                        // 入射角弧线
                        let velDir = Math.atan2(rp.dirY, rp.dirX);
                        let normalInDir = Math.atan2(-rp.normal.y, -rp.normal.x);
                        drawAngle(rp.x, rp.y,
                            rp.x + Math.cos(normalInDir)*30, rp.y + Math.sin(normalInDir)*30,
                            rp.x + Math.cos(velDir)*30, rp.y + Math.sin(velDir)*30,
                            '#4ade80', `${rp.incAngle}°`
                        );
                        
                        // 预测反射角弧线
                        let reflDir = 2 * normalInDir - velDir;
                        drawAngle(rp.x, rp.y,
                            rp.x + Math.cos(normalInDir)*30, rp.y + Math.sin(normalInDir)*30,
                            rp.x + Math.cos(reflDir)*30, rp.y + Math.sin(reflDir)*30,
                            '#ffaa33', `${rp.incAngle}°`
                        );
                    }
                    
                    // 垂径定理模式：瞄准引导
                    if(currentMode === 'chord' && chordForMode){
                        let c = chordForMode;
                        let aimAngle = Math.atan2(dy, dx);
                        let chordAngle = Math.atan2(c.p2.y - c.p1.y, c.p2.x - c.p1.x);
                        let diff = aimAngle - chordAngle;
                        while(diff > Math.PI) diff -= 2*Math.PI;
                        while(diff < -Math.PI) diff += 2*Math.PI;
                        let angleDeg = Math.abs(diff) * 180 / Math.PI;
                        let perpDev = Math.abs(angleDeg - 90);
                        let isClosePerp = perpDev < 15;
                        
                        let perpDir = Math.atan2(c.mid.y - circle.y, c.mid.x - circle.x);
                        let extX = circle.x + R * Math.cos(perpDir);
                        let extY = circle.y + R * Math.sin(perpDir);
                        ctx.beginPath(); ctx.setLineDash([5,5]); 
                        ctx.strokeStyle = isClosePerp ? '#4ade80' : '#ffaa33aa';
                        ctx.lineWidth = isClosePerp ? 3 : 2;
                        ctx.moveTo(circle.x, circle.y); ctx.lineTo(extX, extY); ctx.stroke();
                        ctx.setLineDash([]);
                        
                        let angleColor = perpDev < 5 ? '#4ade80' : (perpDev < 15 ? '#ffcc00' : '#ff8888');
                        let angleText = `${angleDeg.toFixed(1)}°`;
                        ctx.font = 'bold 14px sans-serif';
                        let aW = ctx.measureText(angleText).width;
                        ctx.fillStyle = 'rgba(0,0,0,0.5)';
                        ctx.beginPath(); ctx.roundRect(whiteBall.x + dx/len*60 - 18, whiteBall.y + dy/len*60 - 22, aW + 6, 18, 4); ctx.fill();
                        ctx.fillStyle = angleColor;
                        ctx.fillText(angleText, whiteBall.x + dx/len*60 - 15, whiteBall.y + dy/len*60 - 10);
                        
                        let distToCenterLine = Math.abs(dx*(whiteBall.y - circle.y) - dy*(whiteBall.x - circle.x)) / len;
                        let centerOK = distToCenterLine < 8;
                        let centerText = lang==='zh' ? `距圆心: ${distToCenterLine.toFixed(1)}px` : `To center: ${distToCenterLine.toFixed(1)}px`;
                        ctx.font = '12px sans-serif';
                        let cW = ctx.measureText(centerText).width;
                        ctx.fillStyle = 'rgba(0,0,0,0.5)';
                        ctx.beginPath(); ctx.roundRect(whiteBall.x + dx/len*60 - 23, whiteBall.y + dy/len*60 + 0, cW + 6, 16, 4); ctx.fill();
                        ctx.fillStyle = centerOK ? '#4ade80' : '#ff8888';
                        ctx.fillText(centerText, whiteBall.x + dx/len*60 - 20, whiteBall.y + dy/len*60 + 12);
                        
                        if(perpDev < 15){
                            let toCenter = Math.atan2(circle.y - c.mid.y, circle.x - c.mid.x);
                            let toC = Math.atan2(c.p1.y - c.mid.y, c.p1.x - c.mid.x);
                            let alpha = 0.3 + 0.7 * (1 - perpDev/15);
                            ctx.beginPath();
                            ctx.moveTo(c.mid.x + Math.cos(toCenter)*12, c.mid.y + Math.sin(toCenter)*12);
                            ctx.lineTo(c.mid.x + Math.cos(toCenter)*12 + Math.cos(toC)*12, c.mid.y + Math.sin(toCenter)*12 + Math.sin(toC)*12);
                            ctx.lineTo(c.mid.x + Math.cos(toC)*12, c.mid.y + Math.sin(toC)*12);
                            ctx.strokeStyle = `rgba(78, 222, 128, ${alpha})`; ctx.lineWidth = 3; ctx.stroke();
                        }
                    }
                    
                    // 反射实验室：实时角度读数 + 镜像证明
                    if(currentMode === 'lab' && reflections.length > 0){
                        let rp = reflections[0];
                        ctx.save();
                        ctx.font = 'bold 13px monospace';
                        let t1 = `${lang==='zh'?'入射角':'Inc'}: ${rp.incAngle}°`;
                        let t2 = `${lang==='zh'?'反射角':'Ref'}: ${rp.incAngle}°`;
                        let t3 = `${lang==='zh'?'法线':'Normal'}`;
                        let w1 = ctx.measureText(t1).width, w2 = ctx.measureText(t2).width, w3 = ctx.measureText(t3).width;
                        ctx.fillStyle = 'rgba(0,0,0,0.55)';
                        ctx.beginPath(); ctx.roundRect(rp.x + 12, rp.y - 38, Math.max(w1,w2) + 8, 34, 6); ctx.fill();
                        ctx.beginPath(); ctx.roundRect(rp.x + rp.normal.x * 45 - 18, rp.y + rp.normal.y * 45 - 13, w3 + 6, 17, 4); ctx.fill();
                        ctx.fillStyle = '#4ade80';
                        ctx.fillText(t1, rp.x + 15, rp.y - 25);
                        ctx.fillStyle = '#ffaa33';
                        ctx.fillText(t2, rp.x + 15, rp.y - 10);
                        ctx.fillStyle = '#ff8888';
                        ctx.fillText(t3, rp.x + rp.normal.x * 45 - 15, rp.y + rp.normal.y * 45);
                        ctx.restore();
                        
                        // 镜像证明辅助线
                        if(labProofMode && labTargets.length > 0){
                            let target = labTargets.find(t => !t.hit);
                            if(target){
                                let tx = target.x - circle.x, ty = target.y - circle.y;
                                let tLen = Math.hypot(tx, ty);
                                let tangentX = -ty/tLen, tangentY = tx/tLen;
                                let toTargetX = target.x - rp.x, toTargetY = target.y - rp.y;
                                let dot = toTargetX*tangentX + toTargetY*tangentY;
                                let mirrorX = target.x - 2*dot*tangentX;
                                let mirrorY = target.y - 2*dot*tangentY;
                                ctx.beginPath(); ctx.setLineDash([3,3]); ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2;
                                ctx.moveTo(rp.x, rp.y); ctx.lineTo(mirrorX, mirrorY); ctx.stroke();
                                ctx.setLineDash([]);
                                ctx.beginPath(); ctx.arc(mirrorX, mirrorY, 6, 0, 2*Math.PI);
                                ctx.fillStyle = '#a78bfa'; ctx.fill();
                                ctx.fillStyle = '#a78bfa'; ctx.font = '11px sans-serif';
                                ctx.fillText(lang==='zh'?'镜像点':'Mirror', mirrorX+8, mirrorY+4);
                            }
                        }
                    }
                    
                    let percent = Math.min(1, len/80)*100;
                    powerSlider.value = percent; powerVal.innerText = Math.floor(percent)+'%';
                    ringCtx.clearRect(0,0,width,height);
                    
                    // 改进力度指示器：环绕白球的动态箭头
                    let angle = Math.atan2(dy, dx);
                    let arrowLength = 10 + percent/100 * 40;
                    let arrowWidth = 3 + percent/100 * 2;
                    
                    // 计算箭头颜色：根据力度从绿色到红色渐变
                    let r = Math.floor(255 * percent/100);
                    let g = Math.floor(255 * (1 - percent/100));
                    let color = `rgb(${r}, ${g}, 0)`;
                    
                    // 绘制箭头
                    ringCtx.save();
                    ringCtx.translate(whiteBall.x, whiteBall.y);
                    ringCtx.rotate(angle);
                    
                    // 箭头主体
                    ringCtx.beginPath();
                    ringCtx.moveTo(ballR + 5, 0);
                    ringCtx.lineTo(ballR + arrowLength, 0);
                    ringCtx.strokeStyle = color;
                    ringCtx.lineWidth = arrowWidth;
                    ringCtx.stroke();
                    
                    // 箭头头部
                    ringCtx.beginPath();
                    ringCtx.moveTo(ballR + arrowLength, 0);
                    ringCtx.lineTo(ballR + arrowLength - 10, -5);
                    ringCtx.lineTo(ballR + arrowLength - 10, 5);
                    ringCtx.closePath();
                    ringCtx.fillStyle = color;
                    ringCtx.fill();
                    
                    ringCtx.restore();
                }
            } else if(!isAiming){
                powerSlider.value = 0; powerVal.innerText = '0%';
                ringCtx.clearRect(0,0,width,height);
            }
            
            // 反射模式：显示答案（理想反射路径），跟随轨迹预测开关
            if(showPredict && !isMoving && (currentMode === 'reflect1' || currentMode === 'reflect2')){
                let required = currentMode === 'reflect1' ? 1 : 2;
                let path = findReflectAnswer(required);
                if(path && path.length > 0){
                    ctx.save();
                    ctx.strokeStyle = '#f5e56b'; ctx.lineWidth = 3; ctx.setLineDash([8,4]);
                    ctx.beginPath(); ctx.moveTo(whiteBall.x, whiteBall.y);
                    for(let p of path) ctx.lineTo(p.x, p.y);
                    ctx.lineTo(targetBall.x, targetBall.y);
                    ctx.stroke(); ctx.setLineDash([]);
                    // 碰撞点标记
                    for(let p of path){
                        ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, 2*Math.PI);
                        ctx.fillStyle = '#f5e56b'; ctx.fill();
                        ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
                    }
                    let reflectHint = lang==='zh'?'💡 理想反射路径':'💡 Ideal reflect path';
                    ctx.font = 'bold 13px sans-serif';
                    let hW = ctx.measureText(reflectHint).width;
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.beginPath(); ctx.roundRect(10, height-42, hW+10, 18, 4); ctx.fill();
                    ctx.fillStyle = '#f5e56b';
                    ctx.fillText(reflectHint, 15, height-30);
                    ctx.restore();
                }
            }
            
            // 切线狙击模式：切线预测线与容差扇形
            if(isAiming && aimEnd && currentMode === 'tangent'){
                let dx = targetBall.x - whiteBall.x;
                let dy = targetBall.y - whiteBall.y;
                let d = Math.hypot(dx, dy);
                let effectiveR = targetBall.r + ballR;
                if(d > effectiveR){
                    let baseAngle = Math.atan2(dy, dx);
                    let theta = Math.asin(Math.min(1, effectiveR / d));
                    let dir1 = baseAngle - theta;
                    let dir2 = baseAngle + theta;
                    let lineLen = Math.min(d, 250);
                    
                    // 容差扇形（±8°，浅绿色半透明）
                    let tolRad = 8 * Math.PI / 180;
                    let drawSector = (centerDir) => {
                        ctx.beginPath();
                        ctx.moveTo(whiteBall.x, whiteBall.y);
                        ctx.arc(whiteBall.x, whiteBall.y, lineLen, centerDir - tolRad, centerDir + tolRad);
                        ctx.closePath();
                        ctx.fillStyle = 'rgba(144, 238, 144, 0.12)';
                        ctx.fill();
                    };
                    drawSector(dir1);
                    drawSector(dir2);
                    
                    // 两条切线方向（亮青色虚线）
                    ctx.save();
                    ctx.setLineDash([6, 4]);
                    ctx.lineWidth = 2.5;
                    ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 6;
                    
                    ctx.beginPath();
                    ctx.moveTo(whiteBall.x, whiteBall.y);
                    ctx.lineTo(whiteBall.x + Math.cos(dir1) * lineLen, whiteBall.y + Math.sin(dir1) * lineLen);
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.moveTo(whiteBall.x, whiteBall.y);
                    ctx.lineTo(whiteBall.x + Math.cos(dir2) * lineLen, whiteBall.y + Math.sin(dir2) * lineLen);
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
                    ctx.stroke();
                    
                    ctx.shadowBlur = 0;
                    ctx.setLineDash([]);
                    ctx.restore();
                    
                    // 如果瞄准方向接近切线，预显示切点、半径、直角符号
                    let aimDir = Math.atan2(aimEnd.y - whiteBall.y, aimEnd.x - whiteBall.x);
                    let nearTolerance = 15 * Math.PI / 180;
                    let diff1 = Math.abs(((aimDir - dir1 + Math.PI) % (2*Math.PI)) - Math.PI);
                    let diff2 = Math.abs(((aimDir - dir2 + Math.PI) % (2*Math.PI)) - Math.PI);
                    let showPreview = diff1 < nearTolerance || diff2 < nearTolerance;
                    
                    if(showPreview){
                        let activeDir = diff1 < diff2 ? dir1 : dir2;
                        let tangentDist = Math.sqrt(d*d - targetBall.r*targetBall.r);
                        let tp = {
                            x: whiteBall.x + tangentDist * Math.cos(activeDir),
                            y: whiteBall.y + tangentDist * Math.sin(activeDir)
                        };
                        
                        // 金色切点标记
                        ctx.beginPath(); ctx.arc(tp.x, tp.y, 7, 0, 2*Math.PI);
                        ctx.fillStyle = '#ffcc00'; ctx.fill();
                        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
                        
                        // 半径线（从红球中心到切点）
                        ctx.beginPath(); ctx.moveTo(targetBall.x, targetBall.y); ctx.lineTo(tp.x, tp.y);
                        ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 2.5; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
                        
                        // 切线延长线
                        ctx.beginPath();
                        ctx.moveTo(tp.x - Math.cos(activeDir)*35, tp.y - Math.sin(activeDir)*35);
                        ctx.lineTo(tp.x + Math.cos(activeDir)*35, tp.y + Math.sin(activeDir)*35);
                        ctx.strokeStyle = '#44aaff'; ctx.lineWidth = 2.5; ctx.stroke();
                        
                        // 直角符号
                        let radiusDir = Math.atan2(tp.y - targetBall.y, tp.x - targetBall.x);
                        let perpDir = radiusDir + Math.PI/2;
                        ctx.beginPath();
                        ctx.moveTo(tp.x + Math.cos(radiusDir)*12, tp.y + Math.sin(radiusDir)*12);
                        ctx.lineTo(tp.x + Math.cos(radiusDir)*12 + Math.cos(perpDir)*12, tp.y + Math.sin(radiusDir)*12 + Math.sin(perpDir)*12);
                        ctx.lineTo(tp.x + Math.cos(perpDir)*12, tp.y + Math.sin(perpDir)*12);
                        ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 2.5; ctx.stroke();
                    }
                }
                
                // 显示答案：两条切线路径
                if(tangentShowAnswer && !isMoving){
                    let dx = targetBall.x - whiteBall.x;
                    let dy = targetBall.y - whiteBall.y;
                    let dist = Math.hypot(dx, dy);
                    let effectiveR = targetBall.r + ballR;
                    if(dist > effectiveR){
                        let baseAngle = Math.atan2(dy, dx);
                        let theta = Math.asin(Math.min(1, effectiveR / dist));
                        let lineLen = Math.min(dist, 300);
                        for(let dir of [baseAngle - theta, baseAngle + theta]){
                            let tangentDist = Math.sqrt(dist*dist - effectiveR*effectiveR);
                            let tp = {
                                x: whiteBall.x + tangentDist * Math.cos(dir),
                                y: whiteBall.y + tangentDist * Math.sin(dir)
                            };
                            // 金色虚线路径
                            ctx.beginPath();
                            ctx.moveTo(whiteBall.x, whiteBall.y);
                            ctx.lineTo(tp.x, tp.y);
                            ctx.strokeStyle = '#f5e56b'; ctx.lineWidth = 3; ctx.setLineDash([8,4]); ctx.stroke(); ctx.setLineDash([]);
                            // 切点标记
                            ctx.beginPath(); ctx.arc(tp.x, tp.y, 8, 0, 2*Math.PI);
                            ctx.fillStyle = '#f5e56b'; ctx.fill();
                            // 半径线
                            ctx.beginPath(); ctx.moveTo(targetBall.x, targetBall.y); ctx.lineTo(tp.x, tp.y);
                            ctx.strokeStyle = '#f5e56b'; ctx.lineWidth = 2; ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
                            // 直角符号
                            let radiusDir = Math.atan2(tp.y - targetBall.y, tp.x - targetBall.x);
                            let perpDir = radiusDir + Math.PI/2;
                            ctx.beginPath();
                            ctx.moveTo(tp.x + Math.cos(radiusDir)*15, tp.y + Math.sin(radiusDir)*15);
                            ctx.lineTo(tp.x + Math.cos(radiusDir)*15 + Math.cos(perpDir)*15, tp.y + Math.sin(radiusDir)*15 + Math.sin(perpDir)*15);
                            ctx.lineTo(tp.x + Math.cos(perpDir)*15, tp.y + Math.sin(perpDir)*15);
                            ctx.strokeStyle = '#f5e56b'; ctx.lineWidth = 2.5; ctx.stroke();
                        }
                        ctx.fillStyle = '#f5e56b'; ctx.font = 'bold 13px sans-serif';
                        ctx.fillText(lang==='zh'?'💡 两条切线路径':'💡 Two tangent paths', 15, height-30);
                    }
                }
            }
            
            for(let p of particles){
                ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 2*Math.PI);
                ctx.fillStyle = '#ffaa44'; ctx.fill();
            }
            
            ctx.restore();
            // ★ 圆盘边界线 - 深色模式加发光效果
            ctx.beginPath(); ctx.arc(circle.x, circle.y, circle.r, 0, 2*Math.PI);
            if(isDarkMode){
                ctx.shadowColor = '#f5e56b'; ctx.shadowBlur = 35;
                ctx.strokeStyle = '#f5e56b'; ctx.lineWidth = 4;
            } else {
                ctx.strokeStyle = '#f5e56b'; ctx.lineWidth = 3;
            }
            ctx.stroke(); ctx.shadowBlur = 0;
            // ★ 深色模式下绘制额外的外圈装饰线
            if(isDarkMode){
                ctx.beginPath(); ctx.arc(circle.x, circle.y, circle.r + 4, 0, 2*Math.PI);
                ctx.strokeStyle = 'rgba(245, 229, 107, 0.4)'; ctx.lineWidth = 1; ctx.stroke();
            }
            
            // 碰撞几何 - 切线⊥半径 显示（在圆盘外也可见）
            let displayGeom = collisionEffect.active ? collisionEffect : null;
            let geomsToDraw = collisionVisuals.length > 0 ? collisionVisuals : (displayGeom ? [displayGeom] : []);
            
            for(let cg of geomsToDraw){
                let p = cg.point, n = cg.normal, t = cg.tangent;
                let nd = Math.atan2(n.y, n.x);
                let rayLen = 60;
                
                // 绘制半径
                ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = '#ff77aa'; ctx.lineWidth = 2.5; ctx.setLineDash([4,6]); ctx.stroke();
                ctx.setLineDash([]);
                // 绘制法线（延长显示）
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + n.x*50, p.y + n.y*50);
                ctx.strokeStyle = '#ff7777'; ctx.lineWidth = 2.5; ctx.stroke();
                
                // 绘制入射光线（虚线，显示球从哪来）
                ctx.beginPath();
                ctx.setLineDash([5, 5]);
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + Math.cos(cg.incDir + Math.PI) * rayLen, p.y + Math.sin(cg.incDir + Math.PI) * rayLen);
                ctx.strokeStyle = '#ffdd44'; ctx.lineWidth = 2;
                ctx.stroke();
                ctx.setLineDash([]);
                
                // 绘制反射光线（虚线，显示球往哪去）
                ctx.beginPath();
                ctx.setLineDash([5, 5]);
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + Math.cos(cg.outDir) * rayLen, p.y + Math.sin(cg.outDir) * rayLen);
                ctx.strokeStyle = '#44ffdd'; ctx.lineWidth = 2;
                ctx.stroke();
                ctx.setLineDash([]);
                
                // 绘制切线（在深绿色背景板上也要清晰可见）
                let tangentLen = 120;
                let tangentX1 = p.x - t.x*tangentLen, tangentY1 = p.y - t.y*tangentLen;
                let tangentX2 = p.x + t.x*tangentLen, tangentY2 = p.y + t.y*tangentLen;
                ctx.beginPath(); ctx.moveTo(tangentX1, tangentY1); ctx.lineTo(tangentX2, tangentY2);
                ctx.strokeStyle = '#44aaff'; ctx.lineWidth = 2.5; ctx.stroke();
                // 切线端点加亮
                ctx.beginPath(); ctx.arc(tangentX1, tangentY1, 4, 0, 2*Math.PI);
                ctx.fillStyle = '#44aaff'; ctx.fill();
                ctx.beginPath(); ctx.arc(tangentX2, tangentY2, 4, 0, 2*Math.PI);
                ctx.fillStyle = '#44aaff'; ctx.fill();
                // 绘制垂直符号
                let perpX = p.x + n.x*14, perpY = p.y + n.y*14;
                let sideX = perpX + t.x*10, sideY = perpY + t.y*10;
                ctx.beginPath(); ctx.moveTo(perpX, perpY); ctx.lineTo(sideX, sideY); ctx.lineTo(sideX - n.x*10, sideY - n.y*10);
                ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke();
                ctx.fillStyle = 'yellow'; ctx.fillText('⊥', sideX-7, sideY-5);
                
                // 绘制入射角弧线
                let incDiff = cg.incDir - nd;
                while(incDiff > Math.PI) incDiff -= 2*Math.PI;
                while(incDiff < -Math.PI) incDiff += 2*Math.PI;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.arc(p.x, p.y, 35, nd, cg.incDir, incDiff < 0);
                ctx.closePath();
                ctx.fillStyle = 'rgba(255, 221, 0, 0.12)';
                ctx.fill();
                ctx.strokeStyle = '#ffdd00'; ctx.lineWidth = 3;
                ctx.stroke();
                
                // 绘制反射角弧线
                let inwardNormal = nd + Math.PI;
                let refDiff = cg.outDir - inwardNormal;
                while(refDiff > Math.PI) refDiff -= 2*Math.PI;
                while(refDiff < -Math.PI) refDiff += 2*Math.PI;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.arc(p.x, p.y, 50, inwardNormal, cg.outDir, refDiff < 0);
                ctx.closePath();
                ctx.fillStyle = 'rgba(0, 255, 221, 0.12)';
                ctx.fill();
                ctx.strokeStyle = '#00ffdd'; ctx.lineWidth = 3;
                ctx.stroke();
                
                // 角度文字标注
                ctx.save();
                ctx.font = "bold 13px monospace";
                let incText = `${lang === 'zh' ? '入射' : 'Inc'} ${cg.incAngle.toFixed(0)}°`;
                let refText = `${lang === 'zh' ? '反射' : 'Ref'} ${cg.refAngle.toFixed(0)}°`;
                let perpLabel = i18n[lang].radiusPerpendicularTangent || (lang === 'zh' ? '半径 ⊥ 切线' : 'Radius ⊥ Tangent');
                ctx.font = 'italic 12px';
                let perpW = ctx.measureText(perpLabel).width;
                ctx.font = "bold 13px monospace";
                let wInc = ctx.measureText(incText).width, wRef = ctx.measureText(refText).width;
                
                // 入射角标注位置
                let incMid = nd + incDiff/2;
                let incLabelX = p.x + 28 * Math.cos(incMid);
                let incLabelY = p.y + 28 * Math.sin(incMid);
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.beginPath(); ctx.roundRect(incLabelX - 18, incLabelY - 10, wInc + 6, 17, 4); ctx.fill();
                ctx.fillStyle = '#ffdd00';
                ctx.fillText(incText, incLabelX - 15, incLabelY + 5);
                
                // 反射角标注位置
                let refMid = inwardNormal + refDiff/2;
                let refLabelX = p.x + 43 * Math.cos(refMid);
                let refLabelY = p.y + 43 * Math.sin(refMid);
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.beginPath(); ctx.roundRect(refLabelX - 18, refLabelY - 10, wRef + 6, 17, 4); ctx.fill();
                ctx.fillStyle = '#00ffdd';
                ctx.fillText(refText, refLabelX - 15, refLabelY + 5);
                
                // 半径⊥切线标注
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.beginPath(); ctx.roundRect(p.x + n.x*15 - 3, p.y + n.y*15 - 25, perpW + 6, 16, 4); ctx.fill();
                ctx.fillStyle = '#ffaa88'; ctx.font = 'italic 12px';
                ctx.fillText(perpLabel, p.x + n.x*15, p.y + n.y*15-12);
                ctx.restore();
            }
            
            // 切线狙击成功特效：放大闪烁的直角符号
            if(tangentSuccessEffect.active){
                let p = tangentSuccessEffect.point;
                let tc = tangentSuccessEffect.targetCenter;
                let radiusDir = Math.atan2(p.y - tc.y, p.x - tc.x);
                let perpDir = radiusDir + Math.PI/2;
                let flash = Math.sin(Date.now() / 80) > 0;
                let scale = 1 + 0.5 * Math.sin(Date.now() / 150);
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.scale(scale, scale);
                
                // 半径线
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(radiusDir)*30, Math.sin(radiusDir)*30);
                ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 3; ctx.stroke();
                
                // 切线
                ctx.beginPath(); ctx.moveTo(-Math.cos(perpDir)*30, -Math.sin(perpDir)*30);
                ctx.lineTo(Math.cos(perpDir)*30, Math.sin(perpDir)*30);
                ctx.strokeStyle = '#44aaff'; ctx.lineWidth = 3; ctx.stroke();
                
                // 直角符号（闪烁）
                ctx.beginPath();
                ctx.moveTo(Math.cos(radiusDir)*18, Math.sin(radiusDir)*18);
                ctx.lineTo(Math.cos(radiusDir)*18 + Math.cos(perpDir)*18, Math.sin(radiusDir)*18 + Math.sin(perpDir)*18);
                ctx.lineTo(Math.cos(perpDir)*18, Math.sin(perpDir)*18);
                ctx.strokeStyle = flash ? '#ffcc00' : '#ffffff'; ctx.lineWidth = 4; ctx.stroke();
                
                // 外圈光环
                ctx.beginPath(); ctx.arc(0, 0, 45, 0, 2*Math.PI);
                ctx.strokeStyle = `rgba(255, 204, 0, ${0.3 + 0.3 * Math.sin(Date.now()/100)})`;
                ctx.lineWidth = 2; ctx.stroke();
                
                ctx.restore();
            }
            
            // 切线证明模式：分步可视化（反证法证明半径⊥切线）
            if(currentMode === 'tangent' && proofMode){
                let tc = targetBall;
                // 步骤0：高亮半径 OP
                if(tangentProofStep >= 0){
                    ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(tc.x, tc.y);
                    ctx.strokeStyle = '#ffff00'; ctx.lineWidth = 2; ctx.stroke();
                    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.font = '12px monospace';
                    ctx.beginPath(); ctx.roundRect(circle.x-8, circle.y-14, 14, 14, 3); ctx.fill();
                    ctx.beginPath(); ctx.roundRect(tc.x-8, tc.y-18, 14, 14, 3); ctx.fill();
                    ctx.fillStyle = '#ffff00'; ctx.font = '12px monospace';
                    ctx.fillText('O', circle.x-4, circle.y-4);
                    ctx.fillText('P', tc.x-4, tc.y-8);
                }
                // 步骤1：假设切线不垂直，绘制"假设的垂足"Q
                if(tangentProofStep >= 1){
                    let oToP = Math.atan2(tc.y - circle.y, tc.x - circle.x);
                    let qx = tc.x + Math.cos(oToP + Math.PI/2) * 40;
                    let qy = tc.y + Math.sin(oToP + Math.PI/2) * 40;
                    ctx.beginPath(); ctx.moveTo(tc.x, tc.y); ctx.lineTo(qx, qy);
                    ctx.strokeStyle = '#ff6666'; ctx.lineWidth = 2; ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.beginPath(); ctx.roundRect(qx+1, qy-14, 14, 14, 3); ctx.fill();
                    ctx.fillStyle = '#ff8888'; ctx.fillText('Q', qx+4, qy-4);
                    // 假设线标注
                    let assumeText = lang==='zh' ? '假设: PQ ⊥ OP' : 'Assume: PQ ⟂ OP';
                    ctx.font = '11px sans-serif';
                    let aW = ctx.measureText(assumeText).width;
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.beginPath(); ctx.roundRect(tc.x+12, tc.y+2, aW+6, 16, 4); ctx.fill();
                    ctx.fillStyle = '#ffaaaa'; ctx.font = '11px sans-serif';
                    ctx.fillText(assumeText, tc.x+15, tc.y+15);
                }
                // 步骤2：绘制从O到假设切线的垂线，展示矛盾
                if(tangentProofStep >= 2){
                    let oToP = Math.atan2(tc.y - circle.y, tc.x - circle.x);
                    let perpDir = oToP + Math.PI/2;
                    // 从O向"假设切线"做垂线
                    ctx.beginPath(); ctx.moveTo(circle.x, circle.y);
                    ctx.lineTo(circle.x + Math.cos(perpDir)*50, circle.y + Math.sin(perpDir)*50);
                    ctx.strokeStyle = '#00ffdd'; ctx.lineWidth = 2; ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);
                    let contraText = lang==='zh' ? '但 OQ < OP = R，Q在圆内！' : 'But OQ < OP = R, Q is inside!';
                    ctx.font = '11px sans-serif';
                    let cW = ctx.measureText(contraText).width;
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.beginPath(); ctx.roundRect(circle.x+17, circle.y+17, cW+6, 16, 4); ctx.fill();
                    ctx.fillStyle = '#00ffdd'; ctx.font = '11px sans-serif';
                    ctx.fillText(contraText, circle.x+20, circle.y+30);
                }
                // 步骤3：结论
                if(tangentProofStep >= 3){
                    let py = height - 100;
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    ctx.beginPath(); ctx.roundRect(12, py-18, width-180, 105, 10); ctx.fill();
                    ctx.fillStyle = 'white'; ctx.font = '14px monospace';
                    ctx.fillText(`${lang === 'zh' ? '证明步骤 (反证法):' : 'Proof (by contradiction):'}`, 20, py);
                    ctx.fillText(`1) ${lang === 'zh' ? '假设切线PQ不⊥半径OP' : 'Assume tangent PQ is not ⟂ radius OP'}`, 20, py+20);
                    ctx.fillText(`2) ${lang === 'zh' ? '从O向切线作垂线，垂足Q在圆内' : 'Drop perpendicular from O to tangent, foot Q is inside circle'}`, 20, py+40);
                    ctx.fillText(`3) ${lang === 'zh' ? '但切线定义：圆上只有一点P在切线上' : 'But tangent definition: only P on the circle lies on tangent'}`, 20, py+60);
                    ctx.fillText(`4) ${lang === 'zh' ? '∴ 半径 ⊥ 切线  ✅' : '∴ Radius ⟂ Tangent  ✅'}`, 20, py+80);
                }
            }
            
            // 垂径定理成功特效：高亮圆心到中点的垂线
            if(chordSuccessEffect.active && chordForMode){
                let mid = chordSuccessEffect.mid;
                let flash = Math.sin(Date.now() / 80) > 0;
                let pulse = 0.5 + 0.5 * Math.sin(Date.now() / 120);
                
                ctx.save();
                // 高亮 OM 连线
                ctx.beginPath(); ctx.moveTo(circle.x, circle.y); ctx.lineTo(mid.x, mid.y);
                ctx.strokeStyle = flash ? '#ffcc00' : '#ffffff';
                ctx.lineWidth = 3 + pulse * 2;
                ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([]);
                
                // 中点光环
                ctx.beginPath(); ctx.arc(mid.x, mid.y, 10 + pulse * 8, 0, 2*Math.PI);
                ctx.strokeStyle = `rgba(255, 204, 0, ${0.4 + 0.4 * pulse})`;
                ctx.lineWidth = 2; ctx.stroke();
                
                // 直角符号
                let toO = Math.atan2(circle.y - mid.y, circle.x - mid.x);
                let toC = Math.atan2(chordForMode.p1.y - mid.y, chordForMode.p1.x - mid.x);
                ctx.beginPath();
                ctx.moveTo(mid.x + Math.cos(toO)*18, mid.y + Math.sin(toO)*18);
                ctx.lineTo(mid.x + Math.cos(toO)*18 + Math.cos(toC)*18, mid.y + Math.sin(toO)*18 + Math.sin(toC)*18);
                ctx.lineTo(mid.x + Math.cos(toC)*18, mid.y + Math.sin(toC)*18);
                ctx.strokeStyle = flash ? '#ff7777' : '#ffaaaa'; ctx.lineWidth = 4; ctx.stroke();
                
                ctx.restore();
            }
            
            // ★ 反射实验室：目标绘制（在 ctx.restore() 之后，圆盘外可见）
            if(currentMode === 'lab'){
                for(let t of labTargets){
                    if(t.hit){
                        // 已击中：淡绿色勾号
                        ctx.globalAlpha = 0.4;
                        ctx.beginPath(); ctx.arc(t.x, t.y, 10, 0, 2*Math.PI);
                        ctx.fillStyle = '#4ade80'; ctx.fill();
                        ctx.fillStyle = '#fff'; ctx.font = 'bold 14px';
                        ctx.fillText('✓', t.x-5, t.y+5);
                        ctx.globalAlpha = 1.0;
                        continue;
                    }
                    // 未击中：扇形靶心（30°范围），绿色发光
                    let startAng = t.angle - 0.26;
                    let endAng = t.angle + 0.26;
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, 14, startAng, endAng);
                    ctx.lineTo(t.x, t.y);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(74, 222, 128, 0.25)';
                    ctx.fill();
                    ctx.strokeStyle = '#4ade80';
                    ctx.lineWidth = 3;
                    ctx.shadowColor = '#4ade80';
                    ctx.shadowBlur = 15;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    // 中心点
                    ctx.beginPath(); ctx.arc(t.x, t.y, 4, 0, 2*Math.PI);
                    ctx.fillStyle = '#4ade80'; ctx.fill();
                    // 标签
                    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
                    let label = lang === 'zh' ? `目标${labTargets.indexOf(t)+1}` : `T${labTargets.indexOf(t)+1}`;
                    ctx.fillText(label, t.x + 18, t.y + 4);
                }
                // 反射实验室：未击中时显示正确反射线
                if(labMissEffect.active && labMissEffect.cp && labMissEffect.target){
                    let cp = labMissEffect.cp;
                    let normal = labMissEffect.normal;
                    let target = labMissEffect.target;
                    let toTargetX = target.x - cp.x;
                    let toTargetY = target.y - cp.y;
                    let toTargetLen = Math.hypot(toTargetX, toTargetY);
                    // 根据反射定律反推正确入射方向
                    let dot = (toTargetX * normal.x + toTargetY * normal.y) / toTargetLen;
                    let correctIncX = toTargetX/toTargetLen - 2 * dot * normal.x;
                    let correctIncY = toTargetY/toTargetLen - 2 * dot * normal.y;
                    // 绘制"你应该瞄准的方向"
                    ctx.beginPath();
                    ctx.moveTo(cp.x, cp.y);
                    ctx.lineTo(cp.x - correctIncX * 100, cp.y - correctIncY * 100);
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.setLineDash([8, 4]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
                    let correctLabel = lang==='zh'?'正确方向':'Correct aim';
                    ctx.font = '11px sans-serif';
                    let cW = ctx.measureText(correctLabel).width;
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.beginPath(); ctx.roundRect(cp.x - correctIncX * 80 - 23, cp.y - correctIncY * 80 - 12, cW+6, 16, 4); ctx.fill();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillText(correctLabel, cp.x - correctIncX * 80 - 20, cp.y - correctIncY * 80);
                }
            }
        }
        