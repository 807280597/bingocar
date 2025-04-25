// 主JavaScript文件
document.addEventListener('DOMContentLoaded', function() {
    // 初始化轮播图
    initCarousel();
    
    // 加载车辆数据
    loadCars();
    
    // 如果是详情页，加载详情
    if (document.querySelector('.car-detail')) {
        loadCarDetail();
    }
    
    // 初始化移动端菜单
    initMobileMenu();
});

// 初始化轮播图
function initCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    
    const items = carousel.querySelectorAll('.carousel-item');
    const dots = carousel.querySelectorAll('.carousel-dot');
    let currentIndex = 0;
    
    // 设置第一个为激活状态
    items[0].classList.add('active');
    dots[0].classList.add('active');
    
    // 自动轮播
    setInterval(() => {
        items[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        
        currentIndex = (currentIndex + 1) % items.length;
        
        items[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
    }, 5000);
    
    // 点击指示器切换
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            items[currentIndex].classList.remove('active');
            dots[currentIndex].classList.remove('active');
            
            currentIndex = index;
            
            items[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');
        });
    });
}

// 渲染车辆列表
function renderCars(cars, container) {
    container.innerHTML = '';
    
    if (!cars || cars.length === 0) {
        container.innerHTML = '<div class="no-cars">暂无车辆信息</div>';
        return;
    }
    
    cars.forEach(car => {
        // 检查必要字段是否存在
        if (!car.id || !car.thumbnail) {
            console.error('车辆数据缺少必要字段:', car);
            return;
        }
        
        const carElement = document.createElement('div');
        carElement.className = 'car-card';
        
        // 构建HTML，处理可能不存在的字段
        let html = `
            <a href="detail.html?id=${car.id}">
                <div class="car-image">
                    <img src="${car.thumbnail}" alt="${car.title || '汽车'}">
                </div>
                <div class="car-info">`;
        
        if (car.title) {
            html += `<h3 class="car-title">${car.title}</h3>`;
        }
        
        // 价格信息，检查是否存在
        html += `<div class="car-price">`;
        if (car.price) {
            html += `<span class="current-price">${car.price}万</span>`;
        }
        if (car.originalPrice) {
            html += `<span class="original-price">${car.originalPrice}万</span>`;
        }
        html += `</div>`;
        
        // 元数据信息，检查是否存在
        if (car.year || car.mileage) {
            html += `<div class="car-meta">`;
            if (car.year) html += `<span>${car.year}</span>`;
            if (car.mileage) html += `<span>${car.mileage}</span>`;
            html += `</div>`;
        }
        
        // 标签信息，检查是否存在
        if (car.tags && car.tags.length > 0) {
            html += `<div class="car-tags">`;
            html += car.tags.map(tag => `<span class="car-tag ${tag === '热门' ? 'hot' : ''}">${tag}</span>`).join('');
            html += `</div>`;
        }
        
        html += `</div></a>`;
        carElement.innerHTML = html;
        container.appendChild(carElement);
    });
}

// 加载车辆数据
function loadCars() {
    const carListElements = document.querySelectorAll('.car-list');
    if (carListElements.length === 0) return;
    
    // 从 cars.json 加载数据，使用绝对路径
    fetch('/data/cars.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            console.log('成功加载车辆数据:', data); // 添加日志
            
            if (!data.cars || !Array.isArray(data.cars)) {
                console.error('车辆数据格式不正确，缺少cars数组');
                return;
            }
            
            carListElements.forEach((element, index) => {
                if (index === 0 && !element.classList.contains('recommend-list')) {
                    // 热门车辆，检查tags字段是否存在
                    const hotCars = data.cars.filter(car => car.tags && car.tags.includes('热门'));
                    console.log('热门车辆:', hotCars); // 添加日志
                    renderCars(hotCars, element);
                } else if (index === 1 && !element.classList.contains('recommend-list')) {
                    console.log('所有车辆:', data.cars); // 添加日志
                    renderCars(data.cars, element);
                } else if (element.classList.contains('recommend-list')) {
                    renderCars(data.recommendCars || [], element);
                }
            });
        })
        .catch(error => {
            console.error('加载车辆数据失败:', error);
            // 在页面上显示错误信息
            carListElements.forEach(element => {
                element.innerHTML = `<div class="error-message">加载车辆数据失败: ${error.message}</div>`;
            });
        });
}

// 加载车辆详情
function loadCarDetail() {
    // 获取URL参数中的车辆ID
    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');
    
    if (!carId) {
        console.error('未找到车辆ID');
        return;
    }
    
    // 从 cars.json 加载数据
    fetch('data/cars.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            console.log('成功加载车辆数据:', data);
            
            if (!data.cars || !Array.isArray(data.cars)) {
                throw new Error('车辆数据格式不正确，缺少cars数组');
            }
            
            const car = data.cars.find(c => c.id == carId);
            
            if (car) {
                // 确保car对象有所有必要的属性，防止渲染时出错
                car.parameters = car.parameters || {}; // 如果parameters不存在，设置为空对象
                car.tags = car.tags || [];
                car.highlights = car.highlights || [];
                car.images = car.images || [];
                
                renderCarDetail(car);
                
                // 随机推荐3辆车（不包括当前车辆）
                const otherCars = data.cars.filter(c => c.id != carId);
                // 随机打乱数组
                const shuffledCars = shuffleArray(otherCars);
                // 取前3辆车作为推荐
                const randomRecommendCars = shuffledCars.slice(0, 3);
                renderRecommendCars(randomRecommendCars);
            } else {
                console.error('未找到对应ID的车辆:', carId);
                // 显示错误信息
                document.querySelector('.car-detail').innerHTML = '<div class="error-message">未找到该车辆信息</div>';
            }
        })
        .catch(error => {
            console.error('加载车辆数据失败:', error);
            // 显示错误信息
            document.querySelector('.car-detail').innerHTML = `<div class="error-message">加载车辆数据失败: ${error.message}</div>`;
        });
}

