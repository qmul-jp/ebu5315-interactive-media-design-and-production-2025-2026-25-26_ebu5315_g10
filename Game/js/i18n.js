/**
 * i18n.js - Internationalization
 * Chinese/English translations and language switching
 * Depends on: config.js
 */

        // 多语言
        let lang = 'zh';
        const i18n = {
            zh: {
                mainTitle: "🎯 圆几何台球 3.0 · 声光交互实验室",
                subtitle: "反射定律 | 圆周角 | 垂径定理 | 音效反馈 | 成就系统 | 慢动作回放",
                modeLabel: "🎮 游戏模式:",
                speedLabel: "🐢 动画速度:",
                powerLabel: "🎯 力度:",
                gridLabel: "极坐标网格",
                rulerLabel: "几何标尺",

                predictLabel: "轨迹预测",
                particleLabel: "碰撞粒子特效",
                resetText: "重置球局",
                helpText: "定理提示",
                footer: "✨ 点击白球拖拽瞄准 → 释放击球 | 碰撞音效 + 粒子特效 | 右侧成就系统 | 慢动作回放",
                rulesTitle: "📜 游戏规则",
                free: "自由模式",
                reflect1: "反射1次",
                reflect2: "反射2次",
                tangent: "切线狙击",
                angle: "圆周角探索",
                chord: "垂径定理",
                lab: "🔬 反射定律实验室",
                ruleFree: "✨ 任意次数碰撞边界后击中红球即可得分。<br>📍 圆心距倍率：白球越靠近圆心，得分倍率越高（最高2.0倍）。",
                ruleReflect1: "🔄 必须碰撞边界 <strong>1次</strong> 后再击中红球。",
                ruleReflect2: "🔄 必须碰撞边界 <strong>2次</strong> 后再击中红球。",
                ruleTangent: "✂️ 白球路径必须与红球相切（擦过），系统会提示“半径⊥切线”。",
                ruleAngle: "📐 击中红球时，自动显示圆弧所对圆周角和圆心角，验证定理。",
                ruleAngleDetail: "<strong>📐 圆周角探索模式操作指南：</strong><br>1. 白球击中红球 → 自动计算并显示圆周角∠APB和圆心角∠AOB<br>2. 点击『记录当前角度』→ 保存到角度记录表<br>3. 切换子模式 → 探索不同定理（相等/圆心角关系/半圆直角）<br>4. 开启『证明模式』→ 逐步查看定理证明过程<br>5. 拖拽红球（P点）→ 在圆周上自由探索不同位置的圆周角<br>6. 多次击球 → 自动收集多P点验证同弧所对圆周角相等",
                ruleChord: "📏 垂径定理: 白球路径需垂直于弦并经过圆心(定理1)，或经过弦中点并垂直于弦(定理2)。",
                ruleChordThm1: "📏 定理1: 垂直于弦的直径平分弦。白球路径必须⊥弦且过圆心。",
                ruleChordThm2: "📏 定理2: 平分弦(非直径)的直径垂直于弦。白球路径必须过弦中点且⊥弦。",
                ruleLab: "🎯 必须让白球碰撞边界后，反射路径击中绿色扇形目标区。",
                powerHint: "💪 满力度击球可轻松实现2~3次反射。",
                theme: "🌙 深色",
                rules: "📜 规则",
                undo: "↩️ 撤销",
                replay: "🎬 回放上一杆",
                soundOn: "🔊 音效开",
                soundOff: "🔇 音效关",
                historyTitle: "📊 最近碰撞角度",
                achievementsTitle: "🏆 成就徽章",
                dirLabel: "📱 辅助方向:",
                powerHintLabel: "力度:",
                shootBtn: "击球",
                stepFrameBtn: "⏸️ 逐帧",
                stepContinueBtn: "▶️ 继续",
                addPointBtn: "📍 添加点",
                clearPointsBtn: "🗑️ 清除点",
                angleFineTune: "角度微调:",
                mirrorAim: "🪞 镜像瞄准",
                angleRecordTitle: "📐 角度记录表",
                labRecordTitle: "🔬 实验数据记录",
                chordRecordTitle: "📏 垂径定理实验记录",
                angleRecord: "入射 {inc}° / 反射 {ref}°",
                noCollision: "— 暂无碰撞 —",
                challengeFail: "❌ 挑战失败",
                scoreMsg: "🎉 得分 +{add}！ 倍率 {mult}",
                modeAngleInfo: "圆周角模式: 固定两点(红色标记), 击中红球后显示圆周角/圆心角",
                modeChordInfo: "垂径定理模式: 蓝色弦为目标, 白球路径需垂直平分该弦(经过圆心)",
                modeLabInfo: "🎯 反射定律实验室: 使反射路径击中绿色扇形区域",
                reflectionLaw: "反射定律: 入射角 = 反射角",
                chordTheorem: "垂径定理: 弦的垂直平分线经过圆心",
                chordTheorem1: "定理1: 垂直于弦的直径平分弦",
                chordTheorem2: "定理2: 平分弦(非直径)的直径垂直于弦",
                chordThm1Short: "垂直于弦的直径平分弦",
                chordThm2Short: "平分弦的直径垂直于弦",
                chordSuccessThm1: "✅ 路径垂直于弦且经过圆心 —— 弦被平分 (CM = MD)",
                chordFailThm1: "❌ 路径未满足条件：需垂直于弦且经过圆心",
                chordSuccessThm2: "✅ 路径经过弦中点且垂直于弦 —— 经过圆心",
                chordFailThm2: "❌ 路径未满足条件：需经过弦中点且垂直于弦",
                chordFailNotPerp: "⚠️ 路径与弦不垂直 (偏差 {deg}°)",
                chordFailNotCenter: "⚠️ 路径未经过圆心 (距圆心 {dist}px)",
                chordFailNotMid: "⚠️ 路径未经过弦中点 (距中点 {dist}px)",
                chordComboProgress: "🎯 连续成功 {count}/3",
                chordComboComplete: "🎉 连续3次成功！进入下一关",
                angleTheorem: "圆周角定理: 同弧所对的圆周角相等，且等于圆心角的一半",
                semiCircleTheorem: "半圆上的圆周角是直角",
                radiusPerpendicularTangent: "半径 ⊥ 切线"
            },
            en: {
                mainTitle: "🎯 Circle Geometry Billiards 3.0 · Interactive Lab",
                subtitle: "Law of Reflection | Angles at Circumference | Perpendicular Bisector | Sound Effects | Achievements | Slow-mo Replay",
                modeLabel: "🎮 Game Mode:",
                speedLabel: "🐢 Animation Speed:",
                powerLabel: "🎯 Power:",
                gridLabel: "Polar Grid",
                rulerLabel: "Ruler",

                predictLabel: "Trajectory Prediction",
                particleLabel: "Collision Particles",
                resetText: "Reset Game",
                helpText: "Theorem Tips",
                footer: "✨ Drag from white ball → release to shoot | Collision sound + particles | Achievements | Replay",
                rulesTitle: "📜 Game Rules",
                free: "Free Mode",
                reflect1: "1 Bounce",
                reflect2: "2 Bounces",
                tangent: "Tangent Sniper",
                angle: "Angles at Circumference",
                chord: "Perpendicular Bisector",
                lab: "🔬 Reflection Law Lab",
                ruleFree: "✨ Hit red ball after any number of bounces.<br>📍 Distance multiplier: closer to center → higher score (up to 2.0x).",
                ruleReflect1: "🔄 Must bounce exactly <strong>1 time</strong> before hitting red ball.",
                ruleReflect2: "🔄 Must bounce exactly <strong>2 times</strong> before hitting red ball.",
                ruleTangent: "✂️ White ball path must be tangent to red ball (grazing).",
                ruleAngle: "📐 When hitting red ball, displays inscribed/central angle to verify theorem.",
                ruleAngleDetail: "<strong>📐 Angle Exploration Mode Guide:</strong><br>1. Hit red ball with white ball → auto-calculate inscribed ∠APB and central ∠AOB<br>2. Click 'Record Angle' → save to angle record table<br>3. Switch sub-mode → explore different theorems (equal angles / central relation / semicircle)<br>4. Enable 'Proof Mode' → step-by-step theorem visualization<br>5. Drag red ball (P) → freely explore inscribed angles at different positions<br>6. Hit multiple times → auto-collect multi-P points to verify equal angles on same arc",
                ruleChord: "📏 Perpendicular Bisector: White path must be ⊥ to chord and pass through center (Thm 1), or pass through midpoint and be ⊥ to chord (Thm 2).",
                ruleChordThm1: "📏 Theorem 1: The perpendicular from the centre to a chord bisects the chord. Path must be ⊥ to chord and pass through centre.",
                ruleChordThm2: "📏 Theorem 2: The line from the centre to the midpoint of a chord is perpendicular to the chord. Path must pass through midpoint and be ⊥ to chord.",
                ruleLab: "🎯 Must bounce then reflect into green sector target.",
                powerHint: "💪 Max power easily achieves 2-3 reflections.",
                theme: "🌙 Dark",
                rules: "📜 Rules",
                undo: "↩️ Undo",
                replay: "🎬 Replay Last Shot",
                soundOn: "🔊 Sound On",
                soundOff: "🔇 Sound Off",
                historyTitle: "📊 Recent Collision Angles",
                achievementsTitle: "🏆 Achievements",
                dirLabel: "📱 Direction:",
                powerHintLabel: "Power:",
                shootBtn: "Shoot",
                angleRecord: "Inc {inc}° / Ref {ref}°",
                noCollision: "— No collisions —",
                challengeFail: "❌ Challenge failed",
                scoreMsg: "🎉 Score +{add}! Multiplier {mult}",
                modeAngleInfo: "Angles at Circumference Mode: Two fixed points (red marks). Hit red ball to see inscribed/central angle.",
                modeChordInfo: "Perpendicular Bisector Mode: Blue chord target. White path must bisect it through center.",
                modeLabInfo: "🎯 Reflection Law Lab: Make the reflected path hit the green sector.",
                reflectionLaw: "Law of Reflection: Angle of Incidence = Angle of Reflection",
                chordTheorem: "Perpendicular Bisector of a Chord passes through the Centre",
                chordTheorem1: "Theorem: The perpendicular from the centre of a circle to a chord bisects the chord.",
                chordTheorem2: "Converse: The line drawn from the centre to the midpoint of a chord is perpendicular to the chord.",
                chordThm1Short: "Perpendicular from centre bisects chord",
                chordThm2Short: "Line to midpoint is perpendicular",
                chordSuccessThm1: "✅ Path is perpendicular to chord and passes through centre — chord is bisected (CM = MD)",
                chordFailThm1: "❌ Path does not meet condition: must be perpendicular to chord and pass through centre",
                chordSuccessThm2: "✅ Path passes through midpoint and is perpendicular to chord — passes through centre",
                chordFailThm2: "❌ Path does not meet condition: must pass through midpoint and be perpendicular to chord",
                chordFailNotPerp: "⚠️ Path is not perpendicular to chord (deviation {deg}°)",
                chordFailNotCenter: "⚠️ Path does not pass through centre (distance {dist}px)",
                chordFailNotMid: "⚠️ Path does not pass through midpoint (distance {dist}px)",
                chordComboProgress: "🎯 Consecutive success {count}/3",
                chordComboComplete: "🎉 3 consecutive successes! Advancing to next level",
                angleTheorem: "The angle subtended by an arc at the centre is twice the angle subtended at the circumference",
                semiCircleTheorem: "Angle in a semi-circle is 90°",
                stepFrameBtn: "⏸️ Step",
                stepContinueBtn: "▶️ Continue",
                radiusPerpendicularTangent: "Radius ⊥ Tangent",
                chord: "Chord",
                addPointBtn: "📍 Add Point",
                clearPointsBtn: "🗑️ Clear Points",
                angleFineTune: "Angle Fine-tune:",
                mirrorAim: "🪞 Mirror Aim",
                angleRecordTitle: "📐 Angle Record Table",
                labRecordTitle: "🔬 Experiment Data Records",
                chordRecordTitle: "📏 Perpendicular Bisector Records"
            }
        };
        
        function updateLanguage(){
            const t = i18n[lang];
            const setText = (id, value) => { const el = document.getElementById(id); if(el) el.innerText = value; };
            const setHTML = (id, value) => { const el = document.getElementById(id); if(el) el.innerHTML = value; };
            setText('mainTitle', t.mainTitle);
            setText('subtitle', t.subtitle);
            setText('modeLabel', t.modeLabel);
            setText('speedLabel', t.speedLabel);
            setText('powerLabel', t.powerLabel);
            setText('gridLabel', t.gridLabel);
            setText('cartesianLabel', lang === 'zh' ? '笛卡尔坐标系' : 'Cartesian Coordinates');
            setText('rulerLabel', t.rulerLabel);
            setText('predictLabel', t.predictLabel);
            setText('particleLabel', t.particleLabel);
            setText('resetText', t.resetText);
            setText('helpText', t.helpText);
            updateProofBtnText();
            setHTML('footerText', t.footer);
            setHTML('rulesModalTitle', t.rulesTitle);
            setHTML('historyTitle', t.historyTitle);
            setHTML('achievementsTitle', t.achievementsTitle);
            setHTML('dirLabel', t.dirLabel);
            setHTML('powerHintLabel', t.powerHintLabel);
            setHTML('dirShoot', t.shootBtn);
            // 更新下拉菜单选项文字
            let modeSelect = document.getElementById('modeSelect');
            if(modeSelect){
                let modeLabels = { free: '🎯 ' + t.free, reflect1: '↩️ ' + t.reflect1, reflect2: '↩️↩️ ' + t.reflect2, tangent: '✂️ ' + t.tangent, angle: '📐 ' + t.angle, chord: '📏 ' + t.chord, lab: '🔬 ' + t.lab };
                Array.from(modeSelect.options).forEach(opt => {
                    if(modeLabels[opt.value]) opt.text = modeLabels[opt.value];
                });
            }
            // 更新快捷按钮文字
            let shortcutLabels = { free: t.free, tangent: t.tangent, angle: t.angle };
            document.querySelectorAll('.mode-shortcuts .shortcut').forEach(btn => {
                let m = btn.dataset.mode;
                if(shortcutLabels[m]) btn.innerText = shortcutLabels[m];
            });
            setText('challengeName', t[currentMode] || t.free);
            setHTML('themeBtn', t.theme);
            setHTML('rulesBtn', t.rules);
            setHTML('undoBtn', t.undo);
            setHTML('replayBtn', t.replay);
            setHTML('soundToggleBtn', soundEnabled ? t.soundOn : t.soundOff);
            setHTML('stepFrameBtn', isStepMode ? (t.stepContinueBtn || '▶️ 继续') : (t.stepFrameBtn || '⏸️ 逐帧'));
            setHTML('addPointBtn', t.addPointBtn || '📍 添加点');
            setHTML('clearPointsBtn', t.clearPointsBtn || '🗑️ 清除点');
            setText('rulerToggleLabel', lang === 'zh' ? '启用' : 'Enable');
            // 圆周角模式工具按钮多语言
            setText('angleToolsLabel', lang === 'zh' ? '📐 圆周角工具:' : '📐 Angle Tools:');
            setText('btnEqualAngles', lang === 'zh' ? '圆周角相等' : 'Equal Angles');
            setText('btnCenterAngle', lang === 'zh' ? '圆心角关系' : 'Center ∠ Relation');
            setText('btnSemicircle', lang === 'zh' ? '半圆直角' : 'Semicircle 90°');
            setText('btnRecordAngle', lang === 'zh' ? '📍 记录当前角度' : '📍 Record Angle');
            setText('btnProofNext', lang === 'zh' ? '📜 证明: 下一步' : '📜 Proof: Next');
            setText('proofStepLabel', lang === 'zh' ? `步骤 ${proofStep}/3` : `Step ${proofStep}/3`);
            // 切线狙击模式工具按钮多语言
            setText('tangentToolsLabel', lang === 'zh' ? '✂️ 切线狙击:' : '✂️ Tangent Sniper:');
            setText('btnTangentEasy', lang === 'zh' ? '简单' : 'Easy');
            setText('btnTangentMedium', lang === 'zh' ? '中等' : 'Medium');
            setText('btnTangentHard', lang === 'zh' ? '困难' : 'Hard');
            setText('btnTangentAnswer', tangentShowAnswer ? (lang === 'zh' ? '💡 隐藏答案' : '💡 Hide Answer') : (lang === 'zh' ? '💡 显示答案' : '💡 Show Answer'));
            setText('btnTangentProof', lang === 'zh' ? '📜 证明: 下一步' : '📜 Proof: Next');
            setText('tangentProofStepLabel', lang === 'zh' ? `步骤 ${tangentProofStep}/3` : `Step ${tangentProofStep}/3`);
            let diffNames = { easy: '简单', medium: '中等', hard: '困难' };
            let diffNamesEn = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
            setText('tangentDifficultyLabel', lang === 'zh' ? diffNames[tangentDifficulty] || '中等' : diffNamesEn[tangentDifficulty] || 'Medium');
            setText('labToolsLabel', lang === 'zh' ? '🔬 反射实验室:' : '🔬 Reflection Lab:');
            setText('btnLabMirror', lang === 'zh' ? '🪞 镜像证明' : '🪞 Mirror Proof');
            setText('btnLabRecord', lang === 'zh' ? '📝 记录数据' : '📝 Record Data');
            setText('btnLabCSV', lang === 'zh' ? '📥 CSV' : '📥 CSV');
            setText('labLevelLabel', lang === 'zh' ? `Level ${labLevel}` : `Level ${labLevel}`);
            // 垂径定理模式工具按钮多语言
            setText('chordToolsLabel', lang === 'zh' ? '📏 垂径定理:' : '📏 Perpendicular Bisector:');
            setText('btnChordThm1', lang === 'zh' ? '定理1: 垂直→平分' : 'Thm 1: ⊥ → Bisect');
            setText('btnChordThm2', lang === 'zh' ? '定理2: 平分→垂直' : 'Thm 2: Bisect → ⊥');
            setText('btnChordSnap', chordSnapAssist ? (lang === 'zh' ? '🔓 关闭辅助' : '🔓 Unlock') : (lang === 'zh' ? '🔒 垂直辅助' : '🔒 Snap Assist'));
            setText('btnChordAnswer', chordShowAnswer ? (lang === 'zh' ? '💡 隐藏答案' : '💡 Hide Answer') : (lang === 'zh' ? '💡 显示答案' : '💡 Show Answer'));
            setText('btnChordRecord', lang === 'zh' ? '📝 记录数据' : '📝 Record Data');
            setText('btnChordCSV', lang === 'zh' ? '📥 CSV' : '📥 CSV');
            setText('btnChordProofNext', lang === 'zh' ? '📜 证明: 下一步' : '📜 Proof: Next');
            setText('chordProofStepLabel', lang === 'zh' ? `步骤 ${chordProofStep}/3` : `Step ${chordProofStep}/3`);
            setText('chordLevelLabel', lang === 'zh' ? `Level ${chordLevel}` : `Level ${chordLevel}`);
            setText('angleFineLabel', t.angleFineTune);
            setHTML('mirrorAim', t.mirrorAim);
            setText('powerFineLabel', lang === 'zh' ? '力度微调:' : 'Power Fine-tune:');
            setText('angleRecordTitle', t.angleRecordTitle);
            setText('labRecordTitle', t.labRecordTitle);
            setText('chordRecordTitle', t.chordRecordTitle);
            updateRulesModal();
            updateAngleHistoryUI();
            updateModeSpecificInfo();
            updateAchievementsUI();
        }
        
        function updateRulesModal(){