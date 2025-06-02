// A320 暖機程序檢查項目
const checklistItems = [
    {
        id: 1,
        text: '確認 APU 已經啟動並供應電力',
        detail: '檢查 APU GEN 是否正常運作',
        position: { x: 0.5, y: 1.2, z: -0.3 }, // 3D 空間中的位置
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 2,
        text: '檢查所有照明系統',
        detail: '包括駕駛艙、客艙和外部燈光',
        position: { x: -0.3, y: 1.5, z: -0.2 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 3,
        text: '設定空調系統',
        detail: '確保溫度設定適中，通風正常',
        position: { x: 0.2, y: 1.3, z: -0.4 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 4,
        text: '檢查液壓系統',
        detail: '確認三個液壓系統壓力正常',
        position: { x: -0.4, y: 1.1, z: -0.5 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 5,
        text: '檢查燃油量',
        detail: '確認左右油箱燃油量平衡',
        position: { x: 0.3, y: 1.0, z: -0.6 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 6,
        text: '檢查發動機參數',
        detail: 'N1, N2, EGT 數值在正常範圍',
        position: { x: 0.6, y: 1.4, z: -0.3 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 7,
        text: '測試飛行控制系統',
        detail: '檢查升降舵、方向舵、副翼的活動',
        position: { x: -0.2, y: 1.2, z: -0.4 },
        rotation: { x: 0, y: 0, z: 0 }
    },
    {
        id: 8,
        text: '設定導航系統',
        detail: '輸入飛行計劃，檢查導航數據',
        position: { x: 0.4, y: 1.3, z: -0.5 },
        rotation: { x: 0, y: 0, z: 0 }
    }
];

let completedItems = [];
let scene, camera, renderer, controls;
let cockpitModel;
let interactiveButtons = [];
let animations = [];
let mixer;
let clock;
let highlightedPart = null;

// 初始化 Three.js 場景
function initThreeJS() {
    clock = new THREE.Clock();
    
    // 建立場景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // 建立相機
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 2);

    // 建立渲染器
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(document.getElementById('cockpit3d').clientWidth, 
                    document.getElementById('cockpit3d').clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('cockpit3d').appendChild(renderer.domElement);

    // 加入軌道控制
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 5;
    controls.maxPolarAngle = Math.PI / 1.5;

    // 加入環境光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 加入定向光源
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 加入點光源
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);

    // 創建臨時的駕駛艙模型（使用基本幾何體）
    createTemporaryCockpit();

    // 創建互動按鈕
    createInteractiveButtons();

    // 開始動畫循環
    animate();
}

// 創建臨時的駕駛艙模型
function createTemporaryCockpit() {
    // 創建駕駛艙外殼
    const cockpitGeometry = new THREE.BoxGeometry(2, 1.5, 1.5);
    const cockpitMaterial = new THREE.MeshPhongMaterial({
        color: 0x404040,
        wireframe: true
    });
    cockpitModel = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    scene.add(cockpitModel);

    // 創建儀表板
    const dashboardGeometry = new THREE.BoxGeometry(1.8, 0.5, 0.3);
    const dashboardMaterial = new THREE.MeshPhongMaterial({
        color: 0x202020,
        wireframe: true
    });
    const dashboard = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
    dashboard.position.set(0, 0.8, -0.5);
    cockpitModel.add(dashboard);

    // 創建座椅
    const seatGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.6);
    const seatMaterial = new THREE.MeshPhongMaterial({
        color: 0x303030,
        wireframe: true
    });
    
    // 駕駛座
    const pilotSeat = new THREE.Mesh(seatGeometry, seatMaterial);
    pilotSeat.position.set(-0.5, 0.4, 0.3);
    cockpitModel.add(pilotSeat);
    
    // 副駕駛座
    const copilotSeat = new THREE.Mesh(seatGeometry, seatMaterial);
    copilotSeat.position.set(0.5, 0.4, 0.3);
    cockpitModel.add(copilotSeat);
}

// 載入駕駛艙模型
function loadCockpitModel() {
    const loader = new THREE.GLTFLoader();
    const loadingManager = new THREE.LoadingManager();
    
    loadingManager.onProgress = function(url, loaded, total) {
        const progress = (loaded / total) * 100;
        console.log(`Loading: ${Math.round(progress)}%`);
    };

    loader.load(COCKPIT_MODEL_URL, function(gltf) {
        cockpitModel = gltf.scene;
        cockpitModel.scale.set(0.1, 0.1, 0.1); // 調整模型大小
        cockpitModel.position.set(0, 0, 0);
        scene.add(cockpitModel);

        // 設置陰影
        cockpitModel.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                // 為可互動部件添加發光材質
                if (node.name.includes('button') || node.name.includes('switch')) {
                    node.material.emissive = new THREE.Color(0x404040);
                    node.material.emissiveIntensity = 0.2;
                }
            }
        });

        // 設置動畫混合器
        if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(cockpitModel);
            gltf.animations.forEach((clip) => {
                animations.push(mixer.clipAction(clip));
            });
        }

    }, undefined, function(error) {
        console.error('模型載入錯誤:', error);
    });
}

