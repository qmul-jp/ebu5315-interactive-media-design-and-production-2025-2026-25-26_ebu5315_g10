/**
 * achievements.js - Achievement System
 * Badge unlocks, popups, and UI updates
 * Depends on: config.js, audio.js
 */

        // 成就系统
        let achievements = {
            perfectTangent: false,
            reflectMaster: false,
            distanceKiller: false,
            labMaster: false,
            euclidDescendant: false,
            angleHunter: false,
            angleApprentice: false,
            angleMaster: false,
            semicircleVerifier: false,
            chordMaster: false,
            chordBuster: false,
            perpendicularPro: false,
            // levelMaster removed (level challenge deleted)
        };
        let consecutiveReflectSuccess = 0;
        let angleTypesCollected = new Set();
        let theoremsVerified = new Set();
        function unlockAchievement(id) {
            if(achievements[id]) return;
            achievements[id] = true;
            playSound('score');
            showAchievementPopup(id);
            updateAchievementsUI();
        }
        function getAchievementUnlockMsg(id) {
            const msgs = {
                perfectTangent: lang === 'zh' ? '🏆 解锁成就: 完美切线' : '🏆 Achievement: Perfect Tangent',
                reflectMaster: lang === 'zh' ? '🏆 解锁成就: 反射大师' : '🏆 Achievement: Reflection Master',
                distanceKiller: lang === 'zh' ? '🏆 解锁成就: 圆心距杀手' : '🏆 Achievement: Distance Killer',
                labMaster: lang === 'zh' ? '🏆 解锁成就: 实验室征服者' : '🏆 Achievement: Lab Conqueror',
                euclidDescendant: lang === 'zh' ? '🏆 解锁成就: 欧几里得的后代' : '🏆 Achievement: Euclid\'s Descendant',
                angleHunter: lang === 'zh' ? '🏆 解锁成就: 角度猎人' : '🏆 Achievement: Angle Hunter',
                angleApprentice: lang === 'zh' ? '🏆 解锁成就: 圆周角学徒' : '🏆 Achievement: Angle Apprentice',
                angleMaster: lang === 'zh' ? '🏆 解锁成就: 圆周角大师' : '🏆 Achievement: Angle Master',
                semicircleVerifier: lang === 'zh' ? '🏆 解锁成就: 半圆直角验证者' : '🏆 Achievement: Semicircle Verifier',
                chordMaster: lang === 'zh' ? '🏆 解锁成就: 弦大师' : '🏆 Achievement: Chord Master',
                chordBuster: lang === 'zh' ? '🏆 解锁成就: 弦破坏者' : '🏆 Achievement: Chord Buster',
                perpendicularPro: lang === 'zh' ? '🏆 解锁成就: 垂直专家' : '🏆 Achievement: Perpendicular Pro'
            };
            return msgs[id] || id;
        }
        function getAchievementDesc(id) {
            const desc = {
                perfectTangent: lang === 'zh' ? '切线狙击模式成功一次' : 'Success in Tangent Sniper mode',
                reflectMaster: lang === 'zh' ? '连续3次在反射挑战中得分' : 'Score 3 times in a row in Bounce Challenge',
                distanceKiller: lang === 'zh' ? '得分倍率达到1.8倍以上' : 'Score multiplier above 1.8',
                labMaster: lang === 'zh' ? '完成反射定律实验室挑战' : 'Complete Reflection Lab challenge',
                euclidDescendant: lang === 'zh' ? '完成所有定理验证' : 'Complete all theorem verifications',
                angleHunter: lang === 'zh' ? '收集30/45/60/90度角碰撞' : 'Collect 30/45/60/90 degree collisions',
                angleApprentice: lang === 'zh' ? '在圆周角模式下记录5个角度' : 'Record 5 angles in Angle Mode',
                angleMaster: lang === 'zh' ? '圆周角比值平均误差<0.1（记录10次以上）' : 'Average inscribed angle ratio error < 0.1 (10+ records)',
                semicircleVerifier: lang === 'zh' ? '在半圆模式下验证∠APB=90°±2°' : 'Verify ∠APB=90°±2° in Semicircle mode',
                chordMaster: lang === 'zh' ? '在垂径定理模式下成功10次' : 'Success 10 times in Perpendicular Bisector mode',
                chordBuster: lang === 'zh' ? '通关垂径定理Level 4（连续3条弦）' : 'Complete Chord Level 4 (3 consecutive chords)',
                perpendicularPro: lang === 'zh' ? '通关垂径定理Level 5（自由构造）' : 'Complete Chord Level 5 (free build)'
            };
            return desc[id] || '';
        }
        function showAchievementPopup(id) {
            let name = getAchievementUnlockMsg(id).replace('🏆 解锁成就: ', '').replace('🏆 Achievement: ', '');
            let desc = getAchievementDesc(id);
            let overlay = document.createElement('div');
            overlay.className = 'achievement-popup-overlay';
            overlay.innerHTML = `
                <div class="achievement-popup-card">
                    <div class="achievement-popup-icon">🏆</div>
                    <div class="achievement-popup-title">${lang === 'zh' ? '🎉 解锁新成就！' : '🎉 New Achievement Unlocked!'}</div>
                    <div class="achievement-popup-name">${name}</div>
                    <div class="achievement-popup-desc">${desc}</div>
                    <button class="achievement-popup-btn" id="achievementPopupBtn">${lang === 'zh' ? '太棒了！' : 'Awesome!'}</button>
                </div>
            `;
            document.body.appendChild(overlay);
            document.getElementById('achievementPopupBtn').onclick = () => overlay.remove();
            overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
        }
        function updateAngleRecordUI(){
            const list = document.getElementById('angleRecordList');
            const summary = document.getElementById('angleRecordSummary');
            if(angleModeRecords.length === 0){
                list.innerHTML = `<li>${lang === 'zh' ? '— 暂无记录 —' : '— No records —'}</li>`;
                summary.innerText = '';
                return;
            }
            list.innerHTML = angleModeRecords.map((r, i) => 
                `<li>${lang==='zh'?'记录':'Rec'} ${i+1}: ∠APB=${r.incAngle.toFixed(1)}° | ∠AOB=${r.centerAngle.toFixed(1)}° | ${lang==='zh'?'比值':'Ratio'}=${r.ratio.toFixed(2)}</li>`
            ).join('');
            let avgRatio = angleModeRecords.reduce((s, r) => s + r.ratio, 0) / angleModeRecords.length;
            summary.innerText = (lang === 'zh' ? `平均比值: ${avgRatio.toFixed(2)} (应接近 2.0)` : `Average ratio: ${avgRatio.toFixed(2)} (should be ~2.0)`);
            
            // 简易折线图
            const chart = document.getElementById('angleChart');
            const cctx = chart.getContext('2d');
            cctx.clearRect(0, 0, chart.width, chart.height);
            if(angleModeRecords.length < 2) return;
            let vals = angleModeRecords.map(r => r.incAngle);
            let minV = Math.min(...vals), maxV = Math.max(...vals);
            let pad = 10, w = chart.width - 2*pad, h = chart.height - 2*pad;
            cctx.strokeStyle = '#ffaa33'; cctx.lineWidth = 2;
            cctx.beginPath();
            for(let i=0; i<vals.length; i++){
                let x = pad + (i / (vals.length-1)) * w;
                let y = pad + h - ((vals[i] - minV) / (Math.max(1, maxV - minV) || 1)) * h;
                if(i===0) cctx.moveTo(x, y); else cctx.lineTo(x, y);
            }
            cctx.stroke();
            cctx.fillStyle = '#ffaa33';
            for(let i=0; i<vals.length; i++){
                let x = pad + (i / (vals.length-1)) * w;
                let y = pad + h - ((vals[i] - minV) / (Math.max(1, maxV - minV) || 1)) * h;
                cctx.beginPath(); cctx.arc(x, y, 3, 0, 2*Math.PI); cctx.fill();
            }
        }
        function updateAchievementsUI() {
            const list = document.getElementById('achievementsList');
            list.innerHTML = `
                <li class="${achievements.perfectTangent ? 'achievement-unlocked' : 'achievement-locked'}">
                    ✂️ ${lang === 'zh' ? '完美切线' : 'Perfect Tangent'}
                    <span class="achievement-desc">${getAchievementDesc('perfectTangent')}</span>
                </li>
                <li class="${achievements.reflectMaster ? 'achievement-unlocked' : 'achievement-locked'}">
                    🔄 ${lang === 'zh' ? '反射大师' : 'Reflection Master'}
                    <span class="achievement-desc">${getAchievementDesc('reflectMaster')}</span>
                </li>
                <li class="${achievements.distanceKiller ? 'achievement-unlocked' : 'achievement-locked'}">
                    🎯 ${lang === 'zh' ? '圆心距杀手' : 'Distance Killer'}
                    <span class="achievement-desc">${getAchievementDesc('distanceKiller')}</span>
                </li>
                <li class="${achievements.labMaster ? 'achievement-unlocked' : 'achievement-locked'}">
                    🔬 ${lang === 'zh' ? '实验室征服者' : 'Lab Conqueror'}
                    <span class="achievement-desc">${getAchievementDesc('labMaster')}</span>
                </li>
                <li class="${achievements.euclidDescendant ? 'achievement-unlocked' : 'achievement-locked'}">
                    🏛️ ${lang === 'zh' ? '欧几里得的后代' : 'Euclid\'s Descendant'}
                    <span class="achievement-desc">${getAchievementDesc('euclidDescendant')}</span>
                </li>
                <li class="${achievements.angleHunter ? 'achievement-unlocked' : 'achievement-locked'}">
                    🔍 ${lang === 'zh' ? '角度猎人' : 'Angle Hunter'}
                    <span class="achievement-desc">${getAchievementDesc('angleHunter')}</span>
                </li>
                <li class="${achievements.angleApprentice ? 'achievement-unlocked' : 'achievement-locked'}">
                    📐 ${lang === 'zh' ? '圆周角学徒' : 'Angle Apprentice'}
                    <span class="achievement-desc">${getAchievementDesc('angleApprentice')}</span>
                </li>
                <li class="${achievements.angleMaster ? 'achievement-unlocked' : 'achievement-locked'}">
                    🎓 ${lang === 'zh' ? '圆周角大师' : 'Angle Master'}
                    <span class="achievement-desc">${getAchievementDesc('angleMaster')}</span>
                </li>
                <li class="${achievements.semicircleVerifier ? 'achievement-unlocked' : 'achievement-locked'}">
                    🔎 ${lang === 'zh' ? '半圆直角验证者' : 'Semicircle Verifier'}
                    <span class="achievement-desc">${getAchievementDesc('semicircleVerifier')}</span>
                </li>
                <li class="${achievements.chordMaster ? 'achievement-unlocked' : 'achievement-locked'}">
                    📏 ${lang === 'zh' ? '弦大师' : 'Chord Master'}
                    <span class="achievement-desc">${getAchievementDesc('chordMaster')}</span>
                </li>
                <li class="${achievements.chordBuster ? 'achievement-unlocked' : 'achievement-locked'}">
                    💥 ${lang === 'zh' ? '弦破坏者' : 'Chord Buster'}
                    <span class="achievement-desc">${getAchievementDesc('chordBuster')}</span>
                </li>
                <li class="${achievements.perpendicularPro ? 'achievement-unlocked' : 'achievement-locked'}">
                    📐 ${lang === 'zh' ? '垂直专家' : 'Perpendicular Pro'}
                    <span class="achievement-desc">${getAchievementDesc('perpendicularPro')}</span>
                </li>

            `;
        }
        