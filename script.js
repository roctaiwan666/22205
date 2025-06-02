// A320 暖機程序檢查項目
const checklistItems = [
    {
        id: 1,
        text: '確認 APU 已經啟動並供應電力',
        detail: '檢查 APU GEN 是否正常運作'
    },
    {
        id: 2,
        text: '檢查所有照明系統',
        detail: '包括駕駛艙、客艙和外部燈光'
    },
    {
        id: 3,
        text: '設定空調系統',
        detail: '確保溫度設定適中，通風正常'
    },
    {
        id: 4,
        text: '檢查液壓系統',
        detail: '確認三個液壓系統壓力正常'
    },
    {
        id: 5,
        text: '檢查燃油量',
        detail: '確認左右油箱燃油量平衡'
    },
    {
        id: 6,
        text: '檢查發動機參數',
        detail: 'N1, N2, EGT 數值在正常範圍'
    },
    {
        id: 7,
        text: '測試飛行控制系統',
        detail: '檢查升降舵、方向舵、副翼的活動'
    },
    {
        id: 8,
        text: '設定導航系統',
        detail: '輸入飛行計劃，檢查導航數據'
    }
];

let completedItems = [];

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
    
    const item = document.querySelector(`[data-id="${id}"]`);
    item.classList.toggle('completed');
    
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
}

// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
    initializeChecklist();
    document.getElementById('resetBtn').addEventListener('click', resetChecklist);
});