// 創建互動按鈕
function createInteractiveButtons() {
    checklistItems.forEach(item => {
        const geometry = new THREE.SphereGeometry(0.05, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        const button = new THREE.Mesh(geometry, material);
        button.position.set(
            item.position.x,
            item.position.y,
            item.position.z
        );
        button.userData = { 
            itemId: item.id,
            originalScale: button.scale.clone(),
            originalColor: material.color.clone()
        };
        scene.add(button);
        interactiveButtons.push(button);
        
        // 添加脈動動畫
        animateButton(button);
    });
}

// 按鈕脈動動畫
function animateButton(button) {
    const scaleFactor = 1.2;
    const duration = 1.0;
    
    const pulseUp = new TWEEN.Tween(button.scale)
        .to({
            x: button.userData.originalScale.x * scaleFactor,
            y: button.userData.originalScale.y * scaleFactor,
            z: button.userData.originalScale.z * scaleFactor
        }, duration * 1000)
        .easing(TWEEN.Easing.Quadratic.Out);

    const pulseDown = new TWEEN.Tween(button.scale)
        .to({
            x: button.userData.originalScale.x,
            y: button.userData.originalScale.y,
            z: button.userData.originalScale.z
        }, duration * 1000)
        .easing(TWEEN.Easing.Quadratic.In);

    pulseUp.chain(pulseDown);
    pulseDown.chain(pulseUp);
    pulseUp.start();
}

// 高亮顯示駕駛艙部件
function highlightCockpitPart(partName) {
    if (cockpitModel) {
        if (highlightedPart) {
            // 重置之前高亮的部件
            highlightedPart.material.emissiveIntensity = 0.2;
        }
        
        cockpitModel.traverse((node) => {
            if (node.isMesh && node.name.includes(partName)) {
                node.material.emissiveIntensity = 1.0;
                highlightedPart = node;
            }
        });
    }
}

// 動畫循環
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // 更新軌道控制
    controls.update();
    
    // 更新動畫混合器
    if (mixer) {
        mixer.update(delta);
    }
    
    // 更新 Tween 動畫
    TWEEN.update();
    
    // 更新互動按鈕的旋轉
    interactiveButtons.forEach(button => {
        button.rotation.y += delta * 0.5;
    });
    
    renderer.render(scene, camera);
}

// 處理視窗大小變化
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = document.getElementById('cockpit3d').clientWidth / 
                    document.getElementById('cockpit3d').clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(document.getElementById('cockpit3d').clientWidth, 
                    document.getElementById('cockpit3d').clientHeight);
}

// 處理滑鼠點擊事件
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveButtons);

    if (intersects.length > 0) {
        const clickedButton = intersects[0].object;
        const itemId = clickedButton.userData.itemId;
        toggleItem(itemId);
        // 更新按鈕顏色
        clickedButton.material.color.setHex(
            completedItems.includes(itemId) ? 0x00ff00 : 0xff0000
        );
    }
}

renderer?.domElement.addEventListener('click', onMouseClick);

// 處理滑鼠懸停
function onMouseMove(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveButtons);

    document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';

    interactiveButtons.forEach(button => {
        if (intersects.length > 0 && intersects[0].object === button) {
            button.material.emissiveIntensity = 1.0;
            const item = checklistItems.find(item => item.id === button.userData.itemId);
            if (item) {
                highlightCockpitPart(item.cockpitPart);
            }
        } else {
            button.material.emissiveIntensity = 0.5;
        }
    });
}

// 初始化檢查表
function initializeChecklist() {
    const container = document.getElementById('checklistItems');
    container.innerHTML = '';
    
    checklistItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'checklist-item';
        div.setAttribute('data-id', item.id);
        div.innerHTML = `
            <h5>${item.text}</h5>
            <p class="text-muted small">${item.detail}</p>
        `;
        
        if (completedItems.includes(item.id)) {
            div.classList.add('completed');
        }
        
        div.addEventListener('click', () => toggleItem(item.id));
        container.appendChild(div);
    });
    
    updateProgress();
}

// 切換項目完成狀態
function toggleItem(id) {
    const index = completedItems.indexOf(id);
    if (index === -1) {
        completedItems.push(id);
    } else {
        completedItems.splice(index, 1);
    }
    
    // 更新 UI
    const item = document.querySelector(`[data-id="${id}"]`);
    item.classList.toggle('completed');
    
    // 更新 3D 按鈕顏色
    const button = interactiveButtons.find(b => b.userData.itemId === id);
    if (button) {
        button.material.color.setHex(
            completedItems.includes(id) ? 0x00ff00 : 0xff0000
        );
        button.material.emissive.setHex(
            completedItems.includes(id) ? 0x00ff00 : 0xff0000
        );
    }
    
    updateProgress();
}

// 更新進度條
function updateProgress() {
    const progress = (completedItems.length / checklistItems.length) * 100;
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
}

// 重置檢查表
function resetChecklist() {
    completedItems = [];
    initializeChecklist();
    // 重置所有 3D 按鈕顏色
    interactiveButtons.forEach(button => {
        button.material.color.setHex(0xff0000);
        button.material.emissive.setHex(0xff0000);
    });
}

// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initializeChecklist();
    document.getElementById('resetBtn').addEventListener('click', resetChecklist);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
});