<<<<<<< HEAD
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
        .then(response => response.json())
        .then(data => {
            const car = data.cars.find(c => c.id == carId);
            
            if (car) {
                renderCarDetail(car);
                renderRecommendCars(data.recommendCars);
            } else {
                console.error('未找到对应ID的车辆:', carId);
            }
        })
        .catch(error => {
            console.error('加载车辆数据失败:', error);
        });
}

// 渲染车辆详情
function renderCarDetail(car) {
    // 设置页面标题
    document.title = car.title + ' - 阿敬淘车';
    
    // 渲染图片画廊
    const galleryMain = document.querySelector('.gallery-main');
    const galleryThumbs = document.querySelector('.gallery-thumbs');
    
    if (galleryMain && galleryThumbs) {
        galleryMain.innerHTML = `<img src="${car.images[0]}" alt="${car.title}">`;
        
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
            });
            
            galleryThumbs.appendChild(thumb);
        });
    }
    
    // 渲染基本信息
    document.querySelector('.detail-title').textContent = car.title;
    document.querySelector('.detail-price').textContent = car.price + '万';
    document.querySelector('.detail-original-price').textContent = car.originalPrice + '万';
    
    // 渲染元数据
    const metaItems = document.querySelectorAll('.meta-item');
    metaItems[0].querySelector('.meta-value').textContent = car.year;
    metaItems[1].querySelector('.meta-value').textContent = car.mileage;
    metaItems[2].querySelector('.meta-value').textContent = car.location;
    
    // 渲染标签
    const tagsContainer = document.querySelector('.detail-tags');
    tagsContainer.innerHTML = '';
    car.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = `detail-tag ${tag === '热门' ? 'hot' : ''}`;
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });
    
    // 渲染亮点
    const highlightsContainer = document.querySelector('.detail-highlights');
    highlightsContainer.innerHTML = '';
    car.highlights.forEach(highlight => {
        const highlightElement = document.createElement('span');
        highlightElement.className = 'highlight-item';
        highlightElement.textContent = highlight;
        highlightsContainer.appendChild(highlightElement);
    });
    
    // 渲染描述
    document.querySelector('.detail-description').textContent = car.description;
    
    // 渲染参数
    const parametersContainer = document.querySelector('.detail-parameters');
    parametersContainer.innerHTML = '';
    
    for (const [groupName, params] of Object.entries(car.parameters)) {
        const groupElement = document.createElement('div');
        groupElement.className = 'parameter-group';
        
        groupElement.innerHTML = `
            <h3 class="parameter-group-title">${groupName}</h3>
            <div class="parameter-list"></div>
        `;
        
        const paramList = groupElement.querySelector('.parameter-list');
        
        for (const [label, value] of Object.entries(params)) {
            const paramItem = document.createElement('div');
            paramItem.className = 'parameter-item';
            paramItem.innerHTML = `
                <span class="parameter-label">${label}：</span>
                <span class="parameter-value">${value}</span>
            `;
            paramList.appendChild(paramItem);
        }
        
        parametersContainer.appendChild(groupElement);
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
=======
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
        .then(response => response.json())
        .then(data => {
            const car = data.cars.find(c => c.id == carId);
            
            if (car) {
                renderCarDetail(car);
                renderRecommendCars(data.recommendCars);
            } else {
                console.error('未找到对应ID的车辆:', carId);
            }
        })
        .catch(error => {
            console.error('加载车辆数据失败:', error);
        });
}

// 渲染车辆详情
function renderCarDetail(car) {
    // 设置页面标题
    document.title = car.title + ' - 阿敬淘车';
    
    // 渲染图片画廊
    const galleryMain = document.querySelector('.gallery-main');
    const galleryThumbs = document.querySelector('.gallery-thumbs');
    
    if (galleryMain && galleryThumbs) {
        galleryMain.innerHTML = `<img src="${car.images[0]}" alt="${car.title}">`;
        
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
            });
            
            galleryThumbs.appendChild(thumb);
        });
    }
    
    // 渲染基本信息
    document.querySelector('.detail-title').textContent = car.title;
    document.querySelector('.detail-price').textContent = car.price + '万';
    document.querySelector('.detail-original-price').textContent = car.originalPrice + '万';
    
    // 渲染元数据
    const metaItems = document.querySelectorAll('.meta-item');
    metaItems[0].querySelector('.meta-value').textContent = car.year;
    metaItems[1].querySelector('.meta-value').textContent = car.mileage;
    metaItems[2].querySelector('.meta-value').textContent = car.location;
    
    // 渲染标签
    const tagsContainer = document.querySelector('.detail-tags');
    tagsContainer.innerHTML = '';
    car.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = `detail-tag ${tag === '热门' ? 'hot' : ''}`;
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });
    
    // 渲染亮点
    const highlightsContainer = document.querySelector('.detail-highlights');
    highlightsContainer.innerHTML = '';
    car.highlights.forEach(highlight => {
        const highlightElement = document.createElement('span');
        highlightElement.className = 'highlight-item';
        highlightElement.textContent = highlight;
        highlightsContainer.appendChild(highlightElement);
    });
    
    // 渲染描述
    document.querySelector('.detail-description').textContent = car.description;
    
    // 渲染参数
    const parametersContainer = document.querySelector('.detail-parameters');
    parametersContainer.innerHTML = '';
    
    for (const [groupName, params] of Object.entries(car.parameters)) {
        const groupElement = document.createElement('div');
        groupElement.className = 'parameter-group';
        
        groupElement.innerHTML = `
            <h3 class="parameter-group-title">${groupName}</h3>
            <div class="parameter-list"></div>
        `;
        
        const paramList = groupElement.querySelector('.parameter-list');
        
        for (const [label, value] of Object.entries(params)) {
            const paramItem = document.createElement('div');
            paramItem.className = 'parameter-item';
            paramItem.innerHTML = `
                <span class="parameter-label">${label}：</span>
                <span class="parameter-value">${value}</span>
            `;
            paramList.appendChild(paramItem);
        }
        
        parametersContainer.appendChild(groupElement);
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
>>>>>>> acfea0472b18a2ed4b33ad209ff0cf7d28f53b27
}