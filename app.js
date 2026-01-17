// ==================== DOM 元素获取 ====================
const formElements = {
    avatar: document.getElementById('avatar'),
    name: document.getElementById('name'),
    title: document.getElementById('title'),
    company: document.getElementById('company'),
    bio: document.getElementById('bio'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    bioCount: document.getElementById('bioCount'),
    resetBtn: document.getElementById('resetBtn'),
    downloadBtn: document.getElementById('downloadBtn')
};

const cardElements = {
    card: document.getElementById('card'),
    cardName: document.getElementById('cardName'),
    cardTitle: document.getElementById('cardTitle'),
    cardCompany: document.getElementById('cardCompany'),
    cardBio: document.getElementById('cardBio'),
    cardEmail: document.getElementById('cardEmail'),
    cardPhone: document.getElementById('cardPhone'),
    cardAvatarImg: document.getElementById('cardAvatarImg'),
    emailItem: document.getElementById('emailItem'),
    phoneItem: document.getElementById('phoneItem'),
    avatarPreview: document.getElementById('avatarPreview'),
    qrcodeCanvas: document.getElementById('qrcodeCanvas')
};

// 默认头像 SVG
const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2381C784'/%3E%3Ctext x='50' y='65' font-size='40' text-anchor='middle' fill='white' font-family='Arial'%3E%3F%3C/text%3E%3C/svg%3E";

// ==================== 事件监听器 ====================

// 表单输入监听 - 实时预览
formElements.name.addEventListener('input', updateCard);
formElements.title.addEventListener('input', updateCard);
formElements.company.addEventListener('input', updateCard);
formElements.bio.addEventListener('input', function() {
    updateBioCount();
    updateCard();
});
formElements.email.addEventListener('input', updateCard);
formElements.phone.addEventListener('input', updateCard);

// 头像上传
formElements.avatar.addEventListener('change', handleAvatarUpload);

// 重置按钮
formElements.resetBtn.addEventListener('click', resetForm);

// 下载按钮
formElements.downloadBtn.addEventListener('click', downloadCard);

// ==================== 核心功能函数 ====================

/**
 * 更新卡片预览
 */
function updateCard() {
    // 更新姓名
    cardElements.cardName.textContent = formElements.name.value || '您的姓名';

    // 更新职位
    cardElements.cardTitle.textContent = formElements.title.value || '职位/头衔';

    // 更新公司
    cardElements.cardCompany.textContent = formElements.company.value || '公司名称';

    // 更新简介
    cardElements.cardBio.textContent = formElements.bio.value || '在这里填写您的个人简介，让大家更好地了解您...';

    // 更新邮箱
    if (formElements.email.value) {
        cardElements.cardEmail.textContent = formElements.email.value;
        cardElements.emailItem.classList.remove('hidden');
    } else {
        cardElements.emailItem.classList.add('hidden');
    }

    // 更新电话
    if (formElements.phone.value) {
        cardElements.cardPhone.textContent = formElements.phone.value;
        cardElements.phoneItem.classList.remove('hidden');
    } else {
        cardElements.phoneItem.classList.add('hidden');
    }

    // 更新二维码
    updateQRCode();
}

/**
 * 更新简介字符计数
 */
function updateBioCount() {
    const count = formElements.bio.value.length;
    const max = 100;
    formElements.bioCount.textContent = `${count}/${max}`;

    if (count > max) {
        formElements.bio.value = formElements.bio.value.substring(0, max);
        formElements.bioCount.textContent = `${max}/${max}`;
    }
}

/**
 * 处理头像上传
 */
function handleAvatarUpload(event) {
    const file = event.target.files[0];

    if (file) {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件！');
            return;
        }

        // 验证文件大小（最大 5MB）
        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过 5MB！');
            return;
        }

        // 使用 FileReader 读取图片
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;

            // 更新预览区域
            cardElements.avatarPreview.innerHTML = `<img src="${imageUrl}" alt="头像预览">`;

            // 更新卡片头像
            cardElements.cardAvatarImg.src = imageUrl;
        };
        reader.readAsDataURL(file);
    }
}

/**
 * 更新二维码
 */
function updateQRCode() {
    const name = formElements.name.value || '您的姓名';
    const title = formElements.title.value || '职位';
    const company = formElements.company.value || '公司';
    const email = formElements.email.value || '邮箱';
    const phone = formElements.phone.value || '电话';

    // 构建二维码内容
    const qrContent = `${name} | ${title} | ${company} | ${email} | ${phone}`;

    // 清空之前的二维码
    cardElements.qrcodeCanvas.innerHTML = '';

    // 生成新二维码
    new QRCode(cardElements.qrcodeCanvas, {
        text: qrContent,
        width: 80,
        height: 80,
        colorDark: "#2E7D32",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    });
}

/**
 * 重置表单
 */
function resetForm() {
    // 重置表单
    document.getElementById('cardForm').reset();

    // 重置头像预览
    cardElements.avatarPreview.innerHTML = '<i class="fas fa-user"></i>';

    // 重置卡片头像
    cardElements.cardAvatarImg.src = defaultAvatar;

    // 重置简介计数
    formElements.bioCount.textContent = '0/100';

    // 重置卡片内容
    updateCard();

    // 显示提示
    showNotification('表单已重置');
}

/**
 * 下载卡片为 PNG
 */
async function downloadCard() {
    // 验证必填项
    if (!formElements.name.value.trim()) {
        showNotification('请至少填写姓名！', 'error');
        formElements.name.focus();
        return;
    }

    try {
        // 添加加载状态
        formElements.downloadBtn.classList.add('loading');
        formElements.downloadBtn.disabled = true;
        formElements.downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';

        // 等待一小段时间确保 DOM 更新完成
        await new Promise(resolve => setTimeout(resolve, 100));

        // 使用 html2canvas 生成图片
        const canvas = await html2canvas(cardElements.card, {
            scale: 2, // 提高分辨率
            useCORS: true, // 允许跨域图片
            backgroundColor: null, // 透明背景
            logging: false
        });

        // 转换为图片 URL
        const imageUrl = canvas.toDataURL('image/png');

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `${formElements.name.value || '名片'}-名片.png`;
        link.href = imageUrl;
        link.click();

        // 显示成功提示
        showNotification('名片下载成功！');

    } catch (error) {
        console.error('下载失败:', error);
        showNotification('下载失败，请重试', 'error');
    } finally {
        // 移除加载状态
        formElements.downloadBtn.classList.remove('loading');
        formElements.downloadBtn.disabled = false;
        formElements.downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载名片';
    }
}

/**
 * 显示通知提示
 */
function showNotification(message, type = 'success') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-size: 14px;
        font-weight: 500;
    `;

    // 添加动画样式
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 添加到页面
    document.body.appendChild(notification);

    // 3秒后移除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ==================== 初始化 ====================

// 页面加载时生成初始二维码
document.addEventListener('DOMContentLoaded', function() {
    updateQRCode();
});

// 防止表单默认提交
document.getElementById('cardForm').addEventListener('submit', function(e) {
    e.preventDefault();
});