// 随机打乱数组的函数
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 渲染车辆详情
function renderCarDetail(car) {
    // 设置页面标题
    document.title = car.title + ' - 阿敬淘车';
    
    // 渲染图片画廊
    const galleryMain = document.querySelector('.gallery-main');
    const galleryThumbs = document.querySelector('.gallery-thumbs');
    
    if (galleryMain && galleryThumbs && car.images && car.images.length > 0) {
        // 初始化主图
        galleryMain.innerHTML = `<img src="${car.images[0]}" alt="${car.title}">`;
        
        // 清空缩略图容器
        galleryThumbs.innerHTML = '';
        
        // 添加所有缩略图
        car.images.forEach((image, index) => {
            const thumb = document.createElement('div');
            thumb.className = `gallery-thumb ${index === 0 ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${image}" alt="${car.title} - 图片${index + 1}">`;
            
            thumb.addEventListener('click', () => {
                // 更新主图
                galleryMain.innerHTML = `<img src="${image}" alt="${car.title}">`;
                
                // 更新缩略图激活状态
                document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                
                // 更新当前索引（用于自动轮播）
                currentImageIndex = index;
            });
            
            galleryThumbs.appendChild(thumb);
        });
        
        // 自动轮播图片
        let currentImageIndex = 0;
        const autoSlideInterval = setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % car.images.length;
            
            // 更新主图
            galleryMain.innerHTML = `<img src="${car.images[currentImageIndex]}" alt="${car.title}">`;
            
            // 更新缩略图激活状态
            document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
                if (i === currentImageIndex) {
                    t.classList.add('active');
                } else {
                    t.classList.remove('active');
                }
            });
        }, 3000); // 3秒切换一次
        
        // 当用户离开页面时清除定时器
        window.addEventListener('beforeunload', () => {
            clearInterval(autoSlideInterval);
        });
    }
    
    // 渲染基本信息
    document.querySelector('.detail-title').textContent = car.title || '';
    
    // 移除价格相关代码
    
    // 渲染元数据
    const metaItems = document.querySelectorAll('.meta-item');
    if (metaItems.length >= 2) {
        metaItems[0].querySelector('.meta-value').textContent = car.year || '';
        metaItems[1].querySelector('.meta-value').textContent = car.mileage || '';
        // 移除地点相关代码
    }
    
    // 渲染标签
    const tagsContainer = document.querySelector('.detail-tags');
    if (tagsContainer && car.tags && Array.isArray(car.tags)) {
        tagsContainer.innerHTML = '';
        car.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = `detail-tag ${tag === '热门' ? 'hot' : ''}`;
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
    }
    
    // 渲染亮点
    const highlightsContainer = document.querySelector('.detail-highlights');
    if (highlightsContainer && car.highlights && Array.isArray(car.highlights)) {
        highlightsContainer.innerHTML = '';
        car.highlights.forEach(highlight => {
            const highlightElement = document.createElement('span');
            highlightElement.className = 'highlight-item';
            highlightElement.textContent = highlight;
            highlightsContainer.appendChild(highlightElement);
        });
    }
    
    // 渲染描述
    const descriptionContainer = document.querySelector('.detail-description');
    if (descriptionContainer) {
        descriptionContainer.textContent = car.description || '';
    }
    
    // 渲染参数 - 添加检查确保parameters存在
    const parametersContainer = document.querySelector('.detail-parameters');
    if (parametersContainer && car.parameters) {
        parametersContainer.innerHTML = '';
        
        // 检查parameters是否为对象且不为null
        if (car.parameters && typeof car.parameters === 'object' && car.parameters !== null) {
            for (const [groupName, params] of Object.entries(car.parameters)) {
                const groupElement = document.createElement('div');
                groupElement.className = 'parameter-group';
                
                groupElement.innerHTML = `
                    <h3 class="parameter-group-title">${groupName}</h3>
                    <div class="parameter-list"></div>
                `;
                
                const paramList = groupElement.querySelector('.parameter-list');
                
                // 确保params是对象且不为null
                if (params && typeof params === 'object' && params !== null) {
                    for (const [label, value] of Object.entries(params)) {
                        const paramItem = document.createElement('div');
                        paramItem.className = 'parameter-item';
                        paramItem.innerHTML = `
                            <span class="parameter-label">${label}：</span>
                            <span class="parameter-value">${value}</span>
                        `;
                        paramList.appendChild(paramItem);
                    }
                }
                
                parametersContainer.appendChild(groupElement);
            }
        }
    }
}

// 渲染推荐车型
function renderRecommendCars(cars) {
    const container = document.querySelector('.recommend-list');
    if (!container) return;
    
    renderCars(cars, container);
}

// 初始化移动端菜单
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuBtn || !navMenu) return;
    
    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